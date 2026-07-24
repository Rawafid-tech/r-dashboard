import { Building2, RefreshCw, Shield, SlidersHorizontal, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui";
import { MerchantRole } from "@/shared/types/enums";
import { SettingsHero } from "@/features/account/components/settings-hero";
import { SettingsNav } from "@/features/account/components/settings-nav";
import { SettingsPageSkeleton } from "@/features/account/components/settings-page-skeleton";
import { SettingsSectionCard } from "@/features/account/components/settings-section-card";
import { ProfileSettingsForm } from "@/features/account/components/profile-settings-form";
import { PasswordSettingsForm } from "@/features/account/components/password-settings-form";
import { PreferencesSettingsForm } from "@/features/account/components/preferences-settings-form";
import { CompanySettingsForm } from "@/features/company/components/company-settings-form";
import { useMe } from "@/features/account/hooks/use-me";
import { useSettings } from "@/features/account/hooks/use-settings";
import { useCompany } from "@/features/company/hooks/use-company";

export function SettingsHome() {
  const { t } = useTranslation("settings");
  const meQuery = useMe();
  const companyQuery = useCompany();
  const settingsQuery = useSettings();

  const isLoading =
    meQuery.isLoading || companyQuery.isLoading || settingsQuery.isLoading;

  const isError =
    meQuery.isError || companyQuery.isError || settingsQuery.isError;

  const refetchAll = () =>
    Promise.all([
      meQuery.refetch(),
      companyQuery.refetch(),
      settingsQuery.refetch(),
    ]);

  if (isLoading && !isError) {
    return <SettingsPageSkeleton />;
  }

  const canEditCompany = meQuery.data?.role === MerchantRole.OWNER;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <a
        href="#settings-main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {t("skipToContent")}
      </a>

      <SettingsHero />

      {isError ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 sm:p-5"
        >
          <p className="font-medium text-destructive">{t("errors.loadFailed")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("errors.loadFailedHint")}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            disabled={isLoading}
            onClick={() => void refetchAll()}
          >
            <RefreshCw
              className={isLoading ? "animate-spin" : undefined}
              aria-hidden="true"
            />
            {t("errors.retry")}
          </Button>
        </div>
      ) : null}

      <div
        id="settings-main"
        className="grid gap-6 lg:grid-cols-[minmax(12rem,14rem)_minmax(0,1fr)] lg:items-start"
      >
        <aside className="sticky top-[calc(3.5rem+0.75rem)] z-10 self-start lg:top-[calc(3.5rem+1rem)]">
          <SettingsNav showCompany />
        </aside>

        <div className="space-y-6">
          <SettingsSectionCard
            id="settings-profile"
            icon={UserRound}
            title={t("sections.profile.title")}
            description={t("sections.profile.description")}
          >
            <ProfileSettingsForm user={meQuery.data} />
          </SettingsSectionCard>

          <SettingsSectionCard
            id="settings-company"
            icon={Building2}
            title={t("sections.company.title")}
            description={t("sections.company.description")}
          >
            <CompanySettingsForm
              company={companyQuery.data}
              canEdit={canEditCompany}
            />
          </SettingsSectionCard>

          <SettingsSectionCard
            id="settings-security"
            icon={Shield}
            title={t("sections.security.title")}
            description={t("sections.security.description")}
          >
            <PasswordSettingsForm />
          </SettingsSectionCard>

          <SettingsSectionCard
            id="settings-preferences"
            icon={SlidersHorizontal}
            title={t("sections.preferences.title")}
            description={t("sections.preferences.description")}
          >
            <PreferencesSettingsForm settings={settingsQuery.data} />
          </SettingsSectionCard>
        </div>
      </div>
    </div>
  );
}
