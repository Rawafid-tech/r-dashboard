import type { UserSettings } from "@/features/account/types";
import { Theme } from "@/shared/types/enums";
import { useThemeStore } from "@/stores/theme.store";

function resolveSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyThemePreference(theme: UserSettings["theme"]) {
  const resolved =
    theme === Theme.SYSTEM
      ? resolveSystemTheme()
      : theme === Theme.DARK
        ? "dark"
        : "light";

  useThemeStore.getState().setTheme(resolved);
}

export function applyFontScalePreference(fontScale: UserSettings["fontScale"]) {
  document.documentElement.style.fontSize = `${fontScale}%`;
}

/** Applies server-stored display preferences to the live UI shell. */
export function applyUserSettings(settings: UserSettings) {
  applyThemePreference(settings.theme);
  applyFontScalePreference(settings.fontScale);
}
