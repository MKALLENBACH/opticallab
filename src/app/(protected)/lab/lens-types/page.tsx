import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { LensTypesTable } from './LensTypesTable';
import { EntityStatus, LensCategory, LensMaterial } from '@/lib/types/enums';

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
    return <div>Erro: Laboratório não encontrado.</div>;
  }

  const { data: lenses, error } = await supabase
    .from('lens_types')
    .select('id, name, brand, category, material, status')
    .eq('lab_id', labId)
    .order('name');

  if (error) {
    console.error('Error fetching lens types:', error);
  }

  // Define explicitly the type
  const typedLenses = (lenses || []).map(lens => ({
    ...lens,
    category: lens.category as LensCategory | null,
    material: lens.material as LensMaterial | null,
    status: lens.status as EntityStatus
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-base)]">Catálogo de Lentes</h2>
          <p className="text-[var(--color-text-muted)]">Gerencie os tipos de lentes disponíveis para produção.</p>
        </div>
        <Link href="/lab/lens-types/new">
          <Button variant="primary">
            <Plus size={18} className="mr-2" />
            Nova Lente
          </Button>
        </Link>
      </div>

      <LensTypesTable data={typedLenses} />
    </div>
  );
}
