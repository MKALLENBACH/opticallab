'use server';

import { createClient } from '@/lib/supabase/server';
import { lensTypeSchema, type LensTypeInput } from '@/lib/validators/lens';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createLensTypeAction(data: LensTypeInput) {
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

  const result = lensTypeSchema.safeParse(data);
  
  if (!result.success) {
    return { error: 'Dados inválidos. Verifique os campos e tente novamente.' };
  }

  const { data: insertedLens, error } = await supabase
    .from('lens_types')
    .insert([{
      ...result.data,
      lab_id: profile.lab_id
    }])
    .select('id')
    .single();

  if (error) {
    return { error: 'Ocorreu um erro ao criar o tipo de lente. ' + error.message };
  }

  revalidatePath('/lab/lens-types');
  redirect(`/lab/lens-types/${insertedLens.id}`);
}
