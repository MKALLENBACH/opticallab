'use client';

import { useState } from 'react';
import { Clock3, FileText, Glasses, Layers3, Save } from 'lucide-react';
import { createLensTypeAction } from '@/actions/lens-types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { FormActions, FormSection } from '@/components/ui/Premium';
import { AVAILABLE_TREATMENTS } from '@/lib/constants/treatments';
import { EntityStatus, LensCategory, LensMaterial, RefractiveIndex } from '@/lib/types/enums';

export function LensTypeForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);

  const toggleTreatment = (id: string) => {
    setSelectedTreatments((current) =>
      current.includes(id) ? current.filter((treatment) => treatment !== id) : [...current, id]
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const data = {
      name: formData.get('name') as string,
      brand: (formData.get('brand') as string) || undefined,
      model: (formData.get('model') as string) || undefined,
      category: (formData.get('category') as LensCategory) || undefined,
      material: (formData.get('material') as LensMaterial) || undefined,
      refractive_index: (formData.get('refractive_index') as RefractiveIndex) || undefined,
      treatments: selectedTreatments,
      allow_order_when_out_of_stock: formData.get('allow_order_when_out_of_stock') === 'on',
      default_delivery_time_in_stock_days: parseInt(formData.get('default_delivery_time_in_stock_days') as string) || undefined,
      default_production_time_out_of_stock_days: parseInt(formData.get('default_production_time_out_of_stock_days') as string) || undefined,
      description: (formData.get('description') as string) || undefined,
      status: EntityStatus.ACTIVE,
    };

    const result = await createLensTypeAction(data);

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
            title="Informacoes basicas"
            description="Defina a lente base antes de cadastrar variacoes de grau no estoque."
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Input label="Nome da lente *" name="name" required placeholder="Ex: Visao Simples AR" disabled={isLoading} />
              <Input label="Marca" name="brand" placeholder="Ex: Zeiss, Essilor" disabled={isLoading} />
              <Input label="Modelo" name="model" placeholder="Ex: Crizal Forte" disabled={isLoading} />

              <div className="flex flex-col gap-2">
                <label className="ml-1 text-[0.86rem] font-bold text-slate-200">Categoria</label>
                <select name="category" disabled={isLoading}>
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
                <select name="material" disabled={isLoading}>
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
                <select name="refractive_index" disabled={isLoading}>
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {AVAILABLE_TREATMENTS.map((treatment) => (
                <label
                  key={treatment.value}
                  className={`
                    flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border px-4 text-[0.88rem] font-bold transition-all
                    ${selectedTreatments.includes(treatment.value)
                      ? 'border-violet-300/40 bg-violet-500/16 text-white shadow-[0_0_26px_rgba(139,92,246,0.14)]'
                      : 'border-white/10 bg-white/[0.025] text-slate-300 hover:border-white/20 hover:bg-white/[0.045]'}
                  `}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-violet-400"
                    checked={selectedTreatments.includes(treatment.value)}
                    onChange={() => toggleTreatment(treatment.value)}
                    disabled={isLoading}
                  />
                  <span>{treatment.label}</span>
                </label>
              ))}
            </div>
          </FormSection>

          <FormSection
            icon={Clock3}
            title="Logistica e prazos"
            description="Configure comportamento sem estoque e previsoes padrao."
          >
            <label className="mb-5 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
              <input
                type="checkbox"
                name="allow_order_when_out_of_stock"
                defaultChecked
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

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Input
                label="Prazo com estoque (dias)"
                name="default_delivery_time_in_stock_days"
                type="number"
                min="0"
                placeholder="Ex: 1"
                disabled={isLoading}
              />
              <Input
                label="Prazo sem estoque/producao (dias)"
                name="default_production_time_out_of_stock_days"
                type="number"
                min="0"
                placeholder="Ex: 5"
                disabled={isLoading}
              />
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
              Salvar catalogo
            </Button>
          </FormActions>
        </form>
      </CardContent>
    </Card>
  );
}
