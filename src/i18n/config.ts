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

// Get saved language from localStorage or default to browser language
const savedLanguage = localStorage.getItem("language");
const browserLanguage = navigator.language;

// Map browser language codes to our supported languages
const getDefaultLanguage = () => {
  if (savedLanguage) return savedLanguage;

  if (browserLanguage.startsWith("zh")) {
    // Distinguish between Traditional and Simplified Chinese
    if (browserLanguage === "zh-TW" || browserLanguage === "zh-HK") {
      return "zh-TW";
    }
    return "zh-CN";
  }

  return "en"; // Default to English
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
