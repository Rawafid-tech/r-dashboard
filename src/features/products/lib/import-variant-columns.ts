import type { TFunction } from "i18next";
import type { ImportTemplateColumn } from "@/features/products/types";

export function getImportVariantColumns(
  t: TFunction<"products">,
): ImportTemplateColumn[] {
  return [
    {
      key: "productSku",
      label: t("import.variants.columns.productSku.label"),
      required: true,
      type: "TEXT",
      example: t("import.variants.columns.productSku.example"),
      defaultValue: null,
      allowedValues: [],
      aliases: [
        "productSku",
        "product sku",
        "Product SKU",
        "parent sku",
        "Parent SKU",
        "sku المنتج",
        "رمز المنتج",
        "SKU المنتج",
      ],
    },
    {
      key: "variantName",
      label: t("import.variants.columns.variantName.label"),
      required: true,
      type: "TEXT",
      example: t("import.variants.columns.variantName.example"),
      defaultValue: null,
      allowedValues: [],
      aliases: [
        "variantName",
        "variant name",
        "Variant name",
        "Variant Name",
        "label",
        "Label",
        "اسم المتغير",
        "تسمية المتغير",
        "المتغير",
      ],
    },
    {
      key: "variantPrice",
      label: t("import.variants.columns.variantPrice.label"),
      required: false,
      type: "DECIMAL",
      example: t("import.variants.columns.variantPrice.example"),
      defaultValue: null,
      allowedValues: [],
      aliases: [
        "variantPrice",
        "variant price",
        "Variant price",
        "price",
        "Price",
        "سعر المتغير",
        "السعر",
      ],
    },
  ];
}
