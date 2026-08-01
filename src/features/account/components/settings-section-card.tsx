import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

interface SettingsSectionCardProps {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export function SettingsSectionCard({
  id,
  icon: Icon,
  title,
  description,
  children,
  className,
}: SettingsSectionCardProps) {
  return (
    <Card
      id={id}
      className={cn("scroll-mt-[4.75rem] lg:scroll-mt-20", className)}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
    >
      <CardHeader className="gap-2 border-b border-border pb-4">
        <div className="flex items-start gap-3">
          <div
            className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary"
            aria-hidden="true"
          >
            <Icon className="size-4" />
          </div>
          <div className="min-w-0 space-y-1">
            <CardTitle id={`${id}-title`} className="text-base">
              {title}
            </CardTitle>
            <CardDescription id={`${id}-description`} className="text-sm leading-relaxed">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">{children}</CardContent>
    </Card>
  );
}
