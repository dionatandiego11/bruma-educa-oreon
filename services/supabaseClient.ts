
import { createClient } from '@supabase/supabase-js';

// --- Supabase Credentials ---
// NOTE: Hardcoding credentials here as a workaround for a build environment
// that does not correctly handle .env files.
// In a standard setup, these would be loaded from a .env file.
const supabaseUrl = 'https://llnbtdgkebbmyofkpywk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsbmJ0ZGdrZWJibXlvZmtweXdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4OTA3ODksImV4cCI6MjA3NDQ2Njc4OX0.JsXstMd0UYnaqdvRxTwGHx68_67hu-FbchkQ_llG6Ws';


export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

if (!isSupabaseConfigured) {
  console.error(
    'ERROR: Supabase URL or Anon Key are not configured in services/supabaseClient.ts'
  );
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export default supabase;
