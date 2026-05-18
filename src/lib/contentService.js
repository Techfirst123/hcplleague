import {
  isSupabaseConfigured,
  supabase,
  supabaseConfigMessage,
  supabaseGalleryBucket,
  supabaseGalleryTable,
  supabaseFixturesTable,
  supabaseLiveMatchTable,
  supabasePlayerStatsTable,
  supabasePointsTable,
  supabaseSponsorCardsTable,
  supabaseSponsorsBucket,
  supabaseSponsorsTable,
} from './supabase'

const currentLiveMatchId = 'current'

function ensureSupabaseConfigured() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(supabaseConfigMessage)
  }
}

function normalizeMediaRecord(record) {
  return {
    id: record.id,
    type: record.media_type || record.type || 'image',
    src: record.src || record.public_url || '',
    title: record.title || '',
    alt: record.alt || '',
    displayOrder: record.display_order ?? record.displayOrder ?? 0,
    isActive: record.is_active ?? record.isActive ?? true,
  }
}

function serializeMediaRecord(media, fallbackOrder = 0) {
  return {
    media_type: media.type || 'image',
    src: media.src,
    title: media.title || '',
    alt: media.alt || '',
    display_order: media.displayOrder ?? fallbackOrder,
    is_active: media.isActive ?? true,
  }
}

function normalizeLiveMatchRecord(record) {
  return {
    title: record.title || '',
    status: record.status || 'Live',
    streamUrl: record.stream_url || record.streamUrl || '',
    venue: record.venue || '',
    battingTeam: record.batting_team || record.battingTeam || '',
    bowlingTeam: record.bowling_team || record.bowlingTeam || '',
    score: record.score || '',
    overs: record.overs || '',
    target: record.target || '',
  }
}

function normalizeSponsorCardRecord(record) {
  return {
    id: record.id,
    title: record.title || '',
    value: record.value || '',
    meta: record.meta || '',
    displayOrder: record.display_order ?? record.displayOrder ?? 0,
  }
}

function normalizeFixtureRecord(record) {
  return [
    record.match_date || record.date || '',
    record.match_title || record.match || '',
    record.venue || '',
    record.status || '',
  ]
}

function normalizePointsRecord(record) {
  return [
    record.team_name || record.team || '',
    String(record.played ?? record.p ?? '-'),
    String(record.won ?? record.w ?? '-'),
    String(record.lost ?? record.l ?? '-'),
    String(record.net_run_rate ?? record.nrr ?? '-'),
    String(record.points ?? record.pts ?? '-'),
  ]
}

function normalizePlayerStatRecord(record) {
  return {
    id: record.id,
    title: record.title || '',
    value: record.value || '',
    meta: record.meta || '',
    displayOrder: record.display_order ?? record.displayOrder ?? 0,
  }
}

function serializeLiveMatchRecord(match) {
  return {
    id: currentLiveMatchId,
    title: match.title,
    status: match.status,
    stream_url: match.streamUrl,
    venue: match.venue,
    batting_team: match.battingTeam,
    bowling_team: match.bowlingTeam,
    score: match.score,
    overs: match.overs,
    target: match.target,
    updated_at: new Date().toISOString(),
  }
}

function getFilePath(folder, file) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
  return `${folder}/${Date.now()}-${safeName}`
}

async function uploadPublicFile(bucket, folder, file) {
  ensureSupabaseConfigured()

  const filePath = getFilePath(folder, file)
  const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) {
    throw error
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
  return data.publicUrl
}

export async function fetchGalleryMedia() {
  ensureSupabaseConfigured()

  const { data, error } = await supabase
    .from(supabaseGalleryTable)
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data || []).map(normalizeMediaRecord)
}

export async function fetchSponsorMedia() {
  ensureSupabaseConfigured()

  const { data, error } = await supabase
    .from(supabaseSponsorsTable)
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data || []).map(normalizeMediaRecord)
}

export async function fetchSponsorCards() {
  ensureSupabaseConfigured()

  const { data, error } = await supabase
    .from(supabaseSponsorCardsTable)
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data || []).map(normalizeSponsorCardRecord)
}

export async function fetchMatchFixtures() {
  ensureSupabaseConfigured()

  const { data, error } = await supabase
    .from(supabaseFixturesTable)
    .select('*')
    .eq('is_active', true)
    .order('match_date', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data || []).map(normalizeFixtureRecord)
}

export async function fetchPointsTable() {
  ensureSupabaseConfigured()

  const { data, error } = await supabase
    .from(supabasePointsTable)
    .select('*')
    .eq('is_active', true)
    .order('points', { ascending: false })
    .order('net_run_rate', { ascending: false })

  if (error) {
    throw error
  }

  return (data || []).map(normalizePointsRecord)
}

export async function fetchPlayerStats() {
  ensureSupabaseConfigured()

  const { data, error } = await supabase
    .from(supabasePlayerStatsTable)
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data || []).map(normalizePlayerStatRecord)
}

export async function createGalleryMedia(file, displayOrder = 0) {
  const isVideo = file.type.startsWith('video/')
  const publicUrl = await uploadPublicFile(supabaseGalleryBucket, isVideo ? 'videos' : 'images', file)
  const media = serializeMediaRecord({
    type: isVideo ? 'video' : 'image',
    src: publicUrl,
    title: file.name.replace(/\.[^/.]+$/, ''),
    alt: `${file.name.replace(/\.[^/.]+$/, '')} gallery media for HCPL Hazaribag`,
    displayOrder,
  }, displayOrder)

  const { data, error } = await supabase
    .from(supabaseGalleryTable)
    .insert(media)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return normalizeMediaRecord(data)
}

export async function createSponsorMedia(file, displayOrder = 0) {
  const publicUrl = await uploadPublicFile(supabaseSponsorsBucket, 'images', file)
  const media = serializeMediaRecord({
    type: 'image',
    src: publicUrl,
    title: file.name.replace(/\.[^/.]+$/, ''),
    alt: `${file.name.replace(/\.[^/.]+$/, '')} sponsor promotion for Omega Group Trust`,
    displayOrder,
  }, displayOrder)

  const { data, error } = await supabase
    .from(supabaseSponsorsTable)
    .insert(media)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return normalizeMediaRecord(data)
}

export async function deleteGalleryMedia(mediaId) {
  ensureSupabaseConfigured()

  const { error } = await supabase
    .from(supabaseGalleryTable)
    .delete()
    .eq('id', mediaId)

  if (error) {
    throw error
  }
}

export async function deleteSponsorMedia(mediaId) {
  ensureSupabaseConfigured()

  const { error } = await supabase
    .from(supabaseSponsorsTable)
    .delete()
    .eq('id', mediaId)

  if (error) {
    throw error
  }
}

export async function fetchLiveMatch() {
  ensureSupabaseConfigured()

  const { data, error } = await supabase
    .from(supabaseLiveMatchTable)
    .select('*')
    .eq('id', currentLiveMatchId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data ? normalizeLiveMatchRecord(data) : null
}

export async function saveLiveMatch(match) {
  ensureSupabaseConfigured()

  const { data, error } = await supabase
    .from(supabaseLiveMatchTable)
    .upsert(serializeLiveMatchRecord(match), { onConflict: 'id' })
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return normalizeLiveMatchRecord(data)
}
