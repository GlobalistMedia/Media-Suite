"use client";

import { Button } from "@/components/ui/button";
import { Mail, Heart, ExternalLink, X } from "lucide-react";
import type { ActionButton } from "@/types/editor";

interface ActionButtonBlockProps {
  buttons: ActionButton[];
  onRemoveButton?: (buttonId: string) => void;
  showRemoveButtons?: boolean;
}

export function ActionButtonBlock({
  buttons,
  onRemoveButton,
  showRemoveButtons = false,
}: ActionButtonBlockProps) {
  const getButtonIcon = (type: ActionButton["type"]) => {
    switch (type) {
      case "email_subscribe":
        return <Mail className="h-4 w-4" />;
      case "donation":
        return <Heart className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getButtonColor = (type: ActionButton["type"]) => {
    switch (type) {
      case "email_subscribe":
        return "bg-blue-600 hover:bg-blue-700 text-white";
      case "donation":
        return "bg-red-600 hover:bg-red-700 text-white";
      default:
        return "bg-blue-600 hover:bg-blue-700 text-white";
    }
  };

  const handleButtonClick = (button: ActionButton) => {
    if (button.config.url) {
      window.open(button.config.url, "_blank");
    }
  };

  if (buttons.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap justify-center gap-3 py-6">
      {buttons.map((button) => (
        <div key={button.id} className="relative group">
          <Button
            className={getButtonColor(button.type)}
            onClick={() => handleButtonClick(button)}
          >
            {getButtonIcon(button.type)}
            <span className="ml-2">{button.label}</span>
            <ExternalLink className="h-3 w-3 ml-2" />
          </Button>

          {/* Remove button for individual action buttons */}
          {showRemoveButtons && onRemoveButton && (
            <Button
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveButton(button.id);
              }}
              title={`Remove ${button.label}`}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
