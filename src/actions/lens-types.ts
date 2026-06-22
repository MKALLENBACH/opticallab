'use server';

import { createClient } from '@/lib/supabase/server';
import { lensTypeSchema, type LensTypeInput } from '@/lib/validators/lens';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function getLabContext() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) {
    return { supabase, error: 'Nao autenticado' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('lab_id, role')
    .eq('auth_user_id', userData.user.id)
    .single();

  if (!profile?.lab_id) {
    return { supabase, error: 'Usuario nao vinculado a nenhum laboratorio.' };
  }

  return { supabase, labId: profile.lab_id };
}

export async function createLensTypeAction(data: LensTypeInput) {
  const context = await getLabContext();
  if (context.error || !context.labId) return { error: context.error };

  const result = lensTypeSchema.safeParse(data);

  if (!result.success) {
    return { error: 'Dados invalidos. Verifique os campos e tente novamente.' };
  }

  const { error } = await context.supabase
    .from('lens_types')
    .insert([{
      ...result.data,
      lab_id: context.labId,
    }]);

  if (error) {
    return { error: 'Ocorreu um erro ao criar o tipo de lente. ' + error.message };
  }

  revalidatePath('/lab/lens-types');
  redirect('/lab/lens-types');
}

export async function updateLensTypeAction(id: string, data: LensTypeInput) {
  const context = await getLabContext();
  if (context.error || !context.labId) return { error: context.error };

  const result = lensTypeSchema.safeParse(data);

  if (!result.success) {
    return { error: 'Dados invalidos. Verifique os campos e tente novamente.' };
  }

  const { error } = await context.supabase
    .from('lens_types')
    .update(result.data)
    .eq('id', id)
    .eq('lab_id', context.labId);

  if (error) {
    return { error: 'Ocorreu um erro ao atualizar o tipo de lente. ' + error.message };
  }

  const { error: touchError } = await context.supabase
    .from('lens_variants')
    .update({ updated_at: new Date().toISOString() })
    .eq('lens_type_id', id)
    .eq('lab_id', context.labId);

  if (touchError) {
    return { error: 'Lente atualizada, mas nao foi possivel atualizar a busca dos SKUs. ' + touchError.message };
  }

  revalidatePath('/lab/lens-types');
  revalidatePath(`/lab/lens-types/${id}`);
  revalidatePath('/lab/stock');
  revalidatePath('/store/search');
  revalidatePath('/store/orders/new');

  return { success: true };
}
