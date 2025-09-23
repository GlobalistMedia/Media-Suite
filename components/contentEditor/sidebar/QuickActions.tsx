"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import type { ActionButton, EditorState } from "@/types/editor";

interface QuickActionsProps {
  editorState: EditorState;
  actionButtons: ActionButton[];
  onDeleteBlock: (blockId: string) => void;
  onClearAllActionButtons: () => void;
}

export function QuickActions({
  editorState,
  actionButtons,
  onDeleteBlock,
  onClearAllActionButtons,
}: QuickActionsProps) {
  const { toast } = useToast();

  const handleClearAllBlocks = () => {
    editorState.blocks.forEach((block) => onDeleteBlock(block.id));
    toast({ title: "All content cleared" });
  };

  const handleClearEverything = () => {
    editorState.blocks.forEach((block) => onDeleteBlock(block.id));
    onClearAllActionButtons();
    toast({ title: "Everything cleared" });
  };

  const handleExportJSON = () => {
    const exportData = {
      blocks: editorState.blocks,
      actionButtons: actionButtons,
      timestamp: new Date().toISOString(),
    };
    const content = JSON.stringify(exportData, null, 2);
    navigator.clipboard.writeText(content);
    toast({ title: "Content copied to clipboard" });
  };

  return (
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
          disabled={editorState.blocks.length === 0}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear All Blocks
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearAllActionButtons}
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
          disabled={
            editorState.blocks.length === 0 && actionButtons.length === 0
          }
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear Everything
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportJSON}
          className="w-full justify-start"
          disabled={
            editorState.blocks.length === 0 && actionButtons.length === 0
          }
        >
          Export JSON
        </Button>
      </div>
    </div>
  );
}
