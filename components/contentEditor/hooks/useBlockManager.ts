"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import type { AnyBlock, EditorState } from "@/types/editor";

interface UseBlockManagerProps {
  initialBlocks?: AnyBlock[];
  onContentChange?: (blocks: AnyBlock[]) => void;
}

export function useBlockManager({
  initialBlocks = [],
  onContentChange,
}: UseBlockManagerProps) {
  // Debouncing setup
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastBlocksRef = useRef<AnyBlock[]>(initialBlocks);

  function createTextBlock(): AnyBlock {
    return {
      id: uuidv4(),
      type: "text",
      content: { text: "", html: "" },
      order: 0,
    };
  }

  // Helper: deep compare blocks
  function areBlocksEqual(a: AnyBlock[], b: AnyBlock[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (JSON.stringify(a[i]) !== JSON.stringify(b[i])) return false;
    }
    return true;
  }

  // Helper: safely call onContentChange asynchronously
  const safeContentChange = useCallback(
    (newBlocks: AnyBlock[]) => {
      if (
        onContentChange &&
        !areBlocksEqual(lastBlocksRef.current, newBlocks)
      ) {
        lastBlocksRef.current = newBlocks;
        // Use setTimeout to ensure this happens after the current render cycle
        setTimeout(() => {
          onContentChange(newBlocks);
        }, 0);
      }
    },
    [onContentChange]
  );

  const [editorState, setEditorState] = useState<EditorState>({
    blocks: initialBlocks.length > 0 ? initialBlocks : [], // Don't create default block
    selectedBlockId: null,
    isFullscreen: false,
  });

  // Sync editorState.blocks with initialBlocks prop after mount, only if different
  useEffect(() => {
    setEditorState((prev) => {
      if (areBlocksEqual(prev.blocks, initialBlocks)) return prev;
      return {
        ...prev,
        blocks: initialBlocks.length > 0 ? initialBlocks : [],
      };
    });
  }, [initialBlocks]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const createBlock = useCallback(
    (type: AnyBlock["type"]): AnyBlock => {
      const baseBlock = {
        id: uuidv4(),
        order: editorState.blocks.length,
      };

      switch (type) {
        case "text":
          return {
            ...baseBlock,
            type: "text",
            content: { text: "", html: "" },
          };
        case "heading":
          return {
            ...baseBlock,
            type: "heading",
            content: { text: "", level: 1 },
          };
        case "image":
          return { ...baseBlock, type: "image", content: { url: "", alt: "" } };
        case "video":
          return { ...baseBlock, type: "video", content: { url: "" } };
        case "audio":
          return {
            ...baseBlock,
            type: "audio",
            content: { url: "", title: "", artist: "" },
          };
        case "embed":
          return { ...baseBlock, type: "embed", content: { url: "" } };
        case "quote":
          return { ...baseBlock, type: "quote", content: { text: "" } };
        case "list":
          return {
            ...baseBlock,
            type: "list",
            content: { items: [""], ordered: false },
          };
        default:
          return createTextBlock();
      }
    },
    [editorState.blocks.length]
  );

  const updateBlock = useCallback(
    (blockId: string, content: any) => {
      setEditorState((prev) => {
        const newBlocks = prev.blocks.map((block) =>
          block.id === blockId ? { ...block, content } : block
        );

        // Debounce the onContentChange callback
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(() => {
          safeContentChange(newBlocks);
        }, 300); // 300ms debounce delay

        return { ...prev, blocks: newBlocks };
      });
    },
    [safeContentChange]
  );

  const addBlock = useCallback(
    (type: AnyBlock["type"], afterBlockId?: string) => {
      const newBlock = createBlock(type);

      setEditorState((prev) => {
        let newBlocks;
        if (afterBlockId) {
          const index = prev.blocks.findIndex((b) => b.id === afterBlockId);
          newBlocks = [
            ...prev.blocks.slice(0, index + 1),
            newBlock,
            ...prev.blocks.slice(index + 1),
          ];
        } else {
          newBlocks = [...prev.blocks, newBlock];
        }

        // Update order
        newBlocks = newBlocks.map((block, index) => ({
          ...block,
          order: index,
        }));

        // Use safeContentChange for structural changes
        safeContentChange(newBlocks);

        return {
          ...prev,
          blocks: newBlocks,
          selectedBlockId: newBlock.id,
        };
      });
    },
    [safeContentChange, createBlock]
  );

  const deleteBlock = useCallback(
    (blockId: string) => {
      setEditorState((prev) => {
        const newBlocks = prev.blocks.filter((b) => b.id !== blockId);

        // Update order (removed the "ensure at least one block" logic)
        const reorderedBlocks = newBlocks.map((block, index) => ({
          ...block,
          order: index,
        }));

        // Use safeContentChange for structural changes
        safeContentChange(reorderedBlocks);

        return {
          ...prev,
          blocks: reorderedBlocks,
          selectedBlockId: null,
        };
      });
    },
    [safeContentChange]
  );

  const reorderBlocks = useCallback(
    (sourceIndex: number, destinationIndex: number) => {
      setEditorState((prev) => {
        const newBlocks = Array.from(prev.blocks);
        const [reorderedBlock] = newBlocks.splice(sourceIndex, 1);
        newBlocks.splice(destinationIndex, 0, reorderedBlock);

        // Update order
        const reorderedBlocks = newBlocks.map((block, index) => ({
          ...block,
          order: index,
        }));

        // Use safeContentChange for structural changes
        safeContentChange(reorderedBlocks);

        return { ...prev, blocks: reorderedBlocks };
      });
    },
    [safeContentChange]
  );

  const selectBlock = useCallback((blockId: string | null) => {
    setEditorState((prev) => ({ ...prev, selectedBlockId: blockId }));
  }, []);

  const toggleFullscreen = useCallback(() => {
    setEditorState((prev) => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  }, []);

  // Force immediate content change (useful for save operations)
  const forceContentChange = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    safeContentChange(editorState.blocks);
  }, [safeContentChange, editorState.blocks]);

  return {
    editorState,
    setEditorState,
    updateBlock,
    addBlock,
    deleteBlock,
    reorderBlocks,
    selectBlock,
    toggleFullscreen,
    forceContentChange,
  };
}
