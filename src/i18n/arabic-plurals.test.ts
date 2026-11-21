import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Arabic needs six plural forms. A key with only `_one`/`_other` renders the raw key for 0, 2, 3–10
 * and 11–99 (e.g. "toast.labelsPreparing" when printing 5 labels). Every plural in ar must be complete.
 */
const AR_DIR = join(__dirname, "locales", "ar");
const FORMS = ["zero", "one", "two", "few", "many", "other"] as const;

function pluralBases(node: Record<string, unknown>, prefix = ""): { key: string; present: Set<string> }[] {
  const groups = new Map<string, Set<string>>();
  const nested: { key: string; present: Set<string> }[] = [];
  for (const [name, value] of Object.entries(node)) {
    if (value && typeof value === "object") {
      nested.push(...pluralBases(value as Record<string, unknown>, `${prefix}${name}.`));
      continue;
    }
    const match = name.match(/^(.*)_(zero|one|two|few|many|other)$/);
    if (!match) continue;
    const forms = groups.get(match[1]!) ?? new Set<string>();
    forms.add(match[2]!);
    groups.set(match[1]!, forms);
  }
  return [...[...groups].map(([base, present]) => ({ key: `${prefix}${base}`, present })), ...nested];
}

describe("Arabic plural keys", () => {
  for (const file of readdirSync(AR_DIR).filter((name) => name.endsWith(".json"))) {
    it(`${file} defines all six forms for every plural`, () => {
      const json = JSON.parse(readFileSync(join(AR_DIR, file), "utf8")) as Record<string, unknown>;
      const incomplete = pluralBases(json)
        .map(({ key, present }) => ({ key, missing: FORMS.filter((form) => !present.has(form)) }))
        .filter(({ missing }) => missing.length > 0);
      expect(incomplete).toEqual([]);
    });
  }
});
