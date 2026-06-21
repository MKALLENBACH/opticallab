'use client';

import { useState } from 'react';
import { createLensVariantAction } from '@/actions/lens-variants';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { LensSide } from '@/lib/types/enums';

interface LensTypeOption {
  id: string;
  name: string;
  brand: string | null;
}

export function LensVariantForm({ lensTypes }: { lensTypes: LensTypeOption[] }) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    // Converte os valores para os tipos esperados
    const esf = formData.get('sphere_esf') as string;
    const cil = formData.get('cylinder_cil') as string;
    const add = formData.get('addition_add') as string;
    const axis = formData.get('axis') as string;

    const data = {
      lens_type_id: formData.get('lens_type_id') as string,
      sku: formData.get('sku') as string,
      sphere_esf: esf ? parseFloat(esf) : undefined,
      cylinder_cil: cil ? parseFloat(cil) : undefined,
      addition_add: add ? parseFloat(add) : undefined,
      axis: axis ? parseInt(axis) : undefined,
      side: formData.get('side') as LensSide || undefined,
      quantity_available: parseInt(formData.get('quantity_available') as string) || 0,
      minimum_stock: parseInt(formData.get('minimum_stock') as string) || undefined,
      location: formData.get('location') as string || undefined,
      barcode: formData.get('barcode') as string || undefined,
    };

    const result = await createLensVariantAction(data);
    
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {error && (
            <div className="bg-[var(--color-error-bg)] border border-[var(--color-error)] text-[var(--color-error)] px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Identificação Básica */}
          <section>
            <h3 className="text-lg font-semibold text-[var(--color-text-base)] mb-4">Identificação do Produto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1 w-full">
                <label className="text-sm font-medium text-[var(--color-text-base)]">
                  Lente Base (Catálogo) *
                </label>
                <select
                  name="lens_type_id"
                  required
                  disabled={isLoading}
                  className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-md px-3 py-2 text-base focus:border-[var(--color-primary)] outline-none"
                >
                  <option value="">Selecione a lente base...</option>
                  {lensTypes.map(lt => (
                    <option key={lt.id} value={lt.id}>
                      {lt.name} {lt.brand ? `(${lt.brand})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="SKU (Código Único) *"
                name="sku"
                required
                placeholder="Ex: VS-AR-001"
                helperText="Obrigatório ser único para o seu laboratório."
                disabled={isLoading}
              />
              
              <Input
                label="Código de Barras"
                name="barcode"
                placeholder="EAN/UPC..."
                disabled={isLoading}
              />
              
              <div className="flex flex-col gap-1 w-full">
                <label className="text-sm font-medium text-[var(--color-text-base)]">
                  Lado da Lente
                </label>
                <select
                  name="side"
                  defaultValue={LensSide.NOT_APPLICABLE}
                  disabled={isLoading}
                  className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-md px-3 py-2 text-base focus:border-[var(--color-primary)] outline-none"
                >
                  <option value={LensSide.NOT_APPLICABLE}>Não aplicável / Ambos</option>
                  <option value={LensSide.RIGHT}>Olho Direito (OD)</option>
                  <option value={LensSide.LEFT}>Olho Esquerdo (OE)</option>
                  <option value={LensSide.PAIR}>Par Completo</option>
                </select>
              </div>
            </div>
          </section>

          {/* Dioptria / Grau */}
          <section className="border-t border-[var(--color-border)] pt-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-base)] mb-4">Dioptria (Grau)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Input
                label="Esférico (ESF)"
                name="sphere_esf"
                type="number"
                step="0.25"
                placeholder="0.00"
                disabled={isLoading}
              />
              <Input
                label="Cilíndrico (CIL)"
                name="cylinder_cil"
                type="number"
                step="0.25"
                placeholder="0.00"
                disabled={isLoading}
              />
              <Input
                label="Eixo"
                name="axis"
                type="number"
                min="0"
                max="180"
                step="1"
                placeholder="0 - 180"
                disabled={isLoading}
              />
              <Input
                label="Adição (ADD)"
                name="addition_add"
                type="number"
                step="0.25"
                min="0"
                placeholder="0.00"
                disabled={isLoading}
              />
            </div>
          </section>

          {/* Estoque */}
          <section className="border-t border-[var(--color-border)] pt-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-base)] mb-4">Estoque e Localização</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Quantidade Atual *"
                name="quantity_available"
                type="number"
                min="0"
                required
                defaultValue="0"
                disabled={isLoading}
              />
              <Input
                label="Estoque Mínimo"
                name="minimum_stock"
                type="number"
                min="0"
                defaultValue="0"
                disabled={isLoading}
              />
              <Input
                label="Localização Físca"
                name="location"
                placeholder="Ex: Corredor A, Prateleira 2"
                disabled={isLoading}
              />
            </div>
          </section>

          <div className="flex justify-end gap-3 mt-4 border-t border-[var(--color-border)] pt-4">
            <Button 
              type="button" 
              variant="outline" 
              disabled={isLoading}
              onClick={() => window.history.back()}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Salvar Variante
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
