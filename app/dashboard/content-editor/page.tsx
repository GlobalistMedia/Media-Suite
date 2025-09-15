"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { StreamlinedEditor } from "@/components/contentEditor/StreamlinedEditor";
import { UpgradeModal } from "@/components/contentEditor/UpgradeModal";
import { PublishingHubModal } from "@/components/PublishingHubModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlatformSelector } from "@/components/platform-selector";
import { Sparkles } from "lucide-react";
import type { AnyBlock } from "@/types/editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";

// Email list interfaces (matching EmailListManager)
interface Subscriber {
  id: string;
  email: string;
  name?: string;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  source?: string;
}

interface EmailList {
  _id: string;
  name: string;
  description: string;
  tags: string[];
  createdAt: Date;
  subscribers: Subscriber[];
  subscriberCount: number;
}

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

  // Email list state
  const [emailLists, setEmailLists] = useState<EmailList[]>([]);
  const [isLoadingEmailLists, setIsLoadingEmailLists] = useState(true);
  const [selectedEmailList, setSelectedEmailList] = useState<string>("");

  const router = useRouter();
  const { toast } = useToast();
  // saveAIContent was removed with the old AI Assistant. If you want to save, implement logic here or use another method.
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setUser({ isPremium: session.user.userSubscriptionLevel !== "free" });
    }
  }, [session, status]);

  // Function to load existing post
  const loadPost = useCallback(
    async (postId: string) => {
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
    },
    [toast]
  );

  // Load post from URL parameter if editing
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const postId = urlParams.get("postId");

      if (postId && status === "authenticated") {
        loadPost(postId);
      }
    }
  }, [status, loadPost]);

  // Load email lists from settings
  useEffect(() => {
    if (status === "authenticated") {
      loadEmailLists();
    }
  }, [status]);

  // Function to load email lists (similar to EmailListManager)
  const loadEmailLists = async () => {
    try {
      setIsLoadingEmailLists(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_GLOBALIST_LIVE_URL}/email-list/me?creatorEmail=${session?.user?.email}&page=1&limit=10000`
      );
      console.log("response", response.data);
      if (response.data.status === 200 && response.data.response.emails) {
        const emailLists = response.data.response.emails;

        // Load email lists
        if (emailLists) {
          setEmailLists(emailLists);
          console.log("Email lists loaded:", emailLists);
        }
      }
    } catch (error) {
      console.error("Error loading email lists:", error);
    } finally {
      setIsLoadingEmailLists(false);
    }
  };

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
      console.log("selectedEmailList", selectedEmailList);

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

      // Add selected email list data
      if (selectedEmailList !== "clear") {
        const selectedList = emailLists.find(
          (list) => list._id === selectedEmailList
        );
        if (selectedList) {
          console.log("Adding email list data:", {
            id: selectedEmailList,
            name: selectedList.name,
            subscriberCount: selectedList.subscriberCount,
          });

          // Check if email list has subscribers
          const subscriberEmails = selectedList.subscribers.map(
            (sub) => sub.email
          );

          if (subscriberEmails.length === 0) {
            toast({
              title: "Empty Email List",
              description: `The selected email list "${selectedList.name}" has no active subscribers. Please select a different list or add subscribers first.`,
              variant: "destructive",
            });
            return;
          }

          formData.append("emailListId", selectedEmailList);

          // Make the POST request
          if (
            htmlContent &&
            title &&
            category &&
            country &&
            type &&
            articleImage
          ) {
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
              const successMessage = selectedEmailList
                ? `Article published successfully to ${
                    emailLists.find((list) => list._id === selectedEmailList)
                      ?.name
                  } (${
                    emailLists.find((list) => list._id === selectedEmailList)
                      ?.subscriberCount
                  } subscribers)`
                : "Article published successfully";

              toast({
                title: "Success",
                description: successMessage,
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
        } else {
          toast({
            title: "Email List Not Found",
            description:
              "The selected email list could not be found. Please refresh and try again.",
            variant: "destructive",
          });
          return;
        }
      } else {
        console.log("No email list selected");
        toast({
          title: "Publishing failed",
          description: "Please select an email list",
          variant: "destructive",
        });
        return;
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


    try {
      // Always call handleGlocalistLivePublish first
      if (!isScheduled) {
        await handleGlocalistLivePublish();
      }

      // Always save the post when scheduling or publishing
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
        ...(isScheduled &&
          scheduledDate && {
            scheduledDate: new Date(scheduledDate).toISOString(),
          }),
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

      // Show success message based on platforms and scheduling
      const platformNames = selectedPlatforms
        .map((id) => platformMapping[id])
        .join(", ");

      let description = "";
      if (isScheduled && scheduledDate) {
        if (selectedPlatforms.length > 0) {
          description = `Scheduled for ${new Date(
            scheduledDate
          ).toLocaleString()} on ${platformNames}`;
        } else {
          description = `Scheduled for ${new Date(
            scheduledDate
          ).toLocaleString()} on Globalist.live`;
        }
      } else {
        if (selectedPlatforms.length > 0) {
          description = `Published to: ${platformNames}`;
        } else {
          description = `Published to Globalist.live`;
        }
      }

      toast({ title: "Success", description });

      // Refresh calendar data if post was scheduled
      if (isScheduled) {
        await refreshCalendarData();
      }

      setSelectedPlatforms([]);

      // Handle scheduled publishing
      if (isScheduled && scheduledDate) {
        const scheduleTime = new Date(scheduledDate).getTime();
        const currentTime = new Date().getTime();
        const delay = scheduleTime - currentTime;

        if (delay > 0) {
          // Schedule the article to be published at the specified time
          setTimeout(async () => {
            try {
              // Re-publish to Globalist.live at scheduled time
              await handleGlocalistLivePublish();

              toast({
                title: "Scheduled Article Published",
                description:
                  "Your scheduled article has been published to Globalist.live",
              });
            } catch (error) {
              console.error("Error publishing scheduled article:", error);
              toast({
                title: "Scheduled Publishing Failed",
                description:
                  "Failed to publish scheduled article. Please try again.",
                variant: "destructive",
              });
            }
          }, delay);

          toast({
            title: "Article Scheduled",
            description: `Your article will be published on ${new Date(
              scheduledDate
            ).toLocaleString()}`,
          });
        } else {
          toast({
            title: "Invalid Schedule Time",
            description: "Scheduled time must be in the future",
            variant: "destructive",
          });
        }
      }
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

  // Function to refresh calendar data after scheduling
  const refreshCalendarData = async () => {
    try {
      // Trigger a custom event that the calendar can listen to
      window.dispatchEvent(new CustomEvent("calendarRefresh"));
    } catch (error) {
      console.error("Error refreshing calendar data:", error);
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

        {/* Email List Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Select Email List</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingEmailLists ? (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">
                  Loading email lists...
                </p>
              </div>
            ) : emailLists.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  No email lists found. Create email lists in Settings first.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <Select
                  value={selectedEmailList}
                  onValueChange={setSelectedEmailList}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose an email list..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clear">
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium text-muted-foreground">
                          Clear selection
                        </span>
                        <span className="text-sm text-muted-foreground ml-2">
                          (No email list)
                        </span>
                      </div>
                    </SelectItem>
                    {emailLists.map((list) => (
                      <SelectItem key={list._id} value={list._id}>
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{list.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            ({list.subscriberCount} subscribers)
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedEmailList && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {(() => {
                      const selectedList = emailLists.find(
                        (list) => list._id === selectedEmailList
                      );
                      return selectedList ? (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">
                              {selectedList.name}
                            </h4>
                            {(() => {
                              const activeSubscribers =
                                selectedList.subscriberCount;

                              if (activeSubscribers === 0) {
                                return (
                                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                    Empty
                                  </span>
                                );
                              } else {
                                return (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                    Ready
                                  </span>
                                );
                              }
                            })()}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                            <div>
                              <span className="font-medium">
                                Total Subscribers:
                              </span>{" "}
                              {selectedList.subscriberCount}
                            </div>
                          </div>
                          {selectedList.tags.length > 0 && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              <span className="font-medium">Tags:</span>{" "}
                              <span>{selectedList.tags.join(", ")}</span>
                            </div>
                          )}
                          {selectedList.description && (
                            <p className="text-xs text-muted-foreground mt-2">
                              <span className="font-medium">Description:</span>{" "}
                              {selectedList.description}
                            </p>
                          )}
                          <div className="mt-2 text-xs text-muted-foreground">
                            <span className="font-medium">Created:</span>{" "}
                            {new Date(
                              selectedList.createdAt
                            ).toLocaleDateString()}
                          </div>
                          {(() => {
                            if (selectedList.subscriberCount === 0) {
                              return (
                                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                                  ⚠️ This email list has no active subscribers
                                  and cannot be used for publishing.
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            )}
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
