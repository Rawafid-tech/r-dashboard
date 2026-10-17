import {
  AlertTriangle,
  ArrowLeftRight,
  Ban,
  CheckCircle2,
  Package,
  PackageCheck,
  PackageX,
  RotateCcw,
  Truck,
  type LucideIcon,
} from "lucide-react";
import type { NotificationTopic } from "@/features/notifications/types";

export interface NotificationTopicMeta {
  icon: LucideIcon;
  toneClassName: string;
}

const TOPIC_META: Record<NotificationTopic, NotificationTopicMeta> = {
  SHIPMENT_PICKED_UP: {
    icon: Truck,
    toneClassName: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  },
  SHIPMENT_DELIVERED: {
    icon: PackageCheck,
    toneClassName: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  SHIPMENT_RETURNED: {
    icon: RotateCcw,
    toneClassName: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  },
  SHIPMENT_RETURNING: {
    icon: Package,
    toneClassName: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  SHIPMENT_ISSUE: {
    icon: AlertTriangle,
    toneClassName: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  SHIPMENT_LOST: {
    icon: PackageX,
    toneClassName: "bg-destructive/10 text-destructive",
  },
  SHIPMENT_CANCELLED_BY_CARRIER: {
    icon: Ban,
    toneClassName: "bg-destructive/10 text-destructive",
  },
  SHIPMENT_BOOKING_FAILED: {
    icon: AlertTriangle,
    toneClassName: "bg-destructive/10 text-destructive",
  },
  SHIPMENT_RETURN_PICKED_UP: {
    icon: Truck,
    toneClassName: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  },
  SHIPMENT_RETURN_RECEIVED: {
    icon: RotateCcw,
    toneClassName: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  },
  SHIPMENT_RETURN_FAILED: {
    icon: PackageX,
    toneClassName: "bg-destructive/10 text-destructive",
  },
  SHIPMENT_EXCHANGE_SWAPPED: {
    icon: ArrowLeftRight,
    toneClassName: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  },
  SHIPMENT_EXCHANGE_COMPLETED: {
    icon: PackageCheck,
    toneClassName: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  SHIPMENT_EXCHANGE_FAILED: {
    icon: PackageX,
    toneClassName: "bg-destructive/10 text-destructive",
  },
};

export function getNotificationTopicMeta(
  topic: NotificationTopic,
): NotificationTopicMeta {
  return TOPIC_META[topic] ?? {
    icon: CheckCircle2,
    toneClassName: "bg-muted text-muted-foreground",
  };
}
