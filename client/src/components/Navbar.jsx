import { Link, useLocation, useNavigate } from 'react-router-dom'
import './Navbar.css'
import logo from '../assets/harmonia-logo.svg'

const Navbar = () => {
  const navigate = useNavigate()
  useLocation() // refait le rendu à chaque navigation, pour mettre à jour l'état connecté
  const isLoggedIn = Boolean(localStorage.getItem('token'))

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <img src={logo} alt="" className="navbar-logo-image" />
        <span className="navbar-logo-text">Harmonia</span>
      </Link>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/playlists">Playlists</Link></li>
        <li><Link to="/tracks">Tracks</Link></li>
        {isLoggedIn ? (
          <>
            <li><Link to="/profile">Profile</Link></li>
            <li>
              <button type="button" className="navbar-logout" onClick={handleLogout}>
                Log Out
              </button>
            </li>
          </>
        ) : (
          <>
            <li><Link to="/signup">Sign Up</Link></li>
            <li><Link to="/login">Log In</Link></li>
          </>
        )}
      </ul>
    </nav>
  )
}

export default Navbar