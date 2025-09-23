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
import { useState, useEffect, useCallback, useRef } from "react";
import { Settings, Save, Globe, Palette, UserCheck } from "lucide-react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";

export function GeneralSettings() {
  const { setTheme, theme: currentTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const [settings, setSettings] = useState({
    language: "en",
    theme: "system" as "light" | "dark" | "system",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasLoadedRef = useRef(false);

  const loadSettings = useCallback(async () => {
    try {
      const response = await axios.get("/api/settings");
      if (response.data.success && response.data.data.general) {
        const loadedSettings = response.data.data.general;
        console.log("Loaded settings:", loadedSettings);
        setSettings(loadedSettings);

        // Apply theme from database
        if (loadedSettings.theme) {
          setTheme(loadedSettings.theme);
        }

        // Apply language from database
        if (loadedSettings.language) {
          console.log(`Setting i18n language to: ${loadedSettings.language}`);
          i18n.changeLanguage(loadedSettings.language);
          console.log(`i18n language after change: ${i18n.language}`);
        }
      } else {
        console.log("No general settings found in database, using defaults");
      }
    } catch (error) {
      console.error("Error loading general settings:", error);
      toast({
        title: t("errorLoadingSettings"),
        description: t("errorLoadingSettingsDescription"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }, [setTheme, t, i18n]);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadSettings();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for theme changes from sidebar and sync to database
  useEffect(() => {
    if (currentTheme && currentTheme !== settings.theme && !isInitialLoad) {
      setSettings((prev) => ({
        ...prev,
        theme: currentTheme as "light" | "dark" | "system",
      }));

      // Auto-save theme changes from sidebar
      const syncThemeToDatabase = async () => {
        try {
          await axios.patch("/api/settings", {
            category: "general",
            data: {
              language: settings.language,
              theme: currentTheme as "light" | "dark" | "system",
            },
          });
        } catch (error) {
          console.error("Error syncing theme to database:", error);
        }
      };

      syncThemeToDatabase();
    }
  }, [currentTheme, settings.theme, settings.language, isInitialLoad]);

  // No automatic sync - let user control the theme through the dropdown

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    console.log(
      `Setting change: ${key} = ${value}, current i18n language: ${i18n.language}`
    );

    // Immediately apply language changes
    if (key === "language") {
      console.log(`Changing language from ${i18n.language} to ${value}`);
      i18n.changeLanguage(value);
    }

    setSettings((prev) => ({ ...prev, [key]: value }));

    // Immediately apply theme changes
    if (key === "theme") {
      setTheme(value);
    }
  };

  const validateSettings = (settingsToValidate: typeof settings) => {
    const errors: string[] = [];

    if (!settingsToValidate.language) {
      errors.push(t("languageRequired"));
    }

    if (
      !settingsToValidate.theme ||
      !["light", "dark", "system"].includes(settingsToValidate.theme)
    ) {
      errors.push(t("themeInvalid"));
    }

    return errors;
  };

  const saveSettings = async () => {
    // Validate settings before saving
    const validationErrors = validateSettings(settings);
    if (validationErrors.length > 0) {
      toast({
        title: t("invalidSettings"),
        description: validationErrors.join(", "),
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      console.log("Saving settings:", settings);
      const response = await axios.patch("/api/settings", {
        category: "general",
        data: settings,
      });
      if (response.data.success) {
        setLastSaved(new Date().toLocaleTimeString());
        toast({
          title: t("settingsSaved"),
          description: t("settingsSavedDescription"),
        });
      } else {
        throw new Error(response.data.message || "Failed to save settings");
      }
    } catch (error: any) {
      console.error("Error saving general settings:", error);
      toast({
        title: t("errorSavingSettings"),
        description: error.message || t("errorSavingSettingsDescription"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const languages = [
    { value: "en", label: t("english") },
    // { value: "es", label: "Español" },
    // { value: "fr", label: "Français" },
    // { value: "de", label: "Deutsch" },
    // { value: "it", label: "Italiano" },
    // { value: "pt", label: "Português" },
    // { value: "ja", label: "日本語" },
    // { value: "ko", label: "한국어" },
    { value: "zh", label: t("chinese") },
  ];

  const themes = [
    { value: "light", label: t("light"), icon: "☀️" },
    { value: "dark", label: t("dark"), icon: "🌙" },
    { value: "system", label: t("system"), icon: "🔄" },
  ];

  if (isLoading) {
    return (
      <Card className="p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold mb-6 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          {t("generalSettings")}
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
        {t("generalSettings")}
      </h2>

      <div className="space-y-6">
        {/* Language Section */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {t("language")}
          </h3>

          <div className="space-y-2">
            <Label>{t("language")}</Label>
            <Select
              value={settings.language || "en"}
              onValueChange={(value) => handleSettingChange("language", value)}
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
        </div>
        {/* Appearance Section */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Palette className="h-4 w-4" />
            {t("appearance")}
          </h3>

          <div className="space-y-2">
            <Label>{t("theme")}</Label>
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
              {t("themeDescription")}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="text-sm text-muted-foreground">
            {lastSaved && `${t("lastSaved")}: ${lastSaved}`}
          </div>
          <Button onClick={saveSettings} disabled={isSaving}>
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                {t("saving")}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {t("saveChanges")}
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
                {t("onboardingPreferences")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("onboardingDescription")}
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
              {t("updatePreferences")}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
