'use client';

import { useState } from 'react';
import { Building2, Mail, Phone, Save } from 'lucide-react';
import { createLabAction } from '@/actions/labs';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { FormActions, FormSection } from '@/components/ui/Premium';
import { EntityStatus } from '@/lib/types/enums';

export function LabForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const data = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      email: (formData.get('email') as string) || undefined,
      phone: (formData.get('phone') as string) || undefined,
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
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="rounded-2xl border border-red-400/25 bg-red-500/12 px-4 py-3 text-[0.9rem] font-semibold text-red-100">
              {error}
            </div>
          )}

          <FormSection
            icon={Building2}
            title="Dados do laboratorio"
            description="Identifique o tenant e a URL amigavel usada internamente."
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Input
                label="Nome do laboratorio *"
                name="name"
                required
                placeholder="Ex: LenteLab Master"
                disabled={isLoading}
              />
              <Input
                label="Slug (URL amigavel) *"
                name="slug"
                required
                placeholder="Ex: lentelab-master"
                helperText="Use apenas minusculas, numeros e hifen."
                disabled={isLoading}
                pattern="^[a-z0-9-]+$"
              />
            </div>
          </FormSection>

          <FormSection
            icon={Mail}
            title="Contato"
            description="Dados basicos usados para relacionamento e suporte."
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Input
                label="Email de contato"
                name="email"
                type="email"
                placeholder="contato@lentelab.com"
                leftIcon={<Mail size={16} />}
                disabled={isLoading}
              />
              <Input
                label="Telefone"
                name="phone"
                placeholder="(00) 00000-0000"
                leftIcon={<Phone size={16} />}
                disabled={isLoading}
              />
            </div>
          </FormSection>

          <FormActions>
            <Button type="button" variant="outline" disabled={isLoading} onClick={() => window.history.back()}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isLoading} rightIcon={<Save size={17} />}>
              Salvar laboratorio
            </Button>
          </FormActions>
        </form>
      </CardContent>
    </Card>
  );
}
