"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FullscreenToggle } from "./FullscreenToggle";
import { useBlockManager } from "./hooks/useBlockManager";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import type { AnyBlock, ActionButton } from "@/types/editor";
import { AIAssistantModal } from "./AIAssistantModal";
import { SortableBlock } from "./SortableBlock";

interface EditorCanvasProps {
  initialBlocks?: AnyBlock[];
  onContentChange?: (blocks: AnyBlock[]) => void;
  className?: string;
  actionButtons?: ActionButton[];
  selectedBlockId?: string | null;
}

export function EditorCanvas({
  initialBlocks = [],
  onContentChange,
  className,
  actionButtons = [],
  selectedBlockId = null,
}: EditorCanvasProps) {
  const { toast } = useToast();

  // State for AI improvement modal
  const [improveModalOpen, setImproveModalOpen] = useState(false);
  const [blockToImprove, setBlockToImprove] = useState<AnyBlock | null>(null);

  const {
    editorState,
    updateBlock,
    addBlock,
    deleteBlock,
    reorderBlocks,
    selectBlock,
    toggleFullscreen,
  } = useBlockManager({ initialBlocks, onContentChange });

  // Synchronize selectedBlockId prop with editorState
  useEffect(() => {
    if (selectedBlockId !== editorState.selectedBlockId) {
      selectBlock(selectedBlockId);
    }
  }, [selectedBlockId, editorState.selectedBlockId, selectBlock]);

  // Multi-select state
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null
  );
  // Track the indices of selected blocks (for non-contiguous selection)
  const [selectedBlockIndices, setSelectedBlockIndices] = useState<number[]>(
    []
  );

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Multi-select logic
  const handleBlockSelect = (
    blockId: string,
    index: number,
    event?: React.MouseEvent
  ) => {
    if (event && event.shiftKey) {
      // Shift+Click: toggle selection (custom, non-contiguous)
      setSelectedBlockIds((prev) =>
        prev.includes(blockId)
          ? prev.filter((id) => id !== blockId)
          : [...prev, blockId]
      );
      setSelectedBlockIndices((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index]
      );
      setLastSelectedIndex(index);
    } else {
      // Single select
      setSelectedBlockIds([blockId]);
      setSelectedBlockIndices([index]);
      setLastSelectedIndex(index);
    }
    selectBlock(blockId);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = editorState.blocks.findIndex(
        (block) => block.id === active.id
      );
      const newIndex = editorState.blocks.findIndex(
        (block) => block.id === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderBlocks(oldIndex, newIndex);
      }
    }
  };

  // Handler to trigger AI improvement for a block
  const handleImproveWithAI = (block: AnyBlock) => {
    console.log("handleImproveWithAI called", block);
    setBlockToImprove(block);
    setImproveModalOpen(true);
  };

  // Helper: get selected text-based blocks
  const textBasedTypes = ["text", "heading", "quote", "list"];
  const selectedTextBlocks = editorState.blocks.filter(
    (block) =>
      selectedBlockIds.includes(block.id) && textBasedTypes.includes(block.type)
  );

  // Handler for bulk improve
  const handleBulkImproveWithAI = () => {
    if (selectedTextBlocks.length > 0) {
      setBlockToImprove({
        id: "bulk",
        type: "text", // dummy type
        content: {
          text: selectedTextBlocks
            .map((b) => {
              if (b.type === "list") return b.content.items?.join("\n") || "";
              if (
                b.type === "text" ||
                b.type === "heading" ||
                b.type === "quote"
              )
                return b.content.text || "";
              return "";
            })
            .join("\n\n"),
          html: selectedTextBlocks
            .map((b) => {
              if (b.type === "list") return b.content.items?.join("\n") || "";
              if (
                b.type === "text" ||
                b.type === "heading" ||
                b.type === "quote"
              )
                return b.content.text || "";
              return "";
            })
            .join("\n\n"),
        },
        order: 0, // Add required order property
      });
      setImproveModalOpen(true);
    }
  };

  // Helper to get text content for AI (ensures both text and html for text blocks)
  function getBlockTextContent(b: AnyBlock): string {
    if (b.type === "list") {
      return b.content.items?.join("\n") || "";
    } else if (
      b.type === "text" &&
      b.content &&
      typeof b.content.text === "string"
    ) {
      // Only include html if it's different from text and not empty
      if (b.content.html && b.content.html !== b.content.text) {
        return b.content.text + "\n" + b.content.html;
      }
      return b.content.text;
    } else if (
      b.type === "heading" &&
      b.content &&
      typeof b.content.text === "string"
    ) {
      return b.content.text;
    } else if (
      b.type === "quote" &&
      b.content &&
      typeof b.content.text === "string"
    ) {
      return b.content.text;
    }
    return "";
  }

  return (
    <div
      className={cn(
        "flex flex-col h-screen overflow-x-hidden relative",
        className
      )}
    >
      {/* Main Editor Area - Fixed position, no padding changes */}
      <div
        className={cn(
          "flex flex-col flex-1 min-w-0 relative",
          editorState.isFullscreen && "fixed inset-0 z-50 bg-background"
        )}
      >
        {/* Header - Fixed position */}
        <div className="sticky top-0 z-40 bg-background border-b flex-shrink-0 shadow-sm">
          <div className="flex items-center justify-between p-4 min-h-[64px]">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">
                Content Editor
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <FullscreenToggle
                isFullscreen={editorState.isFullscreen}
                onToggle={toggleFullscreen}
              />
            </div>
          </div>
        </div>

        {/* Content Area - Always in the same position */}
        <div className="flex-1 w-full overflow-y-auto pt-[128px] pb-24">
          {" "}
          {/* Increased top padding to prevent overlap */}
          <div className="p-4 max-w-4xl mx-auto space-y-4 w-full relative">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
            >
              <SortableContext
                items={editorState.blocks.map((block) => block.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4 w-full relative">
                  <AnimatePresence>
                    {editorState.blocks.map((block, index) => (
                      <SortableBlock
                        key={block.id}
                        block={block}
                        index={index}
                        isSelected={selectedBlockIds.includes(block.id)}
                        onSelect={(e) => {
                          console.log("Block selected:", block.id, block.type);
                          handleBlockSelect(block.id, index, e);
                        }}
                        onDelete={() => deleteBlock(block.id)}
                        onUpdate={(content) => updateBlock(block.id, content)}
                        onImproveWithAI={(blk) => {
                          console.log("Toolbar Improve with AI clicked", blk);
                          handleImproveWithAI(blk);
                        }}
                      />
                    ))}
                  </AnimatePresence>

                  {editorState.blocks.length === 0 && (
                    <div className="text-center py-12 w-full relative z-10">
                      <div className="text-muted-foreground mb-4">
                        <Plus className="h-12 w-12 mx-auto mb-2" />
                        <h3 className="text-lg font-medium">Start creating</h3>
                        <p className="text-sm">
                          Use the sidebar to add your first block
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </div>

      {/* Floating Bulk Improve with AI Button */}
      {selectedTextBlocks.length > 1 && (
        <div className="fixed bottom-24 right-8 z-50">
          <Button
            size="lg"
            className="rounded-full shadow-lg bg-primary text-white hover:bg-primary/90"
            onClick={handleBulkImproveWithAI}
          >
            Bulk Improve with AI
          </Button>
        </div>
      )}

      {blockToImprove && (
        <AIAssistantModal
          open={improveModalOpen}
          onOpenChange={setImproveModalOpen}
          articleContent={(() => {
            if (blockToImprove.id === "bulk") {
              return selectedTextBlocks.map(getBlockTextContent).join("\n\n");
            }
            return blockToImprove.type === "text" &&
              blockToImprove.content &&
              typeof blockToImprove.content.text === "string"
              ? getBlockTextContent(blockToImprove)
              : "";
          })()}
          headline={""}
          onInsertBlocks={(aiBlocks) => {
            setImproveModalOpen(false);
            setBlockToImprove(null);
            setSelectedBlockIds([]);
            setSelectedBlockIndices([]);
            if (aiBlocks && aiBlocks.length > 0) {
              setTimeout(() => {
                if (!onContentChange) return;

                const currentBlocks = editorState.blocks;
                let newBlocks: AnyBlock[];

                if (blockToImprove.id === "bulk") {
                  // Replace only the selected blocks (can be non-contiguous)
                  newBlocks = [...currentBlocks];
                  // Sort indices descending so splicing doesn't affect subsequent indices
                  const sortedIndices = [...selectedBlockIndices].sort(
                    (a, b) => b - a
                  );
                  sortedIndices.forEach((idx, i) => {
                    newBlocks.splice(
                      idx,
                      1,
                      ...aiBlocks.slice(i, i + 1).map((b: any) => ({
                        ...b,
                        id: Math.random().toString(36).substr(2, 9),
                        order: idx,
                      }))
                    );
                  });
                  newBlocks = newBlocks.map((b: any, i: number) => ({
                    ...b,
                    order: i,
                  }));
                } else {
                  // Single block replace
                  const idx = currentBlocks.findIndex(
                    (b: AnyBlock) => b.id === blockToImprove.id
                  );
                  if (idx === -1) return;
                  newBlocks = [...currentBlocks];
                  newBlocks.splice(
                    idx,
                    1,
                    ...aiBlocks.map((b: any, i: number) => ({
                      ...b,
                      id: Math.random().toString(36).substr(2, 9),
                      order: idx + i,
                    }))
                  );
                  newBlocks = newBlocks.map((b: any, i: number) => ({
                    ...b,
                    order: i,
                  }));
                }

                onContentChange(newBlocks);
                toast({
                  title:
                    blockToImprove.id === "bulk"
                      ? "Blocks Improved"
                      : "Block Improved",
                  description:
                    blockToImprove.id === "bulk"
                      ? "The selected blocks have been improved by AI."
                      : "The block has been improved by AI.",
                });
              }, 0);
            }
          }}
        />
      )}
    </div>
  );
}
