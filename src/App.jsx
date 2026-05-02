import { useState } from 'react'
import './App.css'
import Fixtures from './Fixtures.jsx'

function App() {
  const [page, setPage] = useState('home')
  const [teamAScore, setTeamAScore] = useState(150)
  const [teamBScore, setTeamBScore] = useState(145)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <img src="/hcpllogo.jpeg" className="logo" alt="Hcpl League logo" />
          <h1>Hcpl League</h1>
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
          <video controls>
            <source src="/sample-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="comments">
          <div className="advertisement">
            <h3>Featured Partner</h3>
            <div className="ad-content">
              <div className="ad-image">
                <img src="https://via.placeholder.com/280x120?text=Zumbi.com" alt="Zumbi.com" />
              </div>
              <div className="ad-info">
                <h4>Zumbi.com</h4>
                <p className="ad-tagline">Online & Retail Store</p>
                <ul className="ad-categories">
                  <li>Fashion</li>
                  <li>FMCG Goods</li>
                  <li>Pharmaceuticals</li>
                </ul>
                <p className="ad-featured">Dettol Hand Wash & More</p>
                <button className="ad-button">Shop Now</button>
              </div>
            </div>
          </div>
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
        <p>&copy; 2026 Hcpl League</p>
      </footer>
    </div>
  )
}

export default App