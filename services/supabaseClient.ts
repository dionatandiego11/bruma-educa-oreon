
import { createClient } from '@supabase/supabase-js';

// Read from Vite env vars. Do not embed defaults in code.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

function createMockSupabase() {
  console.warn('Supabase not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local or environment.');
  const notConfigured = async () => ({ data: null, error: { message: 'Supabase não configurado' } });
  const auth = {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: (_cb: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ data: { user: null }, error: { message: 'Supabase não configurado' } }),
    signOut: async () => ({ error: null }),
  };
  const from = () => ({
    select: notConfigured,
    insert: notConfigured,
    update: notConfigured,
    delete: notConfigured,
    eq: notConfigured,
    order: notConfigured,
    single: notConfigured,
  } as any);
  return { auth, from } as any;
}

let supabase: any;
try {
  supabase = isSupabaseConfigured ? createClient(supabaseUrl as string, supabaseAnonKey as string) : createMockSupabase();
} catch (_e) {
  supabase = createMockSupabase();
}

export { supabase };
export default supabase;
