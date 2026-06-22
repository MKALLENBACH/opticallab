import { createClient } from '@/lib/supabase/server';
import { LabsTable } from './LabsTable';
import { EntityStatus } from '@/lib/types/enums';
import { HeaderAction, PageHeader, SectionCard } from '@/components/ui/Premium';
import { Building2, Plus } from 'lucide-react';

export default async function AdminLabsPage() {
  const supabase = await createClient();

  const { data: labs, error } = await supabase
    .from('labs')
    .select('id, name, slug, email, status, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching labs:', error);
  }

  const typedLabs = (labs || []).map((lab) => ({
    ...lab,
    status: lab.status as EntityStatus,
  }));

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        eyebrow="Admin Global"
        title="Laboratorios"
        description="Gerencie tenants, identidade inicial e status operacional de cada laboratorio."
        actions={<HeaderAction href="/admin/labs/new" icon={<Plus size={17} />}>Novo laboratorio</HeaderAction>}
      />

      <SectionCard
        icon={Building2}
        title="Laboratorios cadastrados"
        description="Busca por nome, slug, email ou status."
        contentClassName="p-0"
      >
        <LabsTable data={typedLabs} />
      </SectionCard>
    </div>
  );
}
