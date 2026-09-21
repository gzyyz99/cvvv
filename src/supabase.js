import { createClient } from '@supabase/supabase-js';

// Access environment variables using import.meta.env for Vite with safe fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://maricanxbnsujwahdzko.supabase.co"; 
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_WvBFu4shEp2ptjh7XgNdaQ_TpzA-vsO";

export const supabase = createClient(supabaseUrl, supabaseKey);