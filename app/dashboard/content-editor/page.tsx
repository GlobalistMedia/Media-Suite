"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { StreamlinedEditor } from "@/components/contentEditor/StreamlinedEditor";
import { UpgradeModal } from "@/components/contentEditor/UpgradeModal";
import { PublishingHubModal } from "@/components/PublishingHubModal";
import { ActionButtons } from "@/components/contentEditor/ActionButtons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlatformSelector } from "@/components/platform-selector";
import {
  Sparkles,
  Type,
  Image as ImageIcon,
  Video,
  Link2,
  Heading1,
  Quote,
  List,
  Music,
  Volume2,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import type { AnyBlock, ActionButton } from "@/types/editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
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

// Email list interface for ActionButtons component
interface EmailListForActionButtons {
  _id: string;
  name: string;
  subscriberCount: number;
  tags: string[];
  description?: string;
  createdAt: string;
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

  // Action buttons state
  const [actionButtons, setActionButtons] = useState<ActionButton[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // Email list state
  const [emailLists, setEmailLists] = useState<EmailList[]>([]);
  const [isLoadingEmailLists, setIsLoadingEmailLists] = useState(true);

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

  // Function to load email lists (similar to EmailListManager)
  const loadEmailLists = useCallback(async () => {
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
  }, [session?.user?.email]);

  // Load email lists from settings
  useEffect(() => {
    if (status === "authenticated") {
      loadEmailLists();
    }
  }, [status, loadEmailLists]);

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

  // Sidebar block management functions
  const handleAddBlock = (type: AnyBlock["type"]) => {
    const newBlock: AnyBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: getDefaultBlockContent(type),
      order: blocks.length,
    };
    setBlocks((prev) => [...prev, newBlock]);
    toast({
      title: "Block added",
      description: `Added a new ${type} block`,
    });
  };

  const getDefaultBlockContent = (type: AnyBlock["type"]): any => {
    switch (type) {
      case "text":
        return { text: "", html: "" };
      case "heading":
        return { text: "", level: 1 };
      case "image":
        return { url: "", alt: "" };
      case "video":
        return { url: "" };
      case "audio":
        return { url: "", title: "", artist: "" };
      case "embed":
        return { url: "", html: "" };
      case "quote":
        return { text: "", author: "" };
      case "list":
        return { items: [""], ordered: false };
      default:
        return {};
    }
  };

  const handleDeleteBlock = (blockId: string) => {
    setBlocks((prev) => prev.filter((block) => block.id !== blockId));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
    toast({
      title: "Block deleted",
      description: "The block has been removed",
    });
  };

  const handleSelectBlock = (blockId: string) => {
    setSelectedBlockId(blockId);
  };

  const handleMoveBlockUp = (blockId: string) => {
    const currentIndex = blocks.findIndex((block) => block.id === blockId);
    if (currentIndex > 0) {
      const newBlocks = [...blocks];
      [newBlocks[currentIndex], newBlocks[currentIndex - 1]] = [
        newBlocks[currentIndex - 1],
        newBlocks[currentIndex],
      ];
      setBlocks(newBlocks.map((block, index) => ({ ...block, order: index })));
      toast({ title: "Block moved up" });
    }
  };

  const handleMoveBlockDown = (blockId: string) => {
    const currentIndex = blocks.findIndex((block) => block.id === blockId);
    if (currentIndex < blocks.length - 1) {
      const newBlocks = [...blocks];
      [newBlocks[currentIndex], newBlocks[currentIndex + 1]] = [
        newBlocks[currentIndex + 1],
        newBlocks[currentIndex],
      ];
      setBlocks(newBlocks.map((block, index) => ({ ...block, order: index })));
      toast({ title: "Block moved down" });
    }
  };

  // Action button management functions
  const handleRemoveActionButton = (buttonId: string) => {
    setActionButtons((prev) => prev.filter((btn) => btn.id !== buttonId));
    toast({
      title: "Action button removed",
      description: "The action button has been removed from your content.",
    });
  };

  const handleClearAllActionButtons = () => {
    setActionButtons([]);
    toast({
      title: "All action buttons cleared",
      description: "All action buttons have been removed from your content.",
    });
  };

  const handleReorderActionButtons = (startIndex: number, endIndex: number) => {
    const result = Array.from(actionButtons);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setActionButtons(result);
  };

  const handleMoveActionButtonUp = (buttonId: string) => {
    const currentIndex = actionButtons.findIndex(
      (button) => button.id === buttonId
    );
    if (currentIndex > 0) {
      handleReorderActionButtons(currentIndex, currentIndex - 1);
      toast({ title: "Action button moved up" });
    }
  };

  const handleMoveActionButtonDown = (buttonId: string) => {
    const currentIndex = actionButtons.findIndex(
      (button) => button.id === buttonId
    );
    if (currentIndex < actionButtons.length - 1) {
      handleReorderActionButtons(currentIndex, currentIndex + 1);
      toast({ title: "Action button moved down" });
    }
  };

  // Quick actions functions
  const handleClearAllBlocks = () => {
    blocks.forEach((block) => handleDeleteBlock(block.id));
    toast({ title: "All content cleared" });
  };

  const handleClearEverything = () => {
    blocks.forEach((block) => handleDeleteBlock(block.id));
    handleClearAllActionButtons();
    toast({ title: "Everything cleared" });
  };

  const handleExportJSON = () => {
    const exportData = {
      blocks: blocks,
      actionButtons: actionButtons,
      timestamp: new Date().toISOString(),
    };
    const content = JSON.stringify(exportData, null, 2);
    navigator.clipboard.writeText(content);
    toast({ title: "Content copied to clipboard" });
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
    console.log("emailLists", emailLists);
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

    // Validate required fields before opening Publishing Hub
    if (!title?.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title before publishing",
        variant: "destructive",
      });
      return;
    }

    if (!category || category.length === 0) {
      toast({
        title: "Category required",
        description: "Please select a category before publishing",
        variant: "destructive",
      });
      return;
    }

    if (!country || country.length === 0) {
      toast({
        title: "Country required",
        description: "Please select a country before publishing",
        variant: "destructive",
      });
      return;
    }

    if (!type?.trim()) {
      toast({
        title: "Type required",
        description: "Please select a type before publishing",
        variant: "destructive",
      });
      return;
    }

    if (!articleImage) {
      toast({
        title: "Article image required",
        description: "Please upload an article image before publishing",
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

      // Check if there are any Email Subscribe action buttons
      const hasEmailSubscribeButton = actionButtons.some(
        (button) => button.type === "email_subscribe"
      );

      // Add email list data only if there are Email Subscribe action buttons
      if (hasEmailSubscribeButton) {
        // Find the first Email Subscribe button with an email list
        const emailSubscribeButton = actionButtons.find(
          (button) =>
            button.type === "email_subscribe" && button.config.emailListId
        );

        if (
          emailSubscribeButton &&
          emailSubscribeButton.config.emailListId !== "clear"
        ) {
          const selectedList = emailLists.find(
            (list) => list._id === emailSubscribeButton.config.emailListId
          );

          if (selectedList) {
            console.log("Adding email list data from action button:", {
              id: emailSubscribeButton.config.emailListId,
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
                description: `The email list "${selectedList.name}" in your action button has no active subscribers. Please update the action button or add subscribers first.`,
                variant: "destructive",
              });
              return;
            }

            formData.append(
              "emailListId",
              emailSubscribeButton.config.emailListId!
            );
          } else {
            toast({
              title: "Email List Not Found",
              description:
                "The email list in your action button could not be found. Please update the action button.",
              variant: "destructive",
            });
            return;
          }
        } else {
          toast({
            title: "Email Subscribe Button Required",
            description:
              "You have Email Subscribe action buttons but no email list is selected. Please update your action buttons.",
            variant: "destructive",
          });
          return;
        }
      }

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
          const successMessage = hasEmailSubscribeButton
            ? `Article published successfully with email subscribe functionality`
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

      // toast({ title: "Success", description });

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

  // Block types for sidebar
  const blockTypes = [
    {
      type: "text" as const,
      icon: Type,
      label: "Text",
      description: "Add a text block",
    },
    {
      type: "heading" as const,
      icon: Heading1,
      label: "Heading",
      description: "Add a heading",
    },
    {
      type: "image" as const,
      icon: ImageIcon,
      label: "Image",
      description: "Add an image",
    },
    {
      type: "video" as const,
      icon: Video,
      label: "Video",
      description: "Embed a video",
    },
    {
      type: "audio" as const,
      icon: Music,
      label: "Audio",
      description: "Add audio or music",
    },
    {
      type: "embed" as const,
      icon: Link2,
      label: "Embed",
      description: "Embed content",
    },
    {
      type: "quote" as const,
      icon: Quote,
      label: "Quote",
      description: "Add a quote",
    },
    {
      type: "list" as const,
      icon: List,
      label: "List",
      description: "Add a list",
    },
  ];

  // Helper functions for sidebar
  const getBlockIcon = (type: AnyBlock["type"]) => {
    const iconMap: Record<AnyBlock["type"], any> = {
      text: Type,
      image: ImageIcon,
      video: Video,
      audio: Volume2,
      embed: Link2,
      heading: Heading1,
      quote: Quote,
      list: List,
    };
    return iconMap[type] || Type;
  };

  const getBlockLabel = (type: AnyBlock["type"]) => {
    const labelMap: Record<AnyBlock["type"], string> = {
      text: "Text",
      heading: "Heading",
      image: "Image",
      video: "Video",
      audio: "Audio",
      embed: "Embed",
      quote: "Quote",
      list: "List",
    };
    return labelMap[type] || "Unknown";
  };

  const getBlockPreview = (block: AnyBlock) => {
    switch (block.type) {
      case "text":
        const textContent = (block.content as any).text || "";
        return textContent.length > 30
          ? textContent.substring(0, 30) + "..."
          : textContent || "Empty text block";
      case "heading":
        const headingContent = (block.content as any).text || "";
        const level = (block.content as any).level || 1;
        return `H${level}: ${
          headingContent.length > 25
            ? headingContent.substring(0, 25) + "..."
            : headingContent || "Empty heading"
        }`;
      case "image":
        const imageUrl = (block.content as any).url || "";
        const imageAlt = (block.content as any).alt || "";
        return imageUrl ? imageAlt || "Image" : "No image selected";
      case "video":
        const videoUrl = (block.content as any).url || "";
        return videoUrl ? "Video embedded" : "No video URL";
      case "audio":
        const audioUrl = (block.content as any).url || "";
        const audioTitle = (block.content as any).title || "";
        const audioArtist = (block.content as any).artist || "";
        if (audioUrl) {
          if (audioTitle && audioArtist) {
            return `${audioTitle} - ${audioArtist}`;
          }
          return audioTitle || "Audio embedded";
        }
        return "No audio URL";
      case "embed":
        const embedUrl = (block.content as any).url || "";
        return embedUrl ? "Content embedded" : "No embed URL";
      case "quote":
        const quoteText = (block.content as any).text || "";
        return quoteText.length > 30
          ? quoteText.substring(0, 30) + "..."
          : quoteText || "Empty quote";
      case "list":
        const items = (block.content as any).items || [];
        const ordered = (block.content as any).ordered || false;
        return `${ordered ? "Ordered" : "Unordered"} list (${
          items.length
        } items)`;
      default:
        return "Unknown block";
    }
  };

  return (
    <div className="min-h-screen bg-background w-full flex relative">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
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
              title={title}
              blocks={blocks}
              actionButtons={actionButtons}
              selectedBlockId={selectedBlockId}
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
            />
          </div>
        </div>
      </div>

      {/* Sidebar Content - Always Visible */}
      <div className="w-80 bg-background border-l shadow-xl flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm">Tools</h2>
          </div>
        </div>

        {/* Sidebar Content */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Add Blocks Section */}
            <div>
              <h3 className="font-medium text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                Add Blocks
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {blockTypes.map(({ type, icon: Icon }) => (
                  <Button
                    key={type}
                    variant="ghost"
                    onClick={() => handleAddBlock(type)}
                    className="w-full h-12 p-2 hover:bg-muted/50"
                    title={type.charAt(0).toUpperCase() + type.slice(1)}
                  >
                    <Icon className="h-6 w-6 text-muted-foreground" />
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Content Blocks Management */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Content Blocks ({blocks.length})
                </h3>
                {blocks.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAllBlocks}
                    className="text-xs text-destructive hover:text-destructive"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              {blocks.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <div className="text-xs">No blocks added yet</div>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {blocks.map((block, index) => {
                    const Icon = getBlockIcon(block.type);
                    const isSelected = selectedBlockId === block.id;
                    const isFirst = index === 0;
                    const isLast = index === blocks.length - 1;

                    return (
                      <Card
                        key={block.id}
                        className={cn(
                          "p-3 cursor-pointer transition-all hover:bg-muted/50",
                          isSelected &&
                            "ring-2 ring-primary ring-offset-1 bg-primary/5"
                        )}
                        onClick={() => handleSelectBlock(block.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <GripVertical className="h-3 w-3 text-muted-foreground" />
                            <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="secondary" className="text-xs">
                                  {getBlockLabel(block.type)}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  #{index + 1}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {getBlockPreview(block)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Move Up Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveBlockUp(block.id);
                              }}
                              disabled={isFirst}
                              className="p-1 h-auto hover:bg-primary/20"
                              title="Move up"
                            >
                              <ChevronUp className="h-3 w-3" />
                            </Button>

                            {/* Move Down Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveBlockDown(block.id);
                              }}
                              disabled={isLast}
                              className="p-1 h-auto hover:bg-primary/20"
                              title="Move down"
                            >
                              <ChevronDown className="h-3 w-3" />
                            </Button>

                            {/* Select Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectBlock(block.id);
                              }}
                              className="p-1 h-auto hover:bg-primary/20"
                              title="Select block"
                            >
                              {isSelected ? (
                                <Eye className="h-3 w-3" />
                              ) : (
                                <EyeOff className="h-3 w-3" />
                              )}
                            </Button>

                            {/* Delete Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteBlock(block.id);
                              }}
                              className="p-1 h-auto hover:bg-destructive hover:text-destructive-foreground"
                              title="Delete block"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            <Separator />

            {/* Action Buttons Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Action Buttons ({actionButtons.length})
                </h3>
                {actionButtons.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAllActionButtons}
                    className="text-xs text-destructive hover:text-destructive"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              {/* Action Buttons Component */}
              <ActionButtons
                buttons={actionButtons}
                onButtonsChange={setActionButtons}
                emailLists={emailLists.map((list) => ({
                  _id: list._id,
                  name: list.name,
                  subscriberCount: list.subscriberCount,
                  tags: list.tags,
                  description: list.description,
                  createdAt: list.createdAt.toString(),
                }))}
                isLoadingEmailLists={isLoadingEmailLists}
                validationData={{
                  title,
                  category,
                  country,
                  type,
                  articleImage,
                  blocks,
                }}
              />

              {/* Action Buttons List with Management Controls */}
              {actionButtons.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground">
                    Current Buttons:
                  </h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {actionButtons.map((button, index) => {
                      const isFirst = index === 0;
                      const isLast = index === actionButtons.length - 1;

                      return (
                        <Card key={button.id} className="p-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <GripVertical className="h-3 w-3 text-muted-foreground" />
                              <Badge variant="outline" className="text-xs">
                                {button.type.replace("_", " ")}
                              </Badge>
                              <span className="text-xs truncate">
                                {button.label}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              {/* Move Up Button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleMoveActionButtonUp(button.id)
                                }
                                disabled={isFirst}
                                className="p-1 h-auto hover:bg-primary/20"
                                title="Move up"
                              >
                                <ChevronUp className="h-3 w-3" />
                              </Button>

                              {/* Move Down Button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleMoveActionButtonDown(button.id)
                                }
                                disabled={isLast}
                                className="p-1 h-auto hover:bg-primary/20"
                                title="Move down"
                              >
                                <ChevronDown className="h-3 w-3" />
                              </Button>

                              {/* Remove Button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleRemoveActionButton(button.id)
                                }
                                className="p-1 h-auto hover:bg-destructive hover:text-destructive-foreground"
                                title="Remove button"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Quick Actions Section */}
            <div>
              <h3 className="font-medium text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAllBlocks}
                  className="w-full justify-start"
                  disabled={blocks.length === 0}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All Blocks
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAllActionButtons}
                  className="w-full justify-start"
                  disabled={actionButtons.length === 0}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Action Buttons
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearEverything}
                  className="w-full justify-start"
                  disabled={blocks.length === 0 && actionButtons.length === 0}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Everything
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportJSON}
                  className="w-full justify-start"
                  disabled={blocks.length === 0 && actionButtons.length === 0}
                >
                  Export JSON
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
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
