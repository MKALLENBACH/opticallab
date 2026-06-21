import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { LensTypesTable } from './LensTypesTable';
import { EntityStatus, LensCategory, LensMaterial } from '@/lib/types/enums';

export const metadata = { title: 'Catálogo de Lentes | LenteLink' };

export default async function LabLensTypesPage() {
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
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-[var(--color-text-muted)]">Laboratório não encontrado.</p>
      </div>
    );
  }

  const { data: lenses, error } = await supabase
    .from('lens_types')
    .select('id, name, brand, category, material, status')
    .eq('lab_id', labId)
    .order('name');

  if (error) {
    console.error('Error fetching lens types:', error);
  }

  const typedLenses = (lenses || []).map(lens => ({
    ...lens,
    category: lens.category as LensCategory | null,
    material: lens.material as LensMaterial | null,
    status: lens.status as EntityStatus
  }));

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="page-header flex items-start justify-between gap-4">
        <div>
          <h2>Catálogo de Lentes</h2>
          <p>Gerencie os tipos de lentes disponíveis para produção.</p>
        </div>
        <Link href="/lab/lens-types/new">
          <Button
            variant="primary"
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            }
          >
            Nova Lente
          </Button>
        </Link>
      </div>

      <div className="bg-[var(--color-bg-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] overflow-hidden shadow-[var(--shadow-card)]">
        <LensTypesTable data={typedLenses} />
      </div>
    </div>
  );
}

