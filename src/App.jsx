import { useEffect, useState } from 'react'
import './App.css'

const liveMatchApiUrl = import.meta.env.VITE_LIVE_MATCH_API_URL
const liveMatchPollMs = Number(import.meta.env.VITE_LIVE_MATCH_POLL_MS || 30000)
const teamRegistrationWebhookUrl = import.meta.env.NEXT_PUBLIC_APPS_SCRIPT_URL || import.meta.env.VITE_TEAM_REGISTRATION_WEBHOOK_URL
const teamRegistrationSheetUrl = 'https://docs.google.com/spreadsheets/d/1tBXBpebHrXQ65XV5QUstK_KOlpxsEsbnXMxglEFGobA/edit?usp=sharing'

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
  teams: {
    kicker: 'Teams',
    title: 'Verified Teams',
    intro: 'Team names will appear here after registration documents and squad details are verified by management.',
    cards: [
      { title: 'Team 1', value: 'Coming Soon', meta: 'Verification pending' },
      { title: 'Team 2', value: 'Coming Soon', meta: 'Verification pending' },
      { title: 'Team 3', value: 'Coming Soon', meta: 'Verification pending' },
    ],
  },
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

function getStoredTeams() {
  try {
    return JSON.parse(window.localStorage.getItem('hcplRegisteredTeams')) || []
  } catch {
    return []
  }
}

function buildRegistrationPayload(form) {
  const formData = new FormData(form)
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
    sourceSheet: teamRegistrationSheetUrl,
    status: 'Pending management verification',
    teamName: formData.get('teamName')?.toString().trim(),
    captainName: formData.get('captainName')?.toString().trim(),
    captainNumber: formData.get('captainNumber')?.toString().trim(),
    viceCaptainName: formData.get('viceCaptainName')?.toString().trim(),
    viceCaptainNumber: formData.get('viceCaptainNumber')?.toString().trim(),
    players,
  }
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
  const [matchApiStatus, setMatchApiStatus] = useState(liveMatchApiUrl ? 'Connecting live API...' : 'Add API URL to enable live feed')
  const youtubeEmbedUrl = getYouTubeEmbedUrl(liveMatch.streamUrl)

  useEffect(() => {
    setRegisteredTeams(getStoredTeams())
  }, [])

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
              <strong>{registeredTeams.length > 0 ? `${registeredTeams.length} Team${registeredTeams.length === 1 ? '' : 's'} Registered` : 'Coming Soon'}</strong>
              <p>Submitted teams appear here instantly and remain pending until management verification is complete.</p>
            </div>
            <button type="button" onClick={() => setPage('registration')}>
              Register Team
            </button>
          </div>
          {registeredTeams.length > 0 && (
            <div className="registered-team-list">
              {registeredTeams.map((team) => (
                <article key={`${team.teamName}-${team.submittedAt}`} className="registered-team-card">
                  <span>{team.status}</span>
                  <h3>{team.teamName}</h3>
                  <p>Captain: {team.captainName} | Vice Captain: {team.viceCaptainName}</p>
                  <small>{team.players.length} player{team.players.length === 1 ? '' : 's'} submitted</small>
                </article>
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

              const nextTeams = [payload, ...registeredTeams]
              setRegisteredTeams(nextTeams)
              window.localStorage.setItem('hcplRegisteredTeams', JSON.stringify(nextTeams))

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
                  setRegistrationStatus('Team registration submitted for management verification and sent to Google Sheets.')
                } catch {
                  setRegistrationStatus('Team saved on this device. Google Sheets submission could not be confirmed.')
                }
              } else {
                setRegistrationStatus('Team saved on this device. Add VITE_TEAM_REGISTRATION_WEBHOOK_URL to send it to Google Sheets.')
              }

              event.currentTarget.reset()
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
                </label>
                <label>
                  Captain Number
                  <input name="captainNumber" type="tel" placeholder="+91 XXXXX XXXXX" required />
                </label>
                <label>
                  Vice Captain Name
                  <input name="viceCaptainName" type="text" placeholder="Enter vice captain name" required />
                </label>
                <label>
                  Vice Captain Number
                  <input name="viceCaptainNumber" type="tel" placeholder="+91 XXXXX XXXXX" required />
                </label>
              </div>
            </section>

            <section className="form-section">
              <div className="players-form-header">
                <h3>Player Details</h3>
                <span>Maximum 15 players</span>
              </div>
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
