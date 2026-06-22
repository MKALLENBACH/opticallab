'use client';

import { useState } from 'react';
import { Building2, Contact, MapPin, StickyNote } from 'lucide-react';
import { createOpticalStoreAction } from '@/actions/optical-stores';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EntityStatus } from '@/lib/types/enums';
import { FormActions, FormSection } from '@/components/ui/Premium';

export function OpticalStoreForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      document: (formData.get('document') as string) || undefined,
      responsible_name: (formData.get('responsible_name') as string) || undefined,
      email: (formData.get('email') as string) || undefined,
      phone: (formData.get('phone') as string) || undefined,
      address: (formData.get('address') as string) || undefined,
      city: (formData.get('city') as string) || undefined,
      state: (formData.get('state') as string) || undefined,
      zip_code: (formData.get('zip_code') as string) || undefined,
      notes: (formData.get('notes') as string) || undefined,
      status: EntityStatus.ACTIVE,
    };

    const result = await createOpticalStoreAction(data);

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
            <div className="rounded-2xl border border-red-400/25 bg-red-500/12 px-4 py-3 text-sm font-semibold text-red-200">
              {error}
            </div>
          )}

          <FormSection icon={Building2} title="Dados da otica" description="Identificacao comercial usada nas listagens e pedidos.">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Input label="Nome da otica *" name="name" required placeholder="Ex: Otica Visao" disabled={isLoading} />
              <Input label="CNPJ/CPF" name="document" placeholder="Somente numeros" disabled={isLoading} />
            </div>
          </FormSection>

          <FormSection icon={Contact} title="Responsavel e contato" description="Canais usados pelo laboratorio para confirmar pedidos.">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <Input label="Responsavel" name="responsible_name" placeholder="Ex: Carlos Almeida" disabled={isLoading} />
              <Input label="Email de contato" name="email" type="email" placeholder="contato@otica.com" disabled={isLoading} />
              <Input label="Telefone" name="phone" placeholder="(00) 00000-0000" disabled={isLoading} />
            </div>
          </FormSection>

          <FormSection icon={MapPin} title="Endereco" description="Informacoes de entrega e referencia operacional.">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-6">
              <div className="md:col-span-6">
                <Input label="Endereco" name="address" placeholder="Rua, numero, bairro" disabled={isLoading} />
              </div>
              <div className="md:col-span-3">
                <Input label="Cidade" name="city" placeholder="Ex: Sao Paulo" disabled={isLoading} />
              </div>
              <div className="md:col-span-1">
                <Input label="UF" name="state" placeholder="SP" maxLength={2} disabled={isLoading} />
              </div>
              <div className="md:col-span-2">
                <Input label="CEP" name="zip_code" placeholder="00000-000" disabled={isLoading} />
              </div>
            </div>
          </FormSection>

          <FormSection icon={StickyNote} title="Status e observacoes" description="Contexto interno para atendimento e auditoria.">
            <label className="flex flex-col gap-2">
              <span className="ml-1 text-[0.86rem] font-bold text-slate-200">Observacoes</span>
              <textarea name="notes" rows={4} placeholder="Observacoes comerciais, preferencias de contato ou instrucoes de entrega." disabled={isLoading} />
            </label>
          </FormSection>

          <FormActions>
            <Button type="button" variant="outline" disabled={isLoading} onClick={() => window.history.back()}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Salvar otica
            </Button>
          </FormActions>
        </form>
      </CardContent>
    </Card>
  );
}
