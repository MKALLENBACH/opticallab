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
    <div className="space-y-6 animate-slide-up">
      <div className="page-header flex items-start justify-between gap-4">
        <div>
          <h2>Óticas Parceiras</h2>
          <p>Gerencie as óticas vinculadas ao seu laboratório.</p>
        </div>
        <Link href="/lab/optical-stores/new">
          <Button
            variant="primary"
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            }
          >
            Nova Ótica
          </Button>
        </Link>
      </div>

      <div className="bg-[var(--color-bg-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] overflow-hidden shadow-[var(--shadow-card)]">
        <OpticalStoresTable data={typedStores} />
      </div>
    </div>
  );
}
