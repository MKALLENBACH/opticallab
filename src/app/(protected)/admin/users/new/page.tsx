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
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/users" 
          className="p-2 rounded-full hover:bg-[var(--color-bg-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-base)]">Novo Usuário Global</h2>
          <p className="text-[var(--color-text-muted)]">Crie contas para administradores de plataforma ou gerentes de laboratórios.</p>
        </div>
      </div>

      <UserForm labs={labs || []} />
    </div>
  );
}
