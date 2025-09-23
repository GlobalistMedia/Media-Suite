import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

export function useLanguageSync(language: string) {
  const { i18n } = useTranslation();
  const isInitialized = useRef(false);

  useEffect(() => {
    // Only sync if we have a valid language and it's different from current
    if (language && i18n.language !== language && isInitialized.current) {
      console.log(`Syncing language from ${i18n.language} to ${language}`);
      i18n.changeLanguage(language);
    }

    // Mark as initialized after first render
    if (!isInitialized.current) {
      isInitialized.current = true;
    }
  }, [language, i18n]);
}
