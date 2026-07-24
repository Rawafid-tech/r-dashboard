import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import commonAr from "./locales/ar/common.json";
import commonEn from "./locales/en/common.json";

const resources = {
  ar: { common: commonAr },
  en: { common: commonEn },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "ar",
    defaultNS: "common",
    ns: ["common"],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "rawafid-locale",
      caches: ["localStorage"],
    },
  });

export default i18n;
