import { getProducts } from "@/features/products/api/products.api";
import type { Product } from "@/features/products/types";

const SKU_LOOKUP_CONCURRENCY = 5;

async function lookupProductBySku(sku: string): Promise<Product | null> {
  const response = await getProducts({ search: sku, size: 20 });
  const normalized = sku.trim();
  return (
    response.content.find((product) => product.sku.trim() === normalized) ??
    null
  );
}

export async function resolveProductIdsBySkus(
  skus: string[],
): Promise<Map<string, Product>> {
  const unique = [...new Set(skus.map((sku) => sku.trim()).filter(Boolean))];
  const resolved = new Map<string, Product>();

  for (let index = 0; index < unique.length; index += SKU_LOOKUP_CONCURRENCY) {
    const batch = unique.slice(index, index + SKU_LOOKUP_CONCURRENCY);
    const results = await Promise.all(
      batch.map(async (sku) => ({
        sku,
        product: await lookupProductBySku(sku),
      })),
    );

    results.forEach(({ sku, product }) => {
      if (product) {
        resolved.set(sku, product);
      }
    });
  }

  return resolved;
}

export async function findMissingVariantSkus(
  skus: string[],
  productSkusInBatch: Set<string>,
): Promise<string[]> {
  const pending = [...new Set(skus.map((sku) => sku.trim()).filter(Boolean))].filter(
    (sku) => !productSkusInBatch.has(sku),
  );

  if (pending.length === 0) return [];

  const resolved = await resolveProductIdsBySkus(pending);
  return pending.filter((sku) => !resolved.has(sku));
}
