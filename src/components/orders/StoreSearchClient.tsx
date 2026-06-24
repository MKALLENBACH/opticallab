'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PackageSearch, Search, ShoppingCart } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { EmptyState, HeaderAction, PageHeader, SectionCard } from '@/components/ui/Premium';
import { getTreatmentLabel } from '@/lib/constants/treatments';
import {
  availabilityFor,
  AVAILABILITY_FILTER_OPTIONS,
  AvailabilityFilter,
  formatGrade,
  matchesAvailabilityFilter,
  ORDER_DRAFT_STORAGE_KEY,
  OrderDraftItem,
  OrderDraftVariant,
  searchTerms,
  StoredOrderDraft,
  variantFromRow,
} from './orderDraft';
import { OrderPriority } from '@/lib/types/enums';

function readDraft(): StoredOrderDraft {
  if (typeof window === 'undefined') {
    return { notes: '', priority: OrderPriority.NORMAL, desired_delivery_date: '', items: [] };
  }

  try {
    const raw = window.localStorage.getItem(ORDER_DRAFT_STORAGE_KEY);
    if (!raw) return { notes: '', priority: OrderPriority.NORMAL, desired_delivery_date: '', items: [] };
    const parsed = JSON.parse(raw) as StoredOrderDraft;
    return {
      notes: parsed.notes || '',
      priority: parsed.priority || OrderPriority.NORMAL,
      desired_delivery_date: parsed.desired_delivery_date || '',
      items: Array.isArray(parsed.items) ? parsed.items : [],
    };
  } catch {
    return { notes: '', priority: OrderPriority.NORMAL, desired_delivery_date: '', items: [] };
  }
}

function saveDraft(items: OrderDraftItem[]) {
  const current = readDraft();
  window.localStorage.setItem(ORDER_DRAFT_STORAGE_KEY, JSON.stringify({ ...current, items }));
}

function availabilityBadge(variant: OrderDraftVariant) {
  const availability = availabilityFor(variant);
  if (availability.state === 'available') return <Badge variant="success" dot>Disponivel</Badge>;
  if (availability.state === 'backorder') return <Badge variant="warning" dot>Sem pronta entrega</Badge>;
  return <Badge variant="error" dot>Indisponivel</Badge>;
}

export function StoreSearchClient() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [query, setQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('all');
  const [results, setResults] = useState<OrderDraftVariant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const lastSearchRef = useRef('');

  const runSearch = useCallback(async (value: string, force = false) => {
    const terms = searchTerms(value);
    const normalized = `${availabilityFilter}:${terms.join(' ') || 'all'}`;

    if (!force && normalized === lastSearchRef.current) return;

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    lastSearchRef.current = normalized;

    setIsLoading(true);
    setHasSearched(true);
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
        lens_type:lens_types!inner(
          id,
          name,
          brand,
          status,
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
      .eq('lens_type.status', 'active')
      .order('quantity_available', { ascending: false })
      .order('sku', { ascending: true });

    if (availabilityFilter === 'in_stock') {
      request = request.gt('quantity_available', 0);
    }

    if (availabilityFilter === 'backorder') {
      request = request.lte('quantity_available', 0);
    }

    for (const term of terms) {
      request = request.ilike('searchable_text', `%${term}%`);
    }

    const { data, error } = await request;

    if (requestId !== requestIdRef.current) return;

    if (error) {
      console.error(error);
      setResults([]);
      setMessage('Nao foi possivel buscar lentes agora. Tente novamente.');
    } else {
      setResults((data || [])
        .map((row) => variantFromRow(row as Record<string, unknown>))
        .filter((variant) => matchesAvailabilityFilter(variant, availabilityFilter)));
    }

    setIsLoading(false);
  }, [availabilityFilter, supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void runSearch(query);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [availabilityFilter, query, runSearch]);

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await runSearch(query, true);
  };

  const addToDraft = (variant: OrderDraftVariant) => {
    const availability = availabilityFor(variant);
    if (!availability.canOrder) {
      setMessage('Esta lente esta indisponivel para pedido no momento.');
      return;
    }

    const draft = readDraft();
    const existing = draft.items.find((item) => item.variant.id === variant.id);
    const nextItems = existing
      ? draft.items.map((item) => item.variant.id === variant.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...draft.items, { variant, quantity: 1, item_notes: '' }];

    saveDraft(nextItems);
    router.push('/store/orders/new');
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        eyebrow="Catalogo do laboratorio"
        title="Busca de lentes"
        description="Encontre SKUs por grau, marca, tratamento ou codigo e inicie o pedido com mais seguranca."
        actions={<HeaderAction href="/store/orders/new" icon={<ShoppingCart size={17} />}>Novo pedido</HeaderAction>}
      />

      <SectionCard
        icon={PackageSearch}
        title="Consulta rapida"
        description="Busque por nome, SKU, material, tratamento, indice ou combinacoes como -2 -1 180."
      >
        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
          <Input
            name="query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ex: LL-VS -2 antirreflexo"
            leftIcon={<Search size={17} />}
            className="flex-1"
          />
          <Button type="submit" size="lg" isLoading={isLoading} className="sm:min-w-[150px]">
            Buscar
          </Button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Filtro de disponibilidade">
          {AVAILABILITY_FILTER_OPTIONS.map((option) => {
            const isActive = availabilityFilter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setAvailabilityFilter(option.value)}
                className={`min-h-10 rounded-2xl border px-4 text-[0.84rem] font-extrabold transition-all ${
                  isActive
                    ? 'border-violet-300/40 bg-violet-500/18 text-white shadow-[0_0_24px_rgba(139,92,246,0.16)]'
                    : 'border-white/10 bg-slate-950/35 text-slate-400 hover:border-violet-300/25 hover:text-white'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        {hasSearched && (
          <p className="mt-3 text-[0.82rem] font-semibold text-slate-500">
            {isLoading
              ? 'Carregando catalogo...'
              : `Mostrando ${results.length} ${results.length === 1 ? 'item' : 'itens'}${query.trim() ? ' encontrados' : ' cadastrados'}.`}
          </p>
        )}
        {message && (
          <p className="mt-4 rounded-2xl border border-amber-400/25 bg-amber-500/12 px-4 py-3 text-[0.88rem] font-semibold text-amber-100">
            {message}
          </p>
        )}
      </SectionCard>

      {results.length > 0 && (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((variant) => {
            const availability = availabilityFor(variant);
            return (
              <Card key={variant.id} hover className="flex min-h-[360px] flex-col">
                <CardContent className="flex h-full flex-col gap-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[1.05rem] font-extrabold text-white">
                        {variant.name}
                      </p>
                      <p className="mt-1 text-[0.86rem] font-semibold text-slate-500">
                        {variant.brand || 'Sem marca'} - {variant.material || 'Material nao informado'}
                      </p>
                    </div>
                    {availabilityBadge(variant)}
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/58 px-4 py-4 text-center font-mono text-[0.95rem] font-extrabold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                    {formatGrade(variant)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[0.82rem] font-semibold text-slate-400">
                    <span>SKU: <strong className="font-mono text-slate-200">{variant.sku}</strong></span>
                    <span>Qtd: <strong className="text-slate-200">{variant.quantity_available} un</strong></span>
                    <span className="col-span-2">
                      Prazo: <strong className="text-slate-200">{availability.leadTime ? `${availability.leadTime} dias` : 'sob confirmacao'}</strong>
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {variant.treatments.length ? variant.treatments.slice(0, 4).map((treatment) => (
                      <Badge key={treatment} variant="info" size="sm">
                        {getTreatmentLabel(treatment)}
                      </Badge>
                    )) : (
                      <Badge size="sm">Sem tratamento</Badge>
                    )}
                  </div>

                  <p className="min-h-10 text-[0.82rem] font-medium text-slate-400">
                    {availability.state === 'backorder'
                      ? `Sem pronta entrega. Prazo estimado de producao: ${availability.leadTime ?? 'sob confirmacao'} dias.`
                      : availability.description}
                  </p>

                  <div className="mt-auto border-t border-white/10 pt-4">
                    <Button
                      type="button"
                      className="w-full"
                      variant={availability.canOrder ? 'primary' : 'outline'}
                      disabled={!availability.canOrder}
                      title={!availability.canOrder ? 'Esta lente esta indisponivel para pedido no momento.' : undefined}
                      onClick={() => addToDraft(variant)}
                      rightIcon={<ShoppingCart size={16} />}
                    >
                      {availability.state === 'backorder' ? 'Solicitar mesmo assim' : availability.canOrder ? 'Adicionar ao pedido' : 'Indisponivel'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}

      {hasSearched && results.length === 0 && !isLoading && (
        <EmptyState
          icon={PackageSearch}
          title="Nenhuma lente encontrada"
          description={query.trim()
            ? 'Tente outra combinacao de grau, marca, tratamento, SKU ou indice.'
            : 'Nao ha lentes ativas para o filtro selecionado.'}
        />
      )}

      {!hasSearched && !isLoading && (
        <EmptyState
          icon={PackageSearch}
          title="Carregando catalogo"
          description="A lista de lentes cadastradas aparecera aqui automaticamente."
        />
      )}
    </div>
  );
}
