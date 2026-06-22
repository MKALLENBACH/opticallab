'use client';

import { useState } from 'react';
import { Building2, Mail, Save, ShieldCheck } from 'lucide-react';
import { updateLabAction } from '@/actions/labs';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { FormActions, FormSection } from '@/components/ui/Premium';
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(event.currentTarget);
    const data = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      email: (formData.get('email') as string) || undefined,
      phone: (formData.get('phone') as string) || undefined,
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
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="rounded-2xl border border-red-400/25 bg-red-500/12 px-4 py-3 text-[0.9rem] font-semibold text-red-100">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/12 px-4 py-3 text-[0.9rem] font-semibold text-emerald-100">
              Laboratorio atualizado com sucesso.
            </div>
          )}

          <FormSection
            icon={Building2}
            title="Dados do laboratorio"
            description="Atualize nome, slug e canais de contato."
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Input label="Nome do laboratorio *" name="name" required defaultValue={lab.name} disabled={isLoading} />
              <Input
                label="Slug (URL amigavel) *"
                name="slug"
                required
                defaultValue={lab.slug}
                pattern="^[a-z0-9-]+$"
                disabled={isLoading}
              />
              <Input
                label="Email de contato"
                name="email"
                type="email"
                defaultValue={lab.email || ''}
                leftIcon={<Mail size={16} />}
                disabled={isLoading}
              />
              <Input label="Telefone" name="phone" defaultValue={lab.phone || ''} disabled={isLoading} />
            </div>
          </FormSection>

          <FormSection
            icon={ShieldCheck}
            title="Status operacional"
            description="Controle se o laboratorio permanece ativo na plataforma."
          >
            <div className="flex flex-col gap-2 md:max-w-sm">
              <label className="ml-1 text-[0.86rem] font-bold text-slate-200">Status</label>
              <select name="status" defaultValue={lab.status} disabled={isLoading}>
                <option value={EntityStatus.ACTIVE}>Ativo</option>
                <option value={EntityStatus.INACTIVE}>Inativo</option>
                <option value={EntityStatus.SUSPENDED}>Suspenso</option>
              </select>
            </div>
          </FormSection>

          <FormActions>
            <Button type="submit" isLoading={isLoading} rightIcon={<Save size={17} />}>
              Salvar alteracoes
            </Button>
          </FormActions>
        </form>
      </CardContent>
    </Card>
  );
}
