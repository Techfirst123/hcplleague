import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseTeamsTable = import.meta.env.VITE_SUPABASE_TEAMS_TABLE || 'teams'
export const supabaseGalleryTable = import.meta.env.VITE_SUPABASE_GALLERY_TABLE || 'gallery_media'
export const supabaseSponsorsTable = import.meta.env.VITE_SUPABASE_SPONSORS_TABLE || 'sponsor_media'
export const supabaseLiveMatchTable = import.meta.env.VITE_SUPABASE_LIVE_MATCH_TABLE || 'live_match'
export const supabaseSponsorCardsTable = import.meta.env.VITE_SUPABASE_SPONSOR_CARDS_TABLE || 'sponsor_cards'
export const supabaseFixturesTable = import.meta.env.VITE_SUPABASE_FIXTURES_TABLE || 'match_fixtures'
export const supabasePointsTable = import.meta.env.VITE_SUPABASE_POINTS_TABLE || 'points_table'
export const supabasePlayerStatsTable = import.meta.env.VITE_SUPABASE_PLAYER_STATS_TABLE || 'player_stats'
export const supabaseGalleryBucket = import.meta.env.VITE_SUPABASE_GALLERY_BUCKET || 'gallery-media'
export const supabaseSponsorsBucket = import.meta.env.VITE_SUPABASE_SPONSORS_BUCKET || 'sponsor-media'
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
export const supabaseConfigMessage = 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your env to enable Supabase features.'

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
