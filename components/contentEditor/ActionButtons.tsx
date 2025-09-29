"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Mail, Heart, Settings, Trash2 } from "lucide-react";
import type { ActionButton } from "@/types/editor";

interface ActionButtonsProps {
  buttons: ActionButton[];
  onButtonsChange: (buttons: ActionButton[]) => void;
  emailLists?: Array<{
    _id: string;
    name: string;
    subscriberCount: number;
    tags: string[];
    description?: string;
    createdAt: string;
  }>;
  isLoadingEmailLists?: boolean;
}

export function ActionButtons({
  buttons,
  onButtonsChange,
  emailLists = [],
  isLoadingEmailLists = false,
}: ActionButtonsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingButton, setEditingButton] = useState<ActionButton | null>(null);

  const handleOpenModal = () => {
    setIsDialogOpen(true);
  };

  const hasEmailSubscribeButton = buttons.some(
    (button) => button.type === "email_subscribe"
  );

  const hasDonationButton = buttons.some(
    (button) => button.type === "donation"
  );

  const addButton = (button: ActionButton) => {
    onButtonsChange([...buttons, button]);
    setIsDialogOpen(false);
    setEditingButton(null);
  };

  const updateButton = (updatedButton: ActionButton) => {
    onButtonsChange(
      buttons.map((btn) => (btn.id === updatedButton.id ? updatedButton : btn))
    );
    setIsDialogOpen(false);
    setEditingButton(null);
  };

  const removeButton = (buttonId: string) => {
    onButtonsChange(buttons.filter((btn) => btn.id !== buttonId));
  };

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

  return (
    <div className="space-y-4">
      {/* Add Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Button size="sm" className="w-full" onClick={handleOpenModal}>
          <Plus className="h-4 w-4 mr-2" />
          Add Action Button
        </Button>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingButton ? "Edit Action Button" : "Add Action Button"}
            </DialogTitle>
          </DialogHeader>
          <ActionButtonForm
            button={editingButton}
            onSave={editingButton ? updateButton : addButton}
            onCancel={() => {
              setIsDialogOpen(false);
              setEditingButton(null);
            }}
            emailLists={emailLists}
            isLoadingEmailLists={isLoadingEmailLists}
            hasEmailSubscribeButton={hasEmailSubscribeButton}
            hasDonationButton={hasDonationButton}
            isEditing={!!editingButton}
          />
        </DialogContent>
      </Dialog>

      {/* Action Buttons List */}
      {buttons.length > 0 && (
        <div className="space-y-2">
          <AnimatePresence>
            {buttons.map((button) => (
              <motion.div
                key={button.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="group relative"
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Preview Button */}
                        <div
                          className={`px-3 py-1 rounded text-xs flex items-center gap-1 ${getButtonColor(
                            button.type
                          )}`}
                        >
                          {getButtonIcon(button.type)}
                          <span className="font-medium">{button.label}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingButton(button);
                            setIsDialogOpen(true);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Settings className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeButton(button.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {buttons.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No action buttons yet</p>
        </div>
      )}
    </div>
  );
}

function ActionButtonForm({
  button,
  onSave,
  onCancel,
  emailLists = [],
  isLoadingEmailLists = false,
  hasEmailSubscribeButton = false,
  hasDonationButton = false,
  isEditing = false,
}: {
  button: ActionButton | null;
  onSave: (button: ActionButton) => void;
  onCancel: () => void;
  emailLists?: Array<{
    _id: string;
    name: string;
    subscriberCount: number;
    tags: string[];
    description?: string;
    createdAt: string;
  }>;
  isLoadingEmailLists?: boolean;
  hasEmailSubscribeButton?: boolean;
  hasDonationButton?: boolean;
  isEditing?: boolean;
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ActionButton>({
    id: button?.id || `action-${Date.now()}`,
    type:
      button?.type ||
      (hasEmailSubscribeButton && hasDonationButton
        ? "donation" // Default to donation if both exist, but this shouldn't happen
        : hasEmailSubscribeButton && !isEditing
        ? "donation"
        : hasDonationButton && !isEditing
        ? "email_subscribe"
        : "email_subscribe"),
    label:
      button?.label ||
      (hasEmailSubscribeButton && !isEditing
        ? "Subscribed"
        : hasDonationButton && !isEditing
        ? "Email list added"
        : "Email list added"),
    config: button?.config || {},
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent adding duplicate email subscribe buttons
    if (
      formData.type === "email_subscribe" &&
      hasEmailSubscribeButton &&
      !isEditing
    ) {
      toast({
        title: "Only One Email List Button",
        description: "You can only have one email list action button.",
        variant: "default",
      });
      return;
    }

    // Prevent adding duplicate donation buttons
    if (formData.type === "donation" && hasDonationButton && !isEditing) {
      toast({
        title: "Only One Donation Button",
        description: "You can only have one donation action button.",
        variant: "default",
      });
      return;
    }

    // Validate email list selection for email_subscribe type
    if (formData.type === "email_subscribe") {
      if (
        !formData.config.emailListId ||
        formData.config.emailListId === "clear"
      ) {
        toast({
          title: "Email List Required",
          description: "Please select an email list.",
          variant: "default",
        });
        return;
      }
    }

    // Validate donation type selection for donation type
    if (formData.type === "donation") {
      if (!formData.config.donationType) {
        toast({
          title: "Donation Type Required",
          description: "Please select a donation type (General or Exclusive).",
          variant: "default",
        });
        return;
      }
    }

    onSave(formData);
  };

  const updateConfig = (key: string, value: any) => {
    console.log(value);

    setFormData((prev) => ({
      ...prev,
      config: { ...prev.config, [key]: value },
    }));
  };

  // Update label when type changes
  const handleTypeChange = (value: string) => {
    // Prevent adding another email subscribe button if one already exists
    if (value === "email_subscribe" && hasEmailSubscribeButton && !isEditing) {
      toast({
        title: "Only One Email List Button",
        description: "You can only have one email list action button.",
        variant: "default",
      });
      return;
    }

    // Prevent adding another donation button if one already exists
    if (value === "donation" && hasDonationButton && !isEditing) {
      toast({
        title: "Only One Donation Button",
        description: "You can only have one donation action button.",
        variant: "default",
      });
      return;
    }

    const defaultLabel =
      value === "email_subscribe" ? "Email list added" : "Subscribed";
    setFormData((prev) => ({
      ...prev,
      type: value as ActionButton["type"],
      label: defaultLabel,
    }));
  };

  const renderConfigFields = () => {
    switch (formData.type) {
      case "email_subscribe":
        return (
          <div className="space-y-4">
            <div>
              {isLoadingEmailLists ? (
                <div className="text-center py-4">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">
                    Loading email lists...
                  </p>
                </div>
              ) : emailLists.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    No email lists found. Create email lists in Settings first.
                  </p>
                </div>
              ) : (
                <Select
                  value={formData.config.emailListId || ""}
                  onValueChange={(value) => updateConfig("emailListId", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select email list" />
                  </SelectTrigger>
                  <SelectContent>
                    {emailLists.map((list) => (
                      <SelectItem key={list._id} value={list._id}>
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{list.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            ({list.subscriberCount} subscribers)
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        );

      case "donation":
        return (
          <div className="space-y-4">
            <div>
              <Select
                value={formData.config.donationType || ""}
                onValueChange={(value) => updateConfig("donationType", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select donation type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">General</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="exclusive">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">Exclusive</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="type">Button Type</Label>
          <Select
            value={formData.type}
            onValueChange={handleTypeChange}
            disabled={isEditing}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email_subscribe">Email List</SelectItem>
              <SelectItem value="donation">Donation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {renderConfigFields()}
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{button ? "Update" : "Add"} Button</Button>
      </div>
    </form>
  );
}
