import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Sparkles,
  Lightbulb,
  FileText,
  Wand2,
  TrendingUp,
  Search,
  X,
  Loader2,
} from "lucide-react";
import {
  parseAIBlocks,
  previewTextFromBlocks,
} from "@/lib/services/aiBlockService";

const TOOLS = [
  {
    id: "ideaGeneration",
    label: "Idea Generation",
    icon: Lightbulb,
    description: "Generate 5 unique article ideas.",
  },
  {
    id: "contentCreation",
    label: "Content Creation",
    icon: FileText,
    description: "Generate a full article draft.",
  },
  {
    id: "contentImprover",
    label: "Content Improver",
    icon: TrendingUp,
    description: "Improve your draft article.",
  },
  {
    id: "seoSupport",
    label: "SEO Support",
    icon: Search,
    description: "Get SEO recommendations.",
  },
];

const IMPROVER_MODES = ["Clarity", "Tone", "Structure", "SEO", "Punch-up"];

// Helper to parse AI response for each tool
function parseAIResponse(tool: string | null, response: any) {
  if (!response) return { content: null, usageStats: null };
  // If response is the full API response, extract result and usageStats
  const result = response.result !== undefined ? response.result : response;
  const usageStats = response.usageStats || null;
  switch (tool) {
    case "ideaGeneration":
      return { content: result.ideas || [], usageStats };
    case "contentCreation":
      return { content: result, usageStats };
    case "contentImprover":
      return { content: result, usageStats };
    case "seoSupport":
      return { content: result, usageStats };
    default:
      return { content: result, usageStats };
  }
}

// Render result based on tool/response type, using parsed content
function renderResult({
  selectedTool,
  result,
  copiedKey,
  setCopiedKey,
  onDraftIdea,
  onInsertBlocks,
  setOpen,
  seoHeadline,
  setSeoHeadline,
  selectedKeywords,
  setSelectedKeywords,
}: {
  selectedTool: string | null;
  result: any;
  copiedKey: string | null;
  setCopiedKey: (key: string | null) => void;
  onDraftIdea: (idea: any) => void;
  onInsertBlocks?: (blocks: any[]) => void;
  setOpen: (open: boolean) => void;
  seoHeadline: string;
  setSeoHeadline: React.Dispatch<React.SetStateAction<string>>;
  selectedKeywords: string[];
  setSelectedKeywords: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  if (!result || !selectedTool) return null;

  // Safety check: ensure the result is for the current tool
  if (result.tool && result.tool !== selectedTool) {
    return null;
  }

  const { content, usageStats } = parseAIResponse(selectedTool, result);
  // Usage stats display
  const usageStatsDisplay = usageStats ? (
    <div className="mb-2 text-xs text-muted-foreground flex flex-wrap gap-4">
      <span>Requests left: {usageStats.hourlyRequestsRemaining}</span>
      <span>Tokens left: {usageStats.hourlyTokensRemaining}</span>
      <span>Tokens used: {usageStats.tokensUsed}</span>
    </div>
  ) : null;
  // Tool-specific rendering
  if (selectedTool === "ideaGeneration" && Array.isArray(content)) {
    return (
      <div>
        {usageStatsDisplay}
        <div className="space-y-4">
          {content.map((idea, idx) => (
            <Card key={idx} className="p-4">
              <div className="font-semibold mb-1">{idea.headline}</div>
              <div className="text-sm mb-1 text-muted-foreground">
                {idea.metaDescription}
              </div>
              <div className="text-xs italic text-muted-foreground">
                Tone: {idea.tone}
              </div>
              <div className="flex justify-end mt-2 gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    if (
                      typeof window !== "undefined" &&
                      typeof window.requestAnimationFrame === "function"
                    ) {
                      // Use a callback passed from the parent
                      if (typeof onDraftIdea === "function") {
                        onDraftIdea(idea);
                      }
                    }
                  }}
                >
                  Draft This Idea
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      idea.headline + "\n" + idea.metaDescription
                    );
                    setCopiedKey("idea-" + idx);
                    setTimeout(() => setCopiedKey(null), 1500);
                  }}
                >
                  {copiedKey === "idea-" + idx ? (
                    <span className="text-xs">Copied!</span>
                  ) : (
                    <span className="text-xs">Copy</span>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (selectedTool === "seoSupport" && typeof content === "object") {
    return (
      <div>
        {usageStatsDisplay}
        <div className="space-y-4">
          {Object.entries(content).map(([key, value]) => {
            // Special handling for suggested headlines
            if (key === "suggestedHeadlines" && Array.isArray(value)) {
              return (
                <Card key={key} className="p-4">
                  <div className="mb-3">
                    <span className="font-semibold capitalize">
                      Suggested Headlines
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">
                      Select a headline or enter your own below
                    </p>
                  </div>
                  <div className="space-y-2 mb-3">
                    {value.map((headline, i) => (
                      <label
                        key={i}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="suggestedHeadline"
                          value={headline}
                          onChange={(e) => setSeoHeadline(e.target.value)}
                          checked={seoHeadline === headline}
                          className="text-primary focus:ring-primary"
                        />
                        <span className="text-sm">{headline}</span>
                      </label>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Or enter your own headline:
                    </label>
                    <Input
                      placeholder="Enter custom headline..."
                      value={seoHeadline}
                      onChange={(e) => setSeoHeadline(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </Card>
              );
            }

            // Special handling for keywords
            if (key === "keywords" && Array.isArray(value)) {
              return (
                <Card key={key} className="p-4">
                  <div className="mb-3">
                    <span className="font-semibold capitalize">Keywords</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      Select keywords to use in your content
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {value.map((keyword, i) => (
                      <label
                        key={i}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          value={keyword}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedKeywords((prev: string[]) => [
                                ...prev,
                                keyword,
                              ]);
                            } else {
                              setSelectedKeywords((prev: string[]) =>
                                prev.filter((k: string) => k !== keyword)
                              );
                            }
                          }}
                          checked={selectedKeywords.includes(keyword)}
                          className="text-primary focus:ring-primary"
                        />
                        <span className="text-sm">{keyword}</span>
                      </label>
                    ))}
                  </div>
                </Card>
              );
            }

            // Default rendering for other fields
            return (
              <Card key={key} className="p-4">
                <div className="mb-2">
                  <span className="font-semibold capitalize">{key}</span>
                </div>
                {Array.isArray(value) ? (
                  <ul className="list-disc pl-5 text-sm">
                    {value.map((v, i) => (
                      <li key={i}>{v}</li>
                    ))}
                  </ul>
                ) : (
                  <Textarea
                    value={value as string}
                    readOnly
                    className="min-h-[40px]"
                  />
                )}
              </Card>
            );
          })}
        </div>
      </div>
    );
  }
  // For text results (improver, creation)
  if (
    selectedTool === "contentCreation" ||
    selectedTool === "contentImprover"
  ) {
    // Extract contentBlocks from the result object
    let blocks: any[] | undefined = undefined;
    if (content && Array.isArray(content.contentBlocks)) {
      blocks = content.contentBlocks;
    } else if (Array.isArray(content)) {
      blocks = content;
    }
    if (blocks && Array.isArray(blocks)) {
      return (
        <div>
          {usageStatsDisplay}
          <Card className="p-4">
            <pre className="whitespace-pre-wrap text-sm mb-4">
              {previewTextFromBlocks(blocks)}
            </pre>
            <div className="flex justify-end gap-2 mt-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => {
                  if (onInsertBlocks && blocks) onInsertBlocks(blocks);
                  setOpen(false);
                }}
              >
                Insert into Editor
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (blocks) {
                    navigator.clipboard.writeText(
                      previewTextFromBlocks(blocks)
                    );
                    setCopiedKey("text");
                    setTimeout(() => setCopiedKey(null), 1500);
                  }
                }}
              >
                {copiedKey === "text" ? (
                  <span className="text-xs">Copied!</span>
                ) : (
                  <span className="text-xs">Copy</span>
                )}
              </Button>
            </div>
          </Card>
        </div>
      );
    }
    // fallback: show nothing if no valid blocks
    return null;
  }
  // fallback
  return (
    <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
      {JSON.stringify(content, null, 2)}
    </pre>
  );
}

export function AIAssistantModal({
  articleContent,
  headline,
  onResult,
  onInsertBlocks,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: {
  articleContent: string;
  headline: string;
  onResult?: (result: any) => void;
  onInsertBlocks?: (blocks: any[]) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : open;
  const setIsOpen = controlledOnOpenChange || setOpen;
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  // Tool-specific state
  const [topicPrompt, setTopicPrompt] = useState("");
  const [creationHeadline, setCreationHeadline] = useState("");
  const [creationMeta, setCreationMeta] = useState("");
  const [creationTone, setCreationTone] = useState("");
  const [improverModes, setImproverModes] = useState<string[]>([]);
  const [seoHeadline, setSeoHeadline] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Ref to store a pending idea to prefill after switching tab
  const pendingIdeaRef = useRef<any>(null);

  // Reset state when tool changes or modal closes
  React.useEffect(() => {
    setTopicPrompt("");
    setCreationHeadline("");
    setCreationMeta("");
    setCreationTone("");
    setImproverModes([]);
    setSeoHeadline("");
    setSelectedKeywords([]);
    setResult(null);
    setError(null);
    setLoading(false);
    setCopiedKey(null);
  }, [selectedTool, open]);

  // Handler to switch to content creation and prefill fields
  function handleDraftIdea(idea: any) {
    setResult(null);
    setError(null);
    setLoading(false);
    setCopiedKey(null);
    pendingIdeaRef.current = idea;
    setSelectedTool("contentCreation");
  }

  // When switching to contentCreation, if a pending idea exists, prefill fields
  useEffect(() => {
    if (selectedTool === "contentCreation" && pendingIdeaRef.current) {
      const idea = pendingIdeaRef.current;
      setCreationHeadline(idea.headline || "");
      setCreationMeta(idea.metaDescription || "");
      setCreationTone(idea.tone || "");
      pendingIdeaRef.current = null;
    }
  }, [selectedTool]);

  // Handler to insert blocks into the editor (to be passed from parent)
  function handleInsertBlocks(blocks: any[]) {
    if (typeof onInsertBlocks === "function") {
      onInsertBlocks(parseAIBlocks(blocks));
      setOpen(false); // Close modal after insert
    }
  }

  // Build API payload based on selected tool
  function buildPayload() {
    switch (selectedTool) {
      case "ideaGeneration":
        return {
          tool: "ideaGeneration",
          payload: { topicPrompt },
        };
      case "contentCreation":
        return {
          tool: "contentCreation",
          payload: {
            headline: creationHeadline,
            metaDescription: creationMeta,
            tone: creationTone,
          },
        };
      case "contentImprover":
        return {
          tool: "contentImprover",
          payload: {
            articleContent,
            preferences: improverModes,
          },
        };
      case "seoSupport":
        // Prioritize headline if provided, otherwise use article content
        if (seoHeadline.trim()) {
          return {
            tool: "seoSupport",
            payload: {
              draftHeadline: seoHeadline,
            },
          };
        } else if (articleContent.trim()) {
          return {
            tool: "seoSupport",
            payload: {
              articleContent,
            },
          };
        } else {
          return null;
        }
      default:
        return null;
    }
  }

  // Handle API call
  async function handleGenerate() {
    // Clear all state first to prevent stale data issues
    setResult(null);
    setError(null);
    setCopiedKey(null);
    setLoading(true);

    const payload = buildPayload();
    if (!payload) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/ai/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "API error");
      }

      const data = await res.json();

      // Double-check the response structure
      if (!data.success) {
        throw new Error(data.error || "AI processing failed");
      }

      setResult(data);
      onResult?.(data);
    } catch (err: any) {
      console.error("AI Assistant error:", err);
      setError(err.message || "Something went wrong");
      setResult(null); // Ensure result is cleared on error
    } finally {
      setLoading(false);
    }
  }

  // UI for tool-specific inputs
  function renderInputs() {
    switch (selectedTool) {
      case "ideaGeneration":
        return (
          <div className="space-y-4">
            <label className="block font-medium">Topic Prompt</label>
            <Textarea
              placeholder="e.g. The future of remote work in 2025"
              value={topicPrompt}
              onChange={(e) => setTopicPrompt(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        );
      case "contentCreation":
        return (
          <div className="space-y-4">
            <label className="block font-medium">Headline</label>
            <Input
              placeholder="e.g. Remote Work Revolution"
              value={creationHeadline}
              onChange={(e) => setCreationHeadline(e.target.value)}
            />
            <label className="block font-medium">Meta Description</label>
            <Textarea
              placeholder="How remote work is reshaping business in 2025."
              value={creationMeta}
              onChange={(e) => setCreationMeta(e.target.value)}
              className="min-h-[60px]"
            />
            <label className="block font-medium">Tone</label>
            <Input
              placeholder="e.g. analytical, provocative, humorous"
              value={creationTone}
              onChange={(e) => setCreationTone(e.target.value)}
            />
          </div>
        );
      case "contentImprover":
        return (
          <div className="space-y-4">
            <label className="block font-medium">Improvement Modes</label>
            <div className="flex flex-wrap gap-2">
              {IMPROVER_MODES.map((mode) => (
                <Badge
                  key={mode}
                  variant={improverModes.includes(mode) ? "default" : "outline"}
                  onClick={() =>
                    setImproverModes((prev) =>
                      prev.includes(mode)
                        ? prev.filter((m) => m !== mode)
                        : [...prev, mode]
                    )
                  }
                  className="cursor-pointer select-none"
                >
                  {mode}
                </Badge>
              ))}
            </div>
            <label className="block font-medium mt-4">Article Preview</label>
            <Textarea
              value={articleContent}
              readOnly
              className="min-h-[120px] opacity-70"
            />
          </div>
        );
      case "seoSupport":
        return (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              <p>
                Enter a headline to get SEO recommendations, or leave it empty
                to analyze your article content.
              </p>
            </div>
            <label className="block font-medium">
              Headline for SEO Analysis
            </label>
            <Input
              placeholder="e.g. Remote Work Revolution"
              value={seoHeadline}
              onChange={(e) => setSeoHeadline(e.target.value)}
            />
            {seoHeadline.trim() ? (
              <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                ✓ Will analyze headline: {seoHeadline}
              </div>
            ) : articleContent.trim() ? (
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                ✓ Will analyze article content ({articleContent.length}{" "}
                characters)
              </div>
            ) : (
              <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                ⚠ Please enter a headline or ensure your article has content
              </div>
            )}
            {!seoHeadline.trim() && (
              <>
                <label className="block font-medium mt-4">
                  Article Content (will be analyzed if no headline provided)
                </label>
                <Textarea
                  value={articleContent}
                  readOnly
                  className="min-h-[120px] opacity-70"
                />
              </>
            )}
          </div>
        );
      default:
        return null;
    }
  }

  // Validation for enabling Generate button
  function canGenerate() {
    switch (selectedTool) {
      case "ideaGeneration":
        return !!topicPrompt.trim();
      case "contentCreation":
        return (
          !!creationHeadline.trim() &&
          !!creationMeta.trim() &&
          !!creationTone.trim()
        );
      case "contentImprover":
        return improverModes.length > 0 && !!articleContent.trim();
      case "seoSupport":
        // Require either headline or article content
        return !!seoHeadline.trim() || !!articleContent.trim();
      default:
        return false;
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg h-14 w-14 p-0 flex items-center justify-center bg-primary text-white hover:bg-primary/90 focus:ring-2 focus:ring-primary/40"
          size="icon"
          aria-label="Open AI Assistant"
        >
          <Sparkles className="h-7 w-7" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Assistant
          </DialogTitle>
        </DialogHeader>
        {/* Tool Selection */}
        <div className="flex gap-2 overflow-x-auto py-2 mb-4">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Button
                key={tool.id}
                variant={selectedTool === tool.id ? "default" : "outline"}
                onClick={() => {
                  setSelectedTool(tool.id);
                  // Clear result when switching tools to prevent rendering mismatches
                  setResult(null);
                  setError(null);
                  setCopiedKey(null);
                  setSelectedKeywords([]);
                }}
                className="flex flex-col items-center gap-1 min-w-[90px] px-2 py-2"
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{tool.label}</span>
              </Button>
            );
          })}
        </div>
        {/* Scrollable Content Area */}
        <div className="max-h-[70vh] overflow-y-auto px-1 pb-2">
          {/* Dynamic Inputs */}
          {selectedTool && <Card className="p-4 mb-4">{renderInputs()}</Card>}
          {/* Error State */}
          {error && (
            <div className="bg-red-100 text-red-700 rounded p-2 mb-2 text-sm flex items-center gap-2">
              <X className="h-4 w-4" /> {error}
            </div>
          )}
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-primary">Generating...</span>
            </div>
          )}
          {/* Result Display */}
          {!loading && result && (
            <div className="mt-4">
              {renderResult({
                selectedTool,
                result,
                copiedKey,
                setCopiedKey,
                onDraftIdea: handleDraftIdea,
                onInsertBlocks,
                setOpen,
                seoHeadline,
                setSeoHeadline,
                selectedKeywords,
                setSelectedKeywords,
              })}
            </div>
          )}
        </div>
        {/* Footer: Submit Button */}
        <DialogFooter>
          <Button
            disabled={!canGenerate() || loading}
            className="w-full"
            onClick={handleGenerate}
          >
            {loading
              ? "Generating..."
              : selectedTool
              ? "Generate"
              : "Select a Tool"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
