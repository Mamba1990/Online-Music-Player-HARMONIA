import { Link } from 'react-router-dom'
import './HomePage.css'

const HomePage = () => {
  const isLoggedIn = Boolean(localStorage.getItem('token'))

  return (
    <div className="homepage-container">
      <p className="homepage-eyebrow">Your music, your rhythm</p>

      <h1 className="homepage-title">
        Welcome to <span className="homepage-title-accent">Harmonia</span>
      </h1>

      <p className="homepage-tagline">Feel the rhythm, anytime, anywhere.</p>

      <div className="homepage-actions">
        {isLoggedIn ? (
          <>
            <Link to="/tracks" className="homepage-btn homepage-btn--primary">
              Browse tracks
            </Link>
            <Link to="/playlists" className="homepage-btn homepage-btn--ghost">
              My playlists
            </Link>
          </>
        ) : (
          <>
            <Link to="/signup" className="homepage-btn homepage-btn--primary">
              Get started
            </Link>
            <Link to="/login" className="homepage-btn homepage-btn--ghost">
              Log in
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default HomePage
