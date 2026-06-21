import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ClientLayoutWrapper } from '@/components/layout/ClientLayoutWrapper';
import { UserRole } from '@/lib/types/enums';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) {
    redirect('/login');
  }

  // Busca o profile com o lab e optical store vinculados
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      lab:labs(name),
      optical_store:optical_stores(name)
    `)
    .eq('auth_user_id', userData.user.id)
    .single();

  if (!profile || profile.status !== 'active') {
    redirect('/login?error=inactive');
  }

  // Busca as configurações do lab para aplicar cores e logo (white label)
  let labLogoUrl = null;
  let primaryColor = null;
  let secondaryColor = null;

  if (profile.lab_id) {
    const { data: labSettings } = await supabase
      .from('lab_settings')
      .select('logo_url, primary_color, secondary_color')
      .eq('lab_id', profile.lab_id)
      .single();

    if (labSettings) {
      labLogoUrl = labSettings.logo_url;
      primaryColor = labSettings.primary_color;
      secondaryColor = labSettings.secondary_color;
    }
  }

  // Nome do ambiente para exibir no topbar
  const environmentName = profile.role.includes('optical') 
    ? profile.optical_store?.name 
    : profile.lab?.name;

  return (
    <>
      {/* Injeção das variáveis de cor White-label */}
      {(primaryColor || secondaryColor) && (
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            ${primaryColor ? `--color-primary: ${primaryColor};` : ''}
            ${secondaryColor ? `--color-secondary: ${secondaryColor};` : ''}
          }
        `}} />
      )}
      
      <ClientLayoutWrapper
        role={profile.role as UserRole}
        userName={profile.full_name}
        userEmail={profile.email}
        labName={environmentName}
        labLogoUrl={labLogoUrl}
      >
        {children}
      </ClientLayoutWrapper>
    </>
  );
}
