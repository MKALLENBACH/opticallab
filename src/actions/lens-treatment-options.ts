'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { normalizeTreatmentName } from '@/lib/constants/treatments';
import { EntityStatus, UserRole } from '@/lib/types/enums';

const treatmentNameSchema = z.string()
  .trim()
  .min(2, 'Informe o nome do tratamento.')
  .max(60, 'Use no maximo 60 caracteres.')
  .transform((value) => value.replace(/\s+/g, ' '))
  .refine((value) => /[\p{L}\p{N}]/u.test(value), 'Informe um nome valido para o tratamento.');

export interface LensTreatmentOptionResult {
  value: string;
  label: string;
  existed: boolean;
  message: string;
}

async function getLabContext() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) {
    return { supabase, error: 'Nao autenticado.' as const };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('lab_id, role')
    .eq('auth_user_id', userData.user.id)
    .single();

  if (!profile?.lab_id) {
    return { supabase, error: 'Usuario nao vinculado a nenhum laboratorio.' as const };
  }

  if (![UserRole.LAB_ADMIN, UserRole.LAB_USER, UserRole.PLATFORM_ADMIN].includes(profile.role as UserRole)) {
    return { supabase, error: 'Apenas usuarios do laboratorio podem cadastrar tratamentos.' as const };
  }

  return {
    supabase,
    profile: {
      lab_id: profile.lab_id as string,
      role: profile.role as UserRole,
    },
  };
}

export async function createLensTreatmentOption(name: string): Promise<{ option?: LensTreatmentOptionResult; error?: string }> {
  const parsed = treatmentNameSchema.safeParse(name);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Informe o nome do tratamento.' };
  }

  const normalizedName = normalizeTreatmentName(parsed.data);
  const context = await getLabContext();
  if ('error' in context) return { error: context.error };

  const { supabase, profile } = context;

  const { data: existing, error: existingError } = await supabase
    .from('lens_treatment_options')
    .select('id, name, is_default, status')
    .eq('normalized_name', normalizedName)
    .or(`is_default.eq.true,lab_id.eq.${profile.lab_id}`)
    .maybeSingle();

  if (existingError && existingError.code !== 'PGRST116') {
    return { error: 'Nao foi possivel verificar tratamentos existentes.' };
  }

  if (existing) {
    if (existing.status !== EntityStatus.ACTIVE) {
      const { data: reactivated, error: reactivateError } = await supabase
        .from('lens_treatment_options')
        .update({ status: EntityStatus.ACTIVE })
        .eq('id', existing.id)
        .select('name')
        .single();

      if (reactivateError || !reactivated) {
        return { error: 'Este tratamento ja esta cadastrado, mas nao pode ser reativado agora.' };
      }

      revalidatePath('/lab/lens-types/new');
      return {
        option: {
          value: reactivated.name,
          label: reactivated.name,
          existed: true,
          message: 'Este tratamento ja existe e foi selecionado.',
        },
      };
    }

    return {
      option: {
        value: existing.name,
        label: existing.name,
        existed: true,
        message: 'Este tratamento ja existe e foi selecionado.',
      },
    };
  }

  const { data: created, error: createError } = await supabase
    .from('lens_treatment_options')
    .insert({
      lab_id: profile.lab_id,
      name: parsed.data,
      normalized_name: normalizedName,
      is_default: false,
      status: EntityStatus.ACTIVE,
    })
    .select('name')
    .single();

  if (createError) {
    if (createError.code === '23505') {
      const { data: duplicate } = await supabase
        .from('lens_treatment_options')
        .select('name')
        .eq('normalized_name', normalizedName)
        .or(`is_default.eq.true,lab_id.eq.${profile.lab_id}`)
        .maybeSingle();

      if (duplicate) {
        return {
          option: {
            value: duplicate.name,
            label: duplicate.name,
            existed: true,
            message: 'Este tratamento ja existe e foi selecionado.',
          },
        };
      }
    }

    return { error: 'Nao foi possivel adicionar o tratamento.' };
  }

  revalidatePath('/lab/lens-types/new');
  return {
    option: {
      value: created.name,
      label: created.name,
      existed: false,
      message: 'Tratamento adicionado com sucesso.',
    },
  };
}
