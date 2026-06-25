import { createClient } from '@/lib/supabase/server';
import { LensTypesTable } from './LensTypesTable';
import { EntityStatus } from '@/lib/types/enums';
import { HeaderAction, PageHeader, SectionCard } from '@/components/ui/Premium';
import { Glasses, Plus } from 'lucide-react';
import { PaginationControls, paginationRange } from '@/components/ui/PaginationControls';

export const metadata = { title: 'Catalogo de Lentes | LenteLink' };

export default async function LabLensTypesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const supabase = await createClient();
  const params = await searchParams;
  const pagination = paginationRange(Number(params.page || 1), 10);
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
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-[var(--color-text-muted)]">Laboratorio nao encontrado.</p>
      </div>
    );
  }

  const { data: lenses, error, count } = await supabase
    .from('lens_types')
    .select('id, name, brand, model, category, material, treatments, status, default_delivery_time_in_stock_days, default_production_time_out_of_stock_days', { count: 'exact' })
    .eq('lab_id', labId)
    .order('name')
    .range(pagination.from, pagination.to);

  if (error) {
    console.error('Error fetching lens types:', error);
  }

  const typedLenses = (lenses || []).map((lens) => ({
    ...lens,
    category: lens.category as string | null,
    material: lens.material as string | null,
    status: lens.status as EntityStatus,
    treatments: (lens.treatments || []) as string[],
  }));

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        eyebrow="Catalogo"
        title="Catalogo de Lentes"
        description="Padronize lentes base, materiais, tratamentos e prazos para a rede de oticas."
        actions={<HeaderAction href="/lab/lens-types/new" icon={<Plus size={17} />}>Nova lente</HeaderAction>}
      />

      <SectionCard
        icon={Glasses}
        title="Lentes base"
        description="Produtos tecnicos disponiveis para producao e pedidos sob encomenda."
        contentClassName="p-0"
      >
        <LensTypesTable data={typedLenses} />
        <PaginationControls page={pagination.page} pageSize={pagination.pageSize} total={count || 0} pathname="/lab/lens-types" />
      </SectionCard>
    </div>
  );
}
