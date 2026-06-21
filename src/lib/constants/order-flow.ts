// ============================================================
// Constants — Order flow transitions
// ============================================================

import { OrderStatus } from '@/lib/types/enums';

/**
 * Mapa de transições de status válidas para cada status atual.
 * Cancelamento é tratado separadamente (apenas lab pode cancelar).
 */
export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.AGUARDANDO_CONFIRMACAO]: [OrderStatus.CONFIRMADO, OrderStatus.CANCELADO],
  [OrderStatus.CONFIRMADO]: [OrderStatus.EM_PRODUCAO, OrderStatus.EM_ENTREGA, OrderStatus.CANCELADO],
  [OrderStatus.EM_PRODUCAO]: [OrderStatus.EM_ENTREGA, OrderStatus.CANCELADO],
  [OrderStatus.EM_ENTREGA]: [OrderStatus.FINALIZADO, OrderStatus.CANCELADO],
  [OrderStatus.FINALIZADO]: [],
  [OrderStatus.CANCELADO]: [],
};

/**
 * Verifica se a transição de status é válida.
 * @param from - Status atual
 * @param to - Novo status desejado
 * @param isLab - Se quem está alterando é um usuário do laboratório
 */
export function canTransitionStatus(
  from: OrderStatus,
  to: OrderStatus,
  isLab: boolean
): boolean {
  // Cancelamento permitido apenas pelo laboratório
  if (to === OrderStatus.CANCELADO) {
    return isLab;
  }

  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Retorna a lista de próximos status possíveis para um pedido,
 * dado o status atual e quem está operando.
 */
export function getAvailableTransitions(
  currentStatus: OrderStatus,
  isLab: boolean
): OrderStatus[] {
  const transitions = VALID_TRANSITIONS[currentStatus] ?? [];

  if (!isLab) {
    // Ótica não pode cancelar nem avançar status
    return [];
  }

  return transitions;
}

/**
 * Verifica se a ótica pode editar o pedido.
 * Apenas em aguardando_confirmacao.
 */
export function canOpticalEditOrder(status: OrderStatus): boolean {
  return status === OrderStatus.AGUARDANDO_CONFIRMACAO;
}
