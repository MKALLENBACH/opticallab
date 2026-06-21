'use client';

import { useState } from 'react';
import { createOpticalStoreAction } from '@/actions/optical-stores';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

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
      document: formData.get('document') as string || undefined,
      responsible_name: formData.get('responsible_name') as string || undefined,
      email: formData.get('email') as string || undefined,
      phone: formData.get('phone') as string || undefined,
      address: formData.get('address') as string || undefined,
      city: formData.get('city') as string || undefined,
      state: formData.get('state') as string || undefined,
      zip_code: formData.get('zip_code') as string || undefined,
    };

    const result = await createOpticalStoreAction(data);
    
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && (
            <div className="bg-[var(--color-error-bg)] border border-[var(--color-error)] text-[var(--color-error)] px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nome da Ótica *"
              name="name"
              required
              placeholder="Ex: Ótica Visão"
              disabled={isLoading}
            />
            <Input
              label="CNPJ/CPF"
              name="document"
              placeholder="Somente números"
              disabled={isLoading}
            />
            <Input
              label="Nome do Responsável"
              name="responsible_name"
              placeholder="Ex: Carlos Almeida"
              disabled={isLoading}
            />
            <Input
              label="Email de Contato"
              name="email"
              type="email"
              placeholder="contato@otica.com"
              disabled={isLoading}
            />
            <Input
              label="Telefone"
              name="phone"
              placeholder="(00) 00000-0000"
              disabled={isLoading}
            />
            <div className="col-span-1 md:col-span-2">
              <Input
                label="Endereço"
                name="address"
                placeholder="Rua, Número, Bairro"
                disabled={isLoading}
              />
            </div>
            <Input
              label="Cidade"
              name="city"
              placeholder="Ex: São Paulo"
              disabled={isLoading}
            />
            <div className="flex gap-4">
              <Input
                label="Estado"
                name="state"
                placeholder="Ex: SP"
                maxLength={2}
                disabled={isLoading}
                className="w-1/3"
              />
              <Input
                label="CEP"
                name="zip_code"
                placeholder="00000-000"
                disabled={isLoading}
                className="w-2/3"
              />
            </div>
          </div>

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
              Salvar Ótica
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
