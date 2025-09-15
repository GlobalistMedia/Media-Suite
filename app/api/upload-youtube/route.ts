import { NextRequest, NextResponse } from "next/server";

// Helper function to convert base64 to buffer
function base64ToBuffer(base64Data: string): Buffer {
  const base64String = base64Data.split(",")[1]; // Remove the data URL part if present
  return Buffer.from(base64String, "base64");
}

// Function to upload video to YouTube
async function uploadToYouTube(
  fileBuffer: Buffer,
  title: string,
  description: string,
  authToken: string
): Promise<any> {
  const formData = new FormData();
  formData.append(
    "snippet",
    JSON.stringify({
      title,
      description,
      tags: ["tutorial", "blog", "YouTube", "content"], // Adjust tags as necessary
    })
  );
  formData.append(
    "status",
    JSON.stringify({
      privacyStatus: "public", // Can be "private", "unlisted", or "public"
    })
  );
  formData.append(
    "file",
    new Blob([fileBuffer], { type: "video/mp4" }),
    "video.mp4"
  );

  try {
    const response = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        // body: formData,
      }
    );

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message || "YouTube upload failed");
    }
    return data; // The response will contain the video URL and other metadata
  } catch (error) {
    console.error("Error uploading video to YouTube:", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, blocks, authToken } = body; // Expecting `title` and `blocks` in the request body

    if (!title || !blocks || !Array.isArray(blocks)) {
      return NextResponse.json(
        { error: "Title and blocks are required" },
        { status: 400 }
      );
    }

    // Find the block with video content
    const videoBlock = blocks.find(
      (block: any) => block.type === "video" && block.content?.file
    );

    if (!videoBlock) {
      return NextResponse.json(
        { error: "No video block found" },
        { status: 400 }
      );
    }

    https: const { file, fileName, fileType, description } = videoBlock.content;

    if (!file) {
      return NextResponse.json(
        { error: "No video file found in block content" },
        { status: 400 }
      );
    }

    // Convert the base64 file to buffer
    const fileBuffer = base64ToBuffer(file);

    // Upload video to YouTube
    const uploadData = await uploadToYouTube(
      fileBuffer,
      title,
      description || "Uploaded via API",
      authToken
    );

    return NextResponse.json({
      success: true,
      message: "Video uploaded successfully",
      videoData: uploadData,
    });
  } catch (error) {
    console.error("Error processing the request:", error);
    return NextResponse.json(
      { error: "Failed to upload video to YouTube" },
      { status: 500 }
    );
  }
}
