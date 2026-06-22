'use server';

import { createClient } from '@/lib/supabase/server';
import { lensVariantSchema, type LensVariantInput } from '@/lib/validators/lens';
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

function variantErrorMessage(error: { code?: string; message: string }) {
  if (error.code === '23505') {
    return 'Ja existe uma variante com este SKU cadastrada no seu laboratorio.';
  }

  return 'Ocorreu um erro ao salvar a variante. ' + error.message;
}

export async function createLensVariantAction(data: LensVariantInput) {
  const context = await getLabContext();
  if (context.error || !context.labId) return { error: context.error };

  const result = lensVariantSchema.safeParse(data);

  if (!result.success) {
    return { error: 'Dados invalidos. Verifique os campos e tente novamente.' };
  }

  const { error } = await context.supabase
    .from('lens_variants')
    .insert([{
      ...result.data,
      lab_id: context.labId,
    }]);

  if (error) {
    return { error: variantErrorMessage(error) };
  }

  revalidatePath('/lab/stock');
  revalidatePath('/lab/dashboard');
  revalidatePath('/store/search');
  revalidatePath('/store/orders/new');
  redirect('/lab/stock');
}

export async function updateLensVariantAction(id: string, data: LensVariantInput) {
  const context = await getLabContext();
  if (context.error || !context.labId) return { error: context.error };

  const result = lensVariantSchema.safeParse(data);

  if (!result.success) {
    return { error: 'Dados invalidos. Verifique os campos e tente novamente.' };
  }

  const { error } = await context.supabase
    .from('lens_variants')
    .update(result.data)
    .eq('id', id)
    .eq('lab_id', context.labId);

  if (error) {
    return { error: variantErrorMessage(error) };
  }

  revalidatePath('/lab/stock');
  revalidatePath(`/lab/stock/${id}`);
  revalidatePath('/lab/dashboard');
  revalidatePath('/store/search');
  revalidatePath('/store/orders/new');

  return { success: true };
}
