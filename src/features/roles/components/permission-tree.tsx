import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/shared/components/ui";
import { PermissionKindBadge } from "@/features/roles/components/permission-kind-badge";
import {
  applyCheck,
  applyUncheck,
  buildPermissionIndex,
  hasCheckedDescendant,
  type PermissionIndex,
} from "@/features/roles/lib/permission-tree";
import type { PermissionNode } from "@/features/roles/types";
import { cn } from "@/shared/lib/utils";
import { useLocaleStore } from "@/stores/locale.store";

interface PermissionTreeProps {
  roots: PermissionNode[];
  selectedIds: string[];
  onChange: (nextIds: string[]) => void;
  disabled?: boolean;
  idPrefix?: string;
  /** When true (e.g. active search), keep matching branches expanded. */
  forceExpandAll?: boolean;
}

interface FlatRow {
  node: PermissionNode;
  depth: number;
  isLastAmongSiblings: boolean;
  ancestorLastFlags: boolean[];
}

function collectExpandableIds(nodes: PermissionNode[], into: Set<string>) {
  for (const node of nodes) {
    if (node.children.length > 0) {
      into.add(node.id);
      collectExpandableIds(node.children, into);
    }
  }
}

function flattenVisibleTree(
  nodes: PermissionNode[],
  expanded: ReadonlySet<string>,
  depth = 0,
  ancestorLastFlags: boolean[] = [],
): FlatRow[] {
  const rows: FlatRow[] = [];

  nodes.forEach((node, index) => {
    const isLastAmongSiblings = index === nodes.length - 1;
    rows.push({
      node,
      depth,
      isLastAmongSiblings,
      ancestorLastFlags,
    });

    if (node.children.length > 0 && expanded.has(node.id)) {
      rows.push(
        ...flattenVisibleTree(node.children, expanded, depth + 1, [
          ...ancestorLastFlags,
          isLastAmongSiblings,
        ]),
      );
    }
  });

  return rows;
}

interface TreeGuidesProps {
  depth: number;
  isLastAmongSiblings: boolean;
  ancestorLastFlags: boolean[];
}

function TreeGuides({
  depth,
  isLastAmongSiblings,
  ancestorLastFlags,
}: TreeGuidesProps) {
  if (depth === 0) return null;

  return (
    <span
      className="pointer-events-none absolute inset-y-0 start-0"
      style={{ width: `calc(${depth} * 1.25rem)` }}
      aria-hidden="true"
    >
      {ancestorLastFlags.map((isAncestorLast, level) =>
        isAncestorLast ? null : (
          <span
            key={level}
            className="absolute top-0 bottom-0 w-px bg-primary/60"
            style={{ insetInlineStart: `calc(${level + 0.55} * 1.25rem)` }}
          />
        ),
      )}

      <span
        className={cn(
          "absolute w-px bg-primary/60",
          isLastAmongSiblings ? "top-0 h-1/2" : "inset-y-0",
        )}
        style={{ insetInlineStart: `calc(${depth - 0.45} * 1.25rem)` }}
      />

      <span
        className="absolute top-1/2 h-px w-3 bg-primary/60"
        style={{ insetInlineStart: `calc(${depth - 0.45} * 1.25rem)` }}
      />
    </span>
  );
}

interface PermissionTreeRowProps {
  row: FlatRow;
  selected: Set<string>;
  index: PermissionIndex;
  expanded: boolean;
  disabled?: boolean;
  idPrefix: string;
  expandLabel: string;
  collapseLabel: string;
  onToggle: (id: string, checked: boolean) => void;
  onToggleExpand: (id: string) => void;
}

function PermissionTreeRow({
  row,
  selected,
  index,
  expanded,
  disabled,
  idPrefix,
  expandLabel,
  collapseLabel,
  onToggle,
  onToggleExpand,
}: PermissionTreeRowProps) {
  const { t } = useTranslation("roles");
  const dir = useLocaleStore((state) => state.dir);
  const { node, depth, isLastAmongSiblings, ancestorLastFlags } = row;
  const hasChildren = node.children.length > 0;
  const checked = selected.has(node.id);
  const lockedByChildren = hasCheckedDescendant(node.id, selected, index);
  const isDisabled = Boolean(disabled) || (checked && lockedByChildren);
  const checkboxId = `${idPrefix}-${node.id}`;
  const ExpandIcon = dir === "rtl" ? ChevronLeft : ChevronRight;

  return (
    <tr
      className={cn(
        "border-b border-border/50 transition-colors last:border-b-0",
        checked ? "bg-primary/5" : "hover:bg-muted/30",
      )}
    >
      <td className="relative min-w-0 py-2 pe-2 ps-2 align-middle">
        <div
          className="relative flex min-w-0 items-center gap-1.5"
          style={{
            paddingInlineStart: `calc(${depth} * 1.25rem + 0.25rem)`,
          }}
        >
          <TreeGuides
            depth={depth}
            isLastAmongSiblings={isLastAmongSiblings}
            ancestorLastFlags={ancestorLastFlags}
          />

          {hasChildren ? (
            <button
              type="button"
              className="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-expanded={expanded}
              aria-label={expanded ? collapseLabel : expandLabel}
              onClick={() => onToggleExpand(node.id)}
            >
              {expanded ? (
                <ChevronDown className="size-3.5" aria-hidden="true" />
              ) : (
                <ExpandIcon className="size-3.5" aria-hidden="true" />
              )}
            </button>
          ) : (
            <span className="size-6 shrink-0" aria-hidden="true" />
          )}

          <label
            htmlFor={checkboxId}
            className={cn(
              "min-w-0 truncate text-sm font-medium leading-snug",
              isDisabled ? "cursor-not-allowed text-muted-foreground" : "cursor-pointer",
            )}
            title={node.label}
          >
            {node.label}
          </label>
        </div>
      </td>

      <td className="w-[7.5rem] px-2 py-2 align-middle">
        <PermissionKindBadge kind={node.kind} />
      </td>

      <td className="w-16 px-2 py-2 text-center align-middle">
        <div className="flex flex-col items-center gap-1">
          <Checkbox
            id={checkboxId}
            checked={checked}
            disabled={isDisabled}
            onCheckedChange={(value) => {
              if (isDisabled) return;
              onToggle(node.id, value === true);
            }}
            aria-label={node.label}
            aria-describedby={
              lockedByChildren ? `${checkboxId}-locked` : undefined
            }
          />
          {lockedByChildren ? (
            <span id={`${checkboxId}-locked`} className="sr-only">
              {t("form.parentLockedHint")}
            </span>
          ) : null}
        </div>
      </td>
    </tr>
  );
}

export function PermissionTree({
  roots,
  selectedIds,
  onChange,
  disabled = false,
  idPrefix = "permission",
  forceExpandAll = false,
}: PermissionTreeProps) {
  const { t } = useTranslation("roles");
  const index = useMemo(() => buildPermissionIndex(roots), [roots]);
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);

  const allExpandableIds = useMemo(() => {
    const ids = new Set<string>();
    collectExpandableIds(roots, ids);
    return ids;
  }, [roots]);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(allExpandableIds),
  );

  useEffect(() => {
    setExpandedIds(new Set(allExpandableIds));
  }, [allExpandableIds]);

  const effectiveExpanded = forceExpandAll ? allExpandableIds : expandedIds;

  const rows = useMemo(
    () => flattenVisibleTree(roots, effectiveExpanded),
    [roots, effectiveExpanded],
  );

  const handleToggle = (id: string, checked: boolean) => {
    const next = checked
      ? applyCheck(selected, id, index)
      : applyUncheck(selected, id, index);
    onChange(Array.from(next));
  };

  const handleToggleExpand = (id: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border/70 bg-background">
      <div className="max-h-56 overflow-auto sm:max-h-64">
        <table className="w-full min-w-[22rem] border-collapse text-start">
          <caption className="sr-only">{t("form.permissionsTableCaption")}</caption>
          <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur-sm">
            <tr className="border-b border-border/70 text-xs font-medium text-muted-foreground">
              <th scope="col" className="px-2 py-2.5 font-medium">
                {t("form.permissionsColumns.name")}
              </th>
              <th scope="col" className="w-[7.5rem] px-2 py-2.5 font-medium">
                {t("form.permissionsColumns.kind")}
              </th>
              <th scope="col" className="w-16 px-2 py-2.5 text-center font-medium">
                {t("form.permissionsColumns.grant")}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <PermissionTreeRow
                key={row.node.id}
                row={row}
                selected={selected}
                index={index}
                expanded={effectiveExpanded.has(row.node.id)}
                disabled={disabled}
                idPrefix={idPrefix}
                expandLabel={t("form.expand")}
                collapseLabel={t("form.collapse")}
                onToggle={handleToggle}
                onToggleExpand={handleToggleExpand}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
