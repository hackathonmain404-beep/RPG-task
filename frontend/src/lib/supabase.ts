import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wawjrbiqadlbsrmnllrv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_OEO4JkSRWJg0H_uP3hUUEw__bf3oMJX';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel or .env.local'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
