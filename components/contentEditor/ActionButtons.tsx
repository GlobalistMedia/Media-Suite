"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import axios from "axios";
import {
  Plus,
  Mail,
  DollarSign,
  Coffee,
  Heart,
  Settings,
  Trash2,
} from "lucide-react";
import type { ActionButton } from "@/types/editor";

// Email list interfaces
interface Subscriber {
  id: string;
  email: string;
  name?: string;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  source?: string;
}

interface EmailList {
  _id: string;
  name: string;
  description: string;
  tags: string[];
  createdAt: Date;
  subscribers: Subscriber[];
  subscriberCount: number;
}

interface ActionButtonsProps {
  buttons: ActionButton[];
  onButtonsChange: (buttons: ActionButton[]) => void;
}

export function ActionButtons({
  buttons,
  onButtonsChange,
}: ActionButtonsProps) {
  const { toast } = useToast();
  const { data: session } = useSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingButton, setEditingButton] = useState<ActionButton | null>(null);

  // Email list state
  const [emailLists, setEmailLists] = useState<EmailList[]>([]);
  const [isLoadingEmailLists, setIsLoadingEmailLists] = useState(false);

  // Load email lists
  const loadEmailLists = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      setIsLoadingEmailLists(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_GLOBALIST_LIVE_URL}/email-list/me?creatorEmail=${session.user.email}&page=1&limit=10000`
      );

      if (response.data.status === 200 && response.data.response.emails) {
        setEmailLists(response.data.response.emails);
      }
    } catch (error) {
      console.error("Error loading email lists:", error);
    } finally {
      setIsLoadingEmailLists(false);
    }
  }, [session?.user?.email]);

  // Load email lists when component mounts
  useEffect(() => {
    if (session?.user?.email) {
      loadEmailLists();
    }
  }, [session?.user?.email, loadEmailLists]);

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
      case "tip_jar":
        return <Coffee className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getButtonColor = (type: ActionButton["type"]) => {
    switch (type) {
      case "email_subscribe":
        return "bg-blue-600 hover:bg-blue-700 text-white";
      case "donation":
        return "bg-red-600 hover:bg-red-700 text-white";
      case "tip_jar":
        return "bg-yellow-600 hover:bg-yellow-700 text-white";
      default:
        return "bg-gray-600 hover:bg-gray-700 text-white";
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Action Button
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingButton ? "Edit Action Button" : "Add Action Button"}
            </DialogTitle>
          </DialogHeader>
          <ActionButtonForm
            button={editingButton}
            emailLists={emailLists}
            isLoadingEmailLists={isLoadingEmailLists}
            onSave={editingButton ? updateButton : addButton}
            onCancel={() => {
              setIsDialogOpen(false);
              setEditingButton(null);
            }}
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
  emailLists,
  isLoadingEmailLists,
  onSave,
  onCancel,
}: {
  button: ActionButton | null;
  emailLists: EmailList[];
  isLoadingEmailLists: boolean;
  onSave: (button: ActionButton) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<ActionButton>({
    id: button?.id || `action-${Date.now()}`,
    type: button?.type || "email_subscribe",
    label: button?.label || "Subscribe to Newsletter",
    config: button?.config || {},
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Allow saving even without email list selected (user can clear selection)
    onSave(formData);
  };

  const updateConfig = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      config: { ...prev.config, [key]: value },
    }));
  };

  const renderConfigFields = () => {
    switch (formData.type) {
      case "email_subscribe":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="emailList">Email List</Label>
              {isLoadingEmailLists ? (
                <div className="text-center py-4">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
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
                  value={formData.config.emailListId || "none"}
                  onValueChange={(value) =>
                    updateConfig("emailListId", value === "none" ? "" : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an email list..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium text-muted-foreground">
                          Clear selection
                        </span>
                        <span className="text-sm text-muted-foreground ml-2">
                          (No email list)
                        </span>
                      </div>
                    </SelectItem>
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

            {formData.config.emailListId && (
              <div className="p-3 rounded-lg bg-muted">
                {(() => {
                  const selectedList = emailLists.find(
                    (list) => list._id === formData.config.emailListId
                  );
                  return selectedList ? (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">
                          {selectedList.name}
                        </h4>
                        {(() => {
                          const activeSubscribers =
                            selectedList.subscriberCount;
                          if (activeSubscribers === 0) {
                            return (
                              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                Empty
                              </span>
                            );
                          } else {
                            return (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                Ready
                              </span>
                            );
                          }
                        })()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Total Subscribers:</span>{" "}
                        {selectedList.subscriberCount}
                      </div>
                      {selectedList.description && (
                        <p className="text-xs text-muted-foreground mt-2">
                          <span className="font-medium">Description:</span>{" "}
                          {selectedList.description}
                        </p>
                      )}
                      {selectedList.subscriberCount === 0 && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                          ⚠️ This email list has no active subscribers
                        </div>
                      )}
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            {!formData.config.emailListId && (
              <div className="p-3 rounded-lg bg-muted">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    No email list selected
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select an email list above to enable email integration
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case "donation":
      case "tip_jar":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="service">Payment Service</Label>
              <Select
                value={formData.config.service || ""}
                onValueChange={(value) => updateConfig("service", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="kofi">Ko-fi</SelectItem>
                  <SelectItem value="buymeacoffee">Buy Me a Coffee</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="url">Payment URL</Label>
              <Input
                id="url"
                value={formData.config.url || ""}
                onChange={(e) => updateConfig("url", e.target.value)}
                placeholder="https://your-payment-link"
              />
            </div>
            {formData.type === "tip_jar" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Suggested Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.config.amount || ""}
                    onChange={(e) =>
                      updateConfig("amount", parseInt(e.target.value))
                    }
                    placeholder="5"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.config.currency || "USD"}
                    onValueChange={(value) => updateConfig("currency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        );

      case "custom":
        return (
          <div>
            <Label htmlFor="url">Custom URL</Label>
            <Input
              id="url"
              value={formData.config.url || ""}
              onChange={(e) => updateConfig("url", e.target.value)}
              placeholder="https://your-custom-link"
            />
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
            onValueChange={(value: any) =>
              setFormData((prev) => ({ ...prev, type: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email_subscribe">Email Subscribe</SelectItem>
              <SelectItem value="donation">Donation</SelectItem>
              {/* <SelectItem value="tip_jar">Tip Jar</SelectItem> */}
              {/* <SelectItem value="custom">Custom</SelectItem> */}
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
