import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import commonAr from "./locales/ar/common.json";
import commonEn from "./locales/en/common.json";
import authAr from "./locales/ar/auth.json";
import authEn from "./locales/en/auth.json";

const resources = {
  ar: {
    common: commonAr,
    auth: authAr,
  },
  en: {
    common: commonEn,
    auth: authEn,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "ar",
    defaultNS: "common",
    ns: ["common", "auth"],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      // Prefer stored choice; otherwise fall back to Arabic (not browser language)
      order: ["localStorage"],
      lookupLocalStorage: "rawafid-locale",
      caches: ["localStorage"],
    },
  });

export default i18n;
