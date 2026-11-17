import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import './Navbar.css'
import logo from '../assets/harmonia-logo.svg'
import Avatar from './Avatar'
import { clearCurrentUser, useCurrentUser } from '../hooks/useCurrentUser'

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation() // re-renders on each navigation so the logged-in state stays current
  const isLoggedIn = Boolean(localStorage.getItem('token'))
  const { user, uploadAvatar, removeAvatar } = useCurrentUser()

  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const menuRef = useRef(null)
  const fileRef = useRef(null)

  // Ferme le menu après chaque navigation
  useEffect(() => {
    setOpen(false)
    setMessage('')
  }, [location.pathname])

  // Ferme le menu au clic extérieur ou avec Échap
  useEffect(() => {
    if (!open) return undefined
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    clearCurrentUser()
    setOpen(false)
    navigate('/login')
  }

  const run = async (action) => {
    setBusy(true)
    setMessage('')
    try {
      await action()
    } catch (err) {
      setMessage(err.message)
    } finally {
      setBusy(false)
    }
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // permet de re-choisir le même fichier
    if (file) run(() => uploadAvatar(file))
  }

  const firstName = user?.name?.trim().split(/\s+/)[0] || ''

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <img src={logo} alt="" width="36" height="36" className="navbar-logo-image" />
        <span className="navbar-logo-text">Harmonia</span>
      </Link>

      <ul className="navbar-links">
        {isLoggedIn ? (
          <li className="navbar-user" ref={menuRef}>
            <button
              type="button"
              className="navbar-user-btn"
              onClick={() => setOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={open}
              aria-label="Account menu"
            >
              <Avatar src={user?.avatar} name={user?.name} size={36} />
              {firstName && <span className="navbar-user-name">{firstName}</span>}
              <span className="navbar-user-caret" aria-hidden="true">▾</span>
            </button>

            {open && (
              <div className="navbar-menu" role="menu">
                <div className="navbar-menu-head">
                  <Avatar src={user?.avatar} name={user?.name} size={48} />
                  <div className="navbar-menu-id">
                    <strong>{user?.name || 'My account'}</strong>
                    <span>{user?.email}</span>
                  </div>
                </div>

                <Link to="/profile" role="menuitem" className="navbar-menu-item">
                  Profile
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  className="navbar-menu-item"
                  onClick={() => fileRef.current?.click()}
                  disabled={busy}
                >
                  {busy ? 'Saving…' : 'Change photo'}
                </button>
                {user?.avatar && (
                  <button
                    type="button"
                    role="menuitem"
                    className="navbar-menu-item"
                    onClick={() => run(removeAvatar)}
                    disabled={busy}
                  >
                    Remove photo
                  </button>
                )}
                <button type="button" role="menuitem" className="navbar-menu-item" onClick={handleLogout}>
                  Log Out
                </button>

                {message && (
                  <p className="navbar-menu-error" role="alert">
                    {message}
                  </p>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="navbar-file"
                  onChange={handleFile}
                  tabIndex={-1}
                />
              </div>
            )}
          </li>
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
