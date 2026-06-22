import Link from 'next/link';
import { PackageSearch, Search, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { AvailabilityBadge, EmptyState, HeaderAction, InfoRow, PageHeader, SectionCard } from '@/components/ui/Premium';
import { getTreatmentLabel } from '@/lib/constants/treatments';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Novo Pedido | LenteLink' };

function normalizeRelation<T>(relation: T | T[] | null | undefined): T | null {
  if (Array.isArray(relation)) return relation[0] ?? null;
  return relation ?? null;
}

function formatPower(value: number | null, prefix: string) {
  if (value === null) return '';
  return `${prefix} ${value > 0 ? '+' : ''}${Number(value).toFixed(2)}`;
}

function formatGrade(item: {
  sphere_esf: number | null;
  cylinder_cil: number | null;
  axis: number | null;
  addition_add: number | null;
}) {
  return [
    formatPower(item.sphere_esf, 'ESF'),
    item.cylinder_cil !== null && item.cylinder_cil !== 0 ? formatPower(item.cylinder_cil, 'CIL') : '',
    item.axis !== null ? `Eixo ${item.axis}` : '',
    item.addition_add !== null ? formatPower(item.addition_add, 'ADD') : '',
  ].filter(Boolean).join(' / ') || 'Plano';
}

export default async function NewStoreOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ variantId?: string }>;
}) {
  const { variantId } = await searchParams;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('lab_id, optical_store_id')
    .eq('auth_user_id', userData.user.id)
    .single();

  const labId = profile?.lab_id;

  const { data: selectedVariant } = variantId && labId
    ? await supabase
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
        lens_type:lens_types(name, brand, category, material, treatments)
      `)
      .eq('id', variantId)
      .eq('lab_id', labId)
      .single()
    : { data: null };

  const lensType = normalizeRelation(selectedVariant?.lens_type as {
    name: string | null;
    brand: string | null;
    category: string | null;
    material: string | null;
    treatments: string[] | null;
  } | {
    name: string | null;
    brand: string | null;
    category: string | null;
    material: string | null;
    treatments: string[] | null;
  }[] | null | undefined);

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        backHref="/store/orders"
        eyebrow="Otica"
        title="Novo pedido"
        description="Monte a solicitacao a partir de uma lente encontrada no catalogo do laboratorio."
        actions={<HeaderAction href="/store/search" icon={<Search size={17} />}>Buscar lentes</HeaderAction>}
      />

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          icon={ShoppingCart}
          title="Itens selecionados"
          description="O item vindo da busca aparece aqui para revisao."
        >
          {!selectedVariant ? (
            <EmptyState
              icon={PackageSearch}
              title="Nenhuma lente selecionada"
              description="Use a busca para localizar um SKU e retornar com o item selecionado."
              action={
                <Link href="/store/search" className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#4f46e5,#9333ea)] px-5 text-[0.9rem] font-extrabold text-white">
                  Buscar no catalogo
                </Link>
              }
            />
          ) : (
            <Card className="bg-white/[0.025]">
              <CardContent>
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-[1.05rem] font-extrabold text-white">{lensType?.name || 'Lente sem nome'}</p>
                      <p className="mt-1 text-[0.86rem] font-semibold text-slate-500">
                        {lensType?.brand || 'Sem marca'} · SKU {selectedVariant.sku}
                      </p>
                    </div>
                    <AvailabilityBadge quantity={selectedVariant.quantity_available} minimumStock={selectedVariant.minimum_stock} />
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/58 px-4 py-4 text-center font-mono text-[0.95rem] font-extrabold text-white">
                    {formatGrade(selectedVariant)}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {lensType?.treatments?.length ? lensType.treatments.slice(0, 4).map((treatment) => (
                      <Badge key={treatment} variant="info" size="sm">{getTreatmentLabel(treatment)}</Badge>
                    )) : (
                      <Badge size="sm">Sem tratamento</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </SectionCard>

        <SectionCard
          icon={PackageSearch}
          title="Resumo"
          description="Dados usados para conferir a solicitacao antes do envio operacional."
        >
          <div className="grid grid-cols-1 gap-3">
            <InfoRow label="Otica vinculada" value={profile?.optical_store_id ? 'Perfil ativo' : 'Nao vinculada'} />
            <InfoRow label="Laboratorio vinculado" value={profile?.lab_id ? 'Disponivel' : 'Nao vinculado'} />
            <InfoRow label="Item selecionado" value={selectedVariant ? selectedVariant.sku : 'Nao informado'} />
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
