import { createClient } from '@supabase/supabase-js'

// IMPORTANT: Create a .env.local file in the root of your project
// and add your Supabase URL and anon key there.
//
// NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
// NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or anon key. Check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
