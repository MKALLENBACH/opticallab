import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/ui/Premium';
import { EditLabForm } from './EditLabForm';
import { EntityStatus } from '@/lib/types/enums';

export default async function EditLabPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: lab, error } = await supabase
    .from('labs')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !lab) {
    notFound();
  }

  const typedLab = {
    ...lab,
    status: lab.status as EntityStatus,
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        backHref="/admin/labs"
        eyebrow="Admin Global"
        title="Detalhes do laboratorio"
        description="Revise cadastro, slug, contato e status deste tenant."
      />

      <EditLabForm lab={typedLab} />
    </div>
  );
}
