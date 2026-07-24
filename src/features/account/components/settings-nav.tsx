import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  Shield,
  SlidersHorizontal,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/shared/lib/utils";

export const SETTINGS_SECTIONS = [
  "profile",
  "company",
  "security",
  "preferences",
] as const;

export type SettingsSection = (typeof SETTINGS_SECTIONS)[number];

const SECTION_ICONS: Record<SettingsSection, LucideIcon> = {
  profile: UserRound,
  company: Building2,
  security: Shield,
  preferences: SlidersHorizontal,
};

/** Header (3.5rem) + breathing room for sticky section nav. */
const STICKY_OFFSET_PX = 72;
const CLICK_LOCK_MS = 700;

interface SettingsNavProps {
  showCompany: boolean;
  className?: string;
}

function resolveActiveSection(
  sections: SettingsSection[],
  offset = STICKY_OFFSET_PX,
): SettingsSection {
  let active = sections[0] ?? "profile";

  for (const section of sections) {
    const element = document.getElementById(`settings-${section}`);
    if (!element) continue;

    if (element.getBoundingClientRect().top <= offset) {
      active = section;
    }
  }

  return active;
}

export function SettingsNav({ showCompany, className }: SettingsNavProps) {
  const { t } = useTranslation("settings");
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");
  const clickLockUntilRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const visibleSections = useMemo(
    () =>
      SETTINGS_SECTIONS.filter(
        (section) => section !== "company" || showCompany,
      ),
    [showCompany],
  );

  const syncActiveSection = useCallback(() => {
    if (Date.now() < clickLockUntilRef.current) return;
    setActiveSection(resolveActiveSection(visibleSections));
  }, [visibleSections]);

  useEffect(() => {
    syncActiveSection();

    function onScroll() {
      if (rafRef.current != null) return;

      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        syncActiveSection();
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);

      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [syncActiveSection]);

  function scrollToSection(section: SettingsSection) {
    const target = document.getElementById(`settings-${section}`);
    if (!target) return;

    clickLockUntilRef.current = Date.now() + CLICK_LOCK_MS;
    setActiveSection(section);

    const top =
      target.getBoundingClientRect().top +
      window.scrollY -
      STICKY_OFFSET_PX;

    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  const navButtonClassName = (isActive: boolean) =>
    cn(
      "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-start text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
      isActive
        ? "bg-primary/10 text-primary ring-1 ring-primary/15"
        : "text-muted-foreground hover:bg-muted hover:text-foreground",
    );

  const tabButtonClassName = (isActive: boolean) =>
    cn(
      "inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
      isActive
        ? "bg-primary text-primary-foreground shadow-sm"
        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
    );

  return (
    <nav className={cn("space-y-2", className)} aria-label={t("nav.label")}>
      <div className="hidden lg:block">
        <ul className="space-y-1">
          {visibleSections.map((section) => {
            const Icon = SECTION_ICONS[section];
            const isActive = activeSection === section;

            return (
              <li key={section}>
                <button
                  type="button"
                  onClick={() => scrollToSection(section)}
                  aria-current={isActive ? "true" : undefined}
                  className={navButtonClassName(isActive)}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  {t(`nav.${section}`)}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="sticky top-14 z-20 -mx-1 bg-background/95 pb-1 backdrop-blur-sm lg:hidden">
        <div
          role="tablist"
          aria-label={t("nav.label")}
          className="flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {visibleSections.map((section) => {
            const Icon = SECTION_ICONS[section];
            const isActive = activeSection === section;

            return (
              <button
                key={section}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`settings-${section}`}
                onClick={() => scrollToSection(section)}
                className={tabButtonClassName(isActive)}
              >
                <Icon className="size-4" aria-hidden="true" />
                {t(`nav.${section}`)}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
