'use client';

import { useState } from 'react';
import { createLensTypeAction } from '@/actions/lens-types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { LensCategory, LensMaterial, RefractiveIndex, EntityStatus } from '@/lib/types/enums';

// Usaremos a constante que já foi solicitada (assumindo que existe ou será criada em constants, vamos criar localmente para o form)
const TREATMENTS = [
  { id: 'antirreflexo', label: 'Antirreflexo' },
  { id: 'blue_cut', label: 'Blue Cut / Proteção Azul' },
  { id: 'transitions', label: 'Transitions / Fotossensível' },
  { id: 'uv', label: 'Proteção UV' },
  { id: 'endurecimento', label: 'Endurecimento / Antirrisco' },
  { id: 'hidrofobico', label: 'Hidrofóbico' },
  { id: 'lipofobico', label: 'Lipofóbico' },
  { id: 'espelhado', label: 'Espelhado' },
];

export function LensTypeForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);

  const toggleTreatment = (id: string) => {
    setSelectedTreatments(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      brand: formData.get('brand') as string || undefined,
      model: formData.get('model') as string || undefined,
      category: formData.get('category') as LensCategory || undefined,
      material: formData.get('material') as LensMaterial || undefined,
      refractive_index: formData.get('refractive_index') as RefractiveIndex || undefined,
      treatments: selectedTreatments,
      allow_order_when_out_of_stock: formData.get('allow_order_when_out_of_stock') === 'on',
      default_delivery_time_in_stock_days: parseInt(formData.get('default_delivery_time_in_stock_days') as string) || undefined,
      default_production_time_out_of_stock_days: parseInt(formData.get('default_production_time_out_of_stock_days') as string) || undefined,
      description: formData.get('description') as string || undefined,
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
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {error && (
            <div className="bg-[var(--color-error-bg)] border border-[var(--color-error)] text-[var(--color-error)] px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Dados Principais */}
          <section>
            <h3 className="text-lg font-semibold text-[var(--color-text-base)] mb-4">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nome da Lente *"
                name="name"
                required
                placeholder="Ex: Visão Simples AR"
                disabled={isLoading}
              />
              <Input
                label="Marca"
                name="brand"
                placeholder="Ex: Zeiss, Essilor"
                disabled={isLoading}
              />
              <Input
                label="Modelo"
                name="model"
                placeholder="Ex: Crizal Forte"
                disabled={isLoading}
              />
              
              <div className="flex flex-col gap-1 w-full">
                <label className="text-sm font-medium text-[var(--color-text-base)]">
                  Categoria
                </label>
                <select
                  name="category"
                  disabled={isLoading}
                  className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-md px-3 py-2 text-base focus:border-[var(--color-primary)] outline-none"
                >
                  <option value="">Selecione...</option>
                  <option value={LensCategory.MONOFOCAL}>Monofocal (Visão Simples)</option>
                  <option value={LensCategory.BIFOCAL}>Bifocal</option>
                  <option value={LensCategory.MULTIFOCAL_PROGRESSIVA}>Multifocal / Progressiva</option>
                  <option value={LensCategory.OCUPACIONAL}>Ocupacional</option>
                  <option value={LensCategory.SOLAR_GRAU}>Solar com Grau</option>
                  <option value={LensCategory.TRATAMENTO_ESPECIAL}>Tratamento Especial</option>
                  <option value={LensCategory.OUTRO}>Outro</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 w-full">
                <label className="text-sm font-medium text-[var(--color-text-base)]">
                  Material
                </label>
                <select
                  name="material"
                  disabled={isLoading}
                  className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-md px-3 py-2 text-base focus:border-[var(--color-primary)] outline-none"
                >
                  <option value="">Selecione...</option>
                  <option value={LensMaterial.CR39}>CR-39 (Resina Comum)</option>
                  <option value={LensMaterial.POLICARBONATO}>Policarbonato</option>
                  <option value={LensMaterial.TRIVEX}>Trivex</option>
                  <option value={LensMaterial.RESINA}>Resina</option>
                  <option value={LensMaterial.ALTO_INDICE}>Alto Índice</option>
                  <option value={LensMaterial.MINERAL}>Mineral (Cristal)</option>
                  <option value={LensMaterial.OUTRO}>Outro</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 w-full">
                <label className="text-sm font-medium text-[var(--color-text-base)]">
                  Índice de Refração
                </label>
                <select
                  name="refractive_index"
                  disabled={isLoading}
                  className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-md px-3 py-2 text-base focus:border-[var(--color-primary)] outline-none"
                >
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
          </section>

          {/* Tratamentos (Multiselect) */}
          <section className="border-t border-[var(--color-border)] pt-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-base)] mb-4">Tratamentos Inclusos</h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">Selecione todos os tratamentos que já vêm aplicados nesta lente.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {TREATMENTS.map((treatment) => (
                <label 
                  key={treatment.id} 
                  className={`
                    flex items-center p-3 rounded-md border cursor-pointer transition-colors
                    ${selectedTreatments.includes(treatment.id) 
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' 
                      : 'border-[var(--color-border)] hover:bg-[var(--color-bg-surface-hover)]'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    className="mr-3 w-4 h-4 text-[var(--color-primary)] border-gray-300 rounded focus:ring-[var(--color-primary)]"
                    checked={selectedTreatments.includes(treatment.id)}
                    onChange={() => toggleTreatment(treatment.id)}
                    disabled={isLoading}
                  />
                  <span className="text-sm font-medium text-[var(--color-text-base)]">{treatment.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Produção e Estoque */}
          <section className="border-t border-[var(--color-border)] pt-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-base)] mb-4">Logística e Prazos</h3>
            
            <label className="flex items-center gap-3 mb-6 p-4 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface-hover)]">
              <input 
                type="checkbox" 
                name="allow_order_when_out_of_stock"
                defaultChecked={true}
                className="w-5 h-5 text-[var(--color-primary)]"
              />
              <div>
                <p className="font-medium text-[var(--color-text-base)]">Permitir pedidos sob encomenda</p>
                <p className="text-sm text-[var(--color-text-muted)]">As óticas podem pedir esta lente mesmo se não houver estoque a pronta entrega (Surfaçagem/Produção).</p>
              </div>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Prazo padrão com estoque (Dias)"
                name="default_delivery_time_in_stock_days"
                type="number"
                min="0"
                placeholder="Ex: 1"
                disabled={isLoading}
              />
              <Input
                label="Prazo padrão de produção/sem estoque (Dias)"
                name="default_production_time_out_of_stock_days"
                type="number"
                min="0"
                placeholder="Ex: 5"
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
              Salvar Catálogo
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
