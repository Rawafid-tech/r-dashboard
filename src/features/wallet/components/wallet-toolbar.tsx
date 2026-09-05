import { ArrowUpDown, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  WALLET_TRANSACTION_TYPE_FILTERS,
  type WalletSortOption,
} from "@/features/wallet/lib/wallet-list-params";
import { getWalletTransactionTypeLabel } from "@/features/wallet/lib/wallet-transaction-label";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui";

const SORT_OPTIONS: WalletSortOption[] = [
  "CREATED_AT_DESC",
  "CREATED_AT_ASC",
  "AMOUNT_DESC",
  "AMOUNT_ASC",
];

const SORT_LABEL_KEYS: Record<WalletSortOption, string> = {
  CREATED_AT_DESC: "toolbar.sort.createdDesc",
  CREATED_AT_ASC: "toolbar.sort.createdAsc",
  AMOUNT_DESC: "toolbar.sort.amountDesc",
  AMOUNT_ASC: "toolbar.sort.amountAsc",
};

interface WalletToolbarProps {
  sortOption: WalletSortOption;
  typeFilter: string;
  onSortChange: (value: WalletSortOption) => void;
  onTypeFilterChange: (value: string) => void;
  disabled?: boolean;
}

export function WalletToolbar({
  sortOption,
  typeFilter,
  onSortChange,
  onTypeFilterChange,
  disabled = false,
}: WalletToolbarProps) {
  const { t } = useTranslation("wallet");
  const selectedSortLabel = t(SORT_LABEL_KEYS[sortOption]);

  return (
    <section
      aria-label={t("toolbar.title")}
      className="rounded-xl border border-border/70 bg-card p-3 shadow-sm"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <Label htmlFor="wallet-type-filter" className="sr-only">
            {t("toolbar.typeLabel")}
          </Label>
          <Select
            value={typeFilter || "all"}
            onValueChange={(value) =>
              onTypeFilterChange(value === "all" ? "" : value)
            }
            disabled={disabled}
          >
            <SelectTrigger id="wallet-type-filter" className="w-full sm:w-56">
              <SelectValue placeholder={t("toolbar.typeAll")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("toolbar.typeAll")}</SelectItem>
              {WALLET_TRANSACTION_TYPE_FILTERS.map((type) => (
                <SelectItem key={type} value={type}>
                  {getWalletTransactionTypeLabel(type, "CREDIT", t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                className="gap-2"
              >
                <ArrowUpDown className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">{t("toolbar.sortLabel")}</span>
                <span className="max-w-[10rem] truncate sm:max-w-none">
                  {selectedSortLabel}
                </span>
                <ChevronDown className="size-4 opacity-60" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{t("toolbar.sortLabel")}</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={sortOption}
                onValueChange={(value) =>
                  onSortChange(value as WalletSortOption)
                }
              >
                {SORT_OPTIONS.map((option) => (
                  <DropdownMenuRadioItem key={option} value={option}>
                    {t(SORT_LABEL_KEYS[option])}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </section>
  );
}
