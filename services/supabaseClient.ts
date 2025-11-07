
import { createClient } from '@supabase/supabase-js';

// Load from Vite env vars with safe fallback to previous defaults
const SUPABASE_URL_DEFAULT = 'https://llnbtdgkebbmyofkpywk.supabase.co';
const SUPABASE_ANON_KEY_DEFAULT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsbmJ0ZGdrZWJibXlvZmtweXdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4OTA3ODksImV4cCI6MjA3NDQ2Njc4OX0.JsXstMd0UYnaqdvRxTwGHx68_67hu-FbchkQ_llG6Ws';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || SUPABASE_URL_DEFAULT;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || SUPABASE_ANON_KEY_DEFAULT;

export const isSupabaseConfigured = Boolean(
  (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  (supabaseUrl && supabaseAnonKey)
);

// If env vars are missing, we fallback to defaults and log a warning (keeps app working in dev)
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('WARN: Using embedded Supabase credentials. Define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to override.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export default supabase;
