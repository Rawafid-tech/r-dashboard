import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui";
import { useResendUserInvite } from "@/features/users/hooks/use-resend-user-invite";

const RESEND_COOLDOWN_MS = 60_000;

interface UserResendInviteButtonProps {
  userId: string;
  disabled?: boolean;
  cooldownUntil?: number;
  onCooldownStart: (userId: string, until: number) => void;
}

export function UserResendInviteButton({
  userId,
  disabled,
  cooldownUntil = 0,
  onCooldownStart,
}: UserResendInviteButtonProps) {
  const { t } = useTranslation("users");
  const resendMutation = useResendUserInvite();
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!cooldownUntil) {
      setSecondsLeft(0);
      return;
    }

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
      setSecondsLeft(remaining);
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [cooldownUntil]);

  const onCooldown = secondsLeft > 0;
  const busy = resendMutation.isPending;

  const handleClick = async () => {
    try {
      await resendMutation.mutateAsync(userId);
      onCooldownStart(userId, Date.now() + RESEND_COOLDOWN_MS);
    } catch {
      // Toast handled in mutation.
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled || busy || onCooldown}
      onClick={() => void handleClick()}
      aria-describedby={`resend-hint-${userId}`}
    >
      {busy ? (
        <>
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          <span className="sr-only">{t("invite.submitting")}</span>
        </>
      ) : onCooldown ? (
        t("table.resendCooldown", { seconds: secondsLeft })
      ) : (
        t("table.resendInvite")
      )}
    </Button>
  );
}
