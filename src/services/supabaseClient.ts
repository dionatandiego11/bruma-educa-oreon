// src/services/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!supabaseUrl || !supabaseAnonKey) {
	// Ambiente não configurado corretamente — log para facilitar debugging
	// Em produção, recomenda-se falhar cedo ou ocultar ações dependentes do Supabase
	 
	console.error('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set in the environment. Check your .env file.');
}

// Cria e exporta o cliente supabase para usar em todo o projeto
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

export default supabase