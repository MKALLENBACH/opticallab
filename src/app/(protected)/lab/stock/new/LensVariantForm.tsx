'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Barcode, Boxes, Clock3, Glasses, Ruler, Save } from 'lucide-react';
import { createLensVariantAction, updateLensVariantAction } from '@/actions/lens-variants';
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

interface LensVariantFormData {
  id: string;
  lens_type_id: string;
  sku: string;
  barcode: string | null;
  sphere_esf: number | null;
  cylinder_cil: number | null;
  axis: number | null;
  addition_add: number | null;
  side: LensSide | null;
  quantity_available: number;
  minimum_stock: number | null;
  location: string | null;
  delivery_time_in_stock_days: number | null;
  production_time_out_of_stock_days: number | null;
  status: EntityStatus;
}

interface LensVariantFormProps {
  lensTypes: LensTypeOption[];
  initialData?: LensVariantFormData;
  mode?: 'create' | 'edit';
}

function optionalText(value: FormDataEntryValue | null) {
  const text = String(value || '').trim();
  return text || null;
}

function optionalDecimal(value: FormDataEntryValue | null) {
  const text = String(value || '').trim().replace(',', '.');
  if (!text) return null;
  const parsed = Number.parseFloat(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function optionalInt(value: FormDataEntryValue | null) {
  const text = String(value || '').trim();
  if (!text) return null;
  const parsed = Number.parseInt(text, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function requiredInt(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = optionalInt(value);
  return parsed ?? fallback;
}

function decimalValue(value: number | null | undefined) {
  return value === null || value === undefined ? '' : Number(value).toFixed(2);
}

export function LensVariantForm({ lensTypes, initialData, mode = 'create' }: LensVariantFormProps) {
  const router = useRouter();
  const isEditing = mode === 'edit' && Boolean(initialData);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const data = {
      lens_type_id: String(formData.get('lens_type_id') || ''),
      sku: String(formData.get('sku') || '').trim(),
      sphere_esf: optionalDecimal(formData.get('sphere_esf')),
      cylinder_cil: optionalDecimal(formData.get('cylinder_cil')),
      addition_add: optionalDecimal(formData.get('addition_add')),
      axis: optionalInt(formData.get('axis')),
      side: (formData.get('side') as LensSide) || LensSide.NOT_APPLICABLE,
      quantity_available: requiredInt(formData.get('quantity_available')),
      minimum_stock: optionalInt(formData.get('minimum_stock')),
      location: optionalText(formData.get('location')),
      delivery_time_in_stock_days: optionalInt(formData.get('delivery_time_in_stock_days')),
      production_time_out_of_stock_days: optionalInt(formData.get('production_time_out_of_stock_days')),
      barcode: optionalText(formData.get('barcode')),
      status: (formData.get('status') as EntityStatus) || EntityStatus.ACTIVE,
    };

    const result = isEditing && initialData
      ? await updateLensVariantAction(initialData.id, data)
      : await createLensVariantAction(data);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    if (isEditing) {
      setMessage('SKU atualizado com sucesso.');
      setIsLoading(false);
      router.refresh();
    }
  };

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {(error || message) && (
            <div className={`rounded-2xl border px-4 py-3 text-[0.9rem] font-semibold ${error ? 'border-red-400/25 bg-red-500/12 text-red-100' : 'border-emerald-400/25 bg-emerald-500/12 text-emerald-100'}`}>
              {error || message}
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
                <select name="lens_type_id" required defaultValue={initialData?.lens_type_id || ''} disabled={isLoading}>
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
                defaultValue={initialData?.sku || ''}
                placeholder="Ex: VS-AR-001"
                helperText="Deve ser unico dentro do laboratorio."
                leftIcon={<Barcode size={16} />}
                disabled={isLoading}
              />

              <Input label="Codigo de barras" name="barcode" defaultValue={initialData?.barcode || ''} placeholder="EAN/UPC" disabled={isLoading} />

              <div className="flex flex-col gap-2">
                <label className="ml-1 text-[0.86rem] font-bold text-slate-200">Lado da lente</label>
                <select name="side" defaultValue={initialData?.side || LensSide.NOT_APPLICABLE} disabled={isLoading}>
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
            description="Informe grau, eixo e adicao quando aplicavel. Aceita ponto ou virgula decimal."
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <Input label="Esferico (ESF)" name="sphere_esf" inputMode="decimal" defaultValue={decimalValue(initialData?.sphere_esf)} placeholder="0.00" disabled={isLoading} />
              <Input label="Cilindrico (CIL)" name="cylinder_cil" inputMode="decimal" defaultValue={decimalValue(initialData?.cylinder_cil)} placeholder="0.00" disabled={isLoading} />
              <Input label="Eixo" name="axis" type="number" min="0" max="180" step="1" defaultValue={initialData?.axis ?? ''} placeholder="0 - 180" disabled={isLoading} />
              <Input label="Adicao (ADD)" name="addition_add" inputMode="decimal" defaultValue={decimalValue(initialData?.addition_add)} placeholder="0.00" disabled={isLoading} />
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
                defaultValue={initialData?.quantity_available ?? 0}
                disabled={isLoading}
              />
              <Input
                label="Estoque minimo"
                name="minimum_stock"
                type="number"
                min="0"
                defaultValue={initialData?.minimum_stock ?? 0}
                disabled={isLoading}
              />
              <Input
                label="Localizacao fisica"
                name="location"
                defaultValue={initialData?.location || ''}
                placeholder="Ex: Corredor A, prateleira 2"
                disabled={isLoading}
              />
            </div>
          </FormSection>

          <FormSection
            icon={Clock3}
            title="Prazos e status"
            description="Ajuste a promessa de entrega para pronta entrega ou producao."
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <Input
                label="Prazo com estoque (dias)"
                name="delivery_time_in_stock_days"
                type="number"
                min="0"
                defaultValue={initialData?.delivery_time_in_stock_days ?? ''}
                placeholder="Ex: 1"
                disabled={isLoading}
              />
              <Input
                label="Prazo de producao (dias)"
                name="production_time_out_of_stock_days"
                type="number"
                min="0"
                defaultValue={initialData?.production_time_out_of_stock_days ?? ''}
                placeholder="Ex: 5"
                disabled={isLoading}
              />
              <div className="flex flex-col gap-2">
                <label className="ml-1 text-[0.86rem] font-bold text-slate-200">Status</label>
                <select name="status" defaultValue={initialData?.status || EntityStatus.ACTIVE} disabled={isLoading}>
                  <option value={EntityStatus.ACTIVE}>Ativo</option>
                  <option value={EntityStatus.INACTIVE}>Inativo</option>
                  <option value={EntityStatus.SUSPENDED}>Suspenso</option>
                </select>
              </div>
            </div>
          </FormSection>

          <FormActions>
            <Button type="button" variant="outline" disabled={isLoading} onClick={() => window.history.back()}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isLoading} rightIcon={<Save size={17} />}>
              {isEditing ? 'Salvar alteracoes' : 'Salvar SKU'}
            </Button>
          </FormActions>
        </form>
      </CardContent>
    </Card>
  );
}
