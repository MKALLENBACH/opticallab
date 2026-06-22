import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/Premium';
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
    return <div>Erro: Laboratorio nao encontrado.</div>;
  }

  const { data: lensTypes } = await supabase
    .from('lens_types')
    .select('id, name, brand')
    .eq('lab_id', labId)
    .eq('status', 'active')
    .order('name');

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        backHref="/lab/stock"
        eyebrow="Estoque"
        title="Novo SKU"
        description="Crie uma variante tecnica com SKU, grau, prazos e disponibilidade de estoque."
      />

      <LensVariantForm lensTypes={lensTypes || []} />
    </div>
  );
}
