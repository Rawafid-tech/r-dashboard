import { create } from "zustand";
import { STORAGE_KEYS, DEFAULT_LOCALE } from "@/shared/lib/constants";
import type { SupportedLocale } from "@/shared/lib/constants";
import i18n from "@/i18n/config";

interface LocaleState {
  locale: SupportedLocale;
  dir: "rtl" | "ltr";
  setLocale: (locale: SupportedLocale) => void;
}

function getInitialLocale(): SupportedLocale {
  const stored = localStorage.getItem(STORAGE_KEYS.LOCALE) as SupportedLocale | null;
  if (stored === "ar" || stored === "en") return stored;
  // A customer opening a tracking link (/track/…) gets their browser's language, not the
  // dashboard's Arabic default (docs/2026-11-21-public-tracking-page.md §2).
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/track/")) {
    return navigator.language?.toLowerCase().startsWith("ar") ? "ar" : "en";
  }
  return DEFAULT_LOCALE;
}

function applyLocale(locale: SupportedLocale) {
  const dir = locale === "ar" ? "rtl" : "ltr";
  document.documentElement.setAttribute("lang", locale);
  document.documentElement.setAttribute("dir", dir);
  localStorage.setItem(STORAGE_KEYS.LOCALE, locale);
  void i18n.changeLanguage(locale);
}

const initialLocale = getInitialLocale();
applyLocale(initialLocale);

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: initialLocale,
  dir: initialLocale === "ar" ? "rtl" : "ltr",

  setLocale: (locale) => {
    applyLocale(locale);
    set({ locale, dir: locale === "ar" ? "rtl" : "ltr" });
  },
}));
