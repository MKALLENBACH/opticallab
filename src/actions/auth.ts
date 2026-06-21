'use server';

import { createClient } from '@/lib/supabase/server';
import { loginSchema, type LoginInput } from '@/lib/validators/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ROLE_HOME_PATH } from '@/lib/constants/roles';
import { UserRole } from '@/lib/types/enums';

export async function loginAction(data: LoginInput) {
  const result = loginSchema.safeParse(data);
  
  if (!result.success) {
    return { error: 'Dados inválidos' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  });

  if (error) {
    return { error: 'Email ou senha incorretos' };
  }

  // Busca o profile para saber a role e redirecionar corretamente
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData?.user) {
    return { error: 'Erro ao identificar usuário' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('auth_user_id', userData.user.id)
    .single();

  if (!profile || !profile.role) {
    // Caso raro: logou mas não tem profile. Joga pra uma rota genérica
    revalidatePath('/', 'layout');
    redirect('/unauthorized');
  }

  const role = profile.role as UserRole;
  const destination = ROLE_HOME_PATH[role] || '/';
  
  revalidatePath('/', 'layout');
  redirect(destination);
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
