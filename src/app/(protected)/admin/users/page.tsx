import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { UsersTable } from './UsersTable';
import { EntityStatus, UserRole } from '@/lib/types/enums';

export const metadata = { title: 'Usuários | LenteLink Admin' };

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

  const typedUsers = (users || []).map(user => ({
    ...user,
    role: user.role as UserRole,
    status: user.status as EntityStatus,
    lab: Array.isArray(user.lab) ? user.lab[0] : user.lab
  }));

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="page-header flex items-start justify-between gap-4">
        <div>
          <h2>Usuários Globais</h2>
          <p>Lista completa de usuários registrados na plataforma.</p>
        </div>
        <Link href="/admin/users/new">
          <Button
            variant="primary"
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            }
          >
            Novo Usuário
          </Button>
        </Link>
      </div>

      <Card className="overflow-hidden">
        <UsersTable data={typedUsers} />
      </Card>
    </div>
  );
}
