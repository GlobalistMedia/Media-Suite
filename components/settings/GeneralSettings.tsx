"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useCallback } from "react";
import { Settings, Save, Globe, Clock, Palette, UserCheck } from "lucide-react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";

export function GeneralSettings() {
  const { setTheme, theme: currentTheme } = useTheme();

  const [settings, setSettings] = useState({
    timezone: "UTC",
    language: "en",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h" as "12h" | "24h",
    weekStart: "monday" as "monday" | "sunday",
    theme: "system" as "light" | "dark" | "system",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      const response = await axios.get("/api/settings");
      console.log("General settings response:", response.data);
      if (response.data.success && response.data.data.general) {
        console.log(
          "Loading general settings from database:",
          response.data.data.general
        );
        const loadedSettings = response.data.data.general;
        setSettings(loadedSettings);

        // Apply theme from database
        if (loadedSettings.theme) {
          setTheme(loadedSettings.theme);
        }
      } else {
        console.log("No general settings found in database, using defaults");
      }
    } catch (error) {
      console.error("Error loading general settings:", error);
      toast({
        title: "Error loading general settings",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [setTheme]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // No automatic sync - let user control the theme through the dropdown

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));

    // Immediately apply theme changes
    if (key === "theme") {
      setTheme(value);
    }
  };

  const validateSettings = (settingsToValidate: typeof settings) => {
    const errors: string[] = [];

    if (!settingsToValidate.timezone) {
      errors.push("Timezone is required");
    }

    if (!settingsToValidate.language) {
      errors.push("Language is required");
    }

    if (!settingsToValidate.dateFormat) {
      errors.push("Date format is required");
    }

    if (
      !settingsToValidate.timeFormat ||
      !["12h", "24h"].includes(settingsToValidate.timeFormat)
    ) {
      errors.push("Time format must be 12h or 24h");
    }

    if (
      !settingsToValidate.weekStart ||
      !["monday", "sunday"].includes(settingsToValidate.weekStart)
    ) {
      errors.push("Week start must be monday or sunday");
    }

    if (
      !settingsToValidate.theme ||
      !["light", "dark", "system"].includes(settingsToValidate.theme)
    ) {
      errors.push("Theme must be light, dark, or system");
    }

    return errors;
  };

  const saveSettings = async () => {
    // Validate settings before saving
    const validationErrors = validateSettings(settings);
    if (validationErrors.length > 0) {
      toast({
        title: "Invalid settings",
        description: validationErrors.join(", "),
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      console.log("Saving general settings:", settings);
      const response = await axios.patch("/api/settings", {
        category: "general",
        data: settings,
      });
      console.log("Save response:", response.data);

      if (response.data.success) {
        setLastSaved(new Date().toLocaleTimeString());
        toast({
          title: "General settings saved successfully",
          description: "Your general settings have been saved.",
        });
      } else {
        throw new Error(response.data.message || "Failed to save settings");
      }
    } catch (error: any) {
      console.error("Error saving general settings:", error);
      toast({
        title: "Error saving general settings",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const timezones = [
    { value: "UTC", label: "UTC (Coordinated Universal Time)" },
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
    { value: "Europe/Paris", label: "Central European Time (CET)" },
    { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
    { value: "Asia/Shanghai", label: "China Standard Time (CST)" },
    { value: "Australia/Sydney", label: "Australian Eastern Time (AET)" },
  ];

  const languages = [
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
    { value: "fr", label: "Français" },
    { value: "de", label: "Deutsch" },
    { value: "it", label: "Italiano" },
    { value: "pt", label: "Português" },
    { value: "ja", label: "日本語" },
    { value: "ko", label: "한국어" },
    { value: "zh", label: "中文" },
  ];

  const dateFormats = [
    { value: "MM/DD/YYYY", label: "MM/DD/YYYY (12/31/2024)" },
    { value: "DD/MM/YYYY", label: "DD/MM/YYYY (31/12/2024)" },
    { value: "YYYY-MM-DD", label: "YYYY-MM-DD (2024-12-31)" },
    { value: "DD-MM-YYYY", label: "DD-MM-YYYY (31-12-2024)" },
  ];

  const themes = [
    { value: "light", label: "Light", icon: "☀️" },
    { value: "dark", label: "Dark", icon: "🌙" },
    { value: "system", label: "System", icon: "🔄" },
  ];

  if (isLoading) {
    return (
      <Card className="p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold mb-6 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          General Settings
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
        <Settings className="h-5 w-5" />
        General Settings
      </h2>

      <div className="space-y-6">
        {/* Localization Section */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Localization
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={settings.language}
                onValueChange={(value) =>
                  handleSettingChange("language", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select
                value={settings.timezone}
                onValueChange={(value) =>
                  handleSettingChange("timezone", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Date & Time Section */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Date & Time
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select
                value={settings.dateFormat}
                onValueChange={(value) =>
                  handleSettingChange("dateFormat", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateFormats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Time Format</Label>
              <Select
                value={settings.timeFormat}
                onValueChange={(value) =>
                  handleSettingChange("timeFormat", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12 Hour (12:30 PM)</SelectItem>
                  <SelectItem value="24h">24 Hour (12:30)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Week Starts On</Label>
              <Select
                value={settings.weekStart}
                onValueChange={(value) =>
                  handleSettingChange("weekStart", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monday">Monday</SelectItem>
                  <SelectItem value="sunday">Sunday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </h3>

          <div className="space-y-2">
            <Label>Theme</Label>
            <Select
              value={settings.theme}
              onValueChange={(value) => handleSettingChange("theme", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {themes.map((theme) => (
                  <SelectItem key={theme.value} value={theme.value}>
                    {theme.icon} {theme.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Choose your preferred theme. System will follow your device
              settings.
            </p>
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

        {/* Preferences Section */}
        <div className="pt-6 border-t">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <UserCheck className="h-4 w-4" />
                Onboarding Preferences
              </h3>
              <p className="text-sm text-muted-foreground">
                Revisit and update your onboarding preferences and settings
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() =>
                (window.location.href = "/onboarding?force-navigation=true")
              }
              className="flex items-center gap-2"
            >
              <UserCheck className="h-4 w-4" />
              Update Preferences
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
