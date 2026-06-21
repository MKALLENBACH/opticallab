'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/client';

export default function SearchLensPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);

    // Fazemos a busca em lens_variants usando operador ilike na coluna searchable_text, 
    // ou se tivéssemos FTS configurado seria com .textSearch
    // Como fizemos trigger de text, podemos usar ilike para buscar os termos unificados
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
      setResults(data || []);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text-base)]">Nova Venda / Busca Unificada</h2>
        <p className="text-[var(--color-text-muted)]">Busque por grau (ex: +2.00 -1.00), marca, tratamentos ou SKU.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <Input
                name="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: Crizal +2.00 Antirreflexo..."
                className="w-full"
              />
            </div>
            <Button type="submit" variant="primary" isLoading={isLoading} className="mt-[2px] h-10">
              <Search size={18} className="mr-2" />
              Buscar Lentes
            </Button>
          </form>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((item) => {
            const lensType = Array.isArray(item.lens_type) ? item.lens_type[0] : item.lens_type;
            const esf = item.sphere_esf !== null ? `ESF: ${item.sphere_esf > 0 ? '+' : ''}${item.sphere_esf.toFixed(2)}` : '';
            const cil = item.cylinder_cil !== null ? `CIL: ${item.cylinder_cil > 0 ? '+' : ''}${item.cylinder_cil.toFixed(2)}` : '';
            
            return (
              <Card key={item.id} className="hover:border-[var(--color-primary)] transition-colors">
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-lg text-[var(--color-text-base)]">
                      {lensType?.name}
                    </h4>
                    <Badge variant={item.quantity_available > 0 ? 'success' : 'warning'}>
                      {item.quantity_available > 0 ? `${item.quantity_available} un` : 'Sob Encomenda'}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-[var(--color-text-muted)] mb-4">{lensType?.brand || 'Sem marca'} | {lensType?.category?.replace(/_/g, ' ')}</p>
                  
                  <div className="bg-[var(--color-bg-surface-hover)] p-3 rounded-md mb-4 text-center font-mono text-sm border border-[var(--color-border)]">
                    {[esf, cil].filter(Boolean).join(' | ') || 'Plano/Sem Grau'}
                  </div>

                  <div className="mt-auto">
                    <Button variant="outline" className="w-full">
                      Adicionar ao Pedido
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {results.length === 0 && query && !isLoading && (
        <div className="text-center p-12 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg">
          <p className="text-[var(--color-text-muted)]">Nenhuma lente encontrada com esses critérios.</p>
        </div>
      )}
    </div>
  );
}
