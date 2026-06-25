'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock3, FileText, Glasses, Layers3, Save } from 'lucide-react';
import { createLensTypeAction, updateLensTypeAction } from '@/actions/lens-types';
import { LabOptionMultiSelect, LabOptionSelect } from '@/components/ui/LabOptionSelect';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { FormActions, FormSection } from '@/components/ui/Premium';
import { type LabOption } from '@/lib/constants/lab-options';
import { EntityStatus } from '@/lib/types/enums';

interface LensTypeFormData {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  category: string | null;
  material: string | null;
  refractive_index: string | null;
  treatments: string[];
  allow_order_when_out_of_stock: boolean | null;
  default_delivery_time_in_stock_days: number | null;
  default_production_time_out_of_stock_days: number | null;
  description: string | null;
  status: EntityStatus;
}

interface LensTypeFormProps {
  optionGroups: {
    brand: LabOption[];
    lens_category: LabOption[];
    lens_material: LabOption[];
    refractive_index: LabOption[];
    lens_treatment: LabOption[];
  };
  initialData?: LensTypeFormData;
  mode?: 'create' | 'edit';
}

function optionalText(value: FormDataEntryValue | null) {
  const text = String(value || '').trim();
  return text || null;
}

function optionalInt(value: FormDataEntryValue | null) {
  const text = String(value || '').trim();
  if (!text) return null;
  const parsed = Number.parseInt(text, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function LensTypeForm({ optionGroups, initialData, mode = 'create' }: LensTypeFormProps) {
  const router = useRouter();
  const isEditing = mode === 'edit' && Boolean(initialData);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>(initialData?.treatments || []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const data = {
      name: String(formData.get('name') || '').trim(),
      brand: optionalText(formData.get('brand')),
      model: optionalText(formData.get('model')),
      category: optionalText(formData.get('category')),
      material: optionalText(formData.get('material')),
      refractive_index: optionalText(formData.get('refractive_index')),
      treatments: selectedTreatments,
      allow_order_when_out_of_stock: formData.get('allow_order_when_out_of_stock') === 'on',
      default_delivery_time_in_stock_days: optionalInt(formData.get('default_delivery_time_in_stock_days')),
      default_production_time_out_of_stock_days: optionalInt(formData.get('default_production_time_out_of_stock_days')),
      description: optionalText(formData.get('description')),
      status: (formData.get('status') as EntityStatus) || EntityStatus.ACTIVE,
    };

    const result = isEditing && initialData
      ? await updateLensTypeAction(initialData.id, data)
      : await createLensTypeAction(data);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    if (isEditing) {
      setMessage('Lente atualizada com sucesso.');
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
            title="Informacoes basicas"
            description="Defina a lente base antes de cadastrar variacoes de grau no estoque."
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Input
                label="Nome da lente *"
                name="name"
                required
                defaultValue={initialData?.name || ''}
                placeholder="Ex: Visao Simples AR"
                disabled={isLoading}
              />
              <LabOptionSelect
                label="Marca"
                name="brand"
                optionType="brand"
                options={optionGroups.brand}
                defaultValue={initialData?.brand || ''}
                disabled={isLoading}
                placeholder="Selecione ou cadastre..."
              />
              <Input label="Modelo" name="model" defaultValue={initialData?.model || ''} placeholder="Ex: Crizal Forte" disabled={isLoading} />

              <LabOptionSelect
                label="Categoria"
                name="category"
                optionType="lens_category"
                options={optionGroups.lens_category}
                defaultValue={initialData?.category || ''}
                disabled={isLoading}
              />

              <LabOptionSelect
                label="Material"
                name="material"
                optionType="lens_material"
                options={optionGroups.lens_material}
                defaultValue={initialData?.material || ''}
                disabled={isLoading}
              />

              <LabOptionSelect
                label="Indice de refracao"
                name="refractive_index"
                optionType="refractive_index"
                options={optionGroups.refractive_index}
                defaultValue={initialData?.refractive_index || ''}
                disabled={isLoading}
              />
            </div>
          </FormSection>

          <FormSection
            icon={Layers3}
            title="Tratamentos inclusos"
            description="Selecione todos os tratamentos que ja fazem parte desta lente."
          >
            <LabOptionMultiSelect
              optionType="lens_treatment"
              options={optionGroups.lens_treatment}
              selectedValues={selectedTreatments}
              onChange={setSelectedTreatments}
              disabled={isLoading}
            />
          </FormSection>

          <FormSection
            icon={Clock3}
            title="Logistica e prazos"
            description="Configure comportamento sem estoque, status e previsoes padrao."
          >
            <label className="mb-5 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
              <input
                type="checkbox"
                name="allow_order_when_out_of_stock"
                defaultChecked={initialData?.allow_order_when_out_of_stock ?? true}
                className="mt-1 h-4 w-4 accent-violet-400"
                disabled={isLoading}
              />
              <span>
                <span className="block font-bold text-white">Permitir pedidos sob encomenda</span>
                <span className="mt-1 block text-[0.86rem] font-medium text-slate-400">
                  Oticas podem solicitar a lente mesmo quando nao houver estoque imediato.
                </span>
              </span>
            </label>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <Input
                label="Prazo com estoque (dias)"
                name="default_delivery_time_in_stock_days"
                type="number"
                min="0"
                defaultValue={initialData?.default_delivery_time_in_stock_days ?? ''}
                placeholder="Ex: 1"
                disabled={isLoading}
              />
              <Input
                label="Prazo sem estoque/producao (dias)"
                name="default_production_time_out_of_stock_days"
                type="number"
                min="0"
                defaultValue={initialData?.default_production_time_out_of_stock_days ?? ''}
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

          <FormSection
            icon={FileText}
            title="Descricao"
            description="Observacoes comerciais ou tecnicas para consulta interna."
          >
            <textarea
              name="description"
              rows={4}
              defaultValue={initialData?.description || ''}
              className="w-full resize-y rounded-2xl border border-white/10 bg-slate-950/62 px-4 py-3 text-[0.95rem] font-medium text-white outline-none transition-all placeholder:text-slate-500 hover:border-white/20 focus:border-violet-300/60 focus:ring-2 focus:ring-violet-400/15"
              placeholder="Ex: Lente recomendada para uso diario com antirreflexo premium."
              disabled={isLoading}
            />
          </FormSection>

          <FormActions>
            <Button type="button" variant="outline" disabled={isLoading} onClick={() => window.history.back()}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isLoading} rightIcon={<Save size={17} />}>
              {isEditing ? 'Salvar alteracoes' : 'Salvar catalogo'}
            </Button>
          </FormActions>
        </form>
      </CardContent>
    </Card>
  );
}
