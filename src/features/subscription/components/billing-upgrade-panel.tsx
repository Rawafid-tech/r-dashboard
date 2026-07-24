import { ArrowUpRight, Info, Mail, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui";
import { SUPPORT_EMAIL } from "@/shared/lib/constants";
import { cn } from "@/shared/lib/utils";

interface BillingUpgradePanelProps {
  isFreePlan?: boolean;
  className?: string;
}

export function BillingUpgradePanel({
  isFreePlan = false,
  className,
}: BillingUpgradePanelProps) {
  const { t } = useTranslation("billing");

  const mailSubject = encodeURIComponent(t("upgrade.mailSubject"));
  const mailBody = encodeURIComponent(t("upgrade.mailBody"));
  const mailtoHref = `mailto:${SUPPORT_EMAIL}?subject=${mailSubject}&body=${mailBody}`;

  return (
    <Card
      className={cn(
        "border-border/80 shadow-sm",
        isFreePlan && "border-primary/20 bg-primary/[0.03]",
        className,
      )}
    >
      <CardHeader className="gap-3">
        <div className="flex items-start gap-3">
          <div
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15"
            aria-hidden="true"
          >
            <Sparkles className="size-5" />
          </div>
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg">
              {isFreePlan ? t("upgrade.freeTitle") : t("upgrade.title")}
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              {isFreePlan ? t("upgrade.freeDescription") : t("upgrade.description")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2 text-sm text-muted-foreground" role="list">
          {(t("upgrade.benefits", { returnObjects: true }) as string[]).map(
            (benefit) => (
              <li key={benefit} className="flex items-start gap-2">
                <span
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                  aria-hidden="true"
                />
                {benefit}
              </li>
            ),
          )}
        </ul>

        <Button type="button" fullWidth asChild>
          <a href={mailtoHref}>
            <Mail aria-hidden="true" />
            {t("upgrade.contactCta")}
            <ArrowUpRight className="size-4 opacity-70" aria-hidden="true" />
          </a>
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          {t("upgrade.supportEmail", { email: SUPPORT_EMAIL })}
        </p>
      </CardContent>
    </Card>
  );
}

interface BillingSnapshotNoticeProps {
  className?: string;
}

export function BillingSnapshotNotice({ className }: BillingSnapshotNoticeProps) {
  const { t } = useTranslation("billing");

  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border border-border/60 bg-muted/30 p-4 sm:p-5",
        className,
      )}
      role="note"
    >
      <Info
        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-medium">{t("notice.title")}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t("notice.description")}
        </p>
      </div>
    </div>
  );
}
