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

const liveMatchApiUrl = import.meta.env.VITE_LIVE_MATCH_API_URL
const liveMatchPollMs = Number(import.meta.env.VITE_LIVE_MATCH_POLL_MS || 30000)
const teamRegistrationWebhookUrl = import.meta.env.NEXT_PUBLIC_APPS_SCRIPT_URL || import.meta.env.VITE_TEAM_REGISTRATION_WEBHOOK_URL
const adminUsername = import.meta.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin'
const adminPassword = import.meta.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'hcpladmin123'
const verifiedTeamStatus = 'Verified'
const pendingVerificationStatus = 'Pending management verification'

const fallbackMatch = {
  title: 'HCPL Live Match',
  status: 'YouTube Live',
  streamUrl: 'https://www.youtube.com/watch?v=odLIg0G5M1w',
  venue: 'Hazaribag Stadium',
  battingTeam: 'Team Alpha',
  bowlingTeam: 'Team Beta',
  score: '150/5',
  overs: '17.4',
  target: '146',
}

const teamAnnouncement = {
  title: 'Big News Coming',
  announcement: 'Verified team names will be added here after management approval.',
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
    { title: 'Match Status', value: 'Live', meta: 'YouTube stream active' },
  ],
  schedule: [
    ['May 10, 2026', 'Team Alpha vs Team Beta', 'HCPL Stadium', 'Scheduled'],
    ['May 12, 2026', 'Team Gamma vs Team Delta', 'City Arena', 'Scheduled'],
    ['May 14, 2026', 'Team Alpha vs Team Gamma', 'National Ground', 'Scheduled'],
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

const contentPages = {
  sponsors: {
    kicker: 'Sponsors',
    title: 'Sponsors and Partners',
    intro: 'HCPL League sponsor and partner announcements will be featured here.',
    cards: [
      { title: 'Featured Partner', value: 'zumbii.com', meta: 'Fashion, FMCG, pharma and daily essentials' },
      { title: 'Title Sponsor', value: 'Coming Soon', meta: 'Management verification pending' },
      { title: 'Ground Partner', value: 'Coming Soon', meta: 'Open for association' },
    ],
  },
  gallery: {
    kicker: 'Gallery',
    title: 'HCPL Moments',
    intro: 'Browse press conference and league event photos.',
    gallery: [
      {
        type: 'video',
        src: '/WhatsApp Video 2026-05-12 at 2.48.45 PM.mp4',
        title: 'Mumbai11',
      },
      {
        type: 'image',
        src: '/WhatsApp Image 2026-05-02 at 1.41.37 PM.jpeg',
        alt: 'HCPL League press conference with Omega Group director and Hazaribag leaders',
      },
      {
        type: 'image',
        src: '/WhatsApp Image 2026-05-02 at 1.42.24 PM.jpeg',
        alt: 'Hazaribag Premier Cricket League leaders attending the press conference',
      },
      {
        type: 'image',
        src: '/WhatsApp Image 2026-05-02 at 1.42.24 PM (1).jpeg',
        alt: 'HCPL League press conference audience and event guests',
      },
    ],
  },
  highlights: {
    kicker: 'Highlights',
    title: 'Match Highlights',
    intro: 'Video highlights and best moments will be added after official matches are completed.',
    cards: [
      { title: 'Latest Highlight', value: 'Coming Soon', meta: 'Match clips will appear here' },
      { title: 'Best Sixes', value: 'Coming Soon', meta: 'Fan favorite moments' },
      { title: 'Best Wickets', value: 'Coming Soon', meta: 'Bowling highlights' },
    ],
  },
}

function MatchCenterPage() {
  return (
    <main className="info-page">
      <section className="info-hero">
        <span className="section-kicker">Match Center</span>
        <h2>Live Scores, Schedule, Points Table and Player Stats</h2>
        <p>Track the complete HCPL League match picture in one place, from live scores to standings and top performers.</p>
      </section>

      <section className="match-center-block">
        <div className="block-heading">
          <h3>Live Scores</h3>
          <span>Updated during match time</span>
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
          <h3>Match Schedule</h3>
          <span>Upcoming fixtures</span>
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
          <h3>Points Table</h3>
          <span>Official standings</span>
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
          <h3>Player Stats</h3>
          <span>Top performers</span>
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
  isAdminAuthenticated,
  isLoadingAdminTeams,
  onAdminDeleteTeam,
  onAdminEditChange,
  onAdminExportExcel,
  onAdminExportPdf,
  onAdminInputChange,
  onAdminLogin,
  onAdminLogout,
  onAdminSaveEdit,
  onAdminSelectTeam,
  onUpdateTeamStatus,
  registeredTeams,
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
  isAdminAuthenticated: PropTypes.bool.isRequired,
  isLoadingAdminTeams: PropTypes.bool.isRequired,
  onAdminDeleteTeam: PropTypes.func.isRequired,
  onAdminEditChange: PropTypes.func.isRequired,
  onAdminExportExcel: PropTypes.func.isRequired,
  onAdminExportPdf: PropTypes.func.isRequired,
  onAdminInputChange: PropTypes.func.isRequired,
  onAdminLogin: PropTypes.func.isRequired,
  onAdminLogout: PropTypes.func.isRequired,
  onAdminSaveEdit: PropTypes.func.isRequired,
  onAdminSelectTeam: PropTypes.func.isRequired,
  onUpdateTeamStatus: PropTypes.func.isRequired,
  registeredTeams: PropTypes.arrayOf(teamShape).isRequired,
}

function App() {
  const [page, setPage] = useState('home')
  const [teamAScore, setTeamAScore] = useState(150)
  const [teamBScore, setTeamBScore] = useState(145)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [liveMatch, setLiveMatch] = useState(fallbackMatch)
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

  useEffect(() => {
    setIsAdminAuthenticated(getStoredAdminAuth())
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
          setLiveMatch(normalizeLiveMatch(data))
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

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <div className="logo-section">
            <div className="logo-mark">
              <img src="/hcpllogo.jpeg" className="logo" alt="HCPL League logo" width="102" height="102" />
            </div>
            <div className="brand-copy">
              <span className="brand-kicker">Hazaribag Premier Cricket</span>
              <h1>HCPL League</h1>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className={page === 'admin' ? 'admin-mini-button active' : 'admin-mini-button'}
            onClick={() => setPage('admin')}
          >
            Admin
          </button>
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
          <h2>Live Comments</h2>
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
          alt="HCPL League progressive banner"
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
          <h2>Press Conference</h2>
          <div className="press-headline">
            <h3>Press Conference of Omega Group Director Mr Sadab Ansari and Respected Leaders of Hazaribag about the Hazaribag Premier League Associated with Jharkhand Association, Delhi</h3>
            <p className="mission-statement">Nasha Mukti Abhiyan Mission - Boosting Athletics and Wellness Among Young Generations</p>
          </div>
          <div className="sponsors-gallery">
            <img
              src="/WhatsApp Image 2026-05-02 at 1.41.37 PM.jpeg"
              alt="HCPL League press conference with Omega Group director and Hazaribag leaders"
              className="sponsor-img"
              width="360"
              height="250"
              loading="lazy"
            />
            <img
              src="/WhatsApp Image 2026-05-02 at 1.42.24 PM.jpeg"
              alt="Hazaribag Premier Cricket League leaders attending the press conference"
              className="sponsor-img"
              width="360"
              height="250"
              loading="lazy"
            />
            <img
              src="/WhatsApp Image 2026-05-02 at 1.42.24 PM (1).jpeg"
              alt="HCPL League press conference audience and event guests"
              className="sponsor-img"
              width="360"
              height="250"
              loading="lazy"
            />
          </div>
        </div>

        <div className="scorecard">
          <h2>Live Match Scorecard</h2>
          <div className="teams">
            <div className="team">
              <h3>Team Alpha</h3>
              <p>Score: {teamAScore}/5</p>
              <button onClick={() => setTeamAScore(teamAScore + 1)}>Score Run</button>
            </div>
            <div className="vs">VS</div>
            <div className="team">
              <h3>Team Beta</h3>
              <p>Score: {teamBScore}/7</p>
              <button onClick={() => setTeamBScore(teamBScore + 1)}>Score Run</button>
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
          isAdminAuthenticated={isAdminAuthenticated}
          isLoadingAdminTeams={isLoadingAdminTeams}
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
        />
      ) : page === 'teams' ? (
        <TeamsPage verifiedTeams={verifiedTeams} publicTeamsStatus={publicTeamsStatus} />
      ) : (
        <InfoPage pageData={contentPages[page]} />
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
