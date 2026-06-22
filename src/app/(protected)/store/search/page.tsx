'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Search, Package } from 'lucide-react';
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
  addition_add: number | null;
  quantity_available: number;
  lens_type: LensTypeResult | LensTypeResult[] | null;
}

export default function SearchLensPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LensVariantResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const supabase = createClient();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
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
        addition_add,
        quantity_available,
        lens_type:lens_types(name, brand, category, treatments)
      `)
      .ilike('searchable_text', `%${query}%`)
      .limit(20);

    if (error) {
      console.error(error);
    } else {
      setResults((data ?? []) as LensVariantResult[]);
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="page-header">
        <h2>Busca de Lentes</h2>
        <p>Busque por grau (ex: +2.00 -1.00), marca, tratamentos ou SKU.</p>
      </div>

      {/* Search form */}
      <Card>
        <CardContent className="p-5">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1">
              <Input
                name="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: Crizal +2.00 Antirreflexo, policarbonato..."
                leftIcon={<Search size={16} />}
              />
            </div>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              {isLoading ? 'Buscando...' : 'Buscar'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((item) => {
            const lensType = Array.isArray(item.lens_type) ? item.lens_type[0] : item.lens_type;
            const esf = item.sphere_esf !== null ? `ESF ${item.sphere_esf > 0 ? '+' : ''}${item.sphere_esf.toFixed(2)}` : '';
            const cil = item.cylinder_cil !== null && item.cylinder_cil !== 0 ? `CIL ${item.cylinder_cil > 0 ? '+' : ''}${item.cylinder_cil.toFixed(2)}` : '';

            return (
              <Card key={item.id} className="flex flex-col gap-3 transition-all duration-200 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-md)]">
                <CardContent className="p-5 flex flex-col gap-3 h-full">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-semibold text-[var(--color-text-base)] leading-tight">
                      {lensType?.name || '—'}
                    </h4>
                    <Badge variant={item.quantity_available > 0 ? 'success' : 'warning'} dot>
                      {item.quantity_available > 0 ? `${item.quantity_available} un` : 'Sob Encomenda'}
                    </Badge>
                  </div>

                  <p className="text-sm text-[var(--color-text-muted)]">
                    {lensType?.brand || 'Sem marca'} · {lensType?.category?.replace(/_/g, ' ') || ''}
                  </p>

                  <div
                    className="bg-[var(--color-bg-surface-2)] p-3 rounded-[var(--radius-md)] text-center
                               font-mono text-sm border border-[var(--color-border)]
                               text-[var(--color-text-base)]"
                  >
                    {[esf, cil].filter(Boolean).join(' · ') || 'Plano / Sem Grau'}
                  </div>

                  <p className="text-xs font-mono text-[var(--color-text-muted)]">SKU: {item.sku}</p>

                  <div className="mt-auto pt-3">
                    <Button variant="outline" className="w-full" size="sm">
                      Adicionar ao Pedido
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty state after search */}
      {hasSearched && results.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--color-bg-surface-2)' }}>
              <Package size={22} className="text-[var(--color-text-muted)]" />
            </div>
            <p className="text-sm font-medium text-[var(--color-text-base)]">Nenhuma lente encontrada</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-1 max-w-xs mx-auto">
              Tente buscar por outra combinação de grau, marca ou tratamento.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Initial state (before any search) */}
      {!hasSearched && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--color-primary-light)' }}>
              <Search size={20} style={{ color: 'var(--color-primary)' }} />
            </div>
            <p className="text-sm font-medium text-[var(--color-text-base)]">Comece sua busca</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-1 max-w-xs mx-auto">
              Digite um termo acima para encontrar lentes disponíveis no catálogo do laboratório.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
