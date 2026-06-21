import { createClient } from '@/lib/supabase/server';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { UserForm } from './UserForm';

export default async function NewUserPage() {
  const supabase = await createClient();

  // Buscar todos os laboratórios ativos para o seletor
  const { data: labs } = await supabase
    .from('labs')
    .select('id, name')
    .eq('status', 'active')
    .order('name');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="page-header flex items-start gap-4">
        <Link 
          href="/admin/users" 
          className="mt-1 p-2 rounded-full hover:bg-[var(--color-bg-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2>Novo Usuário Global</h2>
          <p>Crie contas para administradores de plataforma ou gerentes de laboratórios.</p>
        </div>
      </div>

      <UserForm labs={labs || []} />
    </div>
  );
}
