import { createClient } from '@/lib/supabase/server';
import { StockTable } from './StockTable';
import { HeaderAction, PageHeader, SectionCard } from '@/components/ui/Premium';
import { Boxes, Plus } from 'lucide-react';
import { PaginationControls, paginationRange } from '@/components/ui/PaginationControls';

export const metadata = { title: 'Estoque (SKUs) | LenteLink' };

export default async function LabStockPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
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

  const { data: variants, error, count } = await supabase
    .from('lens_variants')
    .select(`
      id,
      sku,
      sphere_esf,
      cylinder_cil,
      axis,
      addition_add,
      quantity_available,
      minimum_stock,
      delivery_time_in_stock_days,
      production_time_out_of_stock_days,
      status,
      lens_type:lens_types(name, brand, material, treatments)
    `, { count: 'exact' })
    .eq('lab_id', labId)
    .order('created_at', { ascending: false })
    .range(pagination.from, pagination.to);

  if (error) {
    console.error('Error fetching stock:', error);
  }

  const typedVariants = (variants || []).map((variant) => ({
    ...variant,
    lens_type: Array.isArray(variant.lens_type) ? variant.lens_type[0] : variant.lens_type,
  }));

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        eyebrow="Estoque"
        title="Estoque e SKUs"
        description="Controle variantes tecnicas por grau, disponibilidade, prazos e localizacao operacional."
        actions={<HeaderAction href="/lab/stock/new" icon={<Plus size={17} />}>Novo SKU</HeaderAction>}
      />

      <SectionCard
        icon={Boxes}
        title="Inventario tecnico"
        description="Busque por SKU, lente, material ou grau. Estoque baixo recebe destaque automatico."
        contentClassName="p-0"
      >
        <StockTable data={typedVariants} />
        <PaginationControls page={pagination.page} pageSize={pagination.pageSize} total={count || 0} pathname="/lab/stock" />
      </SectionCard>
    </div>
  );
}
