"use client";

import { useState, useEffect } from "react";
import { EditorCanvas } from "./EditorCanvas";
import { AIAssistantModal } from "./AIAssistantModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Save,
  Eye,
  FileText,
  Sparkles,
  CheckCircle,
  Send,
  Mail,
  Heart,
} from "lucide-react";
import type { AnyBlock, ActionButton } from "@/types/editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Country } from "country-state-city"; // Import country library
import axios from "axios";

interface User {
  isPremium: boolean;
}

interface StreamlinedEditorProps {
  user: User;
  platforms: number[];
  onSave?: (title: string, blocks: AnyBlock[]) => Promise<void>;
  onPreview?: (title: string, blocks: AnyBlock[]) => void;
  onPublish?: () => void;
  onContentChange?: (
    title: string,
    blocks: AnyBlock[],
    category: string[],
    country: string[],
    type: string,
    imageBase64: string | null,
    accessType: string,
    seoData?: {
      headline: string;
      keywords: string[];
      metaDescription: string;
    }
  ) => void;
  title: string;
  blocks: AnyBlock[];
  actionButtons?: ActionButton[];
  selectedBlockId?: string | null;
}

export function StreamlinedEditor({
  user,
  onSave,
  onPreview,
  onPublish,
  platforms,
  onContentChange,
  title,
  blocks,
  actionButtons = [],
  selectedBlockId = null,
}: StreamlinedEditorProps) {
  const [type, setType] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [countries, setCountries] = useState<
    { label: string; value: string }[]
  >([]); // Countries state
  const [categories, setCategories] = useState<
    { label: string; value: string; name: string; _id: string }[]
  >([]); // Categories state
  const [selectedCountry, setSelectedCountry] = useState<string>(""); // Selected country
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [accessType, setAccessType] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null); // Image preview state
  const [imageBase64, setImageBase64] = useState<any | null>(null as any); // Image base64 string state

  // SEO data state
  const [seoHeadline, setSeoHeadline] = useState<string>("");
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  const [seoMetaDescription, setSeoMetaDescription] = useState<string>("");

  const { toast } = useToast();

  // Function to handle image upload and convert it to base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Set the base64 encoded image string
        if (reader.result) {
          setImageBase64(file);
          // Set the image preview URL
          setImagePreview(URL.createObjectURL(file));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to handle SEO data insertion from AI Assistant
  const handleSeoDataInsert = (seoData: {
    headline: string;
    keywords: string[];
    metaDescription: string;
  }) => {
    console.log("=== handleSeoDataInsert called in StreamlinedEditor ===");
    console.log("SEO Data Inserted", seoData);
    console.log("Function type:", typeof handleSeoDataInsert);

    setSeoHeadline(seoData.headline);
    setSeoKeywords(seoData.keywords);
    setSeoMetaDescription(seoData.metaDescription);

    toast({
      title: "SEO Data Inserted",
      description:
        "SEO headline, keywords, and meta description have been added to your content.",
    });

    console.log("=== handleSeoDataInsert completed ===");
  };

  // Update the onValueChange to handle multiple selections
  const handleCategoryChange = (value: string) => {
    setSelectedCategory([value]);
  };

  // Sync changes back to parent component with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onContentChange?.(
        title,
        blocks,
        selectedCategory,
        [selectedCountry],
        type,
        imageBase64,
        accessType,
        {
          headline: seoHeadline,
          keywords: seoKeywords,
          metaDescription: seoMetaDescription,
        }
      );
    }, 300); // Debounce to prevent excessive updates

    return () => clearTimeout(timeoutId);
  }, [
    title,
    blocks,
    selectedCategory,
    selectedCountry,
    type,
    imageBase64,
    accessType,
    seoHeadline,
    seoKeywords,
    seoMetaDescription,
    onContentChange,
  ]);

  // Fetch categories
  const getAllCategories = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_GLOBALIST_LIVE_URL}/categories?page=1&perPage=9999`
      );

      setCategories(
        data?.response?.details?.map((category: any) => ({
          label: category.name,
          value: category._id,
        }))
      );
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to fetch Categories.",
        variant: "destructive",
      });
    }
  };

  // Fetch countries and categories
  useEffect(() => {
    const fetchedCountries = Country.getAllCountries().map((country) => ({
      label: country.name,
      value: country.isoCode,
    }));
    setCountries(fetchedCountries);
    getAllCategories();
  }, []);

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your content",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await onSave?.(title, blocks);
      setLastSaved(new Date());
      toast({
        title: "Saved",
        description: "Your content has been saved successfully",
      });
    } catch (error) {
      console.error("Save failed:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save your content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title to preview your content",
        variant: "destructive",
      });
      return;
    }
    onPreview?.(title, blocks);
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title to publish your content",
        variant: "destructive",
      });
      return;
    }
    try {
      await onPublish?.();
    } catch (error) {
      console.error("Publish failed:", error);
      toast({
        title: "Publish Failed",
        description: "Failed to publish your content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const getWordCount = () => {
    return blocks
      .filter((block) => block.type === "text" || block.type === "heading")
      .reduce((count, block) => {
        let text = "";
        if (block.type === "text" && block.content?.text) {
          text = block.content.text;
        } else if (block.type === "heading" && block.content?.text) {
          text = block.content.text;
        }

        if (text.trim()) {
          const words = text
            .trim()
            .split(/\s+/)
            .filter((word: string) => word.length > 0);
          return count + words.length;
        }
        return count;
      }, 0);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-y-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold">Content Editor</h1>
              {user.isPremium && (
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>

            <div className="flex flex-col gap-2 items-end sm:flex-row sm:items-center">
              <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{getWordCount()} words</span>
                </div>
                {lastSaved && (
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Saved {lastSaved.toLocaleTimeString()}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreview}
                  disabled={!title.trim()}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving || !title.trim()}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button
                  size="sm"
                  onClick={handlePublish}
                  disabled={isPublishing || !title.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isPublishing ? "Publishing..." : "Publish"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-4">
              <Input
                placeholder="Enter your title..."
                value={title}
                onChange={(e) => {
                  if (onContentChange) {
                    onContentChange(
                      e.target.value,
                      blocks,
                      selectedCategory,
                      [selectedCountry],
                      type,
                      imageBase64,
                      accessType,
                      {
                        headline: seoHeadline,
                        keywords: seoKeywords,
                        metaDescription: seoMetaDescription,
                      }
                    );
                  }
                }}
                className="text-2xl font-bold border-none bg-transparent placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 flex-1"
              />
              {actionButtons.length > 0 && (
                <div className="flex gap-2">
                  {actionButtons
                    .filter((button) => button.type === "email_subscribe")
                    .map((button) => (
                      <Button
                        key={button.id}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        {button.type === "email_subscribe" && (
                          <Mail className="h-4 w-4" />
                        )}
                        {button.label}
                      </Button>
                    ))}
                </div>
              )}
            </div>
          </Card>

          {/* Editor Canvas */}
          <Card className="p-4 sm:p-6 min-h-[300px] w-full">
            <EditorCanvas
              initialBlocks={blocks}
              actionButtons={actionButtons}
              selectedBlockId={selectedBlockId}
              onContentChange={(newBlocks) => {
                if (onContentChange) {
                  onContentChange(
                    title,
                    newBlocks,
                    selectedCategory,
                    [selectedCountry],
                    type,
                    imageBase64,
                    accessType,
                    {
                      headline: seoHeadline,
                      keywords: seoKeywords,
                      metaDescription: seoMetaDescription,
                    }
                  );
                }
              }}
              className="focus-within:ring-2 focus-within:ring-primary/20 rounded-lg"
            />
          </Card>

          <div className="flex justify-center my-2">
            {actionButtons
              .filter((button) => button.type === "donation")
              .map((button) => (
                <Button
                  key={button.id}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {button.type === "donation" && <Heart className="h-4 w-4" />}
                  {button.label}
                </Button>
              ))}
          </div>

          {platforms.length === 0 && (
            <>
              {/* Form Fields - Compact Grid Layout */}
              <Card className="mb-6 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Type Dropdown */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Type
                    </label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Choose Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blog">Blog</SelectItem>
                        <SelectItem value="news">News</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Country Dropdown */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Country
                    </label>
                    <Select
                      value={selectedCountry}
                      onValueChange={setSelectedCountry}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Choose Country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Category Dropdown */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Category
                    </label>
                    <Select
                      value={selectedCategory[0] || ""}
                      onValueChange={(value) => handleCategoryChange(value)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Choose Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.value}
                            value={category.value}
                          >
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              {/* Image Uploader */}
              <Card className="mb-6 p-4 sm:p-6">
                <CardHeader>
                  <CardTitle className="text-lg">Upload Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full mb-4 p-2 border rounded"
                  />
                  {imagePreview && (
                    <div className="mt-4">
                      <h3 className="font-semibold text-sm">Image Preview:</h3>
                      <img
                        src={imagePreview}
                        alt="Uploaded Preview"
                        className="mt-2 max-w-full h-auto"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* SEO Data Display */}
              {(seoHeadline ||
                seoKeywords.length > 0 ||
                seoMetaDescription) && (
                <Card className="mb-6 p-4 sm:p-6">
                  <CardHeader>
                    <CardTitle className="text-lg">SEO Data</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {seoHeadline && (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          SEO Headline
                        </label>
                        <Input
                          value={seoHeadline}
                          onChange={(e) => setSeoHeadline(e.target.value)}
                          placeholder="SEO Headline"
                          className="w-full"
                        />
                      </div>
                    )}

                    {seoKeywords.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Keywords
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {seoKeywords.map((keyword, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="px-3 py-1"
                            >
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {seoMetaDescription && (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Meta Description
                        </label>
                        <Textarea
                          value={seoMetaDescription}
                          onChange={(e) =>
                            setSeoMetaDescription(e.target.value)
                          }
                          placeholder="Meta Description"
                          className="w-full min-h-[80px]"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
          {/* Empty State */}
          {blocks.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Start Writing</h3>
                <p className="text-sm">
                  Click anywhere to add your first block, or use the AI
                  assistant to generate content
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating AI Assistant */}
      <AIAssistantModal
        articleContent={blocks
          .map((block) => {
            switch (block.type) {
              case "text":
              case "heading":
              case "quote":
                return (block.content as any).text || "";
              case "list":
                return (block.content as any).items?.join("\n") || "";
              default:
                return "";
            }
          })
          .join("\n\n")}
        headline={title}
        onInsertBlocks={(aiBlocks) => {
          // Ensure each new block has a unique id
          const newBlocks = aiBlocks.map((b, i) => ({
            ...b,
            id:
              b.id && typeof b.id === "string"
                ? b.id
                : Math.random().toString(36).substr(2, 9),
            order: i,
          }));
          if (onContentChange) {
            onContentChange(
              title,
              newBlocks,
              selectedCategory,
              [selectedCountry],
              type,
              imageBase64,
              accessType,
              {
                headline: seoHeadline,
                keywords: seoKeywords,
                metaDescription: seoMetaDescription,
              }
            );
          }
          // Clear selection state after insertion
          // Note: Selection state is managed by EditorCanvas internally
          toast({
            title: "AI Content Inserted",
            description: "The generated content has been added to your editor.",
          });
        }}
        onSeoDataInsert={(seoData) => {
          console.log("=== onSeoDataInsert callback triggered ===");
          console.log("Received SEO data:", seoData);
          handleSeoDataInsert(seoData);
        }}
      />
    </div>
  );
}
