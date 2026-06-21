import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ROLE_HOME_PATH } from '@/lib/constants/roles';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('auth_user_id', userData.user.id)
    .single();

  if (!profile || !profile.role) {
    // Caso de edge case sem role definida
    redirect('/unauthorized');
  }

  // Redireciona para o dashboard correto baseado no cargo
  const destination = ROLE_HOME_PATH[profile.role as keyof typeof ROLE_HOME_PATH] || '/login';
  redirect(destination);
}
