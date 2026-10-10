import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CreateShipmentStepper } from "@/features/shipments/components/create-shipment-stepper";
import type { CreateShipmentWizardStep } from "@/features/shipments/components/create-shipment-stepper";
import { WithMyRatesBookingDialog } from "@/features/shipments/components/with-my-rates-booking-dialog";
import { OrderFormSheet } from "@/features/orders/components/order-form-sheet";
import type { Order } from "@/features/orders/types";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui";

interface CreateShipmentWizardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditOrder?: (orderId: string) => void;
}

export function CreateShipmentWizardDialog({
  open,
  onOpenChange,
  onEditOrder,
}: CreateShipmentWizardDialogProps) {
  const { t } = useTranslation(["shipments", "common"]);
  const [step, setStep] = useState<CreateShipmentWizardStep>(1);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(true);
  const [formStep, setFormStep] = useState<1 | 2>(1);
  const [formInitialStep, setFormInitialStep] = useState<1 | 2 | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!open) {
      setStep(1);
      setOrderId(null);
      setFormOpen(true);
    }
  }, [open]);

  const handleClose = (next: boolean) => {
    if (!next) {
      onOpenChange(false);
    }
  };

  const handleOrderSaved = (order: Order) => {
    setOrderId(order.id);
    setFormOpen(false);
    setStep(3);
  };

  const handlePreviousFromBook = () => {
    setFormInitialStep(2);
    setFormStep(2);
    setStep(2);
    setFormOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        size="w7"
        className="flex max-h-[min(92dvh,960px)] flex-col gap-0 overflow-hidden p-0"
        closeLabel={t("common:common.close")}
      >
        <DialogHeader className="border-b border-border/60 px-6 py-4 pe-12">
          <DialogTitle>{t("wizard.title")}</DialogTitle>
          <DialogDescription>{t("wizard.description")}</DialogDescription>
        </DialogHeader>

        <CreateShipmentStepper step={step === 3 ? 3 : formStep} />

        {step < 3 ? (
          <div className="min-h-0 flex-1 overflow-hidden">
            <OrderFormSheet
              presentation="embedded"
              mode={orderId ? "edit" : "create"}
              orderId={orderId}
              listRow={null}
              open={formOpen && step <= 2}
              onOpenChange={(next) => {
                if (!next) onOpenChange(false);
              }}
              closeOnSave={false}
              onOrderSaved={handleOrderSaved}
              onFormStepChange={setFormStep}
              initialFormStep={formInitialStep}
            />
          </div>
        ) : null}

        {step === 3 && orderId ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex justify-start border-b border-border/60 px-6 py-2">
              <Button type="button" variant="outline" size="sm" onClick={handlePreviousFromBook}>
                {t("common:common.back")}
              </Button>
            </div>
            <WithMyRatesBookingDialog
              embedded
              open
              orderIds={[orderId]}
              onOpenChange={(next) => {
                if (!next) onOpenChange(false);
              }}
              onEditOrder={(id) => {
                onEditOrder?.(id);
                onOpenChange(false);
              }}
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
