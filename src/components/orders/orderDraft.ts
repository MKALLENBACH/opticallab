import { OrderPriority } from '@/lib/types/enums';

export const ORDER_DRAFT_STORAGE_KEY = 'lentelink-order-draft-v1';

export interface OrderDraftVariant {
  id: string;
  lens_type_id: string;
  sku: string;
  name: string;
  brand: string | null;
  category: string | null;
  material: string | null;
  refractive_index: string | null;
  treatments: string[];
  allow_order_when_out_of_stock: boolean | null;
  sphere_esf: number | null;
  cylinder_cil: number | null;
  axis: number | null;
  addition_add: number | null;
  quantity_available: number;
  minimum_stock: number | null;
  delivery_time_in_stock_days: number | null;
  production_time_out_of_stock_days: number | null;
  default_delivery_time_in_stock_days: number | null;
  default_production_time_out_of_stock_days: number | null;
}

export interface OrderDraftItem {
  variant: OrderDraftVariant;
  quantity: number;
  item_notes: string;
}

export interface StoredOrderDraft {
  notes: string;
  priority: OrderPriority;
  desired_delivery_date: string;
  items: OrderDraftItem[];
}

export function normalizeSearchQuery(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function searchTerms(value: string) {
  return normalizeSearchQuery(value)
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean)
    .slice(0, 8);
}

export function formatPower(value: number | null, prefix: string): string {
  if (value === null) return '';
  return `${prefix} ${value > 0 ? '+' : ''}${Number(value).toFixed(2)}`;
}

function nullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

export function formatGrade(item: Pick<OrderDraftVariant, 'sphere_esf' | 'cylinder_cil' | 'axis' | 'addition_add'>) {
  return [
    formatPower(item.sphere_esf, 'ESF'),
    item.cylinder_cil !== null && item.cylinder_cil !== 0 ? formatPower(item.cylinder_cil, 'CIL') : '',
    item.axis !== null ? `Eixo ${item.axis}` : '',
    item.addition_add !== null ? formatPower(item.addition_add, 'ADD') : '',
  ].filter(Boolean).join(' / ') || 'Plano';
}

export function availabilityFor(variant: OrderDraftVariant) {
  const canOrderWithoutStock = variant.allow_order_when_out_of_stock ?? true;

  if (variant.quantity_available > 0) {
    return {
      state: 'available' as const,
      label: 'Disponivel',
      description: `${variant.quantity_available} un em estoque`,
      canOrder: true,
      leadTime: variant.delivery_time_in_stock_days ?? variant.default_delivery_time_in_stock_days,
    };
  }

  if (canOrderWithoutStock) {
    return {
      state: 'backorder' as const,
      label: 'Sem pronta entrega',
      description: 'Depende de producao e confirmacao do laboratorio.',
      canOrder: true,
      leadTime: variant.production_time_out_of_stock_days ?? variant.default_production_time_out_of_stock_days,
    };
  }

  return {
    state: 'unavailable' as const,
    label: 'Indisponivel',
    description: 'Esta lente esta indisponivel para pedido no momento.',
    canOrder: false,
    leadTime: null,
  };
}

export function variantFromRow(row: Record<string, unknown>): OrderDraftVariant {
  const rawLensType = row.lens_type;
  const lensType = Array.isArray(rawLensType) ? rawLensType[0] : rawLensType;
  const typedLensType = (lensType || {}) as Record<string, unknown>;

  return {
    id: String(row.id),
    lens_type_id: String(row.lens_type_id || typedLensType.id || ''),
    sku: String(row.sku || ''),
    name: String(typedLensType.name || 'Lente sem nome'),
    brand: (typedLensType.brand as string | null) ?? null,
    category: (typedLensType.category as string | null) ?? null,
    material: (typedLensType.material as string | null) ?? null,
    refractive_index: (typedLensType.refractive_index as string | null) ?? null,
    treatments: Array.isArray(typedLensType.treatments) ? typedLensType.treatments.map(String) : [],
    allow_order_when_out_of_stock: (typedLensType.allow_order_when_out_of_stock as boolean | null) ?? null,
    sphere_esf: nullableNumber(row.sphere_esf),
    cylinder_cil: nullableNumber(row.cylinder_cil),
    axis: nullableNumber(row.axis),
    addition_add: nullableNumber(row.addition_add),
    quantity_available: Number(row.quantity_available ?? 0),
    minimum_stock: nullableNumber(row.minimum_stock),
    delivery_time_in_stock_days: nullableNumber(row.delivery_time_in_stock_days),
    production_time_out_of_stock_days: nullableNumber(row.production_time_out_of_stock_days),
    default_delivery_time_in_stock_days: nullableNumber(typedLensType.default_delivery_time_in_stock_days),
    default_production_time_out_of_stock_days: nullableNumber(typedLensType.default_production_time_out_of_stock_days),
  };
}
