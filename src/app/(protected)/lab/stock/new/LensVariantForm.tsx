'use client';

import { useState } from 'react';
import { Barcode, Boxes, Glasses, Ruler, Save } from 'lucide-react';
import { createLensVariantAction } from '@/actions/lens-variants';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { FormActions, FormSection } from '@/components/ui/Premium';
import { EntityStatus, LensSide } from '@/lib/types/enums';

interface LensTypeOption {
  id: string;
  name: string;
  brand: string | null;
}

export function LensVariantForm({ lensTypes }: { lensTypes: LensTypeOption[] }) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
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
      side: (formData.get('side') as LensSide) || undefined,
      quantity_available: parseInt(formData.get('quantity_available') as string) || 0,
      minimum_stock: parseInt(formData.get('minimum_stock') as string) || undefined,
      location: (formData.get('location') as string) || undefined,
      barcode: (formData.get('barcode') as string) || undefined,
      status: EntityStatus.ACTIVE,
    };

    const result = await createLensVariantAction(data);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="rounded-2xl border border-red-400/25 bg-red-500/12 px-4 py-3 text-[0.9rem] font-semibold text-red-100">
              {error}
            </div>
          )}

          <FormSection
            icon={Glasses}
            title="Produto base"
            description="Vincule o SKU a uma lente ja cadastrada no catalogo."
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="ml-1 text-[0.86rem] font-bold text-slate-200">Lente base *</label>
                <select name="lens_type_id" required disabled={isLoading}>
                  <option value="">Selecione a lente base...</option>
                  {lensTypes.map((lensType) => (
                    <option key={lensType.id} value={lensType.id}>
                      {lensType.name} {lensType.brand ? `(${lensType.brand})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="SKU *"
                name="sku"
                required
                placeholder="Ex: VS-AR-001"
                helperText="Deve ser unico dentro do laboratorio."
                leftIcon={<Barcode size={16} />}
                disabled={isLoading}
              />

              <Input label="Codigo de barras" name="barcode" placeholder="EAN/UPC" disabled={isLoading} />

              <div className="flex flex-col gap-2">
                <label className="ml-1 text-[0.86rem] font-bold text-slate-200">Lado da lente</label>
                <select name="side" defaultValue={LensSide.NOT_APPLICABLE} disabled={isLoading}>
                  <option value={LensSide.NOT_APPLICABLE}>Nao aplicavel / ambos</option>
                  <option value={LensSide.RIGHT}>Olho direito (OD)</option>
                  <option value={LensSide.LEFT}>Olho esquerdo (OE)</option>
                  <option value={LensSide.PAIR}>Par completo</option>
                </select>
              </div>
            </div>
          </FormSection>

          <FormSection
            icon={Ruler}
            title="Dioptria"
            description="Informe grau, eixo e adicao quando aplicavel."
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <Input label="Esferico (ESF)" name="sphere_esf" type="number" step="0.25" placeholder="0.00" disabled={isLoading} />
              <Input label="Cilindrico (CIL)" name="cylinder_cil" type="number" step="0.25" placeholder="0.00" disabled={isLoading} />
              <Input label="Eixo" name="axis" type="number" min="0" max="180" step="1" placeholder="0 - 180" disabled={isLoading} />
              <Input label="Adicao (ADD)" name="addition_add" type="number" step="0.25" min="0" placeholder="0.00" disabled={isLoading} />
            </div>
          </FormSection>

          <FormSection
            icon={Boxes}
            title="Estoque e localizacao"
            description="Controle disponibilidade imediata e ponto fisico de separacao."
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <Input
                label="Quantidade atual *"
                name="quantity_available"
                type="number"
                min="0"
                required
                defaultValue="0"
                disabled={isLoading}
              />
              <Input
                label="Estoque minimo"
                name="minimum_stock"
                type="number"
                min="0"
                defaultValue="0"
                disabled={isLoading}
              />
              <Input
                label="Localizacao fisica"
                name="location"
                placeholder="Ex: Corredor A, prateleira 2"
                disabled={isLoading}
              />
            </div>
          </FormSection>

          <FormActions>
            <Button type="button" variant="outline" disabled={isLoading} onClick={() => window.history.back()}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isLoading} rightIcon={<Save size={17} />}>
              Salvar SKU
            </Button>
          </FormActions>
        </form>
      </CardContent>
    </Card>
  );
}
