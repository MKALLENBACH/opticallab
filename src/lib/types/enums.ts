// ============================================================
// Enums TypeScript — espelhos dos enums do PostgreSQL
// ============================================================

export enum UserRole {
  PLATFORM_ADMIN = 'platform_admin',
  LAB_ADMIN = 'lab_admin',
  LAB_USER = 'lab_user',
  OPTICAL_ADMIN = 'optical_admin',
  OPTICAL_USER = 'optical_user',
}

export enum EntityStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum LensCategory {
  MONOFOCAL = 'monofocal',
  BIFOCAL = 'bifocal',
  MULTIFOCAL_PROGRESSIVA = 'multifocal_progressiva',
  OCUPACIONAL = 'ocupacional',
  SOLAR_GRAU = 'solar_grau',
  TRATAMENTO_ESPECIAL = 'tratamento_especial',
  OUTRO = 'outro',
}

export enum LensMaterial {
  CR39 = 'cr39',
  POLICARBONATO = 'policarbonato',
  TRIVEX = 'trivex',
  RESINA = 'resina',
  ALTO_INDICE = 'alto_indice',
  MINERAL = 'mineral',
  OUTRO = 'outro',
}

export enum RefractiveIndex {
  R_1_49 = '1.49',
  R_1_56 = '1.56',
  R_1_59 = '1.59',
  R_1_60 = '1.60',
  R_1_67 = '1.67',
  R_1_74 = '1.74',
  OUTRO = 'outro',
}

export enum LensSide {
  RIGHT = 'right',
  LEFT = 'left',
  PAIR = 'pair',
  NOT_APPLICABLE = 'not_applicable',
}

export enum OrderStatus {
  AGUARDANDO_CONFIRMACAO = 'aguardando_confirmacao',
  CONFIRMADO = 'confirmado',
  EM_PRODUCAO = 'em_producao',
  EM_ENTREGA = 'em_entrega',
  FINALIZADO = 'finalizado',
  CANCELADO = 'cancelado',
}

export enum OrderPriority {
  NORMAL = 'normal',
  URGENTE = 'urgente',
}

export enum MovementType {
  ENTRADA = 'entrada',
  SAIDA = 'saida',
  AJUSTE = 'ajuste',
  RESERVA = 'reserva',
  CANCELAMENTO = 'cancelamento',
}

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  STATUS_CHANGE = 'status_change',
  LOGIN = 'login',
  STOCK_MOVEMENT = 'stock_movement',
}
