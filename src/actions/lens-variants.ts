'use server';

import { createClient } from '@/lib/supabase/server';
import { lensVariantSchema, type LensVariantInput } from '@/lib/validators/lens';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createLensVariantAction(data: LensVariantInput) {
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

  const result = lensVariantSchema.safeParse(data);
  
  if (!result.success) {
    return { error: 'Dados inválidos. Verifique os campos e tente novamente.' };
  }

  const { error } = await supabase
    .from('lens_variants')
    .insert([{
      ...result.data,
      lab_id: profile.lab_id
    }]);

  if (error) {
    if (error.code === '23505') {
      return { error: 'Já existe uma variante com este SKU cadastrada no seu laboratório.' };
    }
    return { error: 'Ocorreu um erro ao criar a variante. ' + error.message };
  }

  revalidatePath('/lab/stock');
  redirect('/lab/stock');
}
