// ============================================================
// Constants — Status labels and colors
// ============================================================

import { EntityStatus, OrderStatus, OrderPriority } from '@/lib/types/enums';

export const ENTITY_STATUS_LABELS: Record<EntityStatus, string> = {
  [EntityStatus.ACTIVE]: 'Ativo',
  [EntityStatus.INACTIVE]: 'Inativo',
  [EntityStatus.SUSPENDED]: 'Suspenso',
};

export const ENTITY_STATUS_COLORS: Record<EntityStatus, string> = {
  [EntityStatus.ACTIVE]: 'var(--color-success)',
  [EntityStatus.INACTIVE]: 'var(--color-text-muted)',
  [EntityStatus.SUSPENDED]: 'var(--color-warning)',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.AGUARDANDO_CONFIRMACAO]: 'Aguardando Confirmação',
  [OrderStatus.CONFIRMADO]: 'Confirmado',
  [OrderStatus.EM_PRODUCAO]: 'Em Produção',
  [OrderStatus.EM_ENTREGA]: 'Em Entrega',
  [OrderStatus.FINALIZADO]: 'Finalizado',
  [OrderStatus.CANCELADO]: 'Cancelado',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.AGUARDANDO_CONFIRMACAO]: 'var(--color-warning)',
  [OrderStatus.CONFIRMADO]: 'var(--color-info)',
  [OrderStatus.EM_PRODUCAO]: '#A855F7',
  [OrderStatus.EM_ENTREGA]: 'var(--color-accent)',
  [OrderStatus.FINALIZADO]: 'var(--color-success)',
  [OrderStatus.CANCELADO]: 'var(--color-error)',
};

export const ORDER_PRIORITY_LABELS: Record<OrderPriority, string> = {
  [OrderPriority.NORMAL]: 'Normal',
  [OrderPriority.URGENTE]: 'Urgente',
};

export const ORDER_PRIORITY_COLORS: Record<OrderPriority, string> = {
  [OrderPriority.NORMAL]: 'var(--color-text-muted)',
  [OrderPriority.URGENTE]: 'var(--color-urgent)',
};
