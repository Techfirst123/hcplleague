import { useEffect, useState } from 'react'
import './App.css'
import Fixtures from './Fixtures.jsx'

const liveMatchApiUrl = import.meta.env.VITE_LIVE_MATCH_API_URL
const liveMatchPollMs = Number(import.meta.env.VITE_LIVE_MATCH_POLL_MS || 30000)

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

function App() {
  const [page, setPage] = useState('home')
  const [teamAScore, setTeamAScore] = useState(150)
  const [teamBScore, setTeamBScore] = useState(145)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [liveMatch, setLiveMatch] = useState(fallbackMatch)
  const [matchApiStatus, setMatchApiStatus] = useState(liveMatchApiUrl ? 'Connecting live API...' : 'Add API URL to enable live feed')
  const youtubeEmbedUrl = getYouTubeEmbedUrl(liveMatch.streamUrl)

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
              <img src="/hcpllogo.jpeg" className="logo" alt="Hcpl League logo" />
            </div>
            <div className="brand-copy">
              <span className="brand-kicker">Hazaribag Premier Cricket</span>
              <h1>HCPL League</h1>
            </div>
          </div>
        </div>
        <nav className="main-nav">
          <button className={page === 'home' ? 'nav-button active' : 'nav-button'} onClick={() => setPage('home')}>
            Home
          </button>
          <button className={page === 'fixtures' ? 'nav-button active' : 'nav-button'} onClick={() => setPage('fixtures')}>
            Fixtures
          </button>
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
        <div className="sponsors">
          <h2>Press Conference</h2>
          <div className="press-headline">
            <h3>Press Conference of Omega Group Director Mr Sadab Ansari and Respected Leaders of Hazaribag about the Hazaribag Premier League Associated with Jharkhand Association, Delhi</h3>
            <p className="mission-statement">Nasha Mukti Abhiyan Mission - Boosting Athletics and Wellness Among Young Generations</p>
          </div>
          <div className="sponsors-gallery">
            <img src="/WhatsApp Image 2026-05-02 at 1.41.37 PM.jpeg" alt="Press Conference Image 1" className="sponsor-img" />
            <img src="/WhatsApp Image 2026-05-02 at 1.42.24 PM.jpeg" alt="Press Conference Image 2" className="sponsor-img" />
            <img src="/WhatsApp Image 2026-05-02 at 1.42.24 PM (1).jpeg" alt="Press Conference Image 3" className="sponsor-img" />
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
      ) : (
        <Fixtures />
      )}
      
      <footer className="footer">
        <div className="footer-brand">
          <h2>HCPL League</h2>
          <p>Hazaribag Premier Cricket League</p>
        </div>
        <div className="footer-contact">
          <h3>Contact</h3>
          <p>
            Phone: <a href="tel:+919999999999">+91 99999 99999</a>
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
