'use client';

import { useState } from 'react';
import { Mail, Save, ShieldCheck, UserRound } from 'lucide-react';
import { createUserAction } from '@/actions/users';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { FormActions, FormSection } from '@/components/ui/Premium';
import { EntityStatus, UserRole } from '@/lib/types/enums';

interface LabOption {
  id: string;
  name: string;
}

export function UserForm({ labs }: { labs: LabOption[] }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.LAB_ADMIN);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(event.currentTarget);
    const role = formData.get('role') as UserRole;
    const needsLabId = role === UserRole.LAB_ADMIN || role === UserRole.LAB_USER;
    const labIdStr = formData.get('lab_id') as string;
    const lab_id = labIdStr ? labIdStr : null;

    if (needsLabId && !lab_id) {
      setError('Selecione um laboratorio para este perfil.');
      setIsLoading(false);
      return;
    }

    const data = {
      full_name: formData.get('full_name') as string,
      email: formData.get('email') as string,
      phone: (formData.get('phone') as string) || null,
      role,
      status: formData.get('status') as EntityStatus,
      lab_id,
      optical_store_id: null,
    };

    const result = await createUserAction(data);

    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccess(true);
      event.currentTarget.reset();
      setSelectedRole(UserRole.LAB_ADMIN);
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
              Usuario criado com sucesso. Senha temporaria do MVP: <code className="font-mono">Mudar123@</code>
            </div>
          )}

          <FormSection
            icon={UserRound}
            title="Identificacao"
            description="Dados pessoais e canal de contato do usuario."
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Input
                label="Nome completo *"
                name="full_name"
                required
                placeholder="Ex: Joao da Silva"
                disabled={isLoading}
              />
              <Input
                label="Email *"
                name="email"
                type="email"
                required
                placeholder="usuario@exemplo.com"
                leftIcon={<Mail size={16} />}
                disabled={isLoading}
              />
              <Input
                label="Telefone"
                name="phone"
                placeholder="(00) 00000-0000"
                disabled={isLoading}
              />
            </div>
          </FormSection>

          <FormSection
            icon={ShieldCheck}
            title="Acesso e vinculo"
            description="Defina role, status e o laboratorio responsavel quando aplicavel."
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="ml-1 text-[0.86rem] font-bold text-slate-200">Perfil de acesso *</label>
                <select
                  name="role"
                  required
                  value={selectedRole}
                  onChange={(event) => setSelectedRole(event.target.value as UserRole)}
                  disabled={isLoading}
                >
                  <option value={UserRole.LAB_ADMIN}>Admin Laboratorio</option>
                  <option value={UserRole.LAB_USER}>Usuario Laboratorio</option>
                  <option value={UserRole.PLATFORM_ADMIN}>Admin Global</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="ml-1 text-[0.86rem] font-bold text-slate-200">Status</label>
                <select name="status" defaultValue={EntityStatus.ACTIVE} disabled={isLoading}>
                  <option value={EntityStatus.ACTIVE}>Ativo</option>
                  <option value={EntityStatus.INACTIVE}>Inativo</option>
                </select>
              </div>

              {(selectedRole === UserRole.LAB_ADMIN || selectedRole === UserRole.LAB_USER) && (
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="ml-1 text-[0.86rem] font-bold text-slate-200">Laboratorio vinculado *</label>
                  <select name="lab_id" required disabled={isLoading}>
                    <option value="">Selecione um laboratorio...</option>
                    {labs.map((lab) => (
                      <option key={lab.id} value={lab.id}>{lab.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </FormSection>

          <FormActions>
            <Button type="button" variant="outline" disabled={isLoading} onClick={() => window.history.back()}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isLoading} rightIcon={<Save size={17} />}>
              Criar usuario
            </Button>
          </FormActions>
        </form>
      </CardContent>
    </Card>
  );
}
