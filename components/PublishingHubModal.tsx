"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Sparkles, Send, Edit3, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AnyBlock } from "@/types/editor";
import { PlatformMediaUpload } from "@/components/PlatformMediaUpload";

interface PublishingHubModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  blocks: AnyBlock[];
  selectedPlatforms: number[];
  onPublish: (
    socialContent: Record<string, string>,
    platformMedia: Record<string, File[]>,
    isScheduled?: boolean,
    scheduledDate?: string
  ) => void;
}

const platformMap = {
  1: "Twitter",
  2: "LinkedIn",
  3: "Instagram",
  4: "YouTube",
  5: "TikTok",
  6: "Facebook",
};

export function PublishingHubModal({
  open,
  onOpenChange,
  title,
  blocks,
  selectedPlatforms,
  onPublish,
}: PublishingHubModalProps) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [socialContent, setSocialContent] = useState<Record<string, string>>(
    {}
  );
  const [platformMedia, setPlatformMedia] = useState<Record<string, File[]>>(
    {}
  );
  const [hasOptimized, setHasOptimized] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const { toast } = useToast();

  // Convert blocks to plain text for AI processing
  const getArticleContent = useCallback(() => {
    return blocks
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
  }, [blocks]);

  // Get platform names for selected platforms
  const getSelectedPlatformNames = useCallback(() => {
    return selectedPlatforms
      .map((id) => platformMap[id as keyof typeof platformMap])
      .filter(Boolean);
  }, [selectedPlatforms]);

  // Initialize social content with excerpts for selected platforms
  useEffect(() => {
    if (selectedPlatforms.length > 0 && !hasOptimized) {
      const initialContent: Record<string, string> = {};
      const articleContent = getArticleContent();
      const excerpt =
        articleContent.substring(0, 200) +
        (articleContent.length > 200 ? "..." : "");

      getSelectedPlatformNames().forEach((platform) => {
        initialContent[platform] = excerpt;
      });

      setSocialContent(initialContent);
    }
  }, [
    selectedPlatforms,
    hasOptimized,
    getArticleContent,
    getSelectedPlatformNames,
  ]);

  // Optimize content for social media using AI
  const handleOptimizeForSocial = async () => {
    if (selectedPlatforms.length === 0) {
      toast({
        title: "No platforms selected",
        description: "Please select at least one platform to optimize for",
        variant: "destructive",
      });
      return;
    }

    const articleContent = getArticleContent();
    if (!articleContent.trim()) {
      toast({
        title: "No content to optimize",
        description: "Please add content before optimizing for social media",
        variant: "destructive",
      });
      return;
    }

    setIsOptimizing(true);
    try {
      const response = await fetch("/api/ai/enhance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tool: "contentAtomizer",
          payload: {
            articleContent,
            platforms: getSelectedPlatformNames(),
          },
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to optimize content");
      }

      setSocialContent(data.result);
      setHasOptimized(true);

      toast({
        title: "Content optimized!",
        description:
          "AI has generated platform-specific content for you to review and edit",
      });
    } catch (error: any) {
      console.error("Optimization failed:", error);
      toast({
        title: "Optimization failed",
        description:
          error.message || "Failed to optimize content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  // Handle content editing for each platform
  const handleContentChange = (platform: string, content: string) => {
    setSocialContent((prev) => ({
      ...prev,
      [platform]: content,
    }));
  };

  // Handle media upload for each platform
  const handlePlatformMediaUpload = (platform: string, files: File[]) => {
    setPlatformMedia((prev) => ({
      ...prev,
      [platform]: files,
    }));
  };

  // Validate platform requirements before publishing
  const validatePlatformRequirements = async () => {
    const errors: string[] = [];

    for (const platform of getSelectedPlatformNames()) {
      try {
        const response = await fetch("/publishing-criteria.json");
        const data = await response.json();
        // Convert platform name to lowercase to match the JSON keys
        const platformKey = platform.toLowerCase();
        const criteria = data.platforms[platformKey];

        if (criteria) {
          const platformFiles = platformMedia[platform] || [];
          const imageFiles = platformFiles.filter((f) =>
            f.type.startsWith("image/")
          );
          const videoFiles = platformFiles.filter((f) =>
            f.type.startsWith("video/")
          );

          // Check if media is required
          if (
            criteria.image.required &&
            imageFiles.length === 0 &&
            videoFiles.length === 0
          ) {
            errors.push(`${platform} requires at least one image or video`);
          }

          if (criteria.video.required && videoFiles.length === 0) {
            errors.push(`${platform} requires a video`);
          }
        }
      } catch (error) {
        console.error(`Failed to validate ${platform}:`, error);
      }
    }

    return errors;
  };

  // Handle final publishing
  const handleConfirmPublish = async () => {
    // Validate scheduling if enabled
    if (isScheduled && (!scheduleDate || !scheduleTime)) {
      toast({
        title: "Scheduling incomplete",
        description: "Please select both date and time for scheduling.",
        variant: "destructive",
      });
      return;
    }

    // Validate platform requirements first
    const validationErrors = await validatePlatformRequirements();

    if (validationErrors.length > 0) {
      toast({
        title: "Platform requirements not met",
        description: validationErrors.join(". "),
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);
    try {
      const scheduledDate =
        isScheduled && scheduleDate && scheduleTime
          ? new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
          : undefined;

      await onPublish(socialContent, platformMedia, isScheduled, scheduledDate);
      onOpenChange(false);
      setSocialContent({});
      setPlatformMedia({});
      setHasOptimized(false);
      setIsScheduled(false);
      setScheduleDate("");
      setScheduleTime("");
    } catch (error) {
      console.error("Publishing failed:", error);
      toast({
        title: "Publishing failed",
        description: "Failed to publish content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSocialContent({});
      setPlatformMedia({});
      setHasOptimized(false);
      setIsScheduled(false);
      setScheduleDate("");
      setScheduleTime("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto w-[95vw] mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Publishing Hub
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Compact Article Preview */}
          <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{title}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {getArticleContent().substring(0, 120)}...
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              {getSelectedPlatformNames()
                .slice(0, 3)
                .map((platform) => (
                  <Badge key={platform} variant="secondary" className="text-xs">
                    {platform}
                  </Badge>
                ))}
              {getSelectedPlatformNames().length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{getSelectedPlatformNames().length - 3}
                </Badge>
              )}
            </div>
          </div>

          {/* AI Optimization Button */}
          {selectedPlatforms.length > 0 && (
            <div className="flex justify-center">
              <Button
                onClick={handleOptimizeForSocial}
                disabled={isOptimizing}
                size="sm"
                variant="outline"
                className="w-full sm:w-auto"
              >
                {isOptimizing ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-3 w-3" />
                    Optimize for Social Media
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Platform Selection Prompt */}
          {selectedPlatforms.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="text-muted-foreground">
                    <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">
                      Want to share on social media?
                    </h3>
                    <p className="text-sm">
                      Your content will be published to Globalist.live. You can
                      also share it on social platforms for wider reach.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Platform Tabs */}
          {selectedPlatforms.length > 0 && (
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Social Media Content ({selectedPlatforms.length} platforms)
                </h3>
              </div>
              <Tabs
                defaultValue={getSelectedPlatformNames()[0]}
                className="w-full"
              >
                <TabsList className="flex w-full overflow-x-auto scrollbar-none">
                  {getSelectedPlatformNames().map((platform) => (
                    <TabsTrigger
                      key={platform}
                      value={platform}
                      className="flex-shrink-0 px-3 py-1.5 text-xs whitespace-nowrap"
                    >
                      {platform}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {getSelectedPlatformNames().map((platform) => (
                  <TabsContent
                    key={platform}
                    value={platform}
                    className="space-y-3"
                  >
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Edit3 className="h-4 w-4" />
                          {platform} Content
                          {hasOptimized && (
                            <Badge variant="secondary" className="text-xs">
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI Optimized
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Textarea
                          value={socialContent[platform] || ""}
                          onChange={(e) =>
                            handleContentChange(platform, e.target.value)
                          }
                          placeholder={`Content for ${platform}...`}
                          className="min-h-[120px] resize-none text-sm"
                        />
                        <div className="mt-2 text-xs text-muted-foreground">
                          {hasOptimized
                            ? "Edit the AI-generated content to match your voice and style"
                            : "This is an excerpt of your article. Use the 'Optimize for Social Media' button above to generate platform-specific content."}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Platform-specific Media Upload */}
                    <PlatformMediaUpload
                      platform={platform}
                      onMediaUpload={(files) =>
                        handlePlatformMediaUpload(platform, files)
                      }
                      uploadedFiles={platformMedia[platform] || []}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}

          {/* Scheduling Section */}
          <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <Switch
                id="schedule-toggle"
                checked={isScheduled}
                onCheckedChange={setIsScheduled}
              />
              <Label htmlFor="schedule-toggle" className="text-sm font-medium">
                Schedule for later
              </Label>
            </div>

            {isScheduled && (
              <div className="flex gap-2">
                <Input
                  id="schedule-date"
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-32 text-xs"
                  min={new Date().toISOString().split("T")[0]}
                />
                <Input
                  id="schedule-time"
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-24 text-xs"
                />
              </div>
            )}
          </div>

          {/* Publishing Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPublishing}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPublish}
              disabled={
                isPublishing ||
                (isScheduled && (!scheduleDate || !scheduleTime))
              }
              className="w-full sm:w-auto min-w-[150px] order-1 sm:order-2"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isScheduled ? "Scheduling..." : "Publishing..."}
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  {isScheduled
                    ? "Schedule Post"
                    : selectedPlatforms.length > 0
                    ? "Confirm & Publish"
                    : "Publish to Globalist.live"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
