export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Post from "@/lib/models/Post";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status"); // draft, scheduled, published, failed
    const search = searchParams.get("search"); // search in title

    await dbConnect();

    // Build query
    const query: any = { userId: session.user.id };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get posts with pagination
    const posts = await Post.find(query)
      .sort({ updatedAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit)
      .select(
        "title status blocks platforms mediaFiles scheduledDate publishedDate createdAt updatedAt"
      )
      .lean();

    // Get total count for pagination
    const total = await Post.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      posts: posts.map((post) => ({
        id: post._id,
        title: post.title,
        status: post.status,
        platforms: post.platforms,
        blocks: post.blocks,
        mediaFiles: post.mediaFiles,
        scheduledDate: post.scheduledDate,
        publishedDate: post.publishedDate,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,

        // Add a thumbnail from media files if available
        thumbnail:
          post.mediaFiles?.find((file: any) => file.type === "image")
            ?.thumbnailUrl ||
          post.mediaFiles?.find((file: any) => file.type === "video")
            ?.thumbnailUrl ||
          null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
