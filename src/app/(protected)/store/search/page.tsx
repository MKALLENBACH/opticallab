'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { PackageSearch, Search, ShoppingCart, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { AvailabilityBadge, EmptyState, HeaderAction, PageHeader, SectionCard } from '@/components/ui/Premium';
import { getTreatmentLabel } from '@/lib/constants/treatments';
import { createClient } from '@/lib/supabase/client';

interface LensTypeResult {
  name: string | null;
  brand: string | null;
  category: string | null;
  treatments: string[] | null;
}

interface LensVariantResult {
  id: string;
  sku: string;
  sphere_esf: number | null;
  cylinder_cil: number | null;
  axis: number | null;
  addition_add: number | null;
  quantity_available: number;
  minimum_stock: number | null;
  lens_type: LensTypeResult | LensTypeResult[] | null;
}

function formatPower(value: number | null, prefix: string): string {
  if (value === null) return '';
  return `${prefix} ${value > 0 ? '+' : ''}${value.toFixed(2)}`;
}

function formatGrade(item: LensVariantResult): string {
  return [
    formatPower(item.sphere_esf, 'ESF'),
    item.cylinder_cil !== null && item.cylinder_cil !== 0 ? formatPower(item.cylinder_cil, 'CIL') : '',
    item.axis !== null ? `Eixo ${item.axis}` : '',
    item.addition_add !== null ? formatPower(item.addition_add, 'ADD') : '',
  ].filter(Boolean).join(' / ') || 'Plano';
}

export default function SearchLensPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LensVariantResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const supabase = createClient();

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    const { data, error } = await supabase
      .from('lens_variants')
      .select(`
        id,
        sku,
        sphere_esf,
        cylinder_cil,
        axis,
        addition_add,
        quantity_available,
        minimum_stock,
        lens_type:lens_types(name, brand, category, treatments)
      `)
      .ilike('searchable_text', `%${query.trim()}%`)
      .limit(24);

    if (error) {
      console.error(error);
      setResults([]);
    } else {
      setResults((data ?? []) as LensVariantResult[]);
    }

    setIsLoading(false);
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
        description="Experimente termos como +2.00, antirreflexo, policarbonato ou o SKU informado pelo laboratorio."
      >
        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
          <Input
            name="query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ex: Crizal +2.00 antirreflexo"
            leftIcon={<Search size={17} />}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="lg" isLoading={isLoading} className="sm:min-w-[150px]">
            Buscar
          </Button>
        </form>
      </SectionCard>

      {results.length > 0 && (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((item) => {
            const lensType = Array.isArray(item.lens_type) ? item.lens_type[0] : item.lens_type;
            const treatments = lensType?.treatments ?? [];

            return (
              <Card key={item.id} hover className="flex min-h-[300px] flex-col">
                <CardContent className="flex h-full flex-col gap-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[1.05rem] font-extrabold text-white">
                        {lensType?.name || 'Lente sem nome'}
                      </p>
                      <p className="mt-1 text-[0.86rem] font-semibold text-slate-500">
                        {lensType?.brand || 'Sem marca'} · {lensType?.category?.replace(/_/g, ' ') || 'Categoria nao informada'}
                      </p>
                    </div>
                    <AvailabilityBadge quantity={item.quantity_available} minimumStock={item.minimum_stock} />
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/58 px-4 py-4 text-center font-mono text-[0.95rem] font-extrabold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                    {formatGrade(item)}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {treatments.length ? treatments.slice(0, 4).map((treatment) => (
                      <Badge key={treatment} variant="info" size="sm">
                        {getTreatmentLabel(treatment)}
                      </Badge>
                    )) : (
                      <Badge size="sm">Sem tratamento</Badge>
                    )}
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                    <span className="truncate font-mono text-[0.78rem] font-bold text-slate-500">
                      SKU {item.sku}
                    </span>
                    <Link
                      href={`/store/orders/new?variantId=${item.id}`}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-violet-300/20 bg-violet-500/16 px-4 text-[0.82rem] font-extrabold text-violet-100 transition-all hover:border-violet-200/35 hover:bg-violet-500/24"
                    >
                      <ShoppingCart size={15} />
                      Pedido
                    </Link>
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
          description="Tente outra combinacao de grau, marca, tratamento ou SKU."
        />
      )}

      {!hasSearched && (
        <EmptyState
          icon={Sparkles}
          title="Comece pela busca"
          description="Os resultados aparecem aqui com estoque, grau, tratamentos e atalho para iniciar o pedido."
        />
      )}
    </div>
  );
}
