import { Link, useLocation, useNavigate } from 'react-router-dom'
import './Navbar.css'
import logo from '../assets/harmonia-logo.svg'

const Navbar = () => {
  const navigate = useNavigate()
  useLocation() // re-renders on each navigation so the logged-in state stays current
  const isLoggedIn = Boolean(localStorage.getItem('token'))

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <img src={logo} alt="" width="36" height="36" className="navbar-logo-image" />
        <span className="navbar-logo-text">Harmonia</span>
      </Link>

      <ul className="navbar-links">
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
            <li><Link to="/login">Log In</Link></li>
            <li><Link to="/signup" className="navbar-cta">Sign Up</Link></li>
          </>
        )}
      </ul>
    </nav>
  )
}

export default Navbar