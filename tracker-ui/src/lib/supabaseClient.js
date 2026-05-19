import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://fannlkktvoxcwvxbmwcy.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_Bg1PipWT97F8FYodvnCqPg_N892ahhl';

console.log('SUPABASE URL:', supabaseUrl);
console.log('SUPABASE KEY:', supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);