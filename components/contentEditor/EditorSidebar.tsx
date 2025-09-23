"use client";

import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { BlockAddButtons } from "./sidebar/BlockAddButtons";
import { BlockManager } from "./sidebar/BlockManager";
import { ActionButtonManager } from "./sidebar/ActionButtonManager";
import { QuickActions } from "./sidebar/QuickActions";
import type { AnyBlock, ActionButton, EditorState } from "@/types/editor";

interface EditorSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  editorState: EditorState;
  actionButtons: ActionButton[];
  onActionButtonsChange: (buttons: ActionButton[]) => void;
  onAddBlock: (type: AnyBlock["type"]) => void;
  onDeleteBlock: (blockId: string) => void;
  onSelectBlock: (blockId: string) => void;
  onRemoveActionButton: (buttonId: string) => void;
  onClearAllActionButtons: () => void;
  onReorderActionButtons: (startIndex: number, endIndex: number) => void;
  onMoveBlockUp: (blockId: string) => void;
  onMoveBlockDown: (blockId: string) => void;
  onMoveActionButtonUp: (buttonId: string) => void;
  onMoveActionButtonDown: (buttonId: string) => void;
}

export function EditorSidebar({
  isOpen,
  onClose,
  editorState,
  actionButtons,
  onActionButtonsChange,
  onAddBlock,
  onDeleteBlock,
  onSelectBlock,
  onRemoveActionButton,
  onClearAllActionButtons,
  onReorderActionButtons,
  onMoveBlockUp,
  onMoveBlockDown,
  onMoveActionButtonUp,
  onMoveActionButtonDown,
}: EditorSidebarProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Sidebar Overlay */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Sidebar */}
      <motion.div
        className="fixed right-0 top-0 h-full w-80 bg-background border-l z-50 flex flex-col shadow-xl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        {/* Sidebar Header */}
        <SidebarHeader onClose={onClose} />

        {/* Sidebar Content */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Add Blocks Section */}
            <BlockAddButtons onAddBlock={onAddBlock} />
            <Separator />
            {/* Content Blocks Management */}
            <BlockManager
              editorState={editorState}
              onDeleteBlock={onDeleteBlock}
              onSelectBlock={onSelectBlock}
              onMoveBlockUp={onMoveBlockUp}
              onMoveBlockDown={onMoveBlockDown}
            />
            <Separator />
            {/* Action Buttons Section */}
            <ActionButtonManager
              actionButtons={actionButtons}
              onActionButtonsChange={onActionButtonsChange}
              onRemoveActionButton={onRemoveActionButton}
              onClearAllActionButtons={onClearAllActionButtons}
              onReorderActionButtons={onReorderActionButtons}
              onMoveActionButtonUp={onMoveActionButtonUp}
              onMoveActionButtonDown={onMoveActionButtonDown}
            />{" "}
            <Separator />
            {/* Quick Actions Section */}
            <QuickActions
              editorState={editorState}
              actionButtons={actionButtons}
              onDeleteBlock={onDeleteBlock}
              onClearAllActionButtons={onClearAllActionButtons}
            />
          </div>
        </ScrollArea>
      </motion.div>
    </>
  );
}
