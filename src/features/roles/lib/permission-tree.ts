import type { PermissionNode } from "@/features/roles/types";

export interface PermissionIndex {
  byId: Map<string, PermissionNode>;
  parentById: Map<string, string | null>;
  childrenById: Map<string, string[]>;
  descendantIds: Map<string, Set<string>>;
}

export function buildPermissionIndex(roots: PermissionNode[]): PermissionIndex {
  const byId = new Map<string, PermissionNode>();
  const parentById = new Map<string, string | null>();
  const childrenById = new Map<string, string[]>();
  const descendantIds = new Map<string, Set<string>>();

  function walk(node: PermissionNode, parentId: string | null) {
    byId.set(node.id, node);
    parentById.set(node.id, parentId);
    const childIds = node.children.map((child) => child.id);
    childrenById.set(node.id, childIds);

    const descendants = new Set<string>();
    for (const child of node.children) {
      walk(child, node.id);
      descendants.add(child.id);
      const childDescendants = descendantIds.get(child.id);
      if (childDescendants) {
        for (const id of childDescendants) descendants.add(id);
      }
    }
    descendantIds.set(node.id, descendants);
  }

  for (const root of roots) {
    walk(root, null);
  }

  return { byId, parentById, childrenById, descendantIds };
}

export function applyCheck(
  selected: ReadonlySet<string>,
  id: string,
  index: PermissionIndex,
): Set<string> {
  const next = new Set(selected);
  next.add(id);

  let parentId = index.parentById.get(id) ?? null;
  while (parentId) {
    next.add(parentId);
    parentId = index.parentById.get(parentId) ?? null;
  }

  return next;
}

export function applyUncheck(
  selected: ReadonlySet<string>,
  id: string,
  index: PermissionIndex,
): Set<string> {
  const next = new Set(selected);
  next.delete(id);

  const descendants = index.descendantIds.get(id);
  if (descendants) {
    for (const descendantId of descendants) {
      next.delete(descendantId);
    }
  }

  return next;
}

export function hasCheckedDescendant(
  id: string,
  selected: ReadonlySet<string>,
  index: PermissionIndex,
): boolean {
  const descendants = index.descendantIds.get(id);
  if (!descendants || descendants.size === 0) return false;
  for (const descendantId of descendants) {
    if (selected.has(descendantId)) return true;
  }
  return false;
}

/** Keep matching nodes and their ancestors so hierarchy stays readable. */
export function filterPermissionTree(
  roots: PermissionNode[],
  query: string,
): PermissionNode[] {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return roots;

  function filterNode(node: PermissionNode): PermissionNode | null {
    const selfMatch =
      node.label.toLocaleLowerCase().includes(normalized) ||
      node.code.toLocaleLowerCase().includes(normalized);

    const filteredChildren = node.children
      .map(filterNode)
      .filter((child): child is PermissionNode => child !== null);

    if (selfMatch || filteredChildren.length > 0) {
      return {
        ...node,
        children: selfMatch ? node.children : filteredChildren,
      };
    }

    return null;
  }

  return roots
    .map(filterNode)
    .filter((node): node is PermissionNode => node !== null);
}
