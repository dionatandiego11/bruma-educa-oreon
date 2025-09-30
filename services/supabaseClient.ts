import { createClient } from '@supabase/supabase-js';

// --- Lendo as variáveis de ambiente ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// --- Check das credenciais ---
export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

if (!isSupabaseConfigured) {
  console.error(
    'ERRO: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não estão configuradas no arquivo .env'
  );
}

// --- Cria e exporta o cliente global ---
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export default supabase;
