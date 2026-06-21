// ============================================================
// Constants — Roles
// ============================================================

import { UserRole } from '@/lib/types/enums';

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.PLATFORM_ADMIN]: 'Super Admin',
  [UserRole.LAB_ADMIN]: 'Admin do Laboratório',
  [UserRole.LAB_USER]: 'Usuário do Laboratório',
  [UserRole.OPTICAL_ADMIN]: 'Admin da Ótica',
  [UserRole.OPTICAL_USER]: 'Usuário da Ótica',
};

/** Roles que pertencem a laboratórios */
export const LAB_ROLES = [UserRole.LAB_ADMIN, UserRole.LAB_USER] as const;

/** Roles que pertencem a óticas */
export const OPTICAL_ROLES = [UserRole.OPTICAL_ADMIN, UserRole.OPTICAL_USER] as const;

/** Roles que um platform_admin pode criar */
export const PLATFORM_ADMIN_CAN_CREATE: UserRole[] = [UserRole.LAB_ADMIN];

/** Roles que um lab_admin pode criar */
export const LAB_ADMIN_CAN_CREATE: UserRole[] = [
  UserRole.LAB_USER,
  UserRole.OPTICAL_ADMIN,
  UserRole.OPTICAL_USER,
];

/** Mapeamento de role → redirect path após login */
export const ROLE_HOME_PATH: Record<UserRole, string> = {
  [UserRole.PLATFORM_ADMIN]: '/admin/dashboard',
  [UserRole.LAB_ADMIN]: '/lab/dashboard',
  [UserRole.LAB_USER]: '/lab/dashboard',
  [UserRole.OPTICAL_ADMIN]: '/store/dashboard',
  [UserRole.OPTICAL_USER]: '/store/dashboard',
};

/** Roles permitidas por seção de rota */
export const ROUTE_ROLES: Record<string, UserRole[]> = {
  '/admin': [UserRole.PLATFORM_ADMIN],
  '/lab': [UserRole.LAB_ADMIN, UserRole.LAB_USER],
  '/store': [UserRole.OPTICAL_ADMIN, UserRole.OPTICAL_USER],
};

export function isLabRole(role: UserRole): boolean {
  return (LAB_ROLES as readonly UserRole[]).includes(role);
}

export function isOpticalRole(role: UserRole): boolean {
  return (OPTICAL_ROLES as readonly UserRole[]).includes(role);
}

export function isPlatformAdmin(role: UserRole): boolean {
  return role === UserRole.PLATFORM_ADMIN;
}
