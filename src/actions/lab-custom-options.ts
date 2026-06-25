'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import {
  cleanCustomOption,
  DEFAULT_OPTIONS_BY_TYPE,
  normalizeCustomOption,
  type LabOptionType,
} from '@/lib/constants/lab-options';
import { EntityStatus, UserRole } from '@/lib/types/enums';

const optionTypeSchema = z.enum([
  'brand',
  'lens_category',
  'lens_material',
  'refractive_index',
  'lens_treatment',
  'rework_reason',
]);

const createOptionSchema = z.object({
  optionType: optionTypeSchema,
  name: z.string()
    .trim()
    .min(2, 'Informe um nome valido.')
    .max(80, 'Use no maximo 80 caracteres.')
    .transform(cleanCustomOption)
    .refine((value) => /[\p{L}\p{N}]/u.test(value), 'Informe um nome valido.'),
});

async function getLabContext() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) return { supabase, error: 'Sessao expirada. Faca login novamente.' as const };

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, lab_id, role')
    .eq('auth_user_id', userData.user.id)
    .single();

  if (!profile?.lab_id) return { supabase, error: 'Usuario sem laboratorio vinculado.' as const };
  if (![UserRole.LAB_ADMIN, UserRole.LAB_USER].includes(profile.role as UserRole)) {
    return { supabase, error: 'Apenas usuarios do laboratorio podem cadastrar opcoes.' as const };
  }

  return {
    supabase,
    profile: {
      id: profile.id as string,
      lab_id: profile.lab_id as string,
    },
  };
}

export async function createLabCustomOption(input: { optionType: LabOptionType; name: string }) {
  const parsed = createOptionSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || 'Informe um nome valido.' };

  const context = await getLabContext();
  if ('error' in context) return { error: context.error };

  const { supabase, profile } = context;
  const normalizedName = normalizeCustomOption(parsed.data.name);
  const defaultMatch = DEFAULT_OPTIONS_BY_TYPE[parsed.data.optionType].find((option) => (
    normalizeCustomOption(option.label) === normalizedName
    || normalizeCustomOption(option.value) === normalizedName
  ));

  if (defaultMatch) {
    return {
      option: {
        value: defaultMatch.value,
        label: defaultMatch.label,
        existed: true,
        message: 'Essa opcao ja existe e foi selecionada.',
      },
    };
  }

  const { data: existing, error: existingError } = await supabase
    .from('lab_custom_options')
    .select('id, name, status')
    .eq('lab_id', profile.lab_id)
    .eq('option_type', parsed.data.optionType)
    .eq('normalized_name', normalizedName)
    .maybeSingle();

  if (existingError && existingError.code !== 'PGRST116') {
    return { error: 'Nao foi possivel verificar opcoes existentes.' };
  }

  if (existing) {
    if (existing.status !== EntityStatus.ACTIVE) {
      const { data: reactivated, error: reactivateError } = await supabase
        .from('lab_custom_options')
        .update({ status: EntityStatus.ACTIVE })
        .eq('id', existing.id)
        .select('name')
        .single();

      if (reactivateError || !reactivated) return { error: 'Nao foi possivel reativar esta opcao.' };
      revalidatePath('/lab/lens-types');
      revalidatePath('/store/search');
      return {
        option: {
          value: reactivated.name,
          label: reactivated.name,
          existed: true,
          message: 'Essa opcao ja existe e foi selecionada.',
        },
      };
    }

    return {
      option: {
        value: existing.name,
        label: existing.name,
        existed: true,
        message: 'Essa opcao ja existe e foi selecionada.',
      },
    };
  }

  const { data: created, error: createError } = await supabase
    .from('lab_custom_options')
    .insert({
      lab_id: profile.lab_id,
      option_type: parsed.data.optionType,
      name: parsed.data.name,
      normalized_name: normalizedName,
      status: EntityStatus.ACTIVE,
      created_by_profile_id: profile.id,
    })
    .select('name')
    .single();

  if (createError || !created) return { error: 'Nao foi possivel salvar esta opcao.' };

  revalidatePath('/lab/lens-types');
  revalidatePath('/lab/stock');
  revalidatePath('/store/search');
  revalidatePath('/store/orders/new');
  revalidatePath('/store/orders/special/new');

  return {
    option: {
      value: created.name,
      label: created.name,
      existed: false,
      message: 'Opcao adicionada com sucesso.',
    },
  };
}
