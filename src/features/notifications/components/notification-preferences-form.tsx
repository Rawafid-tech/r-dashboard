import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNotificationPreferences } from "@/features/notifications/hooks/use-notification-preferences";
import { useUpdateNotificationPreferences } from "@/features/notifications/hooks/use-update-notification-preferences";
import type {
  NotificationPreferenceTopic,
  NotificationTopic,
} from "@/features/notifications/types";
import {
  Button,
  FieldSet,
  Skeleton,
  Switch,
} from "@/shared/components/ui";

type PreferenceRow = {
  topic: NotificationTopic;
  inApp: boolean;
  email: boolean;
  inAppByDefault: boolean;
  emailByDefault: boolean;
};

function mapTopics(topics: NotificationPreferenceTopic[]): PreferenceRow[] {
  return topics.map((row) => ({
    topic: row.topic,
    inApp: row.inApp,
    email: row.email,
    inAppByDefault: row.inAppByDefault,
    emailByDefault: row.emailByDefault,
  }));
}

export function NotificationPreferencesForm() {
  const { t } = useTranslation("notifications");
  const preferencesQuery = useNotificationPreferences();
  const updateMutation = useUpdateNotificationPreferences();
  const [rows, setRows] = useState<PreferenceRow[]>([]);

  useEffect(() => {
    if (!preferencesQuery.data?.topics.length) return;
    setRows(mapTopics(preferencesQuery.data.topics));
  }, [preferencesQuery.data]);

  const isDirty = useMemo(() => {
    if (!preferencesQuery.data?.topics.length || rows.length === 0) {
      return false;
    }

    return preferencesQuery.data.topics.some((serverRow) => {
      const local = rows.find((row) => row.topic === serverRow.topic);
      if (!local) return true;
      return (
        local.inApp !== serverRow.inApp || local.email !== serverRow.email
      );
    });
  }, [preferencesQuery.data, rows]);

  if (preferencesQuery.isLoading && !preferencesQuery.data) {
    return (
      <div className="space-y-3" aria-busy="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (preferencesQuery.isError) {
    return (
      <div role="alert" className="text-sm text-destructive">
        {t("settings.error")}
      </div>
    );
  }

  function updateRow(
    topic: NotificationTopic,
    patch: Partial<Pick<PreferenceRow, "inApp" | "email">>,
  ) {
    setRows((current) =>
      current.map((row) =>
        row.topic === topic ? { ...row, ...patch } : row,
      ),
    );
  }

  function handleResetDefaults() {
    setRows((current) =>
      current.map((row) => ({
        ...row,
        inApp: row.inAppByDefault,
        email: row.emailByDefault,
      })),
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateMutation.mutate({
      topics: rows.map(({ topic, inApp, email }) => ({
        topic,
        inApp,
        email,
      })),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="hidden gap-4 px-1 text-xs font-medium text-muted-foreground sm:grid sm:grid-cols-[minmax(0,1fr)_5.5rem_5.5rem]">
        <span>{t("settings.columns.topic")}</span>
        <span className="text-center">{t("settings.columns.inApp")}</span>
        <span className="text-center">{t("settings.columns.email")}</span>
      </div>

      <FieldSet className="space-y-2">
        {rows.map((row) => {
          const topicLabel = t(`topics.${row.topic}`);

          return (
            <div
              key={row.topic}
              className="grid gap-3 rounded-xl border border-border bg-muted/15 px-3 py-3 sm:grid-cols-[minmax(0,1fr)_5.5rem_5.5rem] sm:items-center sm:gap-4 sm:px-4"
            >
              <p className="text-sm font-medium text-foreground">{topicLabel}</p>

              <div className="flex items-center justify-between gap-3 sm:justify-center">
                <span className="text-xs text-muted-foreground sm:sr-only">
                  {t("settings.columns.inApp")}
                </span>
                <Switch
                  checked={row.inApp}
                  onCheckedChange={(checked) =>
                    updateRow(row.topic, { inApp: checked })
                  }
                  aria-label={t("settings.inAppLabel", { topic: topicLabel })}
                />
              </div>

              <div className="flex items-center justify-between gap-3 sm:justify-center">
                <span className="text-xs text-muted-foreground sm:sr-only">
                  {t("settings.columns.email")}
                </span>
                <Switch
                  checked={row.email}
                  onCheckedChange={(checked) =>
                    updateRow(row.topic, { email: checked })
                  }
                  aria-label={t("settings.emailLabel", { topic: topicLabel })}
                />
              </div>
            </div>
          );
        })}
      </FieldSet>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={updateMutation.isPending || rows.length === 0}
          onClick={handleResetDefaults}
        >
          {t("settings.resetDefaults")}
        </Button>
        <Button
          type="submit"
          disabled={!isDirty || updateMutation.isPending || rows.length === 0}
        >
          {updateMutation.isPending ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : null}
          {t("settings.save")}
        </Button>
      </div>
    </form>
  );
}
