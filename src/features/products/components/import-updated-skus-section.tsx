import { ChevronDown, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

interface ImportUpdatedSkusSectionProps {
  skus: string[];
  className?: string;
}

export function ImportUpdatedSkusSection({
  skus,
  className,
}: ImportUpdatedSkusSectionProps) {
  const { t } = useTranslation("products");

  if (skus.length === 0) {
    return (
      <p className="flex items-start gap-2 text-sm text-foreground">
        <RefreshCw
          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        {t("import.preview.updatedSkusNone")}
      </p>
    );
  }

  return (
    <Collapsible className={cn("group space-y-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <p className="flex items-start gap-2 text-sm font-semibold text-foreground">
          <RefreshCw
            className="mt-0.5 size-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          {t("import.preview.updatedSkusTitle", { count: skus.length })}
        </p>
        <CollapsibleTrigger className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {t("import.preview.updatedSkusShow")}
          <ChevronDown
            className="size-3.5 transition-transform group-data-[state=open]:rotate-180"
            aria-hidden="true"
          />
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <ul className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-border bg-muted/20 p-3">
          {skus.map((sku) => (
            <li
              key={sku}
              dir="ltr"
              className="font-mono text-xs text-foreground"
            >
              {sku}
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}
