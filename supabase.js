// js/supabase.js
import { createClient } from '@supabase/supabase-js';

// Estas variáveis buscam os dados do seu arquivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Cria o cliente apenas quando o .env estiver preenchido corretamente.
export const supabase = supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;
