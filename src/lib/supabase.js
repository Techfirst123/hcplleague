import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseTeamsTable = import.meta.env.VITE_SUPABASE_TEAMS_TABLE || 'teams'
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
export const supabaseConfigMessage = 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your env to enable Supabase team registration.'

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
