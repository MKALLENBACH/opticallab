import { Building2, Mail, MapPin, Phone, Store } from 'lucide-react';
import { EmptyState, InfoRow, PageHeader, SectionCard, StatusBadge } from '@/components/ui/Premium';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Configuracoes da Otica | LenteLink' };

export default async function StoreSettingsPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('optical_store_id')
    .eq('auth_user_id', userData.user.id)
    .single();

  const storeId = profile?.optical_store_id;

  if (!storeId) {
    return (
      <EmptyState
        icon={Store}
        title="Otica nao encontrada"
        description="Seu usuario ainda nao esta vinculado a uma otica ativa."
      />
    );
  }

  const { data: store } = await supabase
    .from('optical_stores')
    .select('*')
    .eq('id', storeId)
    .single();

  const address = store?.address
    ? `${store.address}${store.city ? `, ${store.city}` : ''}${store.state ? ` - ${store.state}` : ''}${store.zip_code ? ` · CEP ${store.zip_code}` : ''}`
    : 'Nao informado';

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        eyebrow="Otica"
        title="Configuracoes da Otica"
        description="Consulte os dados cadastrais usados pelo laboratorio para pedidos, faturamento e contato."
      />

      <SectionCard
        icon={Building2}
        title="Dados cadastrais"
        description="Para atualizar estas informacoes, entre em contato com o administrador do laboratorio."
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <InfoRow label="Nome / Razao Social" value={store?.name || 'Nao informado'} />
          <InfoRow label="CNPJ / Documento" value={store?.document || 'Nao informado'} />
          <InfoRow label="Status" value={<StatusBadge status={store?.status || 'inactive'} />} />
          <InfoRow label="Responsavel" value={store?.responsible_name || 'Nao informado'} />
          <InfoRow label="Email" value={<span className="inline-flex items-center gap-2"><Mail size={15} />{store?.email || 'Nao informado'}</span>} />
          <InfoRow label="Telefone" value={<span className="inline-flex items-center gap-2"><Phone size={15} />{store?.phone || 'Nao informado'}</span>} />
          <InfoRow label="Endereco" value={<span className="inline-flex items-start gap-2"><MapPin size={15} className="mt-0.5 flex-shrink-0" />{address}</span>} />
        </div>
      </SectionCard>
    </div>
  );
}
