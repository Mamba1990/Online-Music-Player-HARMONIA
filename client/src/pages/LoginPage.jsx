import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import apiClient from '../api/axios'
import logo from '../assets/harmonia-logo.svg'
import './Auth.css'

const LoginPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const response = await apiClient.post('/auth/login', formData)
      localStorage.setItem('token', response.data.token)
      navigate('/profile')
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to reach the server. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <img src={logo} alt="" width="56" height="56" className="auth-logo" />
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Log in to keep the music going</p>

        {error && (
          <div className="auth-alert" role="alert">
            {error}
          </div>
        )}

        <div className="auth-field">
          <label className="auth-label" htmlFor="email">Email</label>
          <input
            className="auth-input"
            type="email"
            id="email"
            name="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="password">Password</label>
          <div className="auth-input-wrap">
            <input
              className="auth-input auth-input--with-toggle"
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              placeholder="Your password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="auth-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? 'Logging in…' : 'Log In'}
        </button>

        <p className="auth-switch">
          No account yet? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  )
}

export default LoginPage