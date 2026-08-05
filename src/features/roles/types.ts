export type PermissionKind = "PAGE" | "ACTION";

export interface PermissionNode {
  id: string;
  code: string;
  kind: PermissionKind;
  label: string;
  children: PermissionNode[];
}

export interface RoleListItem {
  id: string;
  name: string;
  description: string | null;
  userCount: number;
  permissionCount: number;
  createdAt: string;
}

export interface RoleDetail {
  id: string;
  name: string;
  description: string | null;
  permissionIds: string[];
  permissionCodes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RoleUpsertPayload {
  name: string;
  description: string | null;
  permissionIds: string[];
}

export type RolesSortField = "CREATED_AT" | "NAME";

export interface RolesListParams {
  page?: number;
  size?: number;
  sort?: RolesSortField;
  direction?: "ASC" | "DESC";
  search?: string;
}
