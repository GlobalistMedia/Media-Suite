# Internationalization (i18n) Setup

This project uses `react-i18next` and `next-i18next` for internationalization support.

## Configuration Files

- `next-i18next.config.js` - Next.js i18n configuration
- `lib/i18n.ts` - i18next configuration and resource loading
- `public/locales/` - Translation files directory

## Supported Languages

- English (`en`) - Default
- Chinese (`zh`)

## Translation Files

Translation files are located in `public/locales/{language}/common.json`:

- `public/locales/en/common.json` - English translations
- `public/locales/zh/common.json` - Chinese translations

## Usage in Components

```tsx
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <h1>{t("title")}</h1>
      <button onClick={() => i18n.changeLanguage("zh")}>
        Switch to Chinese
      </button>
    </div>
  );
}
```

## Language Synchronization

The `useLanguageSync` hook automatically synchronizes language changes between settings and i18n:

```tsx
import { useLanguageSync } from "@/hooks/useLanguageSync";

function SettingsComponent() {
  const [language, setLanguage] = useState("en");

  // Automatically syncs language changes
  useLanguageSync(language);

  return (
    <select value={language} onChange={(e) => setLanguage(e.target.value)}>
      <option value="en">English</option>
      <option value="zh">中文</option>
    </select>
  );
}
```

## Adding New Languages

1. Add the language code to `next-i18next.config.js`:

   ```js
   locales: ['en', 'zh', 'es'], // Add 'es' for Spanish
   ```

2. Create translation files:

   ```
   public/locales/es/common.json
   ```

3. Add translations to `lib/i18n.ts` resources object

4. Update language options in components

## Translation Keys

All translation keys follow a flat structure in `common.json`:

```json
{
  "generalSettings": "General Settings",
  "language": "Language",
  "saveChanges": "Save Changes"
}
```

## Best Practices

1. Use descriptive key names
2. Keep translations consistent across languages
3. Test with different languages during development
4. Use the `useLanguageSync` hook for automatic language synchronization
5. Always provide fallback text for missing translations
