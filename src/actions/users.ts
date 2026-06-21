'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { profileSchema, type ProfileInput } from '@/lib/validators/lab';
import { revalidatePath } from 'next/cache';
import { UserRole } from '@/lib/types/enums';

export async function createUserAction(data: ProfileInput & { password?: string }) {
  // Apenas platform_admin pode criar outro platform_admin (validação adicional)
  const supabase = await createClient();
  const { data: currentUser } = await supabase.auth.getUser();
  
  if (!currentUser?.user) return { error: 'Não autorizado' };

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('auth_user_id', currentUser.user.id)
    .single();

  if (!currentProfile || currentProfile.role !== UserRole.PLATFORM_ADMIN) {
    if (data.role === UserRole.PLATFORM_ADMIN) {
      return { error: 'Apenas administradores da plataforma podem criar novos admins globais.' };
    }
    // Outras restrições poderiam ir aqui, como lab_admin só criar para seu próprio lab.
  }

  const result = profileSchema.safeParse(data);
  if (!result.success) {
    return { error: 'Dados inválidos. Verifique os campos.' };
  }

  const adminClient = createAdminClient();

  // 1. Cria usuário no Auth
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: result.data.email,
    password: data.password || 'Mudar123@', // Senha temporária por padrão
    email_confirm: true, // Ignora confirmação por email para o MVP
    user_metadata: {
      full_name: result.data.full_name,
    }
  });

  if (authError || !authData.user) {
    return { error: 'Erro ao criar usuário no sistema de autenticação: ' + authError?.message };
  }

  // 2. Cria o Profile
  const { error: profileError } = await adminClient
    .from('profiles')
    .insert([{
      auth_user_id: authData.user.id,
      full_name: result.data.full_name,
      email: result.data.email,
      phone: result.data.phone,
      role: result.data.role,
      lab_id: result.data.lab_id,
      optical_store_id: result.data.optical_store_id,
      status: result.data.status,
    }]);

  if (profileError) {
    // Se falhou perfil, ideal seria deletar o auth user para não deixar lixo
    await adminClient.auth.admin.deleteUser(authData.user.id);
    return { error: 'Erro ao criar perfil do usuário: ' + profileError.message };
  }

  revalidatePath('/admin/users');
  return { success: true };
}
