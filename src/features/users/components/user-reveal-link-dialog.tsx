import { useEffect, useRef, useState } from "react";
import { Copy, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui";
import { useRevealUserInviteLink } from "@/features/users/hooks/use-reveal-user-invite-link";
import type { CompanyUser } from "@/features/users/types";

interface UserRevealLinkDialogProps {
  user: CompanyUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "confirm" | "done";

export function UserRevealLinkDialog({
  user,
  open,
  onOpenChange,
}: UserRevealLinkDialogProps) {
  const { t } = useTranslation("users");
  const { t: tCommon } = useTranslation("common");
  const revealMutation = useRevealUserInviteLink();
  const linkRef = useRef<string | null>(null);
  const [step, setStep] = useState<Step>("confirm");
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setStep("confirm");
      setCopyStatus(null);
      linkRef.current = null;
    }
  }, [open]);

  const busy = revealMutation.isPending;

  const handleGenerate = async () => {
    if (!user) return;

    try {
      const { link } = await revealMutation.mutateAsync(user.id);
      linkRef.current = link;
      setStep("done");
    } catch {
      // Toast in hook.
    }
  };

  const handleCopy = async () => {
    const link = linkRef.current;
    if (!link) return;

    try {
      await navigator.clipboard.writeText(link);
      setCopyStatus(t("reveal.copySuccess"));
      toast.success(t("reveal.copySuccess"));
    } catch {
      setCopyStatus(t("reveal.copyFailed"));
      toast.error(t("reveal.copyFailed"));
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (busy) return;
        onOpenChange(next);
      }}
    >
      <DialogContent
        size="w1"
        className="gap-0 overflow-hidden"
        showCloseButton={!busy}
        closeLabel={tCommon("common.close")}
      >
        <DialogHeader className="border-b border-border/60 pe-10">
          <DialogTitle>
            {step === "confirm" ? t("reveal.title") : t("reveal.doneTitle")}
          </DialogTitle>
          <DialogDescription>
            {step === "confirm"
              ? t("reveal.description")
              : t("reveal.doneDescription")}
          </DialogDescription>
        </DialogHeader>

        {step === "done" ? (
          <div className="space-y-3 px-4 py-5 sm:px-5">
            <Button type="button" className="w-full" onClick={() => void handleCopy()}>
              <Copy aria-hidden="true" />
              {t("reveal.copy")}
            </Button>
            {copyStatus ? (
              <p className="text-center text-sm text-muted-foreground" role="status">
                {copyStatus}
              </p>
            ) : null}
          </div>
        ) : null}

        <DialogFooter>
          {step === "confirm" ? (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => onOpenChange(false)}
              >
                {t("reveal.cancel")}
              </Button>
              <Button
                type="button"
                disabled={!user || busy}
                onClick={() => void handleGenerate()}
              >
                {busy ? (
                  <>
                    <Loader2 className="animate-spin" aria-hidden="true" />
                    {t("reveal.working")}
                  </>
                ) : (
                  t("reveal.confirm")
                )}
              </Button>
            </>
          ) : (
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {tCommon("common.close")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
