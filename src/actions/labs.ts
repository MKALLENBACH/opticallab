'use server';

import { createClient } from '@/lib/supabase/server';
import { labSchema, type LabInput } from '@/lib/validators/lab';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createLabAction(data: LabInput) {
  const result = labSchema.safeParse(data);
  
  if (!result.success) {
    return { error: 'Dados inválidos. Verifique os campos e tente novamente.' };
  }

  const supabase = await createClient();

  const { data: insertedLab, error } = await supabase
    .from('labs')
    .insert([result.data])
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') { // unique_violation
      return { error: 'Já existe um laboratório com este slug.' };
    }
    return { error: 'Ocorreu um erro ao criar o laboratório.' };
  }

  revalidatePath('/admin/labs');
  redirect(`/admin/labs/${insertedLab.id}`);
}

export async function updateLabAction(id: string, data: Partial<LabInput>) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('labs')
    .update(data)
    .eq('id', id);

  if (error) {
    if (error.code === '23505') {
      return { error: 'Já existe um laboratório com este slug.' };
    }
    return { error: 'Ocorreu um erro ao atualizar o laboratório.' };
  }

  revalidatePath('/admin/labs');
  revalidatePath(`/admin/labs/${id}`);
  
  return { success: true };
}
