"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Shield,
  Eye,
  Download,
  Save,
  FileText,
  User,
  Mail,
  Calendar,
  Settings,
} from "lucide-react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";

export function PrivacySettings() {
  const { data: session } = useSession();
  const [privacy, setPrivacy] = useState({
    profileVisibility: true,
    dataCollection: false,
    analyticsSharing: true,
    marketingCommunications: false,
    thirdPartyIntegrations: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [viewDataDialog, setViewDataDialog] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [emailLists, setEmailLists] = useState<any[]>([]);
  const [isLoadingEmailLists, setIsLoadingEmailLists] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await axios.get("/api/settings");
      if (response.data.success && response.data.data.privacy) {
        setPrivacy(response.data.data.privacy);
      } else {
        toast({
          title: "Error loading privacy settings",
          description: "Please try again.",
        });
      }
    } catch (error) {
      toast({
        title: "Error loading privacy settings",
        description: "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrivacyChange = (key: keyof typeof privacy, value: boolean) => {
    setPrivacy((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const response = await axios.patch("/api/settings", {
        category: "privacy",
        data: privacy,
      });

      if (response.data.success) {
        setLastSaved(new Date().toLocaleTimeString());
        toast({
          title: "Privacy settings saved successfully",
          description: "Your privacy settings have been saved.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error saving privacy settings",
        description: "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const loadUserData = async () => {
    setIsLoadingUserData(true);
    try {
      const response = await axios.get("/api/settings");
      if (response.data.success) {
        setUserData(response.data.data);
      }
    } catch (error) {
      toast({
        title: "Error loading user data",
        description: "Please try again.",
      });
    } finally {
      setIsLoadingUserData(false);
    }
  };

  const loadEmailLists = async () => {
    setIsLoadingEmailLists(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_GLOBALIST_LIVE_URL}/email-list/me?creatorEmail=${session?.user?.email}&page=1&limit=10000`
      );
      if (response.data.status === 200 && response.data.response.emails) {
        const emailLists = response.data.response.emails;
        setEmailLists(emailLists);
      } else {
        setEmailLists([]);
      }
    } catch (error) {
      toast({
        title: "Error loading email lists",
        description: "Please try again.",
      });
      setEmailLists([]);
    } finally {
      setIsLoadingEmailLists(false);
    }
  };

  const handleViewData = async () => {
    await Promise.all([loadUserData(), loadEmailLists()]);
    setViewDataDialog(true);
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const [settingsResponse, emailListsResponse] = await Promise.all([
        axios.get("/api/settings"),
        axios.get(
          `${process.env.NEXT_PUBLIC_GLOBALIST_LIVE_URL}/email-list/me?creatorEmail=${session?.user?.email}&page=1&limit=10000`
        ),
      ]);

      if (settingsResponse.data.success) {
        const userData = settingsResponse.data.data;
        const emailLists =
          emailListsResponse.data.status === 200 &&
          emailListsResponse.data.response.emails
            ? emailListsResponse.data.response.emails
            : [];

        // Create comprehensive export data
        const exportData = {
          exportDate: new Date().toISOString(),
          profile: {
            name:
              session?.user?.name || userData.profile?.name || "Not provided",
            email:
              session?.user?.email || userData.profile?.email || "Not provided",
            bio: userData.profile?.bio || "Not provided",
            website: userData.profile?.website || "Not provided",
            location: userData.profile?.location || "Not provided",
            timezone: userData.profile?.timezone || "Not provided",
          },
          settings: {
            notifications: userData.notifications || {},
            privacy: userData.privacy || {},
            preferences: userData.preferences || {},
          },
          emailSettings: {
            lists: emailLists,
            trackOpens: userData.emailSettings?.trackOpens || false,
            trackClicks: userData.emailSettings?.trackClicks || false,
          },
          platformIntegrations: userData.platformIntegrations || {},
          accountInfo: {
            createdAt: userData.createdAt || "Unknown",
            lastLogin: userData.lastLogin || "Unknown",
            plan: userData.plan || "Free",
          },
        };

        // Create and download JSON file
        const jsonContent = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonContent], { type: "application/json" });
        const link = document.createElement("a");

        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute(
            "download",
            `user_data_export_${new Date().toISOString().split("T")[0]}.json`
          );
          link.style.visibility = "hidden";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          toast({
            title: "Data exported successfully",
            description: "Your data has been exported successfully!",
          });
        } else {
          toast({
            title: "Export not supported in this browser.",
            description: "Please try again.",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error exporting user data",
        description: "Please try again.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold mb-6 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Privacy & Data
        </h2>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-semibold mb-6 flex items-center gap-2">
        <Shield className="h-5 w-5" />
        Privacy & Data
      </h2>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Profile Visibility</Label>
            <p className="text-sm text-muted-foreground">
              Make your profile visible to other users
            </p>
          </div>
          <Switch
            checked={privacy.profileVisibility}
            onCheckedChange={(checked) =>
              handlePrivacyChange("profileVisibility", checked)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Data Collection</Label>
            <p className="text-sm text-muted-foreground">
              Allow collection of usage data for service improvement
            </p>
          </div>
          <Switch
            checked={privacy.dataCollection}
            onCheckedChange={(checked) =>
              handlePrivacyChange("dataCollection", checked)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Analytics Sharing</Label>
            <p className="text-sm text-muted-foreground">
              Share anonymized analytics data with partners
            </p>
          </div>
          <Switch
            checked={privacy.analyticsSharing}
            onCheckedChange={(checked) =>
              handlePrivacyChange("analyticsSharing", checked)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Marketing Communications</Label>
            <p className="text-sm text-muted-foreground">
              Receive personalized marketing communications
            </p>
          </div>
          <Switch
            checked={privacy.marketingCommunications}
            onCheckedChange={(checked) =>
              handlePrivacyChange("marketingCommunications", checked)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Third-party Integrations</Label>
            <p className="text-sm text-muted-foreground">
              Allow third-party services to access your data
            </p>
          </div>
          <Switch
            checked={privacy.thirdPartyIntegrations}
            onCheckedChange={(checked) =>
              handlePrivacyChange("thirdPartyIntegrations", checked)
            }
          />
        </div>

        <div className="pt-6 border-t space-y-4">
          <h3 className="font-semibold">Data Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Dialog open={viewDataDialog} onOpenChange={setViewDataDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-center gap-3"
                  onClick={handleViewData}
                >
                  <Eye className="h-6 w-6" />
                  <div className="text-center">
                    <p className="font-medium text-base">View Data</p>
                    <p className="text-xs text-muted-foreground">
                      See what data we have
                    </p>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Your Data</DialogTitle>
                </DialogHeader>

                {isLoadingUserData || isLoadingEmailLists ? (
                  <div className="space-y-4">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                ) : userData ? (
                  <div className="space-y-6">
                    {/* Profile Data */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="h-5 w-5 text-blue-600" />
                        <h4 className="font-semibold">Profile Information</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-medium">Name:</span>{" "}
                          {session?.user?.name ||
                            userData.profile?.name ||
                            "Not provided"}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span>{" "}
                          {session?.user?.email ||
                            userData.profile?.email ||
                            "Not provided"}
                        </div>
                        <div>
                          <span className="font-medium">Bio:</span>{" "}
                          {userData.profile?.bio || "Not provided"}
                        </div>
                        <div>
                          <span className="font-medium">Website:</span>{" "}
                          {userData.profile?.website || "Not provided"}
                        </div>
                        <div>
                          <span className="font-medium">Location:</span>{" "}
                          {userData.profile?.location || "Not provided"}
                        </div>
                        <div>
                          <span className="font-medium">Timezone:</span>{" "}
                          {userData.profile?.timezone || "Not provided"}
                        </div>
                      </div>
                    </div>

                    {/* Email Lists */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Mail className="h-5 w-5 text-green-600" />
                        <h4 className="font-semibold">Email Lists</h4>
                      </div>
                      {isLoadingEmailLists ? (
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ) : emailLists.length > 0 ? (
                        <div className="space-y-2 text-sm">
                          {emailLists.map((list: any, index: number) => (
                            <div key={index} className="bg-gray-50 p-3 rounded">
                              <div className="font-medium">{list.name}</div>
                              <div className="text-muted-foreground">
                                {list.subscriberCount || 0} subscribers •
                                Created:{" "}
                                {new Date(list.createdAt).toLocaleDateString()}
                              </div>
                              {list.description && (
                                <div className="text-muted-foreground text-xs mt-1">
                                  {list.description}
                                </div>
                              )}
                              {list.tags && list.tags.length > 0 && (
                                <div className="text-muted-foreground text-xs mt-1">
                                  Tags: {list.tags.join(", ")}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No email lists created
                        </p>
                      )}
                    </div>

                    {/* Settings */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Settings className="h-5 w-5 text-purple-600" />
                        <h4 className="font-semibold">
                          Settings & Preferences
                        </h4>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="font-medium">Privacy Settings:</span>
                          <div className="ml-4 text-muted-foreground">
                            • Profile Visibility:{" "}
                            {privacy.profileVisibility ? "Enabled" : "Disabled"}
                            <br />• Data Collection:{" "}
                            {privacy.dataCollection ? "Enabled" : "Disabled"}
                            <br />• Analytics Sharing:{" "}
                            {privacy.analyticsSharing ? "Enabled" : "Disabled"}
                            <br />• Marketing Communications:{" "}
                            {privacy.marketingCommunications
                              ? "Enabled"
                              : "Disabled"}
                            <br />• Third-party Integrations:{" "}
                            {privacy.thirdPartyIntegrations
                              ? "Enabled"
                              : "Disabled"}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">
                            Platform Integrations:
                          </span>
                          <div className="ml-4 text-muted-foreground">
                            {userData.platformIntegrations &&
                            Array.isArray(userData.platformIntegrations) &&
                            userData.platformIntegrations.length > 0 ? (
                              userData.platformIntegrations.map(
                                (integration: any, index: number) => (
                                  <div key={index}>
                                    • {integration.platformId}:{" "}
                                    {integration.isConnected
                                      ? "Connected"
                                      : "Disconnected"}
                                    {integration.username && (
                                      <span className="text-xs">
                                        {" "}
                                        (@{integration.username})
                                      </span>
                                    )}
                                    {integration.lastSync &&
                                      integration.isConnected && (
                                        <span className="text-xs">
                                          {" "}
                                          • Last sync:{" "}
                                          {new Date(
                                            integration.lastSync
                                          ).toLocaleDateString()}
                                        </span>
                                      )}
                                  </div>
                                )
                              )
                            ) : (
                              <div>• No platform integrations configured</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Account Info */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="h-5 w-5 text-orange-600" />
                        <h4 className="font-semibold">Account Information</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-medium">Account Created:</span>{" "}
                          {userData.createdAt
                            ? new Date(userData.createdAt).toLocaleDateString()
                            : "Unknown"}
                        </div>
                        <div>
                          <span className="font-medium">Last Login:</span>{" "}
                          {userData.lastLogin
                            ? new Date(userData.lastLogin).toLocaleDateString()
                            : "Unknown"}
                        </div>
                        <div>
                          <span className="font-medium">Plan:</span>{" "}
                          {userData.plan || "Free"}
                        </div>
                        <div>
                          <span className="font-medium">
                            Total Email Lists:
                          </span>{" "}
                          {userData.emailSettings?.lists?.length || 0}
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-800">
                          Data Export
                        </span>
                      </div>
                      <p className="text-sm text-blue-700">
                        You can export all of this data using the &quot;Export
                        Data&quot; button. The export will include detailed
                        information in JSON format for your records.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No data available to display.
                    </p>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-3"
              onClick={handleExportData}
              disabled={isExporting}
            >
              <Download className="h-6 w-6" />
              <div className="text-center">
                <p className="font-medium text-base">
                  {isExporting ? "Exporting..." : "Export Data"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Download your data
                </p>
              </div>
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t">
          <div className="text-sm text-muted-foreground">
            {lastSaved && `Last saved: ${lastSaved}`}
          </div>
          <Button onClick={saveSettings} disabled={isSaving}>
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
