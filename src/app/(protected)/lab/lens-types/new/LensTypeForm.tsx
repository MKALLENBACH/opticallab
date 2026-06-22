'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock3, FileText, Glasses, Layers3, Plus, Save, X } from 'lucide-react';
import { createLensTypeAction, updateLensTypeAction } from '@/actions/lens-types';
import { createLensTreatmentOption } from '@/actions/lens-treatment-options';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ChipSelector, OptionChip } from '@/components/ui/OptionChip';
import { FormActions, FormSection } from '@/components/ui/Premium';
import {
  mergeTreatmentOptions,
  normalizeTreatmentName,
  OTHER_TREATMENT_OPTION,
  type TreatmentOption,
} from '@/lib/constants/treatments';
import { EntityStatus, LensCategory, LensMaterial, RefractiveIndex } from '@/lib/types/enums';

interface LensTypeFormData {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  category: LensCategory | null;
  material: LensMaterial | null;
  refractive_index: RefractiveIndex | null;
  treatments: string[];
  allow_order_when_out_of_stock: boolean | null;
  default_delivery_time_in_stock_days: number | null;
  default_production_time_out_of_stock_days: number | null;
  description: string | null;
  status: EntityStatus;
}

interface LensTypeFormProps {
  treatmentOptions: TreatmentOption[];
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

export function LensTypeForm({ treatmentOptions, initialData, mode = 'create' }: LensTypeFormProps) {
  const router = useRouter();
  const isEditing = mode === 'edit' && Boolean(initialData);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingTreatment, setIsCreatingTreatment] = useState(false);
  const [isAddingCustomTreatment, setIsAddingCustomTreatment] = useState(false);
  const [newTreatmentName, setNewTreatmentName] = useState('');
  const [treatmentError, setTreatmentError] = useState<string | null>(null);
  const [treatmentMessage, setTreatmentMessage] = useState<string | null>(null);
  const [availableTreatmentOptions, setAvailableTreatmentOptions] = useState<TreatmentOption[]>(
    mergeTreatmentOptions(treatmentOptions)
  );
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>(initialData?.treatments || []);

  const toggleTreatment = (id: string) => {
    setSelectedTreatments((current) =>
      current.includes(id) ? current.filter((treatment) => treatment !== id) : [...current, id]
    );
  };

  const addTreatmentOption = (option: TreatmentOption) => {
    setAvailableTreatmentOptions((current) => mergeTreatmentOptions([...current, option]));
    setSelectedTreatments((current) => (
      current.some((value) => normalizeTreatmentName(value) === normalizeTreatmentName(option.value))
        ? current
        : [...current, option.value]
    ));
  };

  const handleAddCustomTreatment = async () => {
    setTreatmentError(null);
    setTreatmentMessage(null);

    if (!newTreatmentName.trim()) {
      setTreatmentError('Informe o nome do tratamento.');
      return;
    }

    setIsCreatingTreatment(true);
    const result = await createLensTreatmentOption(newTreatmentName);
    setIsCreatingTreatment(false);

    if (result.error || !result.option) {
      setTreatmentError(result.error || 'Nao foi possivel adicionar o tratamento.');
      return;
    }

    addTreatmentOption({
      value: result.option.value,
      label: result.option.label,
      isDefault: false,
    });
    setNewTreatmentName('');
    setIsAddingCustomTreatment(false);
    setTreatmentMessage(result.option.message);
  };

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
      category: (formData.get('category') as LensCategory) || null,
      material: (formData.get('material') as LensMaterial) || null,
      refractive_index: (formData.get('refractive_index') as RefractiveIndex) || null,
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
              <Input label="Marca" name="brand" defaultValue={initialData?.brand || ''} placeholder="Ex: Zeiss, Essilor" disabled={isLoading} />
              <Input label="Modelo" name="model" defaultValue={initialData?.model || ''} placeholder="Ex: Crizal Forte" disabled={isLoading} />

              <div className="flex flex-col gap-2">
                <label className="ml-1 text-[0.86rem] font-bold text-slate-200">Categoria</label>
                <select name="category" defaultValue={initialData?.category || ''} disabled={isLoading}>
                  <option value="">Selecione...</option>
                  <option value={LensCategory.MONOFOCAL}>Monofocal</option>
                  <option value={LensCategory.BIFOCAL}>Bifocal</option>
                  <option value={LensCategory.MULTIFOCAL_PROGRESSIVA}>Multifocal / Progressiva</option>
                  <option value={LensCategory.OCUPACIONAL}>Ocupacional</option>
                  <option value={LensCategory.SOLAR_GRAU}>Solar com grau</option>
                  <option value={LensCategory.TRATAMENTO_ESPECIAL}>Tratamento especial</option>
                  <option value={LensCategory.OUTRO}>Outro</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="ml-1 text-[0.86rem] font-bold text-slate-200">Material</label>
                <select name="material" defaultValue={initialData?.material || ''} disabled={isLoading}>
                  <option value="">Selecione...</option>
                  <option value={LensMaterial.CR39}>CR-39</option>
                  <option value={LensMaterial.POLICARBONATO}>Policarbonato</option>
                  <option value={LensMaterial.TRIVEX}>Trivex</option>
                  <option value={LensMaterial.RESINA}>Resina</option>
                  <option value={LensMaterial.ALTO_INDICE}>Alto indice</option>
                  <option value={LensMaterial.MINERAL}>Mineral</option>
                  <option value={LensMaterial.OUTRO}>Outro</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="ml-1 text-[0.86rem] font-bold text-slate-200">Indice de refracao</label>
                <select name="refractive_index" defaultValue={initialData?.refractive_index || ''} disabled={isLoading}>
                  <option value="">Selecione...</option>
                  <option value={RefractiveIndex.R_1_49}>1.49</option>
                  <option value={RefractiveIndex.R_1_56}>1.56</option>
                  <option value={RefractiveIndex.R_1_59}>1.59</option>
                  <option value={RefractiveIndex.R_1_60}>1.60</option>
                  <option value={RefractiveIndex.R_1_67}>1.67</option>
                  <option value={RefractiveIndex.R_1_74}>1.74</option>
                  <option value={RefractiveIndex.OUTRO}>Outro</option>
                </select>
              </div>
            </div>
          </FormSection>

          <FormSection
            icon={Layers3}
            title="Tratamentos inclusos"
            description="Selecione todos os tratamentos que ja fazem parte desta lente."
          >
            <div className="flex flex-wrap gap-2.5">
              <ChipSelector
                options={availableTreatmentOptions}
                selectedValues={selectedTreatments}
                onToggle={toggleTreatment}
                disabled={isLoading || isCreatingTreatment}
              />
              <OptionChip
                value={OTHER_TREATMENT_OPTION.value}
                selected={isAddingCustomTreatment}
                disabled={isLoading || isCreatingTreatment}
                onClick={() => {
                  setIsAddingCustomTreatment((current) => !current);
                  setTreatmentError(null);
                  setTreatmentMessage(null);
                }}
              >
                {OTHER_TREATMENT_OPTION.label}
              </OptionChip>
            </div>

            {isAddingCustomTreatment && (
              <div className="mt-4 rounded-2xl border border-violet-300/18 bg-violet-500/[0.055] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-end">
                  <Input
                    label="Nome do novo tratamento"
                    value={newTreatmentName}
                    onChange={(event) => setNewTreatmentName(event.target.value)}
                    placeholder="Ex: Antirrisco premium"
                    disabled={isCreatingTreatment}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isCreatingTreatment}
                    onClick={() => {
                      setIsAddingCustomTreatment(false);
                      setNewTreatmentName('');
                      setTreatmentError(null);
                    }}
                    leftIcon={<X size={16} />}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    isLoading={isCreatingTreatment}
                    onClick={handleAddCustomTreatment}
                    leftIcon={<Plus size={16} />}
                  >
                    Adicionar tratamento
                  </Button>
                </div>
              </div>
            )}

            {(treatmentError || treatmentMessage) && (
              <div className={`mt-3 rounded-2xl border px-4 py-3 text-[0.88rem] font-semibold ${treatmentError ? 'border-red-400/25 bg-red-500/12 text-red-100' : 'border-emerald-400/25 bg-emerald-500/12 text-emerald-100'}`}>
                {treatmentError || treatmentMessage}
              </div>
            )}
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
