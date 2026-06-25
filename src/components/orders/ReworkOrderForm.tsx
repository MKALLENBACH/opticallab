'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Check, RefreshCw, Search, X } from 'lucide-react';
import { createReworkOrderAction } from '@/actions/orders';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState, InfoRow, PageHeader, SectionCard, StatusBadge } from '@/components/ui/Premium';
import { LensSide } from '@/lib/types/enums';
import { getTreatmentLabel } from '@/lib/constants/treatments';
import { formatDateTime } from '@/lib/format/date';
import { availabilityFor, formatGrade, formatLeadTime, type OrderDraftVariant, variantFromRow } from '@/components/orders/orderDraft';

type ReworkAction = 'same_lens' | 'replace_sku' | 'special';

interface ReworkParentOrder {
  id: string;
  order_number: string;
  status: string;
  confirmed_at: string | null;
  created_at: string;
  optical_store?: { name: string | null } | null;
}

interface ReworkSourceItem {
  id: string;
  lens_type_id: string;
  lens_variant_id: string | null;
  quantity: number;
  sphere_esf: number | null;
  cylinder_cil: number | null;
  axis: number | null;
  addition_add: number | null;
  side: string | null;
  item_notes: string | null;
  lens_type: {
    name: string | null;
    brand: string | null;
    category: string | null;
    material: string | null;
    refractive_index: string | null;
    treatments: string[] | null;
  } | null;
  lens_variant: {
    id: string | null;
    sku: string | null;
    quantity_available: number | null;
  } | null;
}

interface ItemConfig {
  action: ReworkAction;
  quantity: number;
  replacementVariantId: string;
  sphere_esf: string;
  cylinder_cil: string;
  axis: string;
  addition_add: string;
  side: LensSide;
}

interface ReworkOrderFormProps {
  actor: 'store' | 'lab';
  parentOrder: ReworkParentOrder;
  items: ReworkSourceItem[];
  variants: OrderDraftVariant[];
}

const sideLabels: Record<string, string> = {
  [LensSide.RIGHT]: 'OD',
  [LensSide.LEFT]: 'OE',
  [LensSide.PAIR]: 'Par',
  [LensSide.NOT_APPLICABLE]: 'Nao aplicavel',
};

const actionLabels: Record<ReworkAction, string> = {
  same_lens: 'Refazer com a mesma lente',
  replace_sku: 'Trocar por outro SKU',
  special: 'Criar Pedido Especial',
};

function numberField(value: number | null | undefined) {
  return value === null || value === undefined ? '' : Number(value).toFixed(2);
}

function parseOptionalNumber(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseRequiredNumber(value: string) {
  if (!value.trim()) return Number.NaN;
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function itemGrade(item: ReworkSourceItem) {
  return formatGrade({
    sphere_esf: item.sphere_esf,
    cylinder_cil: item.cylinder_cil,
    axis: item.axis,
    addition_add: item.addition_add,
  });
}

function defaultConfig(item: ReworkSourceItem): ItemConfig {
  const side = (item.side || LensSide.RIGHT) as LensSide;
  return {
    action: 'same_lens',
    quantity: item.quantity || 1,
    replacementVariantId: '',
    sphere_esf: numberField(item.sphere_esf),
    cylinder_cil: numberField(item.cylinder_cil),
    axis: item.axis === null || item.axis === undefined ? '' : String(item.axis),
    addition_add: numberField(item.addition_add),
    side,
  };
}

export function ReworkOrderForm({ actor, parentOrder, items, variants }: ReworkOrderFormProps) {
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [configs, setConfigs] = useState<Record<string, ItemConfig>>(() => (
    Object.fromEntries(items.map((item) => [item.id, defaultConfig(item)]))
  ));
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matches, setMatches] = useState<{ sourceItemId: string; variants: OrderDraftVariant[] } | null>(null);

  const variantMap = useMemo(() => new Map(variants.map((variant) => [variant.id, variant])), [variants]);
  const backHref = actor === 'lab' ? `/lab/orders/${parentOrder.id}` : `/store/orders/${parentOrder.id}`;

  const updateConfig = (itemId: string, patch: Partial<ItemConfig>) => {
    setConfigs((current) => ({
      ...current,
      [itemId]: { ...current[itemId], ...patch },
    }));
  };

  const toggleItem = (itemId: string) => {
    setSelectedItems((current) => (
      current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId]
    ));
  };

  const buildPayload = (
    forceSpecialForSource?: string,
    useVariantForSource?: { sourceItemId: string; variantId: string }
  ) => ({
    parent_order_id: parentOrder.id,
    reason: 'erro_de_medico' as const,
    notes: notes || null,
    items: selectedItems.map((itemId) => {
      const item = items.find((entry) => entry.id === itemId)!;
      const config = configs[itemId];
      const selectedVariantId = useVariantForSource?.sourceItemId === itemId
        ? useVariantForSource.variantId
        : config.replacementVariantId;
      const action = useVariantForSource?.sourceItemId === itemId ? 'replace_sku' : config.action;

      return {
        source_order_item_id: item.id,
        action,
        lens_variant_id: action === 'replace_sku' ? selectedVariantId : null,
        lens_type_id: item.lens_type_id,
        treatments: item.lens_type?.treatments || [],
        side: config.side,
        quantity: config.quantity,
        single_power: action === 'special'
          ? {
            sphere_esf: parseRequiredNumber(config.sphere_esf),
            cylinder_cil: parseOptionalNumber(config.cylinder_cil),
            axis: config.axis.trim() ? Number(config.axis) : null,
            addition_add: parseOptionalNumber(config.addition_add),
          }
          : null,
        force_special: forceSpecialForSource === itemId,
        item_notes: notes || null,
      };
    }),
  });

  const submit = async (
    forceSpecialForSource?: string,
    useVariantForSource?: { sourceItemId: string; variantId: string }
  ) => {
    setError(null);
    setIsSubmitting(true);

    const result = await createReworkOrderAction(buildPayload(forceSpecialForSource, useVariantForSource));
    setIsSubmitting(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    if (result?.requiresConfirmation) {
      setMatches({
        sourceItemId: String(result.source_order_item_id || ''),
        variants: (result.matches || []).map((row) => variantFromRow(row as Record<string, unknown>)),
      });
      return;
    }

    if (result?.orderId) {
      router.push(actor === 'lab' ? `/lab/orders/${result.orderId}` : `/store/orders/${result.orderId}`);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        backHref={backHref}
        eyebrow="Retrabalho"
        title={`Abrir retrabalho do ${parentOrder.order_number}`}
        description="Crie um novo pedido vinculado ao pedido finalizado, mantendo o historico original intacto."
      />

      {error && (
        <div className="rounded-2xl border border-red-400/25 bg-red-500/12 px-4 py-3 text-[0.9rem] font-semibold text-red-100">
          {error}
        </div>
      )}

      <SectionCard icon={RefreshCw} title="Pedido original" description="Estes dados serao preservados no pedido finalizado.">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <InfoRow label="Numero" value={<span className="font-mono">{parentOrder.order_number}</span>} />
          <InfoRow label="Status" value={<StatusBadge status={parentOrder.status} />} />
          <InfoRow label="Finalizado em" value={formatDateTime(parentOrder.confirmed_at || parentOrder.created_at)} />
          <InfoRow label="Otica" value={parentOrder.optical_store?.name || 'Nao informado'} />
        </div>
      </SectionCard>

      <SectionCard icon={AlertTriangle} title="Motivo e observacoes" description="Neste momento, o motivo disponivel e Erro de Medico.">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
          <label className="flex flex-col gap-2 text-[0.84rem] font-bold text-slate-200">
            Motivo
            <select
              value="erro_de_medico"
              className="min-h-12 rounded-2xl border border-white/10 bg-slate-950/62 px-3 text-white outline-none"
              disabled
            >
              <option value="erro_de_medico">Erro de Medico</option>
            </select>
          </label>

          <label className="flex flex-col gap-2 text-[0.84rem] font-bold text-slate-200">
            Observacoes {actor === 'store' ? '(obrigatorio)' : '(opcional)'}
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              className="w-full resize-y rounded-2xl border border-white/10 bg-slate-950/62 px-4 py-3 text-[0.95rem] font-medium text-white outline-none transition-all placeholder:text-slate-500 hover:border-white/20 focus:border-violet-300/60 focus:ring-2 focus:ring-violet-400/15"
              placeholder="Explique o que precisa ser refeito ou ajustado."
            />
          </label>
        </div>
      </SectionCard>

      <SectionCard icon={Search} title="Itens do retrabalho" description="Selecione um ou mais itens do pedido original e escolha como cada lente sera refeita.">
        {!items.length ? (
          <EmptyState icon={Search} title="Nenhum item encontrado" description="Nao ha itens disponiveis para retrabalho neste pedido." />
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const selected = selectedItems.includes(item.id);
              const config = configs[item.id];
              const replacement = config.replacementVariantId ? variantMap.get(config.replacementVariantId) : null;

              return (
                <article key={item.id} className={`rounded-2xl border p-4 transition-colors ${selected ? 'border-violet-300/35 bg-violet-500/10' : 'border-white/10 bg-white/[0.025]'}`}>
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleItem(item.id)}
                      className="mt-1"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-[1rem] font-extrabold text-white">{item.lens_type?.name || 'Lente nao informada'}</p>
                          <p className="mt-1 text-[0.82rem] font-semibold text-slate-500">
                            {item.lens_type?.brand || 'Sem marca'} - SKU {item.lens_variant?.sku || '-'}
                          </p>
                        </div>
                        <Badge variant="info" size="sm">{item.quantity} un</Badge>
                      </div>

                      <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/58 px-4 py-3 font-mono text-[0.9rem] font-bold text-white">
                        {itemGrade(item)}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge size="sm">Lado: {sideLabels[item.side || LensSide.NOT_APPLICABLE] || '-'}</Badge>
                        {(item.lens_type?.treatments || []).map((treatment) => (
                          <Badge key={treatment} variant="info" size="sm">{getTreatmentLabel(treatment)}</Badge>
                        ))}
                      </div>
                    </div>
                  </label>

                  {selected && (
                    <div className="mt-4 grid grid-cols-1 gap-3 border-t border-white/10 pt-4 lg:grid-cols-[220px_130px_1fr]">
                      <label className="flex flex-col gap-2 text-[0.82rem] font-bold text-slate-200">
                        Acao
                        <select
                          value={config.action}
                          onChange={(event) => updateConfig(item.id, { action: event.target.value as ReworkAction })}
                          className="min-h-11 rounded-2xl border border-white/10 bg-slate-950/62 px-3 text-white outline-none"
                        >
                          {Object.entries(actionLabels).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </label>

                      <Input
                        label="Quantidade"
                        type="number"
                        min={1}
                        max={item.quantity}
                        value={config.quantity}
                        onChange={(event) => updateConfig(item.id, { quantity: Number(event.target.value) })}
                      />

                      {config.action === 'replace_sku' && (
                        <label className="flex flex-col gap-2 text-[0.82rem] font-bold text-slate-200">
                          SKU substituto
                          <select
                            value={config.replacementVariantId}
                            onChange={(event) => updateConfig(item.id, { replacementVariantId: event.target.value })}
                            className="min-h-11 rounded-2xl border border-white/10 bg-slate-950/62 px-3 text-white outline-none"
                          >
                            <option value="">Selecione um SKU</option>
                            {variants.map((variant) => (
                              <option key={variant.id} value={variant.id}>
                                {variant.sku} - {variant.name} - {formatGrade(variant)} - estoque {variant.quantity_available}
                              </option>
                            ))}
                          </select>
                          {replacement && (
                            <span className="text-[0.78rem] font-semibold text-slate-400">
                              Prazo: {formatLeadTime(availabilityFor(replacement).leadTime)}
                            </span>
                          )}
                        </label>
                      )}

                      {config.action === 'special' && (
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-5 lg:col-span-3">
                          <label className="flex flex-col gap-2 text-[0.82rem] font-bold text-slate-200">
                            Lado
                            <select
                              value={config.side}
                              onChange={(event) => updateConfig(item.id, { side: event.target.value as LensSide })}
                              className="min-h-11 rounded-2xl border border-white/10 bg-slate-950/62 px-3 text-white outline-none"
                            >
                              <option value={LensSide.RIGHT}>OD</option>
                              <option value={LensSide.LEFT}>OE</option>
                              <option value={LensSide.NOT_APPLICABLE}>Nao aplicavel</option>
                            </select>
                          </label>
                          <Input label="ESF" value={config.sphere_esf} onChange={(event) => updateConfig(item.id, { sphere_esf: event.target.value })} />
                          <Input label="CIL" value={config.cylinder_cil} onChange={(event) => updateConfig(item.id, { cylinder_cil: event.target.value })} />
                          <Input label="Eixo" value={config.axis} onChange={(event) => updateConfig(item.id, { axis: event.target.value })} />
                          <Input label="ADD" value={config.addition_add} onChange={(event) => updateConfig(item.id, { addition_add: event.target.value })} />
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <Button
            type="button"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            onClick={() => submit()}
            rightIcon={<Check size={16} />}
          >
            {actor === 'lab' ? 'Criar retrabalho' : 'Enviar retrabalho'}
          </Button>
        </div>
      </SectionCard>

      {matches && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-8 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-950 p-5 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xl font-extrabold text-white">Encontramos uma lente compativel</p>
                <p className="mt-2 text-[0.92rem] font-medium text-slate-400">
                  Confira se o SKU atende ao retrabalho antes de criar um item especial.
                </p>
              </div>
              <button type="button" onClick={() => setMatches(null)} className="rounded-xl border border-white/10 p-2 text-slate-300 hover:text-white" aria-label="Fechar">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {matches.variants.map((variant) => {
                const availability = availabilityFor(variant);
                return (
                  <article key={variant.id} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                    <p className="font-extrabold text-white">{variant.name}</p>
                    <p className="mt-1 text-[0.82rem] font-semibold text-slate-500">{variant.brand || 'Sem marca'} - SKU {variant.sku}</p>
                    <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/58 px-4 py-3 font-mono text-[0.9rem] font-bold text-white">
                      {formatGrade(variant)}
                    </div>
                    <p className="mt-2 text-[0.82rem] font-semibold text-slate-400">
                      Estoque: {variant.quantity_available} un - Prazo: {formatLeadTime(availability.leadTime)}
                    </p>
                    <div className="mt-4 flex flex-col gap-2">
                      <Button type="button" disabled={isSubmitting} onClick={() => submit(undefined, { sourceItemId: matches.sourceItemId, variantId: variant.id })}>
                        Usar este SKU
                      </Button>
                      <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => submit(matches.sourceItemId)}>
                        Continuar Pedido Especial
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
