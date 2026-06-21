'use client';

import { useState } from 'react';
import { updateLabAction } from '@/actions/labs';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EntityStatus } from '@/lib/types/enums';

interface EditLabFormProps {
  lab: {
    id: string;
    name: string;
    slug: string;
    email: string | null;
    phone: string | null;
    status: EntityStatus;
  };
}

export function EditLabForm({ lab }: EditLabFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      email: formData.get('email') as string || undefined,
      phone: formData.get('phone') as string || undefined,
      status: formData.get('status') as EntityStatus,
    };

    const result = await updateLabAction(lab.id, data);
    
    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccess(true);
    }
    
    setIsLoading(false);
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
          
          {success && (
            <div className="bg-[var(--color-success-bg)] border border-[var(--color-success)] text-[var(--color-success)] px-4 py-3 rounded-md text-sm">
              Laboratório atualizado com sucesso!
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nome do Laboratório *"
              name="name"
              required
              defaultValue={lab.name}
              disabled={isLoading}
            />
            <Input
              label="Slug (URL Amigável) *"
              name="slug"
              required
              defaultValue={lab.slug}
              pattern="^[a-z0-9-]+$"
              disabled={isLoading}
            />
            <Input
              label="Email de Contato"
              name="email"
              type="email"
              defaultValue={lab.email || ''}
              disabled={isLoading}
            />
            <Input
              label="Telefone"
              name="phone"
              defaultValue={lab.phone || ''}
              disabled={isLoading}
            />
            <div className="flex flex-col gap-1 w-full">
              <label className="text-sm font-medium text-[var(--color-text-base)]">
                Status
              </label>
              <select
                name="status"
                defaultValue={lab.status}
                disabled={isLoading}
                className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-md px-3 py-2 text-base focus:border-[var(--color-primary)] outline-none"
              >
                <option value={EntityStatus.ACTIVE}>Ativo</option>
                <option value={EntityStatus.INACTIVE}>Inativo</option>
                <option value={EntityStatus.SUSPENDED}>Suspenso</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 border-t border-[var(--color-border)] pt-4">
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Salvar Alterações
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
