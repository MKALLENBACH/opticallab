import { createClient } from '@/lib/supabase/server';
import { OpticalStoresTable } from './OpticalStoresTable';
import { EntityStatus } from '@/lib/types/enums';
import { HeaderAction, PageHeader, SectionCard } from '@/components/ui/Premium';
import { Plus, Store } from 'lucide-react';

export default async function LabOpticalStoresPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('lab_id')
    .eq('auth_user_id', userData.user.id)
    .single();

  const labId = profile?.lab_id;

  if (!labId) {
    return <div>Erro: Laboratorio nao encontrado.</div>;
  }

  const { data: stores, error } = await supabase
    .from('optical_stores')
    .select('id, name, email, phone, status, created_at')
    .eq('lab_id', labId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching optical stores:', error);
  }

  const typedStores = (stores || []).map((store) => ({
    ...store,
    status: store.status as EntityStatus,
  }));

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        eyebrow="Laboratorio"
        title="Oticas Parceiras"
        description="Gerencie as oticas vinculadas ao laboratorio, acompanhe status e mantenha contatos organizados."
        actions={<HeaderAction href="/lab/optical-stores/new" icon={<Plus size={17} />}>Nova otica</HeaderAction>}
      />

      <SectionCard
        icon={Store}
        title="Rede de oticas"
        description="Lista de parceiros ativos e historico de cadastro."
        contentClassName="p-0"
      >
        <OpticalStoresTable data={typedStores} />
      </SectionCard>
    </div>
  );
}
