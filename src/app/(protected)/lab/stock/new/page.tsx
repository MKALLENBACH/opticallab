import { createClient } from '@/lib/supabase/server';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { LensVariantForm } from './LensVariantForm';

export default async function NewLensVariantPage() {
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

  // Busca os tipos de lente do catálogo do laboratório
  const { data: lensTypes } = await supabase
    .from('lens_types')
    .select('id, name, brand')
    .eq('lab_id', labId)
    .eq('status', 'active')
    .order('name');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link 
          href="/lab/stock" 
          className="p-2 rounded-full hover:bg-[var(--color-bg-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-base)]">Nova Variante (Estoque)</h2>
          <p className="text-[var(--color-text-muted)]">Adicione uma variante específica (SKU/Grau) vinculada a uma Lente Base.</p>
        </div>
      </div>

      <LensVariantForm lensTypes={lensTypes || []} />
    </div>
  );
}
