import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { StockTable } from './StockTable';

export const metadata = { title: 'Estoque (SKUs) | LenteLink' };

export default async function LabStockPage() {
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

  const { data: variants, error } = await supabase
    .from('lens_variants')
    .select(`
      id,
      sku,
      sphere_esf,
      cylinder_cil,
      addition_add,
      quantity_available,
      lens_type:lens_types(name)
    `)
    .eq('lab_id', labId)
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    console.error('Error fetching stock:', error);
  }

  const typedVariants = (variants || []).map(v => ({
    ...v,
    lens_type: Array.isArray(v.lens_type) ? v.lens_type[0] : v.lens_type
  }));

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="page-header flex items-start justify-between gap-4">
        <div>
          <h2>Estoque (SKUs)</h2>
          <p>Gerencie as variantes físicas com grau das lentes do seu catálogo.</p>
        </div>
        <Link href="/lab/stock/new">
          <Button
            variant="primary"
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            }
          >
            Nova Variante
          </Button>
        </Link>
      </div>

      <div className="bg-[var(--color-bg-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] overflow-hidden shadow-[var(--shadow-card)]">
        <StockTable data={typedVariants} />
      </div>
    </div>
  );
}

