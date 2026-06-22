import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/Premium';
import { UserForm } from './UserForm';

export default async function NewUserPage() {
  const supabase = await createClient();

  const { data: labs } = await supabase
    .from('labs')
    .select('id, name')
    .eq('status', 'active')
    .order('name');

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        backHref="/admin/users"
        eyebrow="Admin Global"
        title="Novo usuario"
        description="Defina acesso inicial, role e vinculo operacional com laboratorio ou otica."
      />

      <UserForm labs={labs || []} />
    </div>
  );
}
