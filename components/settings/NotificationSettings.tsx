"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save, Check, Calendar, Clock } from "lucide-react";
import axios from "axios";

interface NotificationSettingsProps {
  initialSettings?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    marketingEmails: boolean;
    weeklyDigest: boolean;
    calendarNotifications?: {
      events: {
        emailReminder: boolean;
        reminderTime: number;
        pushNotification: boolean;
      };
      meetings: {
        emailReminder: boolean;
        reminderTime: number;
        pushNotification: boolean;
      };
      scheduledPosts: {
        emailReminder: boolean;
        reminderTime: number;
        pushNotification: boolean;
      };
    };
  };
}

export function NotificationSettings({
  initialSettings,
}: NotificationSettingsProps) {
  const [settings, setSettings] = useState({
    emailNotifications: initialSettings?.emailNotifications ?? true,
    pushNotifications: initialSettings?.pushNotifications ?? true,
    marketingEmails: initialSettings?.marketingEmails ?? false,
    weeklyDigest: initialSettings?.weeklyDigest ?? true,
    calendarNotifications: {
      events: {
        emailReminder:
          initialSettings?.calendarNotifications?.events?.emailReminder ?? true,
        reminderTime:
          initialSettings?.calendarNotifications?.events?.reminderTime ?? 15,
        pushNotification:
          initialSettings?.calendarNotifications?.events?.pushNotification ??
          true,
      },
      meetings: {
        emailReminder:
          initialSettings?.calendarNotifications?.meetings?.emailReminder ??
          true,
        reminderTime:
          initialSettings?.calendarNotifications?.meetings?.reminderTime ?? 30,
        pushNotification:
          initialSettings?.calendarNotifications?.meetings?.pushNotification ??
          true,
      },
      scheduledPosts: {
        emailReminder:
          initialSettings?.calendarNotifications?.scheduledPosts
            ?.emailReminder ?? false,
        reminderTime:
          initialSettings?.calendarNotifications?.scheduledPosts
            ?.reminderTime ?? 5,
        pushNotification:
          initialSettings?.calendarNotifications?.scheduledPosts
            ?.pushNotification ?? true,
      },
    },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await axios.get("/api/settings");
      if (response.data.success && response.data.data.notifications) {
        setSettings(response.data.data.notifications);
      }
    } catch (error) {
      console.error("Error loading notification settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const response = await axios.patch("/api/settings", {
        category: "notifications",
        data: settings,
      });

      if (response.data.success) {
        setLastSaved(new Date().toLocaleTimeString());
      }
    } catch (error: any) {
      console.error("Error saving notification settings:", error);
      alert("Error saving settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold mb-6">
          Notification Preferences
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
      <h2 className="text-lg md:text-xl font-semibold mb-6">
        Notification Preferences
      </h2>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive email updates about your activity and posts
            </p>
          </div>
          <Switch
            checked={settings.emailNotifications}
            onCheckedChange={(checked) =>
              handleSettingChange("emailNotifications", checked)
            }
          />
        </div>

        {/* <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Push Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive push notifications about your activity
            </p>
          </div>
          <Switch
            checked={settings.pushNotifications}
            onCheckedChange={(checked) =>
              handleSettingChange("pushNotifications", checked)
            }
          />
        </div> */}

        {/* <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Marketing Emails</Label>
            <p className="text-sm text-muted-foreground">
              Receive promotional emails and product updates
            </p>
          </div>
          <Switch
            checked={settings.marketingEmails}
            onCheckedChange={(checked) =>
              handleSettingChange("marketingEmails", checked)
            }
          />
        </div> */}

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Weekly Digest</Label>
            <p className="text-sm text-muted-foreground">
              Get a weekly summary of your social media performance
            </p>
          </div>
          <Switch
            checked={settings.weeklyDigest}
            onCheckedChange={(checked) =>
              handleSettingChange("weeklyDigest", checked)
            }
          />
        </div>

        {/* Calendar Notifications Section */}
        <div className="pt-6 border-t">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Calendar Notifications</h3>
          </div>

          {/* Events */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Event Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about upcoming calendar events
                </p>
              </div>
              <Switch
                checked={settings.calendarNotifications.events.emailReminder}
                onCheckedChange={(checked) => {
                  setSettings((prev) => ({
                    ...prev,
                    calendarNotifications: {
                      ...prev.calendarNotifications,
                      events: {
                        ...prev.calendarNotifications.events,
                        emailReminder: checked,
                        pushNotification: checked, // Keep in sync for now
                      },
                    },
                  }));
                }}
              />
            </div>

            {settings.calendarNotifications.events.emailReminder && (
              <div className="ml-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">Reminder Time:</Label>
                  </div>
                  <Select
                    value={settings.calendarNotifications.events.reminderTime.toString()}
                    onValueChange={(value) => {
                      setSettings((prev) => ({
                        ...prev,
                        calendarNotifications: {
                          ...prev.calendarNotifications,
                          events: {
                            ...prev.calendarNotifications.events,
                            reminderTime: parseInt(value),
                          },
                        },
                      }));
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select reminder time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes before</SelectItem>
                      <SelectItem value="10">10 minutes before</SelectItem>
                      <SelectItem value="15">15 minutes before</SelectItem>
                      <SelectItem value="30">30 minutes before</SelectItem>
                      <SelectItem value="60">1 hour before</SelectItem>
                      <SelectItem value="120">2 hours before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Meetings */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Meeting Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about upcoming meetings
                </p>
              </div>
              <Switch
                checked={settings.calendarNotifications.meetings.emailReminder}
                onCheckedChange={(checked) => {
                  setSettings((prev) => ({
                    ...prev,
                    calendarNotifications: {
                      ...prev.calendarNotifications,
                      meetings: {
                        ...prev.calendarNotifications.meetings,
                        emailReminder: checked,
                        pushNotification: checked, // Keep in sync for now
                      },
                    },
                  }));
                }}
              />
            </div>

            {settings.calendarNotifications.meetings.emailReminder && (
              <div className="ml-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">Reminder Time:</Label>
                  </div>
                  <Select
                    value={settings.calendarNotifications.meetings.reminderTime.toString()}
                    onValueChange={(value) => {
                      setSettings((prev) => ({
                        ...prev,
                        calendarNotifications: {
                          ...prev.calendarNotifications,
                          meetings: {
                            ...prev.calendarNotifications.meetings,
                            reminderTime: parseInt(value),
                          },
                        },
                      }));
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select reminder time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes before</SelectItem>
                      <SelectItem value="10">10 minutes before</SelectItem>
                      <SelectItem value="15">15 minutes before</SelectItem>
                      <SelectItem value="30">30 minutes before</SelectItem>
                      <SelectItem value="60">1 hour before</SelectItem>
                      <SelectItem value="120">2 hours before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Scheduled Posts */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Scheduled Post Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about upcoming scheduled posts
                </p>
              </div>
              <Switch
                checked={
                  settings.calendarNotifications.scheduledPosts.emailReminder
                }
                onCheckedChange={(checked) => {
                  setSettings((prev) => ({
                    ...prev,
                    calendarNotifications: {
                      ...prev.calendarNotifications,
                      scheduledPosts: {
                        ...prev.calendarNotifications.scheduledPosts,
                        emailReminder: checked,
                        pushNotification: checked, // Keep in sync for now
                      },
                    },
                  }));
                }}
              />
            </div>

            {settings.calendarNotifications.scheduledPosts.emailReminder && (
              <div className="ml-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">Reminder Time:</Label>
                  </div>
                  <Select
                    value={settings.calendarNotifications.scheduledPosts.reminderTime.toString()}
                    onValueChange={(value) => {
                      setSettings((prev) => ({
                        ...prev,
                        calendarNotifications: {
                          ...prev.calendarNotifications,
                          scheduledPosts: {
                            ...prev.calendarNotifications.scheduledPosts,
                            reminderTime: parseInt(value),
                          },
                        },
                      }));
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select reminder time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes before</SelectItem>
                      <SelectItem value="10">10 minutes before</SelectItem>
                      <SelectItem value="15">15 minutes before</SelectItem>
                      <SelectItem value="30">30 minutes before</SelectItem>
                      <SelectItem value="60">1 hour before</SelectItem>
                      <SelectItem value="120">2 hours before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
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
