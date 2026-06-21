import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { StockTable } from './StockTable';

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
    return <div>Erro: Laboratório não encontrado.</div>;
  }

  // Busca variantes associadas ao laboratório (limita a 200 no MVP se for muito grande)
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-base)]">Controle de Estoque (SKUs)</h2>
          <p className="text-[var(--color-text-muted)]">Gerencie as variantes físicas (com grau) das lentes do seu catálogo.</p>
        </div>
        <Link href="/lab/stock/new">
          <Button variant="primary">
            <Plus size={18} className="mr-2" />
            Nova Variante
          </Button>
        </Link>
      </div>

      <StockTable data={typedVariants} />
    </div>
  );
}
