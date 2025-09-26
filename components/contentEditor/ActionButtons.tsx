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
import { Badge } from "@/components/ui/badge";
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
  validationData?: {
    title: string;
    category: string[];
    country: string[];
    type: string;
    accessType: string;
    articleImage: File | null;
    blocks: any[];
  };
}

export function ActionButtons({
  buttons,
  onButtonsChange,
  emailLists = [],
  isLoadingEmailLists = false,
  validationData,
}: ActionButtonsProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingButton, setEditingButton] = useState<ActionButton | null>(null);

  const validateBeforeOpeningModal = () => {
    if (!validationData) return true; // Skip validation if no data provided

    const { title, category, country, type, accessType, articleImage, blocks } =
      validationData;

    if (!title?.trim()) {
      toast({
        title: "Missing Title",
        description: "Please enter a title before adding action buttons.",
        variant: "destructive",
      });
      return false;
    }

    if (!category || category.length === 0) {
      toast({
        title: "Missing Category",
        description: "Please select a category before adding action buttons.",
        variant: "destructive",
      });
      return false;
    }

    if (!country || country.length === 0) {
      toast({
        title: "Missing Country",
        description: "Please select a country before adding action buttons.",
        variant: "destructive",
      });
      return false;
    }

    if (!type?.trim()) {
      toast({
        title: "Missing Type",
        description: "Please select a type before adding action buttons.",
        variant: "destructive",
      });
      return false;
    }

    if (!accessType?.trim()) {
      toast({
        title: "Missing Access Type",
        description:
          "Please select an access type before adding action buttons.",
        variant: "destructive",
      });
      return false;
    }

    if (!articleImage) {
      toast({
        title: "Missing Article Image",
        description:
          "Please upload an article image before adding action buttons.",
        variant: "destructive",
      });
      return false;
    }

    if (!blocks || blocks.length === 0) {
      toast({
        title: "Missing Content",
        description:
          "Please add some content blocks before adding action buttons.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleOpenModal = () => {
    if (validateBeforeOpeningModal()) {
      setIsDialogOpen(true);
    }
  };

  const addButton = (button: ActionButton) => {
    onButtonsChange([...buttons, button]);
    setIsDialogOpen(false);
    setEditingButton(null);
    toast({
      title: "Action button added",
      description: `${button.label} button has been added to your content.`,
    });
  };

  const updateButton = (updatedButton: ActionButton) => {
    onButtonsChange(
      buttons.map((btn) => (btn.id === updatedButton.id ? updatedButton : btn))
    );
    setIsDialogOpen(false);
    setEditingButton(null);
    toast({
      title: "Action button updated",
      description: `${updatedButton.label} button has been updated.`,
    });
  };

  const removeButton = (buttonId: string) => {
    onButtonsChange(buttons.filter((btn) => btn.id !== buttonId));
    toast({
      title: "Action button removed",
      description: "The action button has been removed from your content.",
    });
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

                        <div>
                          <Badge variant="secondary" className="text-xs">
                            {button.type.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ActionButton>({
    id: button?.id || `action-${Date.now()}`,
    type: button?.type || "email_subscribe",
    label: button?.label || "Subscribe to Newsletter",
    config: button?.config || {},
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email list selection for email_subscribe type
    if (formData.type === "email_subscribe") {
      if (
        !formData.config.emailListId ||
        formData.config.emailListId === "clear"
      ) {
        toast({
          title: "Email List Required",
          description:
            "Please select an email list for the Email Subscribe button.",
          variant: "destructive",
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
    const defaultLabel =
      value === "email_subscribe" ? "Subscribe to Newsletter" : "Donate Now";
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
              <Label htmlFor="emailList">Email List *</Label>
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
              <Label htmlFor="url">Payment URL</Label>
              <Input
                id="url"
                value={formData.config.url || ""}
                onChange={(e) => updateConfig("url", e.target.value)}
                placeholder="https://your-payment-link"
              />
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
          <Select value={formData.type} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email_subscribe">Email Subscribe</SelectItem>
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
