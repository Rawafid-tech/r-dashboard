import { Loader2, Mail, Phone, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Label,
} from "@/shared/components/ui";
import { UserVerifiedBadge } from "@/features/admin/users/components/user-verified-badge";
import { useModerateUser } from "@/features/admin/users/hooks/use-moderate-user";
import type { AdminUser } from "@/features/admin/users/types";

interface UserTrustPanelProps {
  user: AdminUser;
  canModerate: boolean;
}

interface ChannelToggleProps {
  id: string;
  icon: typeof Mail;
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function ChannelToggle({
  id,
  icon: Icon,
  label,
  description,
  checked,
  disabled,
  onCheckedChange,
}: ChannelToggleProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-card/40 p-4">
      <span
        className="grid size-9 shrink-0 place-items-center rounded-lg bg-background text-muted-foreground ring-1 ring-border/60"
        aria-hidden="true"
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        <Label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        aria-describedby={`${id}-description`}
      />
      <span id={`${id}-description`} className="sr-only">
        {description}
      </span>
    </div>
  );
}

export function UserTrustPanel({ user, canModerate }: UserTrustPanelProps) {
  const { t } = useTranslation("admin");
  const moderateMutation = useModerateUser(user.id, user.companyId);
  const isPending = moderateMutation.isPending;

  const handleEmailVerifiedChange = (emailVerified: boolean) => {
    void moderateMutation.mutateAsync({ emailVerified });
  };

  const handlePhoneVerifiedChange = (phoneVerified: boolean) => {
    void moderateMutation.mutateAsync({ phoneVerified });
  };

  return (
    <Card className="border-border/80">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span
              className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15"
              aria-hidden="true"
            >
              <ShieldCheck className="size-4" />
            </span>
            <div>
              <CardTitle>{t("users.detail.trust.title")}</CardTitle>
              <CardDescription>{t("users.detail.trust.subtitle")}</CardDescription>
            </div>
          </div>
          <UserVerifiedBadge verified={user.verified} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canModerate ? (
          <p className="rounded-lg border border-dashed border-border/70 bg-muted/10 p-3 text-sm text-muted-foreground">
            {t("users.detail.readOnlyHint")}
          </p>
        ) : null}

        {isPending ? (
          <div
            className="flex items-center gap-2 text-sm text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            {t("users.detail.trust.saving")}
          </div>
        ) : null}

        <div className="grid gap-3">
          <ChannelToggle
            id={`user-${user.id}-email-verified`}
            icon={Mail}
            label={t("users.detail.trust.emailVerified")}
            description={t("users.detail.trust.emailVerifiedHint")}
            checked={user.emailVerified}
            disabled={!canModerate || isPending}
            onCheckedChange={handleEmailVerifiedChange}
          />
          <ChannelToggle
            id={`user-${user.id}-phone-verified`}
            icon={Phone}
            label={t("users.detail.trust.phoneVerified")}
            description={t("users.detail.trust.phoneVerifiedHint")}
            checked={user.phoneVerified}
            disabled={!canModerate || isPending}
            onCheckedChange={handlePhoneVerifiedChange}
          />
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          {t("users.detail.trust.overallHint")}
        </p>
      </CardContent>
    </Card>
  );
}
