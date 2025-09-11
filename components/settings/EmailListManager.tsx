"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState, useEffect, useRef } from "react";
import {
  Mail,
  Plus,
  Users,
  Edit,
  Trash2,
  Download,
  Upload,
  Search,
  UserPlus,
  UserMinus,
  X,
  FileText,
} from "lucide-react";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Subscriber {
  id: string;
  email: string;
  name?: string;
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

export function EmailListManager() {
  const { toast } = useToast();
  const [emailLists, setEmailLists] = useState<EmailList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newListDialog, setNewListDialog] = useState(false);
  const [editListDialog, setEditListDialog] = useState(false);
  const [subscribersDialog, setSubscribersDialog] = useState(false);
  const [addSubscriberDialog, setAddSubscriberDialog] = useState(false);
  const [importDialog, setImportDialog] = useState(false);
  const [selectedList, setSelectedList] = useState<EmailList | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [subscriberSearchQuery, setSubscriberSearchQuery] = useState("");

  // Import/Export state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importTargetList, setImportTargetList] = useState<string>("");
  const [importProgress, setImportProgress] = useState<{
    total: number;
    processed: number;
    errors: string[];
    success: number;
  } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newListData, setNewListData] = useState({
    name: "",
    description: "",
    tags: "",
    initialEmails: "",
  });

  const [editListData, setEditListData] = useState({
    name: "",
    description: "",
    tags: "",
  });

  const [newSubscriberData, setNewSubscriberData] = useState({
    email: "",
    name: "",
  });

  // Load email settings from database
  useEffect(() => {
    loadEmailSettings();
  }, []);

  const loadEmailSettings = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_GLOBALIST_LIVE_URL}/email-list/me?creatorEmail=venomkr020@gmail.com&page=1&limit=10000`
      );
      console.log("response", response.data);
      if (response.data.status === 200 && response.data.response.emails) {
        const emailLists = response.data.response.emails;

        // Load email lists
        if (emailLists) {
          setEmailLists(emailLists);
          console.log("Email lists loaded:", emailLists);
        }
      }
    } catch (error) {
      console.error("Error loading email settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveEmailSettings = async (updatedLists: EmailList[]) => {
    setIsSaving(true);
    try {
      // For now, just update the local state since we're using the Globalist.live API
      // In a real implementation, you would need to create/update email lists via the API
      setEmailLists(updatedLists);

      // TODO: Implement API calls to create/update/delete email lists via Globalist.live API
      // This would require endpoints like:
      // - POST /email-list/create
      // - PUT /email-list/{id}
      // - DELETE /email-list/{id}

      console.log("Email lists updated locally:", updatedLists);
    } catch (error) {
      console.error("Error saving email settings:", error);
      alert("Error saving email settings. Please try again.");
      throw error; // Re-throw to handle in calling function
    } finally {
      setIsSaving(false);
    }
  };

  // Filter lists based on search and status
  const filteredLists = emailLists.filter((list) => {
    const matchesSearch =
      list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      list.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Filter subscribers based on search query and selected list
  const filteredSubscribers = selectedList
    ? selectedList.subscribers?.filter(
        (subscriber) =>
          subscriber.email
            .toLowerCase()
            .includes(subscriberSearchQuery.toLowerCase()) ||
          subscriber.name
            ?.toLowerCase()
            .includes(subscriberSearchQuery.toLowerCase())
      )
    : [];

  const handleCreateList = async () => {
    if (!newListData.name.trim()) return;

    setIsSaving(true);
    try {
      const newList: EmailList = {
        _id: `list_${Date.now()}`,
        name: newListData.name,
        description: newListData.description,
        tags: newListData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        createdAt: new Date(),
        subscribers: [],
        subscriberCount: 0,
      };

      // If initial emails are provided, add them as subscribers
      if (newListData.initialEmails.trim()) {
        const emailLines = newListData.initialEmails
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line && isValidEmail(line));

        emailLines.forEach((email, index) => {
          const subscriber: Subscriber = {
            id: `sub_${Date.now()}_${index}`,
            email: email,
            name: email.split("@")[0], // Use email prefix as default name
          };
          newList.subscribers.push(subscriber);
        });

        newList.subscriberCount = newList.subscribers.length;
      }

      // Create the email list via API
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_GLOBALIST_LIVE_URL}/email-list`,
        {
          name: newList.name,
          description: newList.description,
          tags: newList.tags,
          // status: newList.status,
          emails: newList.subscribers.map((subscriber) => subscriber.email),
          creatorEmail: "venomkr020@gmail.com", // Using the same email as in loadEmailSettings
        }
      );

      if (response.data.message === "Emails added") {
        // Update local state with the created list (including the actual ID from server)
        const createdList = {
          ...newList,
          _id: response.data.response._id || newList._id,
        };

        const updatedLists = [...emailLists, createdList];
        setEmailLists(updatedLists);

        setNewListData({
          name: "",
          description: "",
          tags: "",
          initialEmails: "",
        });
        setNewListDialog(false);

        console.log("Email list created successfully:", createdList);
        toast({
          title: "Email list created successfully",
          description: "Email list created successfully",
        });
      } else {
        throw new Error(response.data.message || "Failed to create email list");
      }
    } catch (error) {
      console.error("Error creating email list:", error);
      alert("Error creating email list. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditList = async () => {
    if (!selectedList || !editListData.name.trim()) return;

    setIsSaving(true);
    try {
      // Update email list via API
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_GLOBALIST_LIVE_URL}/email-list/`,
        {
          emailListId: selectedList._id,
          name: editListData.name,
          description: editListData.description,
          tags: editListData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          creatorEmail: "venomkr020@gmail.com",
        }
      );

      if (
        response.data.status === 200 ||
        response.data.message === "Email list updated"
      ) {
        // Update local state with the updated list
        const updatedLists = emailLists.map((list) =>
          list._id === selectedList._id
            ? {
                ...list,
                name: editListData.name,
                description: editListData.description,
                tags: editListData.tags
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean),
              }
            : list
        );

        setEmailLists(updatedLists);
        setEditListDialog(false);
        setSelectedList(null);
        setEditListData({ name: "", description: "", tags: "" });

        console.log("Email list updated successfully:", selectedList._id);
        toast({
          title: "Email list updated successfully",
          description: "Email list updated successfully",
        });
      } else {
        throw new Error(response.data.message || "Failed to update email list");
      }
    } catch (error: any) {
      console.error("Error updating email list:", error);
      toast({
        title: "Error updating email list",
        description: "Error updating email list. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteList = async (listId: string) => {
    setIsSaving(true);
    try {
      // Delete email list via API
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_GLOBALIST_LIVE_URL}/email-list/delete-email-list`,
        {
          emailListId: listId,
          creatorEmail: "venomkr020@gmail.com",
        }
      );

      if (
        response.data.status === 201 ||
        response.data.message === "Email-list deleted"
      ) {
        // Update local state by removing the deleted list
        const updatedLists = emailLists.filter((list) => list._id !== listId);
        setEmailLists(updatedLists);

        console.log("Email list deleted successfully:", listId);
        toast({
          title: "Email list deleted successfully",
          description: "Email list deleted successfully",
        });
      } else {
        throw new Error(response.data.message || "Failed to delete email list");
      }
    } catch (error: any) {
      console.error("Error deleting email list:", error);
      toast({
        title: "Error deleting email list",
        description: "Error deleting email list. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const openEditDialog = (list: EmailList) => {
    setSelectedList(list);
    setEditListData({
      name: list.name,
      description: list.description,
      tags: list.tags.join(", "),
    });
    setEditListDialog(true);
  };

  const openSubscribersDialog = (list: EmailList) => {
    setSelectedList(list);
    setSubscribersDialog(true);
    setSubscriberSearchQuery("");
  };

  // Add subscriber functionality
  const handleAddSubscriber = async () => {
    if (
      !selectedList ||
      !newSubscriberData.email.trim() ||
      !isValidEmail(newSubscriberData.email)
    )
      return;

    // Check if subscriber already exists
    const existingSubscriber = selectedList.subscribers.find(
      (sub) => sub.email.toLowerCase() === newSubscriberData.email.toLowerCase()
    );

    if (existingSubscriber) {
      toast({
        title: "Error adding subscriber",
        description: "This email address is already subscribed to this list.",
      });
      return;
    }

    const newSubscriber: Subscriber = {
      id: `sub_${Date.now()}`,
      email: newSubscriberData.email.toLowerCase().trim(), // Normalize email
      name:
        newSubscriberData.name?.trim() || newSubscriberData.email.split("@")[0],
    };

    try {
      // Add subscriber via API
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_GLOBALIST_LIVE_URL}/email-list/add-subscriber`,
        {
          emailListId: selectedList._id,
          subscriberEmail: newSubscriber.email,
        }
      );

      if (response.data.message === "Subscriber added") {
        // Update local state with the new subscriber
        const updatedLists = emailLists.map((list) =>
          list._id === selectedList._id
            ? {
                ...list,
                subscribers: [...list.subscribers, newSubscriber],
                subscriberCount: list.subscriberCount + 1,
              }
            : list
        );

        setEmailLists(updatedLists);

        // Update selectedList to reflect changes
        setSelectedList((prev) =>
          prev
            ? {
                ...prev,
                subscribers: [...prev.subscribers, newSubscriber],
                subscriberCount: prev.subscriberCount + 1,
              }
            : null
        );

        setNewSubscriberData({ email: "", name: "" });
        setAddSubscriberDialog(false);

        console.log("Subscriber added successfully:", newSubscriber);
        toast({
          title: "Subscriber added successfully",
          description: "Subscriber added successfully",
        });
      } else {
        throw new Error(response.data.message || "Failed to add subscriber");
      }
    } catch (error) {
      console.error("Error adding subscriber:", error);
      toast({
        title: "Error adding subscriber",
        description: "Error adding subscriber. Please try again.",
      });
    }
  };

  const handleRemoveSubscriber = async (subscriberEmail: string) => {
    if (!selectedList) return;

    try {
      // Remove subscriber via API
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_GLOBALIST_LIVE_URL}/email-list/delete-subscriber`,
        {
          subscriberEmail: subscriberEmail,
          emailListId: selectedList._id,
        }
      );

      if (response.data.message === "Subscriber deleted") {
        // Update local state with the removed subscriber
        const updatedLists = emailLists.map((list) =>
          list._id === selectedList._id
            ? {
                ...list,
                subscribers: list.subscribers.filter(
                  (sub) => sub.email !== subscriberEmail
                ),
                subscriberCount: Math.max(0, list.subscriberCount - 1),
              }
            : list
        );

        setEmailLists(updatedLists);

        // Update selectedList to reflect changes
        setSelectedList((prev) =>
          prev
            ? {
                ...prev,
                subscribers: prev.subscribers.filter(
                  (sub) => sub.email !== subscriberEmail
                ),
                subscriberCount: Math.max(0, prev.subscriberCount - 1),
              }
            : null
        );

        console.log("Subscriber removed successfully:", subscriberEmail);
        toast({
          title: "Subscriber removed successfully",
          description: "Subscriber removed successfully",
        });
      } else {
        throw new Error(response.data.message || "Failed to remove subscriber");
      }
    } catch (error) {
      console.error("Error removing subscriber:", error);
      toast({
        title: "Error removing subscriber",
        description: "Error removing subscriber. Please try again.",
      });
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Import functionality
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      setImportFile(file);
    } else {
      alert("Please select a valid CSV file.");
    }
  };

  const parseCsvData = (
    csvText: string
  ): { email: string; name?: string }[] => {
    const lines = csvText.trim().split("\n");
    const data: { email: string; name?: string }[] = [];

    // Skip header row if it exists
    const startIndex = lines[0].toLowerCase().includes("email") ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = line
        .split(",")
        .map((col) => col.trim().replace(/"/g, ""));

      if (columns.length >= 1) {
        const email = columns[0].toLowerCase();
        if (isValidEmail(email)) {
          data.push({
            email,
            name: columns.length >= 2 ? columns[1] : email.split("@")[0],
          });
        }
      }
    }

    return data;
  };

  const handleImportContacts = async () => {
    if (!importFile || !importTargetList) {
      toast({
        title: "Missing information",
        description: "Please select both a CSV file and a target list.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setImportProgress({ total: 0, processed: 0, errors: [], success: 0 });

    try {
      const csvText = await importFile.text();
      const parsedData = parseCsvData(csvText);

      if (parsedData.length === 0) {
        toast({
          title: "No valid emails found",
          description: "No valid email addresses found in the CSV file.",
          variant: "destructive",
        });
        setIsImporting(false);
        return;
      }

      setImportProgress((prev) =>
        prev ? { ...prev, total: parsedData.length } : null
      );

      const targetList = emailLists.find(
        (list) => list._id === importTargetList
      );
      if (!targetList) {
        toast({
          title: "Target list not found",
          description: "The selected target list could not be found.",
          variant: "destructive",
        });
        setIsImporting(false);
        return;
      }

      const errors: string[] = [];
      const newSubscribers: Subscriber[] = [];
      let successCount = 0;

      for (let i = 0; i < parsedData.length; i++) {
        const { email, name } = parsedData[i];

        // Check if subscriber already exists
        const existingSubscriber = targetList.subscribers.find(
          (sub) => sub.email.toLowerCase() === email.toLowerCase()
        );

        if (existingSubscriber) {
          errors.push(`${email} - Already exists in list`);
        } else {
          try {
            // Add subscriber via API
            const response = await axios.post(
              `${process.env.NEXT_PUBLIC_GLOBALIST_LIVE_URL}/email-list/add-subscriber`,
              {
                emailListId: importTargetList,
                subscriberEmail: email,
              }
            );

            if (response.data.message === "Subscriber added") {
              const newSubscriber: Subscriber = {
                id: `sub_${Date.now()}_${i}`,
                email: email.toLowerCase(),
                name: name || email.toLowerCase().split("@")[0],
              };
              newSubscribers.push(newSubscriber);
              successCount++;
            } else {
              errors.push(
                `${email} - Failed to add: ${
                  response.data.message || "Unknown error"
                }`
              );
            }
          } catch (error: any) {
            console.error(`Error adding subscriber ${email}:`, error);
            errors.push(
              `${email} - Failed to add: ${
                error.response?.data?.message || "Network error"
              }`
            );
          }
        }

        setImportProgress((prev) =>
          prev
            ? {
                ...prev,
                processed: i + 1,
                errors,
                success: successCount,
              }
            : null
        );
      }

      if (newSubscribers.length > 0) {
        const updatedLists = emailLists.map((list) =>
          list._id === importTargetList
            ? {
                ...list,
                subscribers: [...list.subscribers, ...newSubscribers],
                subscriberCount: list.subscriberCount + newSubscribers.length,
              }
            : list
        );

        setEmailLists(updatedLists);
      }

      // Show completion message
      setTimeout(() => {
        setImportProgress(null);
        setImportFile(null);
        setImportTargetList("");
        setImportDialog(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        toast({
          title: "Import completed!",
          description: `Added ${successCount} new subscribers. ${errors.length} duplicates/errors.`,
        });
      }, 1000);
    } catch (error: any) {
      console.error("Import error:", error);
      toast({
        title: "Error importing contacts",
        description: "Please check your CSV format and try again.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Export functionality
  const handleExportLists = () => {
    if (emailLists.length === 0) {
      alert("No email lists to export.");
      return;
    }

    // Prepare CSV data
    const csvData: string[] = ["List Name,Subscriber Email,Subscriber Name"];

    emailLists.forEach((list) => {
      if (list.subscribers && list.subscribers.length > 0) {
        list.subscribers.forEach((subscriber) => {
          const row = [
            `"${list.name}"`,
            `"${subscriber.email}"`,
            `"${subscriber.name || ""}"`,
          ].join(",");
          csvData.push(row);
        });
      } else {
        // Include empty lists in export
        const row = [`"${list.name}"`, '""', '""', '""'].join(",");
        csvData.push(row);
      }
    });

    // Create and download CSV file
    const csvContent = csvData.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `email_lists_export_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("Export not supported in this browser.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="p-4 md:p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Lists
            </h2>
            <p className="text-sm text-muted-foreground">
              Create and manage your email subscriber lists
            </p>
          </div>
          <Dialog open={newListDialog} onOpenChange={setNewListDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create List
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Email List</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="listName">List Name *</Label>
                  <Input
                    id="listName"
                    value={newListData.name}
                    onChange={(e) =>
                      setNewListData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g., Newsletter Subscribers"
                  />
                </div>
                <div>
                  <Label htmlFor="listDescription">Description</Label>
                  <Textarea
                    id="listDescription"
                    value={newListData.description}
                    onChange={(e) =>
                      setNewListData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Brief description of this list"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="listTags">Tags (comma-separated)</Label>
                  <Input
                    id="listTags"
                    value={newListData.tags}
                    onChange={(e) =>
                      setNewListData((prev) => ({
                        ...prev,
                        tags: e.target.value,
                      }))
                    }
                    placeholder="newsletter, weekly, updates"
                  />
                </div>
                <div>
                  <Label htmlFor="initialEmails">
                    Initial Subscribers (optional)
                  </Label>
                  <Textarea
                    id="initialEmails"
                    value={newListData.initialEmails}
                    onChange={(e) =>
                      setNewListData((prev) => ({
                        ...prev,
                        initialEmails: e.target.value,
                      }))
                    }
                    placeholder="Enter email addresses, one per line:&#10;john@example.com&#10;jane@example.com&#10;bob@example.com"
                    rows={5}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter one email address per line. You can add more
                    subscribers later.
                  </p>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleCreateList}
                    className="flex-1"
                    disabled={!newListData.name.trim() || isSaving}
                  >
                    {isSaving ? "Creating..." : "Create List"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNewListDialog(false);
                      setNewListData({
                        name: "",
                        description: "",
                        tags: "",
                        initialEmails: "",
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search lists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="default" size="sm">
              All ({emailLists.length})
            </Button>
          </div>
        </div>

        {/* Lists */}
        <div className="space-y-4">
          {filteredLists.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No lists found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first email list to get started"}
              </p>
              {!searchQuery && (
                <Button onClick={() => setNewListDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First List
                </Button>
              )}
            </div>
          ) : (
            filteredLists.map((list) => (
              <div
                key={list._id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 w-full">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{list.name}</h3>
                    </div>

                    {/* Detailed Information - Similar to the dialog view */}
                    <div className="space-y-1 text-sm text-muted-foreground mb-3">
                      <div>
                        <span className="font-medium">Total Subscribers:</span>{" "}
                        {list.subscriberCount}
                      </div>

                      {list.tags.length > 0 && (
                        <div>
                          <span className="font-medium">Tags:</span>{" "}
                          {list.tags.join(", ")}
                        </div>
                      )}

                      {list.description && (
                        <div>
                          <span className="font-medium">Description:</span>{" "}
                          {list.description}
                        </div>
                      )}

                      <div>
                        <span className="font-medium">Created:</span>{" "}
                        {new Date(list.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 ml-0 sm:ml-4 w-full sm:w-auto justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openSubscribersDialog(list)}
                      title="Manage Subscribers"
                    >
                      <Users className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(list)}
                      title="Edit List"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          title="Delete List"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Email List</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {list.name}? This
                            action cannot be undone and will remove all{" "}
                            {list.subscriberCount} subscribers from this list.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteList(list._id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete List
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Edit List Dialog */}
      <Dialog open={editListDialog} onOpenChange={setEditListDialog}>
        <DialogContent className="w-full max-w-sm sm:max-w-md mx-auto px-4 sm:px-6 py-6 rounded-xl shadow-lg overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Email List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editListName">List Name *</Label>
              <Input
                id="editListName"
                value={editListData.name}
                onChange={(e) =>
                  setEditListData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="e.g., Newsletter Subscribers"
              />
            </div>
            <div>
              <Label htmlFor="editListDescription">Description</Label>
              <Textarea
                id="editListDescription"
                value={editListData.description}
                onChange={(e) =>
                  setEditListData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Brief description of this list"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="editListTags">Tags (comma-separated)</Label>
              <Input
                id="editListTags"
                value={editListData.tags}
                onChange={(e) =>
                  setEditListData((prev) => ({
                    ...prev,
                    tags: e.target.value,
                  }))
                }
                placeholder="newsletter, weekly, updates"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleEditList}
                className="flex-1"
                disabled={!editListData.name.trim() || isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditListDialog(false);
                  setSelectedList(null);
                  setEditListData({ name: "", description: "", tags: "" });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Subscribers Management Dialog */}
      <Dialog open={subscribersDialog} onOpenChange={setSubscribersDialog}>
        <DialogContent className="w-full max-w-sm sm:max-w-md px-4 sm:px-6 py-6 rounded-xl shadow-lg overflow-y-auto max-h-[90vh] mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Manage Subscribers - {selectedList?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Add Subscriber and Search */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search subscribers..."
                  value={subscriberSearchQuery}
                  onChange={(e) => setSubscriberSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Dialog
                open={addSubscriberDialog}
                onOpenChange={setAddSubscriberDialog}
              >
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Subscriber
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Subscriber</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="subscriberEmail">Email Address *</Label>
                      <Input
                        id="subscriberEmail"
                        type="email"
                        value={newSubscriberData.email}
                        onChange={(e) =>
                          setNewSubscriberData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="subscriber@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subscriberName">Name (optional)</Label>
                      <Input
                        id="subscriberName"
                        value={newSubscriberData.name}
                        onChange={(e) =>
                          setNewSubscriberData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Subscriber Name"
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleAddSubscriber}
                        className="flex-1"
                        disabled={
                          !newSubscriberData.email.trim() ||
                          !isValidEmail(newSubscriberData.email)
                        }
                      >
                        Add Subscriber
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setAddSubscriberDialog(false);
                          setNewSubscriberData({ email: "", name: "" });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Subscribers List */}
            <div className="border rounded-lg max-h-96 overflow-y-auto">
              {filteredSubscribers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {subscriberSearchQuery
                      ? "No subscribers found"
                      : "No subscribers yet"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {subscriberSearchQuery
                      ? "Try adjusting your search criteria"
                      : "Add your first subscriber to get started"}
                  </p>
                  {!subscriberSearchQuery && (
                    <Button onClick={() => setAddSubscriberDialog(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add First Subscriber
                    </Button>
                  )}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredSubscribers.map(
                    (subscriber: Subscriber, index: number) => (
                      <div
                        key={index}
                        className="p-4 flex items-center justify-between hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">
                              {subscriber.name || subscriber.email}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {subscriber.email}
                          </p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Remove Subscriber
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove
                                {subscriber.email} from this list? This action
                                cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleRemoveSubscriber(subscriber.email)
                                }
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Remove Subscriber
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Email List Details */}
            {selectedList && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-lg">{selectedList.name}</h4>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Total Subscribers:</span>{" "}
                    {selectedList.subscriberCount}
                  </div>

                  {selectedList.tags.length > 0 && (
                    <div>
                      <span className="font-medium">Tags:</span>{" "}
                      {selectedList.tags.join(", ")}
                    </div>
                  )}

                  {selectedList.description && (
                    <div>
                      <span className="font-medium">Description:</span>{" "}
                      {selectedList.description}
                    </div>
                  )}

                  <div>
                    <span className="font-medium">Created:</span>{" "}
                    {new Date(selectedList.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setSubscribersDialog(false);
                  setSelectedList(null);
                  setSubscriberSearchQuery("");
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Subscriber Dialog */}
      <Dialog open={addSubscriberDialog} onOpenChange={setAddSubscriberDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Subscriber</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subscriberEmail">Email Address *</Label>
              <Input
                id="subscriberEmail"
                type="email"
                value={newSubscriberData.email}
                onChange={(e) =>
                  setNewSubscriberData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                placeholder="subscriber@example.com"
              />
              {newSubscriberData.email &&
                !isValidEmail(newSubscriberData.email) && (
                  <p className="text-sm text-red-600 mt-1">
                    Please enter a valid email address
                  </p>
                )}
            </div>
            <div>
              <Label htmlFor="subscriberName">Name (optional)</Label>
              <Input
                id="subscriberName"
                value={newSubscriberData.name}
                onChange={(e) =>
                  setNewSubscriberData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Subscriber Name"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleAddSubscriber}
                className="flex-1"
                disabled={
                  !newSubscriberData.email.trim() ||
                  !isValidEmail(newSubscriberData.email)
                }
              >
                Add Subscriber
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setAddSubscriberDialog(false);
                  setNewSubscriberData({ email: "", name: "" });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Actions */}
      <Card className="p-4 md:p-6">
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Dialog open={importDialog} onOpenChange={setImportDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <Upload className="h-6 w-6" />
                <div className="text-center">
                  <p className="font-medium">Import Contacts</p>
                  <p className="text-xs text-muted-foreground">
                    Upload CSV file with email addresses
                  </p>
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Import Contacts from CSV</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="csvFile">CSV File</Label>
                  <input
                    ref={fileInputRef}
                    id="csvFile"
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
                    <p className="text-xs font-medium text-gray-700 mb-2">
                      Required CSV Structure:
                    </p>
                    <div className="bg-white p-2 rounded border font-mono text-xs">
                      <div className="text-gray-600">email,name</div>
                      <div>john@example.com,John Doe</div>
                      <div>jane@example.com,Jane Smith</div>
                      <div>bob@example.com,Bob Johnson</div>
                    </div>
                    <div className="mt-2 space-y-1 text-xs text-gray-600">
                      <p>
                        • <strong>Email column</strong> (required): Must be the
                        first column
                      </p>
                      <p>
                        • <strong>Name column</strong> (optional): Can be the
                        second column
                      </p>
                      <p>• Header row is optional but recommended</p>
                      <p>• Duplicate emails will be skipped automatically</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="targetList">Target List</Label>
                  <Select
                    value={importTargetList}
                    onValueChange={setImportTargetList}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a list to import to" />
                    </SelectTrigger>
                    <SelectContent>
                      {emailLists.map((list) => (
                        <SelectItem key={list._id} value={list._id}>
                          {list.name} ({list.subscriberCount} subscribers)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {importFile && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">
                        {importFile.name}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(importFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                )}

                {importProgress && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>
                        {importProgress.processed}/{importProgress.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${
                            importProgress.total > 0
                              ? (importProgress.processed /
                                  importProgress.total) *
                                100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    {importProgress.errors.length > 0 && (
                      <div className="max-h-20 overflow-y-auto">
                        <p className="text-xs font-medium text-orange-600 mb-1">
                          Issues:
                        </p>
                        {importProgress.errors
                          .slice(0, 3)
                          .map((error, index) => (
                            <p key={index} className="text-xs text-orange-600">
                              {error}
                            </p>
                          ))}
                        {importProgress.errors.length > 3 && (
                          <p className="text-xs text-orange-600">
                            ...and {importProgress.errors.length - 3} more
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setImportDialog(false);
                      setImportFile(null);
                      setImportTargetList("");
                      setImportProgress(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    disabled={isImporting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleImportContacts}
                    disabled={!importFile || !importTargetList || isImporting}
                  >
                    {isImporting ? "Importing..." : "Import"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={handleExportLists}
          >
            <Download className="h-6 w-6" />
            <div className="text-center">
              <p className="font-medium">Export Lists</p>
              <p className="text-xs text-muted-foreground">
                Download subscriber data as CSV
              </p>
            </div>
          </Button>
        </div>
      </Card>

      {/* Summary Stats */}
      <Card className="p-4 md:p-6">
        <h3 className="font-semibold mb-4">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {emailLists.length}
            </p>
            <p className="text-sm font-medium text-blue-800">Total Lists</p>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              {emailLists
                .reduce((total, list) => total + list.subscriberCount, 0)
                .toLocaleString()}
            </p>
            <p className="text-sm font-medium text-purple-800">
              Total Subscribers
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
