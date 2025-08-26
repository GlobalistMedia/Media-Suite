"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { StreamlinedEditor } from "@/components/contentEditor/StreamlinedEditor";
import { UpgradeModal } from "@/components/contentEditor/UpgradeModal";
import { PublishingHubModal } from "@/components/PublishingHubModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlatformSelector } from "@/components/platform-selector";
import { Sparkles } from "lucide-react";
import type { AnyBlock } from "@/types/editor";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import axios from "axios";

// Platform mapping utility
const platformMapping: Record<number, string> = {
  1: "Twitter", // Twitter
  2: "LinkedIn", // LinkedIn
  3: "Instagram", // Instagram
  4: "YouTube", // YouTube
  5: "TikTok", // TikTok
  6: "Facebook", // Facebook
};

export default function DistributionPage() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [user, setUser] = useState({ isPremium: false });
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<AnyBlock[]>([]);
  const [type, setType] = useState("");
  const [articleImage, setArticleImage] = useState(null as any | null);
  const [category, setCategory] = useState<string[]>([]);
  const [country, setCountry] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPublishingHub, setShowPublishingHub] = useState(false);
  const [currentPostId, setCurrentPostId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  // saveAIContent was removed with the old AI Assistant. If you want to save, implement logic here or use another method.
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setUser({ isPremium: session.user.userSubscriptionLevel !== "free" });
    }
  }, [session, status]);

  // Load post from URL parameter if editing
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const postId = urlParams.get("postId");

      if (postId && status === "authenticated") {
        loadPost(postId);
      }
    }
  }, [status]);

  // Helper function to convert block to HTML content
  const convertBlockToHTML = (block: any) => {
    let htmlContent = "";

    switch (block.type) {
      // Handle heading blocks (e.g., <h1>, <h2>, etc.)
      case "heading": {
        const level = block.content?.level || 1; // Default to <h1> if no level provided
        htmlContent = `<h${level}>${block.content?.text}</h${level}>`;
        break;
      }

      // Handle paragraph blocks
      case "paragraph": {
        htmlContent = `<p>${block.content?.text}</p>`;
        break;
      }

      // Handle image blocks
      case "image": {
        htmlContent = `<img src="${block.content?.url}" alt="${
          block.content?.alt || ""
        }" />`;
        break;
      }

      // Handle quote blocks (e.g., <blockquote>)
      case "quote": {
        htmlContent = `<blockquote>${block.content?.text}</blockquote>`;
        break;
      }

      // Handle list blocks (unordered <ul> and ordered <ol> lists)
      case "list": {
        const listType = block.content?.ordered ? "ol" : "ul"; // Check if it's an ordered list
        htmlContent = `<${listType}>${block.content?.items
          .map((item: any) => `<li>${item}</li>`)
          .join("")}</${listType}>`;
        break;
      }

      // Handle button blocks
      case "button": {
        htmlContent = `<button>${block.content?.label}</button>`;
        break;
      }

      // Handle embed blocks (e.g., for embedded media or HTML code)
      case "embed": {
        htmlContent = `<div class="embed-container">${block.content?.html}</div>`; // Use block.content.html to insert the embed code
        break;
      }

      // Handle code blocks
      case "code": {
        htmlContent = `<pre><code>${block.content?.code}</code></pre>`;
        break;
      }

      // Handle divider blocks (e.g., horizontal rule <hr>)
      case "divider": {
        htmlContent = `<hr />`;
        break;
      }

      // Handle table blocks (with headers and rows)
      case "table": {
        htmlContent = `<table><thead><tr>${block.content?.headers
          .map((header: any) => `<th>${header}</th>`)
          .join("")}</tr></thead><tbody>${block.content?.rows
          .map(
            (row: any) =>
              `<tr>${row.map((cell: any) => `<td>${cell}</td>`).join("")}</tr>`
          )
          .join("")}</tbody></table>`;
        break;
      }
      // Handle video blocks (e.g., YouTube, Vimeo, etc.)
      case "video": {
        const videoUrl = block.content?.url;
        if (videoUrl) {
          // Check if the video is a YouTube URL and convert it into an iframe
          const youtubeMatch = videoUrl.match(
            /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/]+\/[^/]+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]+)/
          );

          if (youtubeMatch) {
            // Extract the video ID from the URL
            const videoId = youtubeMatch[1];
            htmlContent = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
          } else {
            // For other video sources, embed them as <video> tag (generic fallback)
            htmlContent = `<video controls><source src="${videoUrl}" type="video/mp4" />Your browser does not support the video tag.</video>`;
          }
        }
        break;
      }

      // Handle audio blocks (e.g., audio files)
      case "audio": {
        const audioUrl = block.content?.url;
        if (audioUrl) {
          htmlContent = `<audio controls><source src="${audioUrl}" type="audio/mp3" />Your browser does not support the audio element.</audio>`;
        }
        break;
      }

      // Default case for any unknown block types
      default: {
        htmlContent = block.content?.text || "";
        break;
      }
    }

    return htmlContent;
  };

  const handlePlatformToggle = (platformId: number) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleSave = async (editorTitle: string, editorBlocks: AnyBlock[]) => {
    if (!editorTitle.trim()) throw new Error("Title is required");

    try {
      setIsSaving(true);
      setTitle(editorTitle);
      setBlocks(editorBlocks);

      // Prepare the save payload
      const savePayload = {
        title: editorTitle,
        blocks: editorBlocks,
        status: "draft" as const,
        platforms: selectedPlatforms
          .map((id) => platformMapping[id].toLowerCase())
          .filter(Boolean),
        tags: [], // TODO: Add tags functionality later
        isPublic: true,
        ...(currentPostId && { postId: currentPostId }), // Include postId if editing existing post
      };

      // Call the save API
      const response = await fetch("/api/content/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(savePayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save content");
      }

      const result = await response.json();

      // Update post state management
      if (result.post?.id) {
        setCurrentPostId(result.post.id);
        setIsEditing(true);
      }

      toast({
        title: "Success",
        description: `Content ${isEditing ? "updated" : "saved"} successfully!`,
      });
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save content. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = (previewTitle: string, previewBlocks: AnyBlock[]) => {
    const contentText = previewBlocks
      .map((block) => {
        switch (block.type) {
          case "text":
          case "heading":
          case "quote":
            return (block.content as any).text || "";
          case "list":
            return (block.content as any).items?.join(", ") || "";
          default:
            return "";
        }
      })
      .join(" ");

    if (!contentText.trim() && !previewTitle.trim()) {
      toast({
        title: "Nothing to preview",
        description: "Please add content before previewing",
        variant: "destructive",
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "Select platforms",
        description: "Please select at least one platform",
        variant: "destructive",
      });
      return;
    }

    const previewData = {
      title: previewTitle,
      content: contentText,
      blocks: previewBlocks,
      selectedPlatforms,
      timestamp: new Date().toISOString(),
    };

    const previewUrl = `/preview?data=${encodeURIComponent(
      JSON.stringify(previewData)
    )}`;

    window.open(previewUrl, "_blank", "width=1200,height=800,scrollbars=yes");

    toast({
      title: "Preview opened",
      description: "Check the new tab for your content preview",
    });
  };

  const handlePublish = () => {
    console.log("Publishing with blocks:", blocks);
    console.log("Publishing with title:", title);

    const contentText = blocks
      .map((block) => {
        switch (block.type) {
          case "text":
          case "heading":
          case "quote":
            return (block.content as any).text || "";
          case "list":
            return (block.content as any).items?.join(", ") || "";
          default:
            return "";
        }
      })
      .join(" ");

    console.log("Extracted content text:", contentText);
    console.log("Content text length:", contentText.length);

    if (!contentText.trim()) {
      toast({
        title: "Content required",
        description: "Please add content before publishing",
        variant: "destructive",
      });
      return;
    }

    // Allow publishing without platforms (will go to Globalist.live only)
    // The Publishing Hub will handle platform selection if needed

    // Open the Publishing Hub modal
    setShowPublishingHub(true);
  };

  const handleGlocalistLivePublish = async () => {
    // Create HTML content for all blocks
    const htmlContent = blocks
      .map((block) => convertBlockToHTML(block))
      .join("");

    try {
      console.log("articleImage", articleImage);

      // Create a FormData object to send the file and other data
      const formData = new FormData();
      formData.append("content", htmlContent);
      formData.append("title", title);
      // Append category as an array
      if (Array.isArray(category)) {
        category.forEach((cat) => formData.append("category[]", cat)); // Sending as an array
      } else {
        formData.append("category[]", category); // If category is a single value, send it as an array
      }
      // Append category as an array
      if (Array.isArray(country)) {
        country.forEach((cat) => formData.append("country[]", cat)); // Sending as an array
      } else {
        formData.append("country[]", country); // If category is a single value, send it as an array
      }
      formData.append("type", type);
      formData.append("author", session?.user?.email ?? "");
      formData.append("urlToImage", articleImage); // Assuming articleImage is a File object

      // Make the POST request
      if (htmlContent && title && category && country && type && articleImage) {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_GLOBALIST_LIVE_URL}/news-api/article/media-suite`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data", // Important for file uploads
            },
          }
        );

        if (response.status === 201) {
          toast({
            title: "Success",
            description: "Article published successfully",
          });
          return;
        } else {
          throw new Error("Publishing failed");
        }
      } else {
        toast({
          title: "Publishing failed",
          description: "Please fill in all fields",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error uploading to Media Suite:", error);
      toast({
        title: "Publishing failed",
        description: "Failed to upload content to Media Suite",
        variant: "destructive",
      });
      return;
    }
  };

  const handlePublishingHubPublish = async (
    socialContent: Record<string, string>,
    platformMedia: Record<string, File[]>,
    isScheduled: boolean = false,
    scheduledDate?: string
  ) => {
    setIsPublishing(true);

    if (selectedPlatforms.length === 0) {
      await handleGlocalistLivePublish();
      return;
    }

    try {
      // Save the post with scheduling information
      const savePayload = {
        title,
        blocks,
        category,
        country,
        type,
        articleImage,
        status: isScheduled ? ("scheduled" as const) : ("published" as const),
        platforms: selectedPlatforms
          .map((id) => platformMapping[id].toLowerCase())
          .filter(Boolean),
        tags: [], // TODO: Add tags functionality later
        isPublic: true,
        ...(isScheduled && scheduledDate && { scheduledDate }),
        ...(currentPostId && { postId: currentPostId }),
      };

      // Call the save API
      const response = await fetch("/api/content/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(savePayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save content");
      }

      const result = await response.json();

      // Update post state management
      if (result.post?.id) {
        setCurrentPostId(result.post.id);
        setIsEditing(true);
      }

      const platformNames = selectedPlatforms
        .map((id) => platformMapping[id])
        .join(", ");

      const description =
        isScheduled && scheduledDate
          ? `Scheduled for ${new Date(
              scheduledDate
            ).toLocaleString()} on ${platformNames}`
          : `Published to: ${platformNames}`;

      toast({ title: "Success", description });

      setSelectedPlatforms([]);
    } catch (error) {
      console.error("Publishing error:", error);
      toast({
        title: "Publishing failed",
        description:
          error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUpgradeFromModal = () => {
    setShowUpgradeModal(false);
    router.push("/pricing");
  };

  // Function to load existing post
  const loadPost = async (postId: string) => {
    try {
      const response = await fetch(`/api/content/load?postId=${postId}`);

      if (!response.ok) {
        throw new Error("Failed to load post");
      }

      const postData = await response.json();

      setTitle(postData.title);
      setBlocks(postData.blocks);
      setCurrentPostId(postData.id);
      setIsEditing(true);

      // Map backend platform names back to frontend IDs
      const platformIds =
        postData.platforms
          ?.map((platformName: string) => {
            const entry = Object.entries(platformMapping).find(
              ([_, name]) => name.toLowerCase() === platformName
            );
            return entry ? parseInt(entry[0]) : null;
          })
          .filter((id: number | null) => id !== null) || [];

      setSelectedPlatforms(platformIds);

      toast({
        title: "Post Loaded",
        description: "Your post has been loaded successfully!",
      });
    } catch (error) {
      console.error("Load error:", error);
      toast({
        title: "Error",
        description: "Failed to load post. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background w-full flex flex-col">
      <div className="w-full px-4 md:px-8 py-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Distribution
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Create, edit, and distribute your content across platforms
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isEditing && currentPostId && (
                <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  Editing Post #{currentPostId.slice(-6)}
                </div>
              )}
              {isSaving && (
                <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full flex items-center gap-1">
                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Platform Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Publishing Platforms</CardTitle>
          </CardHeader>
          <CardContent>
            <PlatformSelector
              selectedPlatforms={selectedPlatforms}
              onPlatformToggle={handlePlatformToggle}
            />
          </CardContent>
        </Card>

        {/* Content Editor */}
        <div className="w-full space-y-6">
          <StreamlinedEditor
            key={currentPostId || "new-post"} // Force re-mount when post changes
            user={user}
            platforms={selectedPlatforms}
            onSave={handleSave}
            onPreview={(title, blocks) => handlePreview(title, blocks)}
            onPublish={handlePublish}
            onContentChange={(
              newTitle: string,
              newBlocks: AnyBlock[],
              category?: string[],
              country?: string[],
              type?: string,
              imageBase64?: any
            ) => {
              setTitle(newTitle);
              setBlocks(newBlocks);
              setCategory(category || []);
              setCountry(country || []);
              setType(type || "");
              setArticleImage(imageBase64);
            }}
            initialTitle={title}
            initialBlocks={blocks}
          />
        </div>
      </div>

      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        onUpgrade={handleUpgradeFromModal}
      />

      <PublishingHubModal
        open={showPublishingHub}
        onOpenChange={setShowPublishingHub}
        title={title}
        blocks={blocks}
        selectedPlatforms={selectedPlatforms}
        onPublish={handlePublishingHubPublish}
      />
    </div>
  );
}
