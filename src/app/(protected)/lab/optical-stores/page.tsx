import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { OpticalStoresTable } from './OpticalStoresTable';
import { EntityStatus } from '@/lib/types/enums';

export default async function LabOpticalStoresPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) return null;

  // Obter lab_id do usuário atual
  const { data: profile } = await supabase
    .from('profiles')
    .select('lab_id')
    .eq('auth_user_id', userData.user.id)
    .single();

  const labId = profile?.lab_id;

  if (!labId) {
    return <div>Erro: Laboratório não encontrado.</div>;
  }

  const { data: stores, error } = await supabase
    .from('optical_stores')
    .select('id, name, email, phone, status, created_at')
    .eq('lab_id', labId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching optical stores:', error);
  }

  // Define explicitly the type
  const typedStores = (stores || []).map(store => ({
    ...store,
    status: store.status as EntityStatus
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-base)]">Óticas Parceiras</h2>
          <p className="text-[var(--color-text-muted)]">Gerencie as óticas vinculadas ao seu laboratório.</p>
        </div>
        <Link href="/lab/optical-stores/new">
          <Button variant="primary">
            <Plus size={18} className="mr-2" />
            Nova Ótica
          </Button>
        </Link>
      </div>

      <OpticalStoresTable data={typedStores} />
    </div>
  );
}
