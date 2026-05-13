import { isSupabaseConfigured, supabase, supabaseConfigMessage, supabaseTeamsTable } from './supabase'

const pendingVerificationStatus = 'Pending management verification'
const verifiedStatus = 'Verified'

function parsePlayers(players) {
  if (Array.isArray(players)) {
    return players
  }

  if (typeof players === 'string') {
    try {
      const parsed = JSON.parse(players)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  return []
}

function normalizePlayers(players) {
  return parsePlayers(players).map((player, index) => ({
    playerNumber: player.playerNumber || index + 1,
    name: player.name || '',
    aadhaar: player.aadhaar || '',
  }))
}

export function normalizeTeamRecord(record) {
  return {
    id: record.id ?? record.submitted_at ?? record.submittedAt,
    submittedAt: record.submitted_at || record.submittedAt || record.created_at || new Date().toISOString(),
    status: record.status || pendingVerificationStatus,
    teamName: record.team_name || record.teamName || '',
    captainName: record.captain_name || record.captainName || '',
    captainNumber: record.captain_number || record.captainNumber || '',
    viceCaptainName: record.vice_captain_name || record.viceCaptainName || '',
    viceCaptainNumber: record.vice_captain_number || record.viceCaptainNumber || '',
    sponsorPaid: Boolean(record.sponsor_paid ?? record.sponsorPaid),
    teamLogoName: record.team_logo_name || record.teamLogoName || '',
    players: normalizePlayers(record.players),
  }
}

function serializeTeamRecord(team) {
  return {
    submitted_at: team.submittedAt,
    status: team.status || pendingVerificationStatus,
    team_name: team.teamName,
    captain_name: team.captainName,
    captain_number: team.captainNumber,
    vice_captain_name: team.viceCaptainName,
    vice_captain_number: team.viceCaptainNumber,
    sponsor_paid: Boolean(team.sponsorPaid),
    team_logo_name: team.teamLogoName || '',
    players: normalizePlayers(team.players),
  }
}

function ensureSupabaseConfigured() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(supabaseConfigMessage)
  }
}

export async function fetchVerifiedTeams() {
  ensureSupabaseConfigured()

  const { data, error } = await supabase
    .from(supabaseTeamsTable)
    .select('*')
    .eq('status', verifiedStatus)
    .order('submitted_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data || []).map(normalizeTeamRecord)
}

export async function fetchAllTeams() {
  ensureSupabaseConfigured()

  const { data, error } = await supabase
    .from(supabaseTeamsTable)
    .select('*')
    .order('submitted_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data || []).map(normalizeTeamRecord)
}

export async function createTeamRegistration(team) {
  ensureSupabaseConfigured()

  const { data, error } = await supabase
    .from(supabaseTeamsTable)
    .insert(serializeTeamRecord(team))
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return normalizeTeamRecord(data)
}

export async function updateTeamRegistration(teamId, team) {
  ensureSupabaseConfigured()

  const { data, error } = await supabase
    .from(supabaseTeamsTable)
    .update(serializeTeamRecord(team))
    .eq('id', teamId)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return normalizeTeamRecord(data)
}

export async function updateTeamVerificationStatus(teamId, status) {
  ensureSupabaseConfigured()

  const { data, error } = await supabase
    .from(supabaseTeamsTable)
    .update({ status })
    .eq('id', teamId)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return normalizeTeamRecord(data)
}

export async function deleteTeamRegistration(teamId) {
  ensureSupabaseConfigured()

  const { error } = await supabase
    .from(supabaseTeamsTable)
    .delete()
    .eq('id', teamId)

  if (error) {
    throw error
  }
}
