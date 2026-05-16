import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import {
  createTeamRegistration,
  deleteTeamRegistration,
  fetchAllTeams,
  fetchVerifiedTeams,
  updateTeamRegistration,
  updateTeamVerificationStatus,
} from './lib/teamService'
import { isSupabaseConfigured, supabaseConfigMessage } from './lib/supabase'
import './App.css'

const liveMatchApiUrlRaw = import.meta.env.VITE_LIVE_MATCH_API_URL
const liveMatchApiUrl = liveMatchApiUrlRaw?.includes('your-live-match-api.example.com') ? '' : liveMatchApiUrlRaw
const liveMatchPollMs = Number(import.meta.env.VITE_LIVE_MATCH_POLL_MS || 30000)
const teamRegistrationWebhookUrl = import.meta.env.NEXT_PUBLIC_APPS_SCRIPT_URL || import.meta.env.VITE_TEAM_REGISTRATION_WEBHOOK_URL
const adminUsername = import.meta.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin'
const adminPassword = import.meta.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'hcpladmin123'
const verifiedTeamStatus = 'Verified'
const pendingVerificationStatus = 'Pending management verification'
const adminContentStorageKey = 'hcplAdminContent'

const fallbackMatch = {
  title: 'Live Match Hazaribag - HCPL Hazaribag',
  status: 'YouTube Live',
  streamUrl: 'https://www.youtube.com/watch?v=BNkIgRYDnBo',
  venue: 'Hazaribagh Cricket Tournament at Hazaribag Stadium',
  battingTeam: 'Team Alpha',
  bowlingTeam: 'Team Beta',
  score: '150/5',
  overs: '17.4',
  target: '146',
}

const teamAnnouncement = {
  title: 'Omega Cup Hazaribag Team Updates',
  announcement: 'Verified teams for HCPL Hazaribag and the Hazaribagh Premier League will be added here after management approval.',
}

const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'match-center', label: 'Match Center' },
  { id: 'teams', label: 'Teams' },
  { id: 'sponsors', label: 'Sponsors' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'registration', label: 'Registration' },
  { id: 'highlights', label: 'Highlights' },
]

const matchCenterData = {
  liveScores: [
    { title: 'Team Alpha', value: '150/5', meta: '17.4 overs' },
    { title: 'Team Beta', value: '145/7', meta: 'Target 146' },
    { title: 'Live Match Hazaribag', value: 'Live', meta: 'YouTube stream active for HCPL Hazaribag' },
  ],
  schedule: [
    ['May 10, 2026', 'Team Alpha vs Team Beta', 'HCPL Hazaribag Stadium', 'Scheduled'],
    ['May 12, 2026', 'Team Gamma vs Team Delta', 'Omega Cup Hazaribag Arena', 'Scheduled'],
    ['May 14, 2026', 'Team Alpha vs Team Gamma', 'Cricket League in Jharkhand Ground', 'Scheduled'],
  ],
  points: [
    ['Coming Soon', '-', '-', '-', '-', '-'],
    ['Coming Soon', '-', '-', '-', '-', '-'],
    ['Coming Soon', '-', '-', '-', '-', '-'],
  ],
  playerStats: [
    { title: 'Most Runs', value: 'Coming Soon', meta: 'Batting leaderboard' },
    { title: 'Most Wickets', value: 'Coming Soon', meta: 'Bowling leaderboard' },
    { title: 'Best Strike Rate', value: 'Coming Soon', meta: 'Minimum innings required' },
  ],
}

const defaultSponsorImages = []

const defaultGalleryItems = [
  {
    type: 'video',
    src: '/WhatsApp Video 2026-05-12 at 2.48.45 PM.mp4',
    title: 'HCPL Hazaribag Mumbai11 video',
  },
  {
    type: 'image',
    src: '/WhatsApp Image 2026-05-02 at 1.41.37 PM.jpeg',
    alt: 'HCPL Hazaribag press conference for Omega Cup Hazaribag with Hazaribagh cricket leaders',
  },
  {
    type: 'image',
    src: '/WhatsApp Image 2026-05-02 at 1.42.24 PM.jpeg',
    alt: 'Hazaribagh Premier League leaders attending Hazaribagh Cricket Tournament press conference',
  },
  {
    type: 'image',
    src: '/WhatsApp Image 2026-05-02 at 1.42.24 PM (1).jpeg',
    alt: 'Cricket League in Jharkhand audience at HCPL Hazaribag press conference',
  },
]

const contentPages = {
  sponsors: {
    kicker: 'Sponsors',
    title: 'Omega Group Trust Sponsors and Promotion Partners',
    intro: 'Companies sponsoring HCPL Hazaribag matches through Omega Group Trust receive promotional visibility across our league portals.',
    cards: [
      { title: 'Featured Partner', value: 'zumbii.com', meta: 'Fashion, FMCG, pharma and daily essentials' },
      { title: 'Title Sponsor', value: 'Coming Soon', meta: 'Promotion slot open for Omega Group Trust sponsors' },
      { title: 'Ground Partner', value: 'Coming Soon', meta: 'Company promotion available on HCPL League portals' },
    ],
  },
  gallery: {
    kicker: 'Gallery',
    title: 'HCPL Hazaribag Moments',
    intro: 'Browse Hazaribagh Cricket Tournament press conference photos, Omega Cup Hazaribag updates, and league event media.',
    gallery: defaultGalleryItems,
  },
  highlights: {
    kicker: 'Highlights',
    title: 'Hazaribagh Cricket Tournament Highlights',
    intro: 'Live Match Hazaribag video highlights and best Hazaribagh Premier League moments will be added after official matches are completed.',
    cards: [
      { title: 'Latest Highlight', value: 'Coming Soon', meta: 'Match clips will appear here' },
      { title: 'Best Sixes', value: 'Coming Soon', meta: 'Fan favorite moments' },
      { title: 'Best Wickets', value: 'Coming Soon', meta: 'Bowling highlights' },
    ],
  },
}

function getStoredAdminContent() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const storedContent = JSON.parse(window.localStorage.getItem(adminContentStorageKey)) || null
    const sanitizedContent = sanitizeStoredAdminContent(storedContent)

    if (sanitizedContent && JSON.stringify(storedContent) !== JSON.stringify(sanitizedContent)) {
      window.localStorage.setItem(adminContentStorageKey, JSON.stringify(sanitizedContent))
    }

    return sanitizedContent
  } catch {
    return null
  }
}

function isOldGallerySponsorImage(image) {
  const oldGalleryImageNames = [
    'WhatsApp Image 2026-05-02 at 1.41.37 PM.jpeg',
    'WhatsApp Image 2026-05-02 at 1.42.24 PM.jpeg',
    'WhatsApp Image 2026-05-02 at 1.42.24 PM (1).jpeg',
  ]

  return oldGalleryImageNames.some((imageName) => image?.src?.includes(imageName))
}

function sanitizeStoredAdminContent(content) {
  if (!content) {
    return null
  }

  return {
    ...content,
    sponsorImages: (content.sponsorImages || []).filter((image) => !isOldGallerySponsorImage(image)),
  }
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Unable to read image file.'))
    reader.readAsDataURL(file)
  })
}

function MatchCenterPage() {
  return (
    <main className="info-page">
      <section className="info-hero">
        <span className="section-kicker">Match Center</span>
        <h2>Live Match Hazaribag Scores, Schedule, Points Table and Player Stats</h2>
        <p>Track the complete HCPL Hazaribag match picture in one place, from Hazaribagh Cricket Tournament live scores to Hazaribagh Premier League standings and top performers.</p>
      </section>

      <section className="match-center-block">
        <div className="block-heading">
          <h3>Live Match Hazaribag Scores</h3>
          <span>Updated during HCPL Hazaribag match time</span>
        </div>
        <div className="info-grid">
          {matchCenterData.liveScores.map((card) => (
            <article key={`${card.title}-${card.value}`} className="info-card">
              <span>{card.title}</span>
              <strong>{card.value}</strong>
              <p>{card.meta}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="match-center-block">
        <div className="block-heading">
          <h3>Hazaribagh Cricket Tournament Schedule</h3>
          <span>Upcoming Cricket League in Jharkhand fixtures</span>
        </div>
        <div className="table-panel">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Match</th>
                <th>Venue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {matchCenterData.schedule.map((row, index) => (
                <tr key={index}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${index}-${cellIndex}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="match-center-block">
        <div className="block-heading">
          <h3>Hazaribagh Premier League Points Table</h3>
          <span>Official Omega Cup Hazaribag standings</span>
        </div>
        <div className="table-panel">
          <table>
            <thead>
              <tr>
                <th>Team</th>
                <th>P</th>
                <th>W</th>
                <th>L</th>
                <th>NRR</th>
                <th>Pts</th>
              </tr>
            </thead>
            <tbody>
              {matchCenterData.points.map((row, index) => (
                <tr key={index}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${index}-${cellIndex}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="match-center-block">
        <div className="block-heading">
          <h3>HCPL Hazaribag Player Stats</h3>
          <span>Top Cricket League in Jharkhand performers</span>
        </div>
        <div className="info-grid">
          {matchCenterData.playerStats.map((card) => (
            <article key={`${card.title}-${card.value}`} className="info-card">
              <span>{card.title}</span>
              <strong>{card.value}</strong>
              <p>{card.meta}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

function InfoPage({ pageData }) {
  return (
    <main className="info-page">
      <section className="info-hero">
        <span className="section-kicker">{pageData.kicker}</span>
        <h2>{pageData.title}</h2>
        <p>{pageData.intro}</p>
      </section>

      {pageData.cards && (
        <section className="info-grid">
          {pageData.cards.map((card) => (
            <article key={`${card.title}-${card.value}`} className="info-card">
              <span>{card.title}</span>
              <strong>{card.value}</strong>
              <p>{card.meta}</p>
            </article>
          ))}
        </section>
      )}

      {pageData.table && (
        <section className="table-panel">
          <table>
            <thead>
              <tr>
                {pageData.table.headings.map((heading) => (
                  <th key={heading}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageData.table.rows.map((row, index) => (
                <tr key={index}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${index}-${cellIndex}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {pageData.gallery && (
        <section className="page-gallery">
          {pageData.gallery.map((item) => (
            item.type === 'video' ? (
              <article key={item.src} className="gallery-video-card">
                <h3>{item.title}</h3>
                <video controls preload="metadata" title={item.title}>
                  <source src={item.src} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </article>
            ) : (
              <img key={item.src} src={item.src} alt={item.alt} width="420" height="280" loading="lazy" />
            )
          ))}
        </section>
      )}
    </main>
  )
}

function getYouTubeEmbedUrl(url) {
  try {
    const parsedUrl = new URL(url)
    const videoId = parsedUrl.hostname.includes('youtu.be')
      ? parsedUrl.pathname.slice(1)
      : parsedUrl.searchParams.get('v')

    if (!videoId) {
      return null
    }

    return `https://www.youtube.com/embed/${videoId}?autoplay=0&playsinline=1&rel=0&controls=1`
  } catch {
    return null
  }
}

function normalizeLiveMatch(data) {
  return {
    title: data.title || data.matchTitle || data.name || fallbackMatch.title,
    status: data.status || data.matchStatus || 'Live',
    streamUrl: data.streamUrl || data.videoUrl || data.liveStreamUrl || fallbackMatch.streamUrl,
    venue: data.venue || fallbackMatch.venue,
    battingTeam: data.battingTeam || data.teamA || data.homeTeam || fallbackMatch.battingTeam,
    bowlingTeam: data.bowlingTeam || data.teamB || data.awayTeam || fallbackMatch.bowlingTeam,
    score: data.score || data.currentScore || fallbackMatch.score,
    overs: data.overs || data.currentOvers || fallbackMatch.overs,
    target: data.target || data.chaseTarget || fallbackMatch.target,
  }
}

function parseScoreValue(score) {
  const [runsText = '0', wicketsText = '0'] = String(score || '').split('/')
  return {
    runs: Number.parseInt(runsText, 10) || 0,
    wickets: Number.parseInt(wicketsText, 10) || 0,
  }
}

function formatScoreValue(runs, wickets) {
  return `${Math.max(0, runs)}/${Math.min(10, Math.max(0, wickets))}`
}

function oversToBalls(overs) {
  const [completedOversText = '0', ballsText = '0'] = String(overs || '').split('.')
  const completedOvers = Number.parseInt(completedOversText, 10) || 0
  const balls = Math.min(5, Number.parseInt(ballsText, 10) || 0)
  return (completedOvers * 6) + balls
}

function ballsToOvers(totalBalls) {
  const safeBalls = Math.max(0, totalBalls)
  return `${Math.floor(safeBalls / 6)}.${safeBalls % 6}`
}

function buildLiveMatchUpdate(form) {
  return {
    ...fallbackMatch,
    ...form,
    title: form.title.trim(),
    status: form.status.trim(),
    streamUrl: form.streamUrl.trim(),
    venue: form.venue.trim(),
    battingTeam: form.battingTeam.trim(),
    bowlingTeam: form.bowlingTeam.trim(),
    score: form.score.trim(),
    overs: form.overs.trim(),
    target: form.target.trim(),
  }
}

function getStoredAdminAuth() {
  return window.localStorage.getItem('hcplAdminAuthenticated') === 'true'
}

function createAdminEditForm(team) {
  return {
    id: team.id,
    submittedAt: team.submittedAt,
    teamName: team.teamName || '',
    captainName: team.captainName || '',
    captainNumber: team.captainNumber || '',
    viceCaptainName: team.viceCaptainName || '',
    viceCaptainNumber: team.viceCaptainNumber || '',
    status: team.status || pendingVerificationStatus,
    sponsorPaid: Boolean(team.sponsorPaid),
    teamLogoName: team.teamLogoName || '',
    playersText: (team.players || [])
      .map((player) => `${player.name || ''} | ${player.aadhaar || ''}`)
      .join('\n'),
  }
}

function parseAdminPlayers(playersText) {
  return playersText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [namePart, aadhaarPart = ''] = line.split('|')
      return {
        playerNumber: index + 1,
        name: namePart.trim(),
        aadhaar: aadhaarPart.trim(),
      }
    })
    .filter((player) => player.name || player.aadhaar)
}

function escapeCsvValue(value) {
  const text = String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatTeamExportDate(value) {
  try {
    return new Date(value).toLocaleString('en-IN')
  } catch {
    return value
  }
}

function buildTeamExportRows(teams) {
  return teams.map((team) => ({
    teamName: team.teamName || '',
    status: team.status || '',
    captainName: team.captainName || '',
    captainNumber: team.captainNumber || '',
    viceCaptainName: team.viceCaptainName || '',
    viceCaptainNumber: team.viceCaptainNumber || '',
    sponsorPaid: team.sponsorPaid ? 'Yes' : 'No',
    teamLogoName: team.teamLogoName || '',
    submittedAt: formatTeamExportDate(team.submittedAt),
    playerCount: team.players?.length || 0,
    players: (team.players || [])
      .map((player) => `P${player.playerNumber}: ${player.name || 'NA'} (${player.aadhaar || 'NA'})`)
      .join(' | '),
  }))
}

function downloadTeamExcel(teams) {
  if (!teams.length) {
    return 'No team data available to export.'
  }

  const headers = [
    'Team Name',
    'Status',
    'Captain Name',
    'Captain Number',
    'Vice Captain Name',
    'Vice Captain Number',
    'Sponsor Paid',
    'Team Logo',
    'Submitted At',
    'Player Count',
    'Players',
  ]

  const rows = buildTeamExportRows(teams)
  const csv = [
    headers.map(escapeCsvValue).join(','),
    ...rows.map((row) => (
      [
        row.teamName,
        row.status,
        row.captainName,
        row.captainNumber,
        row.viceCaptainName,
        row.viceCaptainNumber,
        row.sponsorPaid,
        row.teamLogoName,
        row.submittedAt,
        row.playerCount,
        row.players,
      ].map(escapeCsvValue).join(',')
    )),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `hcpl-team-export-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
  return 'Excel export downloaded successfully.'
}

function openTeamPdfExport(teams) {
  if (!teams.length) {
    return 'No team data available to export.'
  }

  const exportWindow = window.open('', '_blank', 'width=1200,height=900')
  if (!exportWindow) {
    return 'Allow pop-ups to open the PDF export preview.'
  }

  const generatedAt = formatTeamExportDate(new Date().toISOString())
  const teamSections = teams.map((team) => `
    <section class="team-card">
      <div class="team-header">
        <div>
          <h2>${escapeHtml(team.teamName || 'Unnamed Team')}</h2>
          <p>Status: ${escapeHtml(team.status || 'Pending management verification')}</p>
        </div>
        <span>Submitted: ${escapeHtml(formatTeamExportDate(team.submittedAt))}</span>
      </div>
      <div class="team-meta">
        <div><strong>Captain</strong><span>${escapeHtml(team.captainName || '-')} (${escapeHtml(team.captainNumber || '-')})</span></div>
        <div><strong>Vice Captain</strong><span>${escapeHtml(team.viceCaptainName || '-')} (${escapeHtml(team.viceCaptainNumber || '-')})</span></div>
        <div><strong>Sponsor Paid</strong><span>${team.sponsorPaid ? 'Yes' : 'No'}</span></div>
        <div><strong>Team Logo</strong><span>${escapeHtml(team.teamLogoName || 'Not uploaded')}</span></div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Player No.</th>
            <th>Name</th>
            <th>Aadhaar</th>
          </tr>
        </thead>
        <tbody>
          ${(team.players || []).map((player) => `
            <tr>
              <td>${escapeHtml(player.playerNumber)}</td>
              <td>${escapeHtml(player.name || '-')}</td>
              <td>${escapeHtml(player.aadhaar || '-')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </section>
  `).join('')

  exportWindow.document.write(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>HCPL Team Export</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 32px;
            color: #13243a;
            background: #ffffff;
          }
          .report-header {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            align-items: flex-start;
            margin-bottom: 24px;
          }
          .report-header h1 {
            margin: 0;
            font-size: 28px;
          }
          .report-header p {
            margin: 8px 0 0;
            color: #526275;
          }
          .team-card {
            border: 1px solid #d8e0e8;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            break-inside: avoid;
          }
          .team-header {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 16px;
          }
          .team-header h2 {
            margin: 0;
            font-size: 22px;
          }
          .team-header p,
          .team-header span {
            margin: 6px 0 0;
            color: #526275;
          }
          .team-meta {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
            margin-bottom: 16px;
          }
          .team-meta div {
            padding: 12px;
            border-radius: 8px;
            background: #f8fafc;
          }
          .team-meta strong,
          .team-meta span {
            display: block;
          }
          .team-meta strong {
            margin-bottom: 6px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th,
          td {
            padding: 10px 12px;
            border: 1px solid #d8e0e8;
            text-align: left;
            vertical-align: top;
          }
          th {
            background: #eff4f8;
          }
          @media print {
            body {
              margin: 18px;
            }
          }
        </style>
      </head>
      <body>
        <header class="report-header">
          <div>
            <h1>HCPL Team Registration Export</h1>
            <p>Generated from the admin panel on ${escapeHtml(generatedAt)}</p>
          </div>
          <div>
            <strong>Total Teams:</strong> ${teams.length}
          </div>
        </header>
        ${teamSections}
        <script>
          window.onload = function () {
            window.print();
          };
        </script>
      </body>
    </html>
  `)
  exportWindow.document.close()
  return 'PDF export opened in a new window. Choose Save as PDF in the print dialog.'
}

function buildRegistrationPayload(form) {
  const formData = new FormData(form)
  const sponsorPaid = formData.get('sponsorPaid') === 'yes'
  const teamLogoFile = formData.get('teamLogo')
  const players = Array.from({ length: 15 }, (_, index) => {
    const playerNumber = index + 1
    const name = formData.get(`player-${playerNumber}-name`)?.toString().trim()
    const aadhaar = formData.get(`player-${playerNumber}-aadhaar`)?.toString().trim()

    if (!name && !aadhaar) {
      return null
    }

    return {
      playerNumber,
      name,
      aadhaar,
    }
  }).filter(Boolean)

  return {
    submittedAt: new Date().toISOString(),
    status: pendingVerificationStatus,
    teamName: formData.get('teamName')?.toString().trim(),
    captainName: formData.get('captainName')?.toString().trim(),
    captainNumber: formData.get('captainNumber')?.toString().trim(),
    viceCaptainName: formData.get('viceCaptainName')?.toString().trim(),
    viceCaptainNumber: formData.get('viceCaptainNumber')?.toString().trim(),
    sponsorPaid,
    teamLogoName: sponsorPaid && teamLogoFile && typeof teamLogoFile === 'object' && 'name' in teamLogoFile ? teamLogoFile.name : '',
    players,
  }
}

function getTeamKey(team) {
  return team.id || `${team.teamName}-${team.submittedAt}`
}

function TeamRosterCard({ team, className }) {
  const [isOpen, setIsOpen] = useState(false)
  const totalPlayersLabel = `${team.players.length} Player${team.players.length === 1 ? '' : 's'}`

  return (
    <article className={className}>
      <div className="team-card-topline">
        <span className="team-status-badge">{team.status}</span>
        <span className="team-count-badge">{totalPlayersLabel}</span>
      </div>
      <button
        type="button"
        className="team-name-toggle"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
      >
        <span className="team-name-copy">
          <span className="team-name-heading">{team.teamName}</span>
          <small>{isOpen ? 'Tap to collapse roster' : 'Tap to view full roster'}</small>
        </span>
        <span className="team-toggle-icon" aria-hidden="true">
          {isOpen ? '−' : '+'}
        </span>
      </button>
      <div className="team-meta-list">
        <p><strong>Captain</strong>{team.captainName}</p>
        <p><strong>Vice Captain</strong>{team.viceCaptainName}</p>
        <p><strong>Sponsor</strong>{team.sponsorPaid ? 'Paid' : 'Not paid'}</p>
        {team.teamLogoName && <p><strong>Logo</strong>{team.teamLogoName}</p>}
      </div>
      <small className="team-card-footnote">{totalPlayersLabel} verified for public display</small>
      {isOpen && (
        <div className="team-players-panel">
          <strong>Registered Players</strong>
          <ul className="team-players-list">
            {team.players.map((player) => (
              <li key={`${getTeamKey(team)}-${player.playerNumber}`}>
                <span className="team-player-number">{player.playerNumber}</span>
                <span className="team-player-name">{player.name || 'Name not added'}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  )
}

function TeamsPage({ verifiedTeams, publicTeamsStatus }) {
  return (
    <main className="info-page">
      <section className="info-hero">
        <span className="section-kicker">Teams</span>
        <h2>Verified Teams</h2>
        <p>Teams appear here automatically after management verification in the admin panel.</p>
      </section>

      {verifiedTeams.length > 0 ? (
        <section className="verified-team-grid">
          {verifiedTeams.map((team) => (
            <TeamRosterCard key={getTeamKey(team)} team={team} className="verified-team-card" />
          ))}
        </section>
      ) : (
        <section className="admin-empty-state">
          <h3>No verified teams yet</h3>
          <p>{publicTeamsStatus || 'Create a team from Registration, then verify it in Admin and it will appear here automatically.'}</p>
        </section>
      )}
    </main>
  )
}

function AdminPanel({
  adminActionMessage,
  adminEditForm,
  adminForm,
  adminError,
  adminGalleryItems,
  liveMatchForm,
  isAdminAuthenticated,
  isLoadingAdminTeams,
  onAdminDeleteTeam,
  onAdminEditChange,
  onAdminExportExcel,
  onAdminExportPdf,
  onAdminGalleryUpload,
  onAdminInputChange,
  onAdminLogin,
  onAdminLogout,
  onAdminLiveMatchChange,
  onAdminLiveMatchSave,
  onAdminScoreEvent,
  onAdminSaveEdit,
  onAdminSelectTeam,
  onAdminSponsorUpload,
  onRemoveAdminGalleryItem,
  onRemoveAdminSponsorImage,
  onUpdateTeamStatus,
  registeredTeams,
  sponsorImages,
}) {
  if (!isAdminAuthenticated) {
    return (
      <main className="admin-page">
        <section className="admin-login-shell">
          <div className="admin-login-copy">
            <span className="section-kicker">Admin Panel</span>
            <h2>Management Login</h2>
            <p>Use the admin credentials to fetch team registrations from Supabase, review captain details, and verify approved teams.</p>
          </div>

          <form className="admin-login-form" onSubmit={onAdminLogin}>
            <label>
              Username
              <input
                name="username"
                type="text"
                value={adminForm.username}
                onChange={onAdminInputChange}
                placeholder="Enter username"
                required
              />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                value={adminForm.password}
                onChange={onAdminInputChange}
                placeholder="Enter password"
                required
              />
            </label>
            <button type="submit">Login to Admin</button>
            {adminError && <p role="alert">{adminError}</p>}
          </form>
        </section>
      </main>
    )
  }

  return (
    <main className="admin-page">
      <section className="admin-hero">
        <div>
          <span className="section-kicker">Admin Panel</span>
          <h2>Registration Review Dashboard</h2>
          <p>Management dashboard connected to Supabase for reviewing new team registrations and publishing verified teams to users.</p>
        </div>
        <button type="button" className="admin-logout" onClick={onAdminLogout}>
          Logout
        </button>
      </section>

      <section className="admin-summary">
        <article className="admin-summary-card">
          <span>Total Registrations</span>
          <strong>{registeredTeams.length}</strong>
          <p>Teams currently available in the database</p>
        </article>
        <article className="admin-summary-card">
          <span>Pending Verification</span>
          <strong>{registeredTeams.filter((team) => team.status === pendingVerificationStatus).length}</strong>
          <p>Awaiting management approval</p>
        </article>
        <article className="admin-summary-card">
          <span>Players Submitted</span>
          <strong>{registeredTeams.reduce((total, team) => total + team.players.length, 0)}</strong>
          <p>Total player records collected</p>
        </article>
      </section>

      <section className="admin-table-panel">
        <div className="block-heading admin-panel-heading">
          <div>
            <h3>Live Score Match</h3>
            <span>Update team names, score, overs, target, venue, and YouTube live link</span>
          </div>
        </div>
        <form className="admin-edit-panel" onSubmit={onAdminLiveMatchSave}>
          <div className="admin-score-control">
            <div>
              <span>{liveMatchForm.battingTeam}</span>
              <strong>{liveMatchForm.score}</strong>
              <small>Overs {liveMatchForm.overs} | Target {liveMatchForm.target}</small>
            </div>
            <div className="admin-score-buttons">
              <button type="button" onClick={() => onAdminScoreEvent({ runs: 0, legalBall: true })}>0</button>
              <button type="button" onClick={() => onAdminScoreEvent({ runs: 1, legalBall: true })}>1</button>
              <button type="button" onClick={() => onAdminScoreEvent({ runs: 2, legalBall: true })}>2</button>
              <button type="button" onClick={() => onAdminScoreEvent({ runs: 3, legalBall: true })}>3</button>
              <button type="button" onClick={() => onAdminScoreEvent({ runs: 4, legalBall: true })}>4</button>
              <button type="button" onClick={() => onAdminScoreEvent({ runs: 6, legalBall: true })}>6</button>
              <button type="button" onClick={() => onAdminScoreEvent({ runs: 0, wicket: true, legalBall: true })}>Wicket</button>
              <button type="button" onClick={() => onAdminScoreEvent({ runs: 1, legalBall: false })}>Wide</button>
              <button type="button" onClick={() => onAdminScoreEvent({ runs: 1, legalBall: false })}>No Ball</button>
              <button type="button" className="secondary" onClick={() => onAdminScoreEvent({ undoBall: true })}>Undo Ball</button>
            </div>
          </div>
          <div className="admin-edit-grid">
            <label>
              Match Title
              <input name="title" type="text" value={liveMatchForm.title} onChange={onAdminLiveMatchChange} required />
            </label>
            <label>
              Status
              <input name="status" type="text" value={liveMatchForm.status} onChange={onAdminLiveMatchChange} required />
            </label>
            <label>
              YouTube or Video Link
              <input name="streamUrl" type="url" value={liveMatchForm.streamUrl} onChange={onAdminLiveMatchChange} required />
            </label>
            <label>
              Venue
              <input name="venue" type="text" value={liveMatchForm.venue} onChange={onAdminLiveMatchChange} required />
            </label>
            <label>
              Batting Team Name
              <input name="battingTeam" type="text" value={liveMatchForm.battingTeam} onChange={onAdminLiveMatchChange} required />
            </label>
            <label>
              Bowling Team Name
              <input name="bowlingTeam" type="text" value={liveMatchForm.bowlingTeam} onChange={onAdminLiveMatchChange} required />
            </label>
            <label>
              Score
              <input name="score" type="text" value={liveMatchForm.score} onChange={onAdminLiveMatchChange} placeholder="150/5" required />
            </label>
            <label>
              Overs
              <input name="overs" type="text" value={liveMatchForm.overs} onChange={onAdminLiveMatchChange} placeholder="17.4" required />
            </label>
            <label>
              Target
              <input name="target" type="text" value={liveMatchForm.target} onChange={onAdminLiveMatchChange} placeholder="146" required />
            </label>
          </div>
          <div className="admin-team-actions">
            <button type="submit">Update Live Match</button>
          </div>
        </form>
      </section>

      <section className="admin-table-panel">
        <div className="block-heading admin-panel-heading">
          <div>
            <h3>Gallery Images</h3>
            <span>Upload images that appear on the Gallery page</span>
          </div>
        </div>
        <div className="admin-upload-panel">
          <label>
            Add Gallery Images
            <input type="file" accept="image/*" multiple onChange={onAdminGalleryUpload} />
          </label>
          <div className="admin-media-grid">
            {adminGalleryItems.filter((item) => item.type === 'image').map((item, index) => (
              <article key={`${item.src}-${index}`} className="admin-media-card">
                <img src={item.src} alt={item.alt || `Gallery upload ${index + 1}`} />
                <p>{item.alt || `Gallery image ${index + 1}`}</p>
                <button type="button" className="danger" onClick={() => onRemoveAdminGalleryItem(item.src)}>
                  Remove
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="admin-table-panel">
        <div className="block-heading admin-panel-heading">
          <div>
            <h3>Sponsor Images</h3>
            <span>Upload sponsor or partner images shown on the homepage and Sponsors page</span>
          </div>
        </div>
        <div className="admin-upload-panel">
          <label>
            Add Sponsor Images
            <input type="file" accept="image/*" multiple onChange={onAdminSponsorUpload} />
          </label>
          <div className="admin-media-grid">
            {sponsorImages.map((image, index) => (
              <article key={`${image.src}-${index}`} className="admin-media-card">
                <img src={image.src} alt={image.alt || `Sponsor upload ${index + 1}`} />
                <p>{image.alt || `Sponsor image ${index + 1}`}</p>
                <button type="button" className="danger" onClick={() => onRemoveAdminSponsorImage(image.src)}>
                  Remove
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="admin-table-panel">
        <div className="block-heading admin-panel-heading">
          <div>
            <h3>Team Registrations</h3>
            <span>{isLoadingAdminTeams ? 'Loading Supabase data...' : registeredTeams.length > 0 ? 'Live Supabase data' : 'No submissions yet'}</span>
          </div>
          <div className="admin-export-actions">
            <button type="button" className="secondary" onClick={onAdminExportExcel}>
              Export Excel
            </button>
            <button type="button" className="secondary" onClick={onAdminExportPdf}>
              Export PDF
            </button>
          </div>
        </div>
        {adminActionMessage && <p className="admin-action-message">{adminActionMessage}</p>}
        {adminEditForm && (
          <form className="admin-edit-panel" onSubmit={onAdminSaveEdit}>
            <div className="block-heading">
              <h3>Edit Team</h3>
              <span>{adminEditForm.teamName || 'Draft update'}</span>
            </div>
            <div className="admin-edit-grid">
              <label>
                Team Name
                <input name="teamName" type="text" value={adminEditForm.teamName} onChange={onAdminEditChange} required />
              </label>
              <label>
                Captain Name
                <input name="captainName" type="text" value={adminEditForm.captainName} onChange={onAdminEditChange} required />
              </label>
              <label>
                Captain Number
                <input name="captainNumber" type="tel" value={adminEditForm.captainNumber} onChange={onAdminEditChange} required />
              </label>
              <label>
                Vice Captain Name
                <input name="viceCaptainName" type="text" value={adminEditForm.viceCaptainName} onChange={onAdminEditChange} required />
              </label>
              <label>
                Vice Captain Number
                <input name="viceCaptainNumber" type="tel" value={adminEditForm.viceCaptainNumber} onChange={onAdminEditChange} required />
              </label>
              <label>
                Status
                <select name="status" value={adminEditForm.status} onChange={onAdminEditChange}>
                  <option value={pendingVerificationStatus}>{pendingVerificationStatus}</option>
                  <option value={verifiedTeamStatus}>{verifiedTeamStatus}</option>
                </select>
              </label>
              <label className="admin-checkbox">
                <input
                  name="sponsorPaid"
                  type="checkbox"
                  checked={adminEditForm.sponsorPaid}
                  onChange={onAdminEditChange}
                />
                Sponsor payment received
              </label>
              <label>
                Team Logo Name
                <input name="teamLogoName" type="text" value={adminEditForm.teamLogoName} onChange={onAdminEditChange} />
              </label>
            </div>
            <label className="admin-players-editor">
              Players
              <textarea
                name="playersText"
                value={adminEditForm.playersText}
                onChange={onAdminEditChange}
                rows="8"
                placeholder="One player per line: Name | Aadhaar"
              />
            </label>
            <div className="admin-team-actions">
              <button type="submit">Save Team Update</button>
            </div>
          </form>
        )}
        {registeredTeams.length > 0 ? (
          <div className="admin-team-list">
            {registeredTeams.map((team) => (
              <article key={getTeamKey(team)} className="admin-team-card">
                <div className="admin-team-card-header">
                  <div>
                    <h3>{team.teamName}</h3>
                    <p>{team.status}</p>
                  </div>
                  <small>{new Date(team.submittedAt).toLocaleString()}</small>
                </div>
                <div className="admin-team-meta">
                  <p><strong>Captain:</strong> {team.captainName} ({team.captainNumber})</p>
                  <p><strong>Vice Captain:</strong> {team.viceCaptainName} ({team.viceCaptainNumber})</p>
                  <p><strong>Players:</strong> {team.players.length}</p>
                  <p><strong>Sponsor Payment:</strong> {team.sponsorPaid ? 'Paid' : 'Not paid'}</p>
                  <p><strong>Logo:</strong> {team.teamLogoName || 'Not uploaded'}</p>
                </div>
                <div className="admin-team-actions">
                  <button type="button" className="secondary" onClick={() => onAdminSelectTeam(team)}>
                    Edit Team
                  </button>
                  {team.status === verifiedTeamStatus ? (
                    <button type="button" className="verified" disabled>
                      Verified
                    </button>
                  ) : (
                    <button type="button" onClick={() => onUpdateTeamStatus(team.id, verifiedTeamStatus)}>
                      Verify Team
                    </button>
                  )}
                  <button type="button" className="secondary" onClick={() => onUpdateTeamStatus(team.id, pendingVerificationStatus)}>
                    Mark Pending
                  </button>
                  <button type="button" className="danger" onClick={() => onAdminDeleteTeam(team.id)}>
                    Delete Team
                  </button>
                </div>
                <div className="admin-player-grid">
                  {team.players.map((player) => (
                    <div key={`${team.teamName}-${player.playerNumber}`} className="admin-player-card">
                      <span>Player {player.playerNumber}</span>
                      <strong>{player.name || 'Name not added'}</strong>
                      <p>Aadhaar: {player.aadhaar || 'Not provided'}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="admin-empty-state">
            <h3>No registrations yet</h3>
            <p>Once a team submits the registration form, it will appear here for management review.</p>
          </div>
        )}
      </section>
    </main>
  )
}

const playerShape = PropTypes.shape({
  playerNumber: PropTypes.number,
  name: PropTypes.string,
  aadhaar: PropTypes.string,
})

const teamShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  submittedAt: PropTypes.string,
  status: PropTypes.string,
  teamName: PropTypes.string,
  captainName: PropTypes.string,
  captainNumber: PropTypes.string,
  viceCaptainName: PropTypes.string,
  viceCaptainNumber: PropTypes.string,
  sponsorPaid: PropTypes.bool,
  teamLogoName: PropTypes.string,
  players: PropTypes.arrayOf(playerShape),
})

TeamRosterCard.propTypes = {
  team: teamShape.isRequired,
  className: PropTypes.string.isRequired,
}

InfoPage.propTypes = {
  pageData: PropTypes.shape({
    kicker: PropTypes.string,
    title: PropTypes.string,
    intro: PropTypes.string,
    cards: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string,
      value: PropTypes.string,
      meta: PropTypes.string,
    })),
    table: PropTypes.shape({
      headings: PropTypes.arrayOf(PropTypes.string),
      rows: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
    }),
    gallery: PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.string,
      src: PropTypes.string,
      title: PropTypes.string,
      alt: PropTypes.string,
    })),
  }).isRequired,
}

TeamsPage.propTypes = {
  verifiedTeams: PropTypes.arrayOf(teamShape).isRequired,
  publicTeamsStatus: PropTypes.string.isRequired,
}

AdminPanel.propTypes = {
  adminActionMessage: PropTypes.string.isRequired,
  adminEditForm: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    submittedAt: PropTypes.string,
    teamName: PropTypes.string,
    captainName: PropTypes.string,
    captainNumber: PropTypes.string,
    viceCaptainName: PropTypes.string,
    viceCaptainNumber: PropTypes.string,
    status: PropTypes.string,
    sponsorPaid: PropTypes.bool,
    teamLogoName: PropTypes.string,
    playersText: PropTypes.string,
  }),
  adminForm: PropTypes.shape({
    username: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
  }).isRequired,
  adminError: PropTypes.string.isRequired,
  adminGalleryItems: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string,
    src: PropTypes.string,
    title: PropTypes.string,
    alt: PropTypes.string,
  })).isRequired,
  isAdminAuthenticated: PropTypes.bool.isRequired,
  isLoadingAdminTeams: PropTypes.bool.isRequired,
  liveMatchForm: PropTypes.shape({
    title: PropTypes.string,
    status: PropTypes.string,
    streamUrl: PropTypes.string,
    venue: PropTypes.string,
    battingTeam: PropTypes.string,
    bowlingTeam: PropTypes.string,
    score: PropTypes.string,
    overs: PropTypes.string,
    target: PropTypes.string,
  }).isRequired,
  onAdminDeleteTeam: PropTypes.func.isRequired,
  onAdminEditChange: PropTypes.func.isRequired,
  onAdminExportExcel: PropTypes.func.isRequired,
  onAdminExportPdf: PropTypes.func.isRequired,
  onAdminGalleryUpload: PropTypes.func.isRequired,
  onAdminInputChange: PropTypes.func.isRequired,
  onAdminLogin: PropTypes.func.isRequired,
  onAdminLogout: PropTypes.func.isRequired,
  onAdminLiveMatchChange: PropTypes.func.isRequired,
  onAdminLiveMatchSave: PropTypes.func.isRequired,
  onAdminScoreEvent: PropTypes.func.isRequired,
  onAdminSaveEdit: PropTypes.func.isRequired,
  onAdminSelectTeam: PropTypes.func.isRequired,
  onAdminSponsorUpload: PropTypes.func.isRequired,
  onRemoveAdminGalleryItem: PropTypes.func.isRequired,
  onRemoveAdminSponsorImage: PropTypes.func.isRequired,
  onUpdateTeamStatus: PropTypes.func.isRequired,
  registeredTeams: PropTypes.arrayOf(teamShape).isRequired,
  sponsorImages: PropTypes.arrayOf(PropTypes.shape({
    src: PropTypes.string,
    alt: PropTypes.string,
  })).isRequired,
}

function App() {
  const storedAdminContent = getStoredAdminContent()
  const [page, setPage] = useState(() => (window.location.hash === '#admin' ? 'admin' : 'home'))
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [liveMatch, setLiveMatch] = useState(storedAdminContent?.liveMatch || fallbackMatch)
  const [liveMatchForm, setLiveMatchForm] = useState(storedAdminContent?.liveMatch || fallbackMatch)
  const [adminGalleryItems, setAdminGalleryItems] = useState(storedAdminContent?.galleryItems || defaultGalleryItems)
  const [sponsorImages, setSponsorImages] = useState(storedAdminContent?.sponsorImages || defaultSponsorImages)
  const [registrationStatus, setRegistrationStatus] = useState('')
  const [registeredTeams, setRegisteredTeams] = useState([])
  const [verifiedTeams, setVerifiedTeams] = useState([])
  const [publicTeamsStatus, setPublicTeamsStatus] = useState(
    isSupabaseConfigured ? 'Loading verified teams...' : supabaseConfigMessage,
  )
  const [adminActionMessage, setAdminActionMessage] = useState('')
  const [adminEditForm, setAdminEditForm] = useState(null)
  const [adminForm, setAdminForm] = useState({ username: '', password: '' })
  const [adminError, setAdminError] = useState('')
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [isLoadingAdminTeams, setIsLoadingAdminTeams] = useState(false)
  const [sponsorPaid, setSponsorPaid] = useState(false)
  const [matchApiStatus, setMatchApiStatus] = useState(liveMatchApiUrl ? 'Connecting live API...' : 'Add API URL to enable live feed')
  const youtubeEmbedUrl = getYouTubeEmbedUrl(liveMatch.streamUrl)
  const isAdminPage = page === 'admin'
  const activeContentPages = {
    ...contentPages,
    sponsors: {
      ...contentPages.sponsors,
      gallery: sponsorImages.map((image) => ({ ...image, type: 'image' })),
    },
    gallery: {
      ...contentPages.gallery,
      gallery: adminGalleryItems,
    },
  }

  useEffect(() => {
    window.localStorage.setItem(adminContentStorageKey, JSON.stringify({
      liveMatch,
      galleryItems: adminGalleryItems,
      sponsorImages,
    }))
  }, [adminGalleryItems, liveMatch, sponsorImages])

  useEffect(() => {
    setIsAdminAuthenticated(getStoredAdminAuth())
  }, [])

  useEffect(() => {
    function handleHashChange() {
      if (window.location.hash === '#admin') {
        setPage('admin')
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    function handleStorageSync() {
      setIsAdminAuthenticated(getStoredAdminAuth())
    }

    window.addEventListener('storage', handleStorageSync)
    return () => window.removeEventListener('storage', handleStorageSync)
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadVerifiedTeams() {
      if (!isSupabaseConfigured) {
        if (isMounted) {
          setVerifiedTeams([])
          setPublicTeamsStatus(supabaseConfigMessage)
        }
        return
      }

      try {
        const teams = await fetchVerifiedTeams()
        if (isMounted) {
          setVerifiedTeams(teams)
          setPublicTeamsStatus(teams.length ? '' : 'No verified teams are available yet.')
        }
      } catch (error) {
        if (isMounted) {
          setVerifiedTeams([])
          setPublicTeamsStatus(error.message || 'Unable to load verified teams from Supabase.')
        }
      }
    }

    loadVerifiedTeams()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadAdminTeams() {
      if (!isAdminAuthenticated) {
        if (isMounted) {
          setRegisteredTeams([])
          setAdminEditForm(null)
        }
        return
      }

      if (!isSupabaseConfigured) {
        if (isMounted) {
          setRegisteredTeams([])
          setAdminActionMessage(supabaseConfigMessage)
        }
        return
      }

      setIsLoadingAdminTeams(true)

      try {
        const teams = await fetchAllTeams()
        if (isMounted) {
          setRegisteredTeams(teams)
          setAdminActionMessage(teams.length ? 'Team data loaded from Supabase.' : 'No team registrations found in Supabase yet.')
        }
      } catch (error) {
        if (isMounted) {
          setRegisteredTeams([])
          setAdminActionMessage(error.message || 'Unable to load team registrations from Supabase.')
        }
      } finally {
        if (isMounted) {
          setIsLoadingAdminTeams(false)
        }
      }
    }

    loadAdminTeams()

    return () => {
      isMounted = false
    }
  }, [isAdminAuthenticated])

  useEffect(() => {
    if (!liveMatchApiUrl) {
      return
    }

    let isMounted = true
    let refreshTimer

    async function loadLiveMatch() {
      try {
        const response = await fetch(liveMatchApiUrl)

        if (!response.ok) {
          throw new Error(`Live API returned ${response.status}`)
        }

        const data = await response.json()

        if (isMounted) {
          const nextLiveMatch = normalizeLiveMatch(data)
          setLiveMatch(nextLiveMatch)
          setLiveMatchForm(nextLiveMatch)
          setMatchApiStatus('Live API connected')
        }
      } catch (error) {
        if (isMounted) {
          setMatchApiStatus(error.message || 'Unable to load live API')
        }
      }
    }

    loadLiveMatch()
    refreshTimer = window.setInterval(loadLiveMatch, liveMatchPollMs)

    return () => {
      isMounted = false
      window.clearInterval(refreshTimer)
    }
  }, [])

  async function handleAdminGalleryUpload(event) {
    const files = Array.from(event.target.files || [])

    if (!files.length) {
      return
    }

    try {
      const uploadedItems = await Promise.all(files.map(async (file) => ({
        type: 'image',
        src: await readImageFile(file),
        alt: `${file.name.replace(/\.[^/.]+$/, '')} gallery image for HCPL Hazaribag`,
      })))
      setAdminGalleryItems((current) => [...current, ...uploadedItems])
      setAdminActionMessage(`${uploadedItems.length} gallery image${uploadedItems.length === 1 ? '' : 's'} uploaded.`)
      event.target.value = ''
    } catch (error) {
      setAdminActionMessage(error.message || 'Unable to upload gallery images.')
    }
  }

  async function handleAdminSponsorUpload(event) {
    const files = Array.from(event.target.files || [])

    if (!files.length) {
      return
    }

    try {
      const uploadedImages = await Promise.all(files.map(async (file) => ({
        src: await readImageFile(file),
        alt: `${file.name.replace(/\.[^/.]+$/, '')} sponsor image for Omega Cup Hazaribag`,
      })))
      setSponsorImages((current) => [...current, ...uploadedImages])
      setAdminActionMessage(`${uploadedImages.length} sponsor image${uploadedImages.length === 1 ? '' : 's'} uploaded.`)
      event.target.value = ''
    } catch (error) {
      setAdminActionMessage(error.message || 'Unable to upload sponsor images.')
    }
  }

  function handleAdminLiveMatchChange(event) {
    const { name, value } = event.target
    setLiveMatchForm((current) => ({ ...current, [name]: value }))
  }

  function handleAdminLiveMatchSave(event) {
    event.preventDefault()
    const nextLiveMatch = buildLiveMatchUpdate(liveMatchForm)
    setLiveMatch(nextLiveMatch)
    setLiveMatchForm(nextLiveMatch)
    setMatchApiStatus('Admin live match details saved')
    setAdminActionMessage('Live match details updated on the homepage.')
    window.alert('Live match details updated successfully.')
  }

  function handleAdminScoreEvent(scoreEvent) {
    setLiveMatchForm((current) => {
      const currentScore = parseScoreValue(current.score)
      const currentBalls = oversToBalls(current.overs)
      const nextBalls = scoreEvent.undoBall
        ? Math.max(0, currentBalls - 1)
        : currentBalls + (scoreEvent.legalBall ? 1 : 0)
      const nextScore = formatScoreValue(
        currentScore.runs + (scoreEvent.runs || 0),
        currentScore.wickets + (scoreEvent.wicket ? 1 : 0),
      )
      const nextForm = {
        ...current,
        score: nextScore,
        overs: ballsToOvers(nextBalls),
      }
      const nextLiveMatch = buildLiveMatchUpdate(nextForm)

      setLiveMatch(nextLiveMatch)
      setMatchApiStatus('Admin scoreboard updated')
      setAdminActionMessage('Scoreboard updated.')
      return nextLiveMatch
    })
  }

  function removeAdminGalleryItem(src) {
    setAdminGalleryItems((current) => current.filter((item) => item.src !== src))
    setAdminActionMessage('Gallery image removed.')
  }

  function removeAdminSponsorImage(src) {
    setSponsorImages((current) => current.filter((image) => image.src !== src))
    setAdminActionMessage('Sponsor image removed.')
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <div className="logo-section">
            <div className="logo-mark">
              <img src="/hcpllogo.jpeg" className="logo" alt="HCPL Hazaribag logo for Hazaribagh Cricket Tournament" width="102" height="102" />
            </div>
            <div className="brand-copy">
              <span className="brand-kicker">Hazaribagh Premier League</span>
              <h1>HCPL Hazaribag</h1>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className={isAdminPage ? 'admin-mini-button active' : 'admin-mini-button'}
            onClick={() => {
              if (isAdminPage) {
                return
              }

              window.open(`${window.location.origin}${window.location.pathname}#admin`, '_blank', 'noopener,noreferrer')
            }}
          >
            Admin
          </button>
          {!isAdminPage && (
            <nav className="main-nav">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  className={page === item.id ? 'nav-button active' : 'nav-button'}
                  onClick={() => setPage(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>
      
      {page === 'home' ? (
        <>
          <section className="hero">
        <div className="video-container">
          {youtubeEmbedUrl ? (
            <iframe
              key={youtubeEmbedUrl}
              src={youtubeEmbedUrl}
              title={liveMatch.title}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video key={liveMatch.streamUrl} controls autoPlay muted playsInline>
              <source src={liveMatch.streamUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
          <div className="live-video-overlay">
            <div>
              <span className="live-pill">{liveMatch.status}</span>
              <h2>{liveMatch.title}</h2>
              <p>{liveMatch.venue}</p>
              <a className="youtube-watch-link" href={liveMatch.streamUrl} target="_blank" rel="noreferrer">
                Watch on YouTube
              </a>
            </div>
            <div className="live-score-strip">
              <strong>{liveMatch.battingTeam}</strong>
              <span>{liveMatch.score}</span>
              <small>Overs {liveMatch.overs} | Target {liveMatch.target}</small>
            </div>
          </div>
          <span className="api-status">{matchApiStatus}</span>
        </div>
        <div className="comments">
          <aside className="partner-banner" aria-label="Featured partner zumbii.com promotion">
            <div className="partner-copy">
              <span className="partner-eyebrow">Featured Partner</span>
              <h3>Shop match-day essentials on zumbii.com</h3>
              <p>Fashion, FMCG, pharmaceuticals, Dettol Hand Wash, daily care and more from one trusted store.</p>
              <div className="partner-actions">
                <a className="partner-button" href="https://zumbii.com" target="_blank" rel="noreferrer">
                  Shop Now
                </a>
                <span className="partner-badge">Online + Retail</span>
              </div>
            </div>
            <div className="partner-products" aria-hidden="true">
              <span>Fashion</span>
              <span>FMCG</span>
              <span>Pharma</span>
              <span>Daily Care</span>
            </div>
          </aside>
          <h2>Live Match Hazaribag Comments</h2>
          <div className="comment-list">
            {comments.map((comment, index) => (
              <div key={index} className="comment">
                {comment}
              </div>
            ))}
          </div>
          <div className="comment-form">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
            />
            <button onClick={() => {
              if (newComment.trim()) {
                setComments([...comments, newComment]);
                setNewComment('');
              }
            }}>Post</button>
          </div>
        </div>
      </section>

      <section className="home-banner">
        <img
          src="/progressive banner.png"
          alt="HCPL Hazaribag banner for Hazaribagh Cricket Tournament and Cricket League in Jharkhand"
          width="1600"
          height="500"
          loading="lazy"
        />
      </section>
      
      <section className="content">
        <section className="team-announcement" aria-labelledby="team-announcement-title">
          <div className="team-announcement-header">
            <div>
              <span className="section-kicker">Team Announcement</span>
              <h2 id="team-announcement-title">{teamAnnouncement.title}</h2>
              <p>{teamAnnouncement.announcement}</p>
            </div>
            <span className="announcement-badge">Verification Open</span>
          </div>

          <div className="team-placeholder">
            <div>
              <span>Team Name</span>
              <strong>{verifiedTeams.length > 0 ? `${verifiedTeams.length} Verified Team${verifiedTeams.length === 1 ? '' : 's'}` : 'Waiting for Verification'}</strong>
              <p>Only verified teams from the database are shown to visitors.</p>
            </div>
            <button type="button" onClick={() => setPage('registration')}>
              Register Team
            </button>
          </div>
          {publicTeamsStatus && <p>{publicTeamsStatus}</p>}
          {verifiedTeams.length > 0 && (
            <div className="registered-team-list">
              {verifiedTeams.map((team) => (
                <TeamRosterCard key={getTeamKey(team)} team={team} className="registered-team-card" />
              ))}
            </div>
          )}
        </section>

        <div className="sponsors">
          <h2>Omega Group Trust Sponsor Promotion</h2>
          <div className="press-headline">
            <h3>Companies sponsoring HCPL Hazaribag matches with Omega Group Trust will receive promotion across our official portals.</h3>
            <p className="mission-statement">Sponsor images, brand banners, and partner promotions can be uploaded from the admin panel.</p>
          </div>
          <div className="sponsors-gallery">
            {sponsorImages.length > 0 ? (
              sponsorImages.map((image, index) => (
                <img
                  key={`${image.src}-${index}`}
                  src={image.src}
                  alt={image.alt}
                  className="sponsor-img"
                  width="360"
                  height="250"
                  loading="lazy"
                />
              ))
            ) : (
              <div className="sponsor-empty-state">
                <strong>Sponsor promotions coming soon</strong>
                <p>Approved company sponsor images will appear here after admin upload.</p>
              </div>
            )}
          </div>
        </div>

        <div className="scorecard">
          <h2>Live Match Hazaribag Scorecard</h2>
          <div className="teams">
            <div className="team">
              <h3>{liveMatch.battingTeam}</h3>
              <p>Score: {liveMatch.score}</p>
              <p>Overs: {liveMatch.overs}</p>
            </div>
            <div className="vs">VS</div>
            <div className="team">
              <h3>{liveMatch.bowlingTeam}</h3>
              <p>Target: {liveMatch.target}</p>
              <p>Status: {liveMatch.status}</p>
            </div>
          </div>
        </div>
      </section>
        </>
      ) : page === 'match-center' ? (
        <MatchCenterPage />
      ) : page === 'registration' ? (
        <main className="registration-page">
          <section className="registration-hero">
            <span className="section-kicker">Team Registration</span>
            <h2>Submit Your Squad for Management Verification</h2>
            <p>Register your team with up to 15 players. Captain, vice captain, contact numbers, and Aadhaar details are required for verification.</p>
          </section>

          <form
            className="registration-form"
            onSubmit={async (event) => {
              event.preventDefault()
              const payload = buildRegistrationPayload(event.currentTarget)

              if (payload.players.length === 0) {
                setRegistrationStatus('Add at least one player before submitting.')
                return
              }

              const playerNames = payload.players.map((player) => player.name).filter(Boolean)
              if (!playerNames.includes(payload.captainName) || !playerNames.includes(payload.viceCaptainName)) {
                setRegistrationStatus('Captain and vice captain must both be included in the player list before submission.')
                return
              }

              if (payload.sponsorPaid && !payload.teamLogoName) {
                setRegistrationStatus('Upload a team logo when sponsor payment is marked yes.')
                return
              }

              if (!isSupabaseConfigured) {
                setRegistrationStatus(supabaseConfigMessage)
                return
              }

              try {
                const createdTeam = await createTeamRegistration(payload)

                if (isAdminAuthenticated) {
                  setRegisteredTeams((current) => [createdTeam, ...current])
                }

                if (teamRegistrationWebhookUrl) {
                  try {
                    await fetch(teamRegistrationWebhookUrl, {
                      method: 'POST',
                      mode: 'no-cors',
                      headers: {
                        'Content-Type': 'text/plain;charset=utf-8',
                      },
                      body: JSON.stringify(payload),
                    })
                    setRegistrationStatus('Team registration submitted to Supabase and synced to Google Sheets.')
                  } catch {
                    setRegistrationStatus('Team registration submitted to Supabase. Google Sheets sync could not be confirmed.')
                  }
                } else {
                  setRegistrationStatus('Team registration submitted to Supabase for management verification.')
                }

                setSponsorPaid(false)
                event.currentTarget.reset()
              } catch (error) {
                setRegistrationStatus(error.message || 'Unable to submit team registration to Supabase.')
              }
            }}
          >
            <section className="form-section">
              <h3>Team Details</h3>
              <div className="form-grid">
                <label>
                  Team Name
                  <input name="teamName" type="text" placeholder="Enter team name" required />
                </label>
                <label>
                  Captain Name
                  <input name="captainName" type="text" placeholder="Enter captain name" required />
                  <small className="field-help">Captain must also be entered again in the player list below.</small>
                </label>
                <label>
                  Captain Number
                  <input name="captainNumber" type="tel" placeholder="+91 XXXXX XXXXX" required />
                </label>
                <label>
                  Vice Captain Name
                  <input name="viceCaptainName" type="text" placeholder="Enter vice captain name" required />
                  <small className="field-help">Vice captain must also be entered again in the player list below.</small>
                </label>
                <label>
                  Vice Captain Number
                  <input name="viceCaptainNumber" type="tel" placeholder="+91 XXXXX XXXXX" required />
                </label>
                <fieldset className="sponsor-payment-group">
                  <legend>I have paid the sponsor money</legend>
                  <label className="inline-choice">
                    <input
                      name="sponsorPaid"
                      type="radio"
                      value="yes"
                      checked={sponsorPaid}
                      onChange={() => setSponsorPaid(true)}
                    />
                    Yes
                  </label>
                  <label className="inline-choice">
                    <input
                      name="sponsorPaid"
                      type="radio"
                      value="no"
                      checked={!sponsorPaid}
                      onChange={() => setSponsorPaid(false)}
                    />
                    No
                  </label>
                </fieldset>
                {sponsorPaid && (
                  <label>
                    Team Logo
                    <input name="teamLogo" type="file" accept="image/*" />
                    <small className="field-help">Logo upload is required when sponsor payment is marked yes.</small>
                  </label>
                )}
              </div>
            </section>

            <section className="form-section">
              <div className="players-form-header">
                <h3>Player Details</h3>
                <span>Maximum 15 players</span>
              </div>
              <p className="form-note">Add captain and vice captain names inside the player list as part of the team members.</p>
              <div className="player-fields">
                {Array.from({ length: 15 }, (_, index) => (
                  <fieldset key={index} className="player-fieldset">
                    <legend>Player {index + 1}</legend>
                    <label>
                      Player Name
                      <input name={`player-${index + 1}-name`} type="text" placeholder="Full name" />
                    </label>
                    <label>
                      Aadhaar Card Number
                      <input
                        name={`player-${index + 1}-aadhaar`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]{12}"
                        maxLength="12"
                        placeholder="12 digit Aadhaar number"
                      />
                    </label>
                  </fieldset>
                ))}
              </div>
            </section>

            <div className="registration-actions">
              <button type="submit">Submit for Verification</button>
              {registrationStatus && <p role="status">{registrationStatus}</p>}
            </div>
          </form>
        </main>
      ) : page === 'admin' ? (
        <AdminPanel
          adminActionMessage={adminActionMessage}
          adminEditForm={adminEditForm}
          adminForm={adminForm}
          adminError={adminError}
          adminGalleryItems={adminGalleryItems}
          isAdminAuthenticated={isAdminAuthenticated}
          isLoadingAdminTeams={isLoadingAdminTeams}
          liveMatchForm={liveMatchForm}
          onAdminDeleteTeam={async (teamId) => {
            try {
              await deleteTeamRegistration(teamId)
              setRegisteredTeams((current) => current.filter((team) => team.id !== teamId))
              if (adminEditForm?.id === teamId) {
                setAdminEditForm(null)
              }

              const nextVerifiedTeams = await fetchVerifiedTeams()
              setVerifiedTeams(nextVerifiedTeams)
              setPublicTeamsStatus(nextVerifiedTeams.length ? '' : 'No verified teams are available yet.')
              setAdminActionMessage('Team deleted from the admin dashboard.')
            } catch (error) {
              setAdminActionMessage(error.message || 'Unable to delete team from Supabase.')
            }
          }}
          onAdminEditChange={(event) => {
            const { name, type, value, checked } = event.target
            setAdminEditForm((current) => (
              current
                ? { ...current, [name]: type === 'checkbox' ? checked : value }
                : current
            ))
          }}
          onAdminExportExcel={() => {
            setAdminActionMessage(downloadTeamExcel(registeredTeams))
          }}
          onAdminExportPdf={() => {
            setAdminActionMessage(openTeamPdfExport(registeredTeams))
          }}
          onAdminGalleryUpload={handleAdminGalleryUpload}
          onAdminInputChange={(event) => {
            const { name, value } = event.target
            setAdminForm((current) => ({ ...current, [name]: value }))
          }}
          onAdminLogin={(event) => {
            event.preventDefault()

            if (adminForm.username === adminUsername && adminForm.password === adminPassword) {
              setIsAdminAuthenticated(true)
              setAdminError('')
              setAdminActionMessage('')
              window.localStorage.setItem('hcplAdminAuthenticated', 'true')
              return
            }

            setAdminError('Incorrect username or password.')
          }}
          onAdminLogout={() => {
            setIsAdminAuthenticated(false)
            setAdminError('')
            setAdminActionMessage('')
            setAdminEditForm(null)
            setAdminForm({ username: '', password: '' })
            window.localStorage.removeItem('hcplAdminAuthenticated')
          }}
          onAdminLiveMatchChange={handleAdminLiveMatchChange}
          onAdminLiveMatchSave={handleAdminLiveMatchSave}
          onAdminScoreEvent={handleAdminScoreEvent}
          onAdminSaveEdit={async (event) => {
            event.preventDefault()

            if (!adminEditForm) {
              return
            }

            const players = parseAdminPlayers(adminEditForm.playersText)
            const playerNames = players.map((player) => player.name).filter(Boolean)

            if (!players.length) {
              setAdminActionMessage('Add at least one player before saving the team update.')
              return
            }

            if (!playerNames.includes(adminEditForm.captainName) || !playerNames.includes(adminEditForm.viceCaptainName)) {
              setAdminActionMessage('Captain and vice captain must both exist in the player list before saving.')
              return
            }

            if (adminEditForm.sponsorPaid && !adminEditForm.teamLogoName.trim()) {
              setAdminActionMessage('Add a team logo name when sponsor payment is marked received.')
              return
            }

            try {
              const savedTeam = await updateTeamRegistration(adminEditForm.id, {
                ...adminEditForm,
                teamName: adminEditForm.teamName.trim(),
                captainName: adminEditForm.captainName.trim(),
                captainNumber: adminEditForm.captainNumber.trim(),
                viceCaptainName: adminEditForm.viceCaptainName.trim(),
                viceCaptainNumber: adminEditForm.viceCaptainNumber.trim(),
                teamLogoName: adminEditForm.sponsorPaid ? adminEditForm.teamLogoName.trim() : '',
                players,
              })

              setRegisteredTeams((current) => current.map((team) => (
                team.id === savedTeam.id ? savedTeam : team
              )))

              const nextVerifiedTeams = await fetchVerifiedTeams()
              setVerifiedTeams(nextVerifiedTeams)
              setPublicTeamsStatus(nextVerifiedTeams.length ? '' : 'No verified teams are available yet.')
              setAdminEditForm(null)
              setAdminActionMessage('Team details updated successfully.')
            } catch (error) {
              setAdminActionMessage(error.message || 'Unable to update team in Supabase.')
            }
          }}
          onAdminSelectTeam={(team) => {
            setAdminEditForm(createAdminEditForm(team))
            setAdminActionMessage('')
          }}
          onAdminSponsorUpload={handleAdminSponsorUpload}
          onRemoveAdminGalleryItem={removeAdminGalleryItem}
          onRemoveAdminSponsorImage={removeAdminSponsorImage}
          onUpdateTeamStatus={async (teamId, status) => {
            try {
              const updatedTeam = await updateTeamVerificationStatus(teamId, status)
              setRegisteredTeams((current) => current.map((team) => (
                team.id === updatedTeam.id ? updatedTeam : team
              )))

              if (adminEditForm?.id === teamId) {
                setAdminEditForm(createAdminEditForm(updatedTeam))
              }

              const nextVerifiedTeams = await fetchVerifiedTeams()
              setVerifiedTeams(nextVerifiedTeams)
              setPublicTeamsStatus(nextVerifiedTeams.length ? '' : 'No verified teams are available yet.')
              setAdminActionMessage(status === verifiedTeamStatus ? 'Team verified successfully.' : 'Team moved back to pending verification.')
            } catch (error) {
              setAdminActionMessage(error.message || 'Unable to update team status in Supabase.')
            }
          }}
          registeredTeams={registeredTeams}
          sponsorImages={sponsorImages}
        />
      ) : page === 'teams' ? (
        <TeamsPage verifiedTeams={verifiedTeams} publicTeamsStatus={publicTeamsStatus} />
      ) : (
        <InfoPage pageData={activeContentPages[page]} />
      )}
      
      <footer className="footer">
        <div className="footer-brand">
          <h2>HCPL League</h2>
          <p>Hazaribag Premier Cricket League</p>
        </div>
        <div className="footer-contact">
          <h3>Contact</h3>
          <p>
            Phone: <a href="tel:+917050193876">+91 7050193876</a>
          </p>
          <p>
            Phone: <a href="tel:+919310568900">+91 9310568900</a>
          </p>
          <p>
            Email: <a href="mailto:info@hcplleague.com">info@hcplleague.com</a>
          </p>
        </div>
        <div className="footer-social">
          <h3>Social</h3>
          <div className="social-links">
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://www.facebook.com/" target="_blank" rel="noreferrer">Facebook</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 HCPL League. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
