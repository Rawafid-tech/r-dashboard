import { Moon, Sun, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui";
import { useThemeStore } from "@/stores/theme.store";
import { useLocaleStore } from "@/stores/locale.store";

export function AuthLocaleThemeControls() {
  const { t } = useTranslation("auth");
  const { theme, toggleTheme } = useThemeStore();
  const { locale, setLocale } = useLocaleStore();

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={toggleTheme}
        aria-label={t("controls.toggleTheme")}
        title={
          theme === "light" ? t("controls.themeDark") : t("controls.themeLight")
        }
      >
        {theme === "light" ? <Moon /> : <Sun />}
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
        aria-label={t("controls.switchLocale")}
      >
        <Languages data-icon="inline-start" />
        {locale === "ar" ? t("controls.localeEn") : t("controls.localeAr")}
      </Button>
    </div>
  );
}
