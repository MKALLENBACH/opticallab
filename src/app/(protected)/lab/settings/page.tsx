import { Settings } from 'lucide-react';
import { EmptyState, PageHeader, SectionCard } from '@/components/ui/Premium';
import { createClient } from '@/lib/supabase/server';
import { LabSettingsForm } from './LabSettingsForm';

export const metadata = { title: 'Configuracoes do Laboratorio | LenteLink' };

export default async function LabSettingsPage() {
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
      <EmptyState
        icon={Settings}
        title="Laboratorio nao encontrado"
        description="Seu usuario ainda nao esta vinculado a um laboratorio ativo."
      />
    );
  }

  const { data: settings } = await supabase
    .from('lab_settings')
    .select('*')
    .eq('lab_id', labId)
    .single();

  const defaultSettings = {
    primary_color: settings?.primary_color || null,
    secondary_color: settings?.secondary_color || null,
    logo_url: settings?.logo_url || null,
    default_delivery_message: settings?.default_delivery_message || null,
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        eyebrow="White-label"
        title="Configuracoes do Laboratorio"
        description="Ajuste identidade visual, mensagens padrao e parametros que aparecem para as oticas parceiras."
      />

      <SectionCard
        icon={Settings}
        title="Identidade e mensagens"
        description="As alteracoes visuais desta tela ainda seguem o fluxo MVP existente."
        contentClassName="p-0"
      >
        <LabSettingsForm settings={defaultSettings} />
      </SectionCard>
    </div>
  );
}
