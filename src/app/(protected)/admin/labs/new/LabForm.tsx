'use client';

import { useState } from 'react';
import { createLabAction } from '@/actions/labs';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EntityStatus } from '@/lib/types/enums';

export function LabForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      email: formData.get('email') as string || undefined,
      phone: formData.get('phone') as string || undefined,
      status: EntityStatus.ACTIVE,
    };

    const result = await createLabAction(data);
    
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
              label="Nome do Laboratório *"
              name="name"
              required
              placeholder="Ex: Laboratório Master"
              disabled={isLoading}
            />
            <Input
              label="Slug (URL Amigável) *"
              name="slug"
              required
              placeholder="Ex: master-lab"
              helperText="Usado para identificar a URL do laboratório. Apenas minúsculas e hífen."
              disabled={isLoading}
              pattern="^[a-z0-9-]+$"
            />
            <Input
              label="Email de Contato"
              name="email"
              type="email"
              placeholder="contato@masterlab.com"
              disabled={isLoading}
            />
            <Input
              label="Telefone"
              name="phone"
              placeholder="(00) 00000-0000"
              disabled={isLoading}
            />
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
              Salvar Laboratório
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
