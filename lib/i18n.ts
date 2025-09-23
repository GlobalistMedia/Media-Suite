import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      // General Settings
      generalSettings: "General Settings",
      language: "Language",
      appearance: "Appearance",
      theme: "Theme",
      saveChanges: "Save Changes",
      saving: "Saving...",
      lastSaved: "Last saved",

      // Theme options
      light: "Light",
      dark: "Dark",
      system: "System",

      // Language options
      english: "English",
      chinese: "中文",

      // Theme description
      themeDescription:
        "Choose your preferred theme. System will follow your device settings.",

      // Onboarding
      onboardingPreferences: "Onboarding Preferences",
      onboardingDescription:
        "Revisit and update your onboarding preferences and settings",
      updatePreferences: "Update Preferences",

      // Messages
      settingsSaved: "General settings saved successfully",
      settingsSavedDescription: "Your general settings have been saved.",
      errorLoadingSettings: "Error loading general settings",
      errorLoadingSettingsDescription: "Please try again.",
      errorSavingSettings: "Error saving general settings",
      errorSavingSettingsDescription: "Please try again.",
      invalidSettings: "Invalid settings",
      languageRequired: "Language is required",
      themeInvalid: "Theme must be light, dark, or system",
    },
  },
  zh: {
    translation: {
      // General Settings
      generalSettings: "常规设置",
      language: "语言",
      appearance: "外观",
      theme: "主题",
      saveChanges: "保存更改",
      saving: "保存中...",
      lastSaved: "最后保存",

      // Theme options
      light: "浅色",
      dark: "深色",
      system: "系统",

      // Language options
      english: "English",
      chinese: "中文",

      // Theme description
      themeDescription: "选择您喜欢的主题。系统将跟随您的设备设置。",

      // Onboarding
      onboardingPreferences: "入门偏好设置",
      onboardingDescription: "重新访问并更新您的入门偏好设置",
      updatePreferences: "更新偏好设置",

      // Messages
      settingsSaved: "常规设置保存成功",
      settingsSavedDescription: "您的常规设置已保存。",
      errorLoadingSettings: "加载常规设置时出错",
      errorLoadingSettingsDescription: "请重试。",
      errorSavingSettings: "保存常规设置时出错",
      errorSavingSettingsDescription: "请重试。",
      invalidSettings: "设置无效",
      languageRequired: "语言是必需的",
      themeInvalid: "主题必须是浅色、深色或系统",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  debug: process.env.NODE_ENV === "development",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
