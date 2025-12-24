import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import zhTW from "./locales/zh-TW.json";
import zhCN from "./locales/zh-CN.json";

const resources = {
  en: { translation: en },
  "zh-TW": { translation: zhTW },
  "zh-CN": { translation: zhCN }
};

// Get saved language from localStorage or default to the user's browser preferences
const savedLanguage = localStorage.getItem("language");

// Robust default language detection:
// 1. Use saved language in localStorage if present
// 2. Iterate through navigator.languages (if available) for best match
// 3. Fall back to navigator.language
// 4. Finally fall back to English ('en')
const mapToSupported = (lang: string | undefined): string | null => {
  if (!lang) return null;
  const code = lang.toLowerCase();

  if (code.startsWith("zh")) {
    // Treat zh-TW / zh-HK as Traditional Chinese
    if (code.includes("-tw") || code.includes("-hk") || code.includes("_tw") || code.includes("_hk")) {
      return "zh-TW";
    }
    // Default any other zh variants to Simplified Chinese
    return "zh-CN";
  }

  if (code.startsWith("en")) return "en";

  // Add additional mappings here if more locales are supported later
  return null;
};

const getDefaultLanguage = () => {
  if (savedLanguage) return savedLanguage;

  // Try navigator.languages (an ordered list of preferred languages)
  const navLanguages: readonly string[] | undefined = (navigator as any).languages;
  if (Array.isArray(navLanguages)) {
    for (const l of navLanguages) {
      const mapped = mapToSupported(l);
      if (mapped) return mapped;
    }
  }

  // Fallback to navigator.language
  const fallbackMapped = mapToSupported(navigator.language);
  if (fallbackMapped) return fallbackMapped;

  return "en";
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDefaultLanguage(),
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;
