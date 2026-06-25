import { createClient } from '@/lib/supabase/server';
import { UsersTable } from './UsersTable';
import { EntityStatus, UserRole } from '@/lib/types/enums';
import { HeaderAction, PageHeader, SectionCard } from '@/components/ui/Premium';
import { Plus, Users } from 'lucide-react';
import { PaginationControls, paginationRange } from '@/components/ui/PaginationControls';

export const metadata = { title: 'Usuarios | LenteLink Admin' };

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const supabase = await createClient();
  const params = await searchParams;
  const pagination = paginationRange(Number(params.page || 1), 10);

  const { data: users, error, count } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      email,
      role,
      status,
      created_at,
      lab:labs(name),
      optical_store:optical_stores(name)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(pagination.from, pagination.to);

  if (error) {
    console.error('Error fetching users:', error);
  }

  const typedUsers = (users || []).map((user) => ({
    ...user,
    role: user.role as UserRole,
    status: user.status as EntityStatus,
    lab: Array.isArray(user.lab) ? user.lab[0] : user.lab,
    optical_store: Array.isArray(user.optical_store) ? user.optical_store[0] : user.optical_store,
  }));

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        eyebrow="Admin Global"
        title="Usuarios"
        description="Controle acessos, roles e vinculos com laboratorios ou oticas."
        actions={<HeaderAction href="/admin/users/new" icon={<Plus size={17} />}>Novo usuario</HeaderAction>}
      />

      <SectionCard
        icon={Users}
        title="Usuarios da plataforma"
        description="Filtre por nome, email, role, laboratorio ou status."
        contentClassName="p-0"
      >
        <UsersTable data={typedUsers} />
        <PaginationControls page={pagination.page} pageSize={pagination.pageSize} total={count || 0} pathname="/admin/users" />
      </SectionCard>
    </div>
  );
}
