import { createClient } from '@/lib/supabase/server';
import { LabSettingsForm } from './LabSettingsForm';

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
    return <div>Erro: Laboratório não encontrado.</div>;
  }

  // Busca configurações (se não existir, o Form lida com null)
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
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text-base)]">Configurações (White-label)</h2>
        <p className="text-[var(--color-text-muted)]">Personalize a identidade visual e as regras de negócio do seu laboratório.</p>
      </div>

      <LabSettingsForm settings={defaultSettings} />
    </div>
  );
}
