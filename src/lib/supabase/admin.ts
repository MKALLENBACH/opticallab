import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Cria um client do Supabase com poderes de SERVICE_ROLE.
 * 
 * ATENÇÃO: Nunca use isso no Client Side ou para consultar dados
 * que dependam de RLS (Row Level Security), pois o RLS é ignorado
 * por este client.
 * 
 * Use APENAS em Server Actions/API Routes seguras para tarefas administrativas
 * (ex: criar usuário, trigger actions de sistema).
 */
export function createAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY');
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
