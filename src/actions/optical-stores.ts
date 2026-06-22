'use server';

import { createClient } from '@/lib/supabase/server';
import { opticalStoreSchema, type OpticalStoreInput } from '@/lib/validators/lab';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createOpticalStoreAction(data: OpticalStoreInput) {
  const supabase = await createClient();
  
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { error: 'Não autenticado' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('lab_id, role')
    .eq('auth_user_id', userData.user.id)
    .single();

  if (!profile || !profile.lab_id) {
    return { error: 'Usuário não vinculado a nenhum laboratório.' };
  }

  const result = opticalStoreSchema.safeParse(data);
  
  if (!result.success) {
    return { error: 'Dados inválidos. Verifique os campos e tente novamente.' };
  }

  const { error } = await supabase
    .from('optical_stores')
    .insert([{
      ...result.data,
      lab_id: profile.lab_id
    }]);

  if (error) {
    return { error: 'Ocorreu um erro ao criar a ótica. ' + error.message };
  }

  revalidatePath('/lab/optical-stores');
  redirect('/lab/optical-stores');
}
