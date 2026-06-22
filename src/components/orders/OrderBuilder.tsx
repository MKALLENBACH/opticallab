'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CalendarDays, PackageSearch, Save, Search, ShoppingCart, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { createStoreOrderAction, updateStoreOrderAction } from '@/actions/orders';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState, FormSection, PageHeader, SectionCard } from '@/components/ui/Premium';
import { getTreatmentLabel } from '@/lib/constants/treatments';
import { OrderPriority } from '@/lib/types/enums';
import {
  availabilityFor,
  formatGrade,
  ORDER_DRAFT_STORAGE_KEY,
  OrderDraftItem,
  OrderDraftVariant,
  searchTerms,
  StoredOrderDraft,
  variantFromRow,
} from './orderDraft';

export interface EditableOrderDraft {
  id: string;
  status: string;
  notes: string;
  priority: OrderPriority;
  desired_delivery_date: string;
  items: OrderDraftItem[];
}

interface OrderBuilderProps {
  initialVariant?: OrderDraftVariant | null;
  editOrder?: EditableOrderDraft | null;
  blockedMessage?: string | null;
}

function emptyDraft(): StoredOrderDraft {
  return { notes: '', priority: OrderPriority.NORMAL, desired_delivery_date: '', items: [] };
}

function readDraft(initialVariant?: OrderDraftVariant | null): StoredOrderDraft {
  if (typeof window === 'undefined') {
    return { ...emptyDraft(), items: initialVariant ? [{ variant: initialVariant, quantity: 1, item_notes: '' }] : [] };
  }

  try {
    const raw = window.localStorage.getItem(ORDER_DRAFT_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) as StoredOrderDraft : emptyDraft();
    const items = Array.isArray(parsed.items) ? parsed.items : [];

    if (initialVariant && !items.some((item) => item.variant.id === initialVariant.id)) {
      items.push({ variant: initialVariant, quantity: 1, item_notes: '' });
    }

    return {
      notes: parsed.notes || '',
      priority: parsed.priority || OrderPriority.NORMAL,
      desired_delivery_date: parsed.desired_delivery_date || '',
      items,
    };
  } catch {
    return { ...emptyDraft(), items: initialVariant ? [{ variant: initialVariant, quantity: 1, item_notes: '' }] : [] };
  }
}

function writeDraft(draft: StoredOrderDraft) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ORDER_DRAFT_STORAGE_KEY, JSON.stringify(draft));
}

function clearDraft() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ORDER_DRAFT_STORAGE_KEY);
}

function availabilityBadge(variant: OrderDraftVariant) {
  const availability = availabilityFor(variant);
  if (availability.state === 'available') return <Badge variant="success" dot>Disponivel</Badge>;
  if (availability.state === 'backorder') return <Badge variant="warning" dot>Sem pronta entrega</Badge>;
  return <Badge variant="error" dot>Indisponivel</Badge>;
}

export function OrderBuilder({ initialVariant, editOrder, blockedMessage }: OrderBuilderProps) {
  const router = useRouter();
  const supabase = createClient();
  const [initialDraft] = useState(() => editOrder ?? readDraft(initialVariant));

  const [items, setItems] = useState<OrderDraftItem[]>(initialDraft.items);
  const [notes, setNotes] = useState(initialDraft.notes);
  const [priority, setPriority] = useState<OrderPriority>(initialDraft.priority || OrderPriority.NORMAL);
  const [desiredDate, setDesiredDate] = useState(initialDraft.desired_delivery_date || '');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<OrderDraftVariant[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const desiredDateRef = useRef<HTMLInputElement>(null);

  const isEditing = Boolean(editOrder);

  useEffect(() => {
    if (isEditing || blockedMessage) return;
    writeDraft({ notes, priority, desired_delivery_date: desiredDate, items });
  }, [desiredDate, isEditing, items, notes, priority, blockedMessage]);

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const terms = searchTerms(query);
    if (!terms.length) return;

    setIsSearching(true);
    setError(null);
    setMessage(null);

    let request = supabase
      .from('lens_variants')
      .select(`
        id,
        lens_type_id,
        sku,
        sphere_esf,
        cylinder_cil,
        axis,
        addition_add,
        quantity_available,
        minimum_stock,
        delivery_time_in_stock_days,
        production_time_out_of_stock_days,
        lens_type:lens_types(
          id,
          name,
          brand,
          category,
          material,
          refractive_index,
          treatments,
          allow_order_when_out_of_stock,
          default_delivery_time_in_stock_days,
          default_production_time_out_of_stock_days
        )
      `)
      .eq('status', 'active')
      .limit(12);

    for (const term of terms) {
      request = request.ilike('searchable_text', `%${term}%`);
    }

    const { data, error: searchError } = await request;

    if (searchError) {
      setResults([]);
      setError('Nao foi possivel buscar lentes agora.');
    } else {
      setResults((data || []).map((row) => variantFromRow(row as Record<string, unknown>)));
      if (!data?.length) setMessage('Nenhuma lente encontrada para esta busca.');
    }

    setIsSearching(false);
  };

  const addItem = (variant: OrderDraftVariant) => {
    const availability = availabilityFor(variant);
    if (!availability.canOrder) {
      setError('Esta lente esta indisponivel para pedido no momento.');
      return;
    }

    setError(null);
    setMessage('Item adicionado ao pedido.');
    setItems((current) => {
      const existing = current.find((item) => item.variant.id === variant.id);
      if (existing) {
        return current.map((item) => item.variant.id === variant.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...current, { variant, quantity: 1, item_notes: '' }];
    });
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    setItems((current) => current.map((item) => (
      item.variant.id === variantId ? { ...item, quantity: Math.max(1, quantity || 1) } : item
    )));
  };

  const updateItemNotes = (variantId: string, itemNotes: string) => {
    setItems((current) => current.map((item) => (
      item.variant.id === variantId ? { ...item, item_notes: itemNotes } : item
    )));
  };

  const removeItem = (variantId: string) => {
    setItems((current) => current.filter((item) => item.variant.id !== variantId));
  };

  const handleSubmit = async () => {
    setError(null);
    setMessage(null);

    if (!items.length) {
      setError('Adicione pelo menos uma lente ao pedido antes de finalizar.');
      return;
    }

    if (items.some((item) => item.quantity <= 0)) {
      setError('Todos os itens precisam ter quantidade maior que zero.');
      return;
    }

    setIsSubmitting(true);
    const currentDesiredDate = desiredDateRef.current?.value || desiredDate;
    const payload = {
      notes: notes || null,
      priority,
      desired_delivery_date: currentDesiredDate || null,
      items: items.map((item) => ({
        lens_variant_id: item.variant.id,
        quantity: item.quantity,
        item_notes: item.item_notes || null,
      })),
    };

    const result = isEditing && editOrder
      ? await updateStoreOrderAction(editOrder.id, payload)
      : await createStoreOrderAction(payload);

    setIsSubmitting(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    setMessage(isEditing ? 'Pedido atualizado com sucesso.' : 'Pedido criado com sucesso.');
    clearDraft();
    router.replace(`/store/orders/${result.orderId}`);
  };

  if (blockedMessage) {
    return (
      <div className="space-y-6 animate-slide-up">
        <PageHeader
          backHref="/store/orders"
          eyebrow="Pedido bloqueado"
          title="Pedido nao editavel"
          description={blockedMessage}
        />
        <EmptyState
          icon={ShoppingCart}
          title="Edicao indisponivel"
          description="Este pedido ja saiu da etapa de confirmacao. Para alteracoes, entre em contato com o laboratorio."
          action={<Link href="/store/orders" className="font-bold text-violet-300 hover:text-white">Voltar para pedidos</Link>}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        backHref={isEditing && editOrder ? `/store/orders/${editOrder.id}` : '/store/orders'}
        eyebrow={isEditing ? 'Editar pedido' : 'Otica'}
        title={isEditing ? 'Editar pedido' : 'Novo pedido'}
        description="Busque lentes, ajuste quantidades, revise observacoes e finalize a solicitacao ao laboratorio."
      />

      {(error || message) && (
        <div className={`rounded-2xl border px-4 py-3 text-[0.9rem] font-semibold ${error ? 'border-red-400/25 bg-red-500/12 text-red-100' : 'border-emerald-400/25 bg-emerald-500/12 text-emerald-100'}`}>
          {error || message}
        </div>
      )}

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard
          icon={PackageSearch}
          title="1. Selecionar lente"
          description="Busque por nome, SKU, grau, material, tratamento ou indice."
        >
          <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ex: LL-VS -2 antirreflexo"
              leftIcon={<Search size={17} />}
              disabled={isSearching}
              className="flex-1"
            />
            <Button type="submit" isLoading={isSearching} className="sm:min-w-[140px]">
              Buscar
            </Button>
          </form>

          <div className="mt-5 grid grid-cols-1 gap-3">
            {results.map((variant) => {
              const availability = availabilityFor(variant);
              return (
                <article
                  key={variant.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-extrabold text-white">{variant.name}</p>
                        {availabilityBadge(variant)}
                      </div>
                      <p className="mt-1 text-[0.82rem] font-semibold text-slate-500">
                        SKU {variant.sku} - {variant.material || 'Material nao informado'} - {formatGrade(variant)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {variant.treatments.slice(0, 3).map((treatment) => (
                          <Badge key={treatment} variant="info" size="sm">{getTreatmentLabel(treatment)}</Badge>
                        ))}
                      </div>
                      <p className="mt-2 text-[0.8rem] font-medium text-slate-400">
                        {availability.description} Prazo: {availability.leadTime ? `${availability.leadTime} dias` : 'sob confirmacao'}.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      disabled={!availability.canOrder}
                      onClick={() => addItem(variant)}
                      rightIcon={<ShoppingCart size={15} />}
                    >
                      Adicionar
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard
          icon={ShoppingCart}
          title={`2. Itens do pedido (${totalItems})`}
          description="Revise quantidades, remova itens ou adicione observacoes individuais."
        >
          {!items.length ? (
            <EmptyState
              icon={ShoppingCart}
              title="Nenhum item adicionado"
              description="Busque uma lente e adicione ao pedido para continuar."
            />
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <article
                  key={item.variant.id}
                  className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-extrabold text-white">{item.variant.name}</p>
                        <p className="mt-1 font-mono text-[0.8rem] font-bold text-slate-500">
                          SKU {item.variant.sku} - {formatGrade(item.variant)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.variant.id)}
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 text-red-200 transition-colors hover:bg-red-500/18"
                        aria-label="Remover item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[120px_1fr]">
                      <Input
                        label="Quantidade"
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(event) => updateQuantity(item.variant.id, Number(event.target.value))}
                      />
                      <Input
                        label="Observacao do item"
                        value={item.item_notes}
                        onChange={(event) => updateItemNotes(item.variant.id, event.target.value)}
                        placeholder="Ex: montar como OD"
                      />
                    </div>
                </article>
              ))}
            </div>
          )}
        </SectionCard>
      </section>

      <SectionCard
        icon={CalendarDays}
        title="3. Observacoes e revisao"
        description="Defina prioridade, data desejada e observacoes gerais antes de finalizar."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_220px_220px]">
          <div className="flex flex-col gap-2">
            <label className="ml-1 text-[0.86rem] font-bold text-slate-200">Observacoes gerais</label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              className="w-full resize-y rounded-2xl border border-white/10 bg-slate-950/62 px-4 py-3 text-[0.95rem] font-medium text-white outline-none transition-all placeholder:text-slate-500 hover:border-white/20 focus:border-violet-300/60 focus:ring-2 focus:ring-violet-400/15"
              placeholder="Informe detalhes do pedido, paciente ou combinados com o laboratorio."
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="ml-1 text-[0.86rem] font-bold text-slate-200">Prioridade</label>
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value as OrderPriority)}
              className="min-h-12 rounded-2xl border border-white/10 bg-slate-950/62 px-4 py-3 text-[0.95rem] font-medium text-white outline-none transition-all hover:border-white/20 focus:border-violet-300/60 focus:ring-2 focus:ring-violet-400/15"
            >
              <option value={OrderPriority.NORMAL}>Normal</option>
              <option value={OrderPriority.URGENTE}>Urgente</option>
            </select>
          </div>
          <Input
            label="Entrega desejada"
            type="date"
            ref={desiredDateRef}
            value={desiredDate}
            onChange={(event) => setDesiredDate(event.target.value)}
          />
        </div>

        <FormSection title="Resumo" description="Confira antes de enviar ao laboratorio.">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
              <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-slate-500">Itens</p>
              <p className="mt-2 text-2xl font-extrabold text-white">{items.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
              <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-slate-500">Quantidade total</p>
              <p className="mt-2 text-2xl font-extrabold text-white">{totalItems}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
              <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-slate-500">Status inicial</p>
              <p className="mt-2 text-[0.95rem] font-extrabold text-amber-100">Aguardando confirmacao</p>
            </div>
          </div>
        </FormSection>

        <div className="mt-5 flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => {
              if (isEditing && editOrder) {
                router.push(`/store/orders/${editOrder.id}`);
                return;
              }
              clearDraft();
              setItems([]);
              setNotes('');
              setDesiredDate('');
            }}
            leftIcon={<ArrowLeft size={16} />}
          >
            {isEditing ? 'Cancelar edicao' : 'Limpar rascunho'}
          </Button>
          <Button
            type="button"
            isLoading={isSubmitting}
            disabled={!items.length}
            rightIcon={<Save size={17} />}
            onClick={handleSubmit}
          >
            {isEditing ? 'Salvar pedido' : 'Finalizar pedido'}
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}
