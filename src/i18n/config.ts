import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import commonAr from "./locales/ar/common.json";
import commonEn from "./locales/en/common.json";
import authAr from "./locales/ar/auth.json";
import authEn from "./locales/en/auth.json";
import dashboardAr from "./locales/ar/dashboard.json";
import dashboardEn from "./locales/en/dashboard.json";
import settingsAr from "./locales/ar/settings.json";
import settingsEn from "./locales/en/settings.json";
import billingAr from "./locales/ar/billing.json";
import billingEn from "./locales/en/billing.json";
import adminAr from "./locales/ar/admin.json";
import adminEn from "./locales/en/admin.json";
import rolesAr from "./locales/ar/roles.json";
import rolesEn from "./locales/en/roles.json";
import usersAr from "./locales/ar/users.json";
import usersEn from "./locales/en/users.json";
import locationsAr from "./locales/ar/locations.json";
import locationsEn from "./locales/en/locations.json";

const resources = {
  ar: {
    common: commonAr,
    auth: authAr,
    dashboard: dashboardAr,
    settings: settingsAr,
    billing: billingAr,
    admin: adminAr,
    roles: rolesAr,
    users: usersAr,
    locations: locationsAr,
  },
  en: {
    common: commonEn,
    auth: authEn,
    dashboard: dashboardEn,
    settings: settingsEn,
    billing: billingEn,
    admin: adminEn,
    roles: rolesEn,
    users: usersEn,
    locations: locationsEn,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "ar",
    defaultNS: "common",
    ns: ["common", "auth", "dashboard", "settings", "billing", "admin", "roles", "users", "locations"],
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
