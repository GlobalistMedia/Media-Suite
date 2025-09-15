export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Post from "@/lib/models/Post";
import mediaUploadService from "@/lib/services/mediaUploadService";
import type { AnyBlock } from "@/types/editor";
import Event from "@/lib/models/Event";
import axios from "axios";

// Helper function to convert base64 to buffer
function base64ToBuffer(base64Data: string): Buffer {
  const base64String = base64Data.split(",")[1];
  return Buffer.from(base64String, "base64");
}

// Helper function to get default file info based on block type
function getDefaultFileInfo(blockType: string) {
  const defaults = {
    image: { name: "image.jpg", type: "image/jpeg", extension: "jpg" },
    video: { name: "video.mp4", type: "video/mp4", extension: "mp4" },
    audio: { name: "audio.mp3", type: "audio/mpeg", extension: "mp3" },
  };
  return (
    defaults[blockType as keyof typeof defaults] || {
      name: "file",
      type: "application/octet-stream",
      extension: "bin",
    }
  );
}

// Type guard for media block content
function isMediaContent(content: any): content is {
  file: string;
  fileName?: string;
  fileType?: string;
  size?: number;
  url?: string;
  alt?: string;
  width?: number;
  height?: number;
  thumbnailUrl?: string;
  duration?: number;
} {
  return typeof content === "object" && typeof content.file === "string";
}

// Helper function to process media blocks
async function processMediaBlock(
  block: AnyBlock,
  userId: string,
  postId?: string
): Promise<AnyBlock> {
  try {
    const { type, content } = block;
    const defaultInfo = getDefaultFileInfo(type);

    // Ensure file exists and content is media
    if (!isMediaContent(content)) {
      throw new Error("No file data found in block content");
    }
    // Convert base64 to buffer
    const buffer = base64ToBuffer(content.file);

    // Upload media
    const uploadedMedia = await mediaUploadService.uploadMedia(
      {
        originalName: content.fileName || defaultInfo.name,
        mimeType: content.fileType || defaultInfo.type,
        size: buffer.length,
        buffer,
      },
      userId,
      postId
    );

    // Update block content with uploaded media info
    const updatedContent: any = {
      ...content,
      url: uploadedMedia.url,
      fileName: uploadedMedia.name,
      fileType: uploadedMedia.type,
      size: uploadedMedia.size,
    };
    // Explicitly remove the file property
    delete updatedContent.file;

    // Add type-specific metadata
    if (type === "image") {
      updatedContent.width = uploadedMedia.width;
      updatedContent.height = uploadedMedia.height;
      updatedContent.thumbnailUrl = uploadedMedia.thumbnailUrl;
    } else if (type === "video") {
      updatedContent.width = uploadedMedia.width;
      updatedContent.height = uploadedMedia.height;
      updatedContent.duration = uploadedMedia.duration;
      updatedContent.thumbnailUrl = uploadedMedia.thumbnailUrl;
    } else if (type === "audio") {
      updatedContent.duration = uploadedMedia.duration;
    }

    return {
      ...block,
      content: updatedContent,
    };
  } catch (error) {
    console.error(`Error uploading ${block.type}:`, error);
    return block; // Return original block if upload fails
  }
}

// Helper function to extract URLs from media blocks
function extractMediaUrls(blocks: AnyBlock[]): string[] {
  return blocks
    .filter(
      (block) =>
        ["image", "video", "audio"].includes(block.type) &&
        isMediaContent(block.content)
    )
    .map((block) =>
      isMediaContent(block.content) ? block.content.url : undefined
    )
    .filter((url): url is string => Boolean(url));
}

// Helper function to cleanup orphaned media files
async function cleanupOrphanedMedia(oldUrls: string[], newUrls: string[]) {
  const urlsToDelete = oldUrls.filter((url) => !newUrls.includes(url));

  for (const url of urlsToDelete) {
    try {
      await mediaUploadService.deleteMedia(url);
      console.log(`Deleted orphaned media: ${url}`);
    } catch (error) {
      console.error(`Failed to delete media ${url}:`, error);
    }
  }
}

interface SaveContentRequest {
  title: string;
  blocks: AnyBlock[];
  category?: string[];
  country?: string[];
  type?: string;
  articleImage?: any; // Base64 image string
  status?: "draft" | "scheduled" | "published";
  postId?: string;
  scheduledDate?: string;
  platforms?: string[];
  tags?: string[];
  isPublic?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body: SaveContentRequest = await request.json();
    console.log("Content save request body:", body);
    const {
      title,
      blocks,
      status = "draft",
      postId,
      scheduledDate,
      platforms = [],
      tags = [],
      isPublic = true,
    } = body;

    if (!title || !blocks || !Array.isArray(blocks)) {
      return NextResponse.json(
        { error: "Title and blocks are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get existing post data for comparison (if updating)
    let existingPost = null;
    let existingMediaUrls: string[] = [];

    if (postId) {
      existingPost = await Post.findOne({
        _id: postId,
        userId: session.user.id,
      });

      if (!existingPost) {
        return NextResponse.json(
          { error: "Post not found or access denied" },
          { status: 404 }
        );
      }

      // Extract existing media URLs for cleanup
      existingMediaUrls = extractMediaUrls(existingPost.blocks);
    }

    // Process media files in blocks and ensure proper order
    const processedBlocks = await Promise.all(
      blocks.map(async (block: AnyBlock, index: number) => {
        // Ensure block has proper order
        const blockWithOrder = {
          ...block,
          order: block.order ?? index,
        };

        // Only process media blocks that have NEW file data (base64)
        // Skip blocks that already have URLs (existing media)
        if (
          ["image", "video", "audio"].includes(block.type) &&
          isMediaContent(block.content)
        ) {
          return await processMediaBlock(
            blockWithOrder,
            session.user.id,
            postId
          );
        }

        return blockWithOrder;
      })
    );

    // Extract new media URLs
    const newMediaUrls = extractMediaUrls(processedBlocks);

    // Cleanup orphaned media files (if updating)
    if (postId && existingMediaUrls.length > 0) {
      await cleanupOrphanedMedia(existingMediaUrls, newMediaUrls);
    }

    // Extract media files for the post
    const mediaFiles = processedBlocks
      .filter(
        (block) =>
          ["image", "video", "audio"].includes(block.type) &&
          isMediaContent(block.content)
      )
      .map((block) => {
        const content = block.content;
        if (!isMediaContent(content)) return undefined;
        return {
          url: content.url,
          thumbnailUrl: content.thumbnailUrl,
          type: block.type,
          name: content.fileName,
          size: content.size,
          width: content.width,
          height: content.height,
          duration: content.duration,
          fileName: content.fileName,
          fileType: content.fileType,
        };
      })
      .filter((media) => media && media.url);

    // Create or update post
    let post;
    let event;
    if (postId) {
      // Update existing post
      post = await Post.findByIdAndUpdate(
        postId,
        {
          title,
          blocks: processedBlocks,
          status,
          mediaFiles,
          platforms,
          tags,
          isPublic,
          scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
          updatedAt: new Date(),
        },
        { new: true }
      );
      // Note: We no longer create Event records for scheduled posts
      // Scheduled posts are handled directly through the Post model
    } else {
      // Create new post
      post = new Post({
        userId: session.user.id,
        title,
        blocks: processedBlocks,
        status,
        mediaFiles,
        platforms,
        tags,
        isPublic,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
      });
      await post.save();
      // Note: We no longer create Event records for scheduled posts
      // Scheduled posts are handled directly through the Post model
    }

    return NextResponse.json({
      success: true,
      post: {
        id: post._id,
        title: post.title,
        status: post.status,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        scheduledDate: post.scheduledDate,
      },
    });
  } catch (error) {
    console.error("Error saving content:", error);
    return NextResponse.json(
      { error: "Failed to save content" },
      { status: 500 }
    );
  }
}
