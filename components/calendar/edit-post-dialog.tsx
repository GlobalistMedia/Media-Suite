"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Calendar,
  Clock,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Globe,
} from "lucide-react";
import { SiTiktok } from "react-icons/si";
import type { ScheduledPost } from "@/types/calendar";

interface EditPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: ScheduledPost | null;
  onUpdatePost: (post: ScheduledPost) => void;
}

const platforms = [
  { id: 1, name: "X", icon: Twitter, color: "bg-black text-white" },
  { id: 2, name: "LinkedIn", icon: Linkedin, color: "bg-blue-600 text-white" },
  {
    id: 3,
    name: "Instagram",
    icon: Instagram,
    color: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
  },
  { id: 4, name: "YouTube", icon: Youtube, color: "bg-red-600 text-white" },
  { id: 5, name: "TikTok", icon: SiTiktok, color: "bg-blue-300 text-white" },
  { id: 6, name: "Personal", icon: Globe, color: "bg-gray-600 text-white" },
];

export function EditPostDialog({
  open,
  onOpenChange,
  post,
  onUpdatePost,
}: EditPostDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    date: "",
    time: "",
    platforms: [] as number[],
    status: "scheduled" as "scheduled" | "draft" | "published",
  });

  useEffect(() => {
    if (post) {
      const postDate = new Date(post.scheduledDate);
      setFormData({
        title: post.title,
        content: post.content,
        date: postDate.toISOString().split("T")[0],
        time: postDate.toTimeString().slice(0, 5),
        platforms: post.platforms,
        status: post.status as "scheduled" | "draft" | "published",
      });
    }
  }, [post]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !post ||
      !formData.title ||
      !formData.content ||
      !formData.date ||
      !formData.time
    ) {
      return;
    }

    const scheduledDate = new Date(`${formData.date}T${formData.time}`);

    const updatedPost: ScheduledPost = {
      ...post,
      title: formData.title,
      content: formData.content,
      scheduledDate,
      platforms: formData.platforms,
      status: formData.status,
    };

    onUpdatePost(updatedPost);
    onOpenChange(false);
  };

  const togglePlatform = (platformId: number) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter((id) => id !== platformId)
        : [...prev.platforms, platformId],
    }));
  };

  if (!post) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-2xl mx-auto px-4 sm:px-6 py-6 rounded-xl shadow-lg overflow-y-auto max-h-[90vh]">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg sm:text-xl">
            Edit Scheduled Post
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter post title"
              className="w-full"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium">
              Content <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              placeholder="Enter post content"
              rows={4}
              className="w-full resize-none"
            />
            <div className="text-xs text-muted-foreground text-right">
              {formData.content.length} characters
            </div>
          </div>

          {/* Platforms */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Platforms <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {platforms.map((platform) => {
                const IconComponent = platform.icon;
                const isSelected = formData.platforms.includes(platform.id);

                return (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => togglePlatform(platform.id)}
                    className={`
                      p-3 rounded-lg border-2 transition-all duration-200 flex items-center gap-2
                      ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-400"
                          : "border-gray-200 hover:border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 dark:hover:border-gray-500 dark:text-gray-100"
                      }
                    `}
                  >
                    <IconComponent className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">
                      {platform.name}
                    </span>
                  </button>
                );
              })}
            </div>
            {formData.platforms.length === 0 && (
              <p className="text-xs text-red-500 dark:text-red-400">
                Please select at least one platform
              </p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium">
                Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="text-sm font-medium">
                Time <span className="text-red-500">*</span>
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, time: e.target.value }))
                }
                className="w-full"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">
              Status
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value: "scheduled" | "draft" | "published") =>
                setFormData((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Post Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Preview</Label>
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 dark:border-gray-600">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm dark:text-gray-100">
                  {formData.title || "Untitled Post"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-3 dark:text-gray-300">
                {formData.content || "No content"}
              </p>
              <div className="flex flex-wrap gap-1">
                {formData.platforms.map((platformId) => {
                  const platform = platforms.find((p) => p.id === platformId);
                  return platform ? (
                    <Badge
                      key={platformId}
                      variant="outline"
                      className="text-xs dark:border-gray-500 dark:text-gray-300"
                    >
                      {platform.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !formData.title ||
                !formData.content ||
                !formData.date ||
                !formData.time ||
                formData.platforms.length === 0
              }
              className="w-full sm:w-auto sm:flex-1 order-1 sm:order-2"
            >
              Update Post
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
