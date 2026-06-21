import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { UsersTable } from './UsersTable';
import { EntityStatus, UserRole } from '@/lib/types/enums';

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: users, error } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      email,
      role,
      status,
      created_at,
      lab:labs(name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
  }

  // Type assertion
  const typedUsers = (users || []).map(user => ({
    ...user,
    role: user.role as UserRole,
    status: user.status as EntityStatus,
    lab: Array.isArray(user.lab) ? user.lab[0] : user.lab
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-base)]">Usuários Globais</h2>
          <p className="text-[var(--color-text-muted)]">Lista completa de usuários registrados na plataforma.</p>
        </div>
        <Link href="/admin/users/new">
          <Button variant="primary">
            <Plus size={18} className="mr-2" />
            Novo Usuário
          </Button>
        </Link>
      </div>

      <UsersTable data={typedUsers} />
    </div>
  );
}
