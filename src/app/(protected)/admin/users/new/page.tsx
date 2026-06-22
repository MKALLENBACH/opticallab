import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/Premium';
import { UserForm } from './UserForm';

function relationName(relation: unknown): string | null {
  const value = Array.isArray(relation) ? relation[0] : relation;
  if (!value || typeof value !== 'object' || !('name' in value)) return null;
  const name = (value as { name?: unknown }).name;
  return typeof name === 'string' ? name : null;
}

export default async function NewUserPage() {
  const supabase = await createClient();

  const { data: labs } = await supabase
    .from('labs')
    .select('id, name')
    .eq('status', 'active')
    .order('name');

  const { data: opticalStores } = await supabase
    .from('optical_stores')
    .select('id, name, lab_id, lab:labs(name)')
    .eq('status', 'active')
    .order('name');

  const mappedOpticalStores = (opticalStores || []).map((store) => ({
    id: store.id,
    name: store.name,
    lab_id: store.lab_id,
    lab_name: relationName(store.lab),
  }));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        backHref="/admin/users"
        eyebrow="Admin Global"
        title="Novo usuario"
        description="Defina acesso inicial, role e vinculo operacional com laboratorio ou otica."
      />

      <UserForm labs={labs || []} opticalStores={mappedOpticalStores} />
    </div>
  );
}
