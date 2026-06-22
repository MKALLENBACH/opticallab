'use client';

import { useState } from 'react';
import { createUserAction } from '@/actions/users';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { UserRole, EntityStatus } from '@/lib/types/enums';

interface LabOption {
  id: string;
  name: string;
}

export function UserForm({ labs }: { labs: LabOption[] }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.LAB_ADMIN);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const role = formData.get('role') as UserRole;
    
    // Validar se lab_id é necessário e foi fornecido
    const needsLabId = role === UserRole.LAB_ADMIN || role === UserRole.LAB_USER;
    const labIdStr = formData.get('lab_id') as string;
    const lab_id = labIdStr ? labIdStr : null;

    if (needsLabId && !lab_id) {
      setError('Por favor, selecione um laboratório para este perfil.');
      setIsLoading(false);
      return;
    }

    const data = {
      full_name: formData.get('full_name') as string,
      email: formData.get('email') as string,
      phone: (formData.get('phone') as string) || null,
      role: role,
      status: formData.get('status') as EntityStatus,
      lab_id: lab_id,
      optical_store_id: null, // Para admin global criamos primeiro os usuários de lab, óticas via lab admin
    };

    const result = await createUserAction(data);
    
    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccess(true);
      (e.target as HTMLFormElement).reset(); // Limpa o formulário
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
              Usuário criado com sucesso! Uma senha temporária foi enviada ou pode ser definida. (Para MVP: use <code>Mudar123@</code>)
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nome Completo *"
              name="full_name"
              required
              placeholder="Ex: João da Silva"
              disabled={isLoading}
            />
            <Input
              label="Email *"
              name="email"
              type="email"
              required
              placeholder="joao@exemplo.com"
              disabled={isLoading}
            />
            
            <div className="flex flex-col gap-1 w-full">
              <label className="text-sm font-medium text-[var(--color-text-base)]">
                Perfil de Acesso *
              </label>
              <select
                name="role"
                required
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                disabled={isLoading}
                className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-md px-3 py-2 text-base focus:border-[var(--color-primary)] outline-none"
              >
                <option value={UserRole.LAB_ADMIN}>Admin Laboratório</option>
                <option value={UserRole.LAB_USER}>Usuário Laboratório</option>
                <option value={UserRole.PLATFORM_ADMIN}>Admin Global (Perigoso)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 w-full">
              <label className="text-sm font-medium text-[var(--color-text-base)]">
                Status
              </label>
              <select
                name="status"
                defaultValue={EntityStatus.ACTIVE}
                disabled={isLoading}
                className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-md px-3 py-2 text-base focus:border-[var(--color-primary)] outline-none"
              >
                <option value={EntityStatus.ACTIVE}>Ativo</option>
                <option value={EntityStatus.INACTIVE}>Inativo</option>
              </select>
            </div>

            {/* Renderizar seleção de Lab apenas se aplicável */}
            {(selectedRole === UserRole.LAB_ADMIN || selectedRole === UserRole.LAB_USER) && (
              <div className="flex flex-col gap-1 w-full">
                <label className="text-sm font-medium text-[var(--color-text-base)]">
                  Laboratório Vinculado *
                </label>
                <select
                  name="lab_id"
                  required
                  disabled={isLoading}
                  className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-md px-3 py-2 text-base focus:border-[var(--color-primary)] outline-none"
                >
                  <option value="">Selecione um laboratório...</option>
                  {labs.map(lab => (
                    <option key={lab.id} value={lab.id}>{lab.name}</option>
                  ))}
                </select>
              </div>
            )}
            
            <Input
              label="Telefone (Opcional)"
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
              Criar Usuário
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
