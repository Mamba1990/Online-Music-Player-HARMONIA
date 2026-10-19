import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import apiClient from '../api/axios'
import logo from '../assets/harmonia-logo.svg'
import './Auth.css'

const SignupPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const { data } = await apiClient.post('/auth/signup', formData)
      if (data.success) {
        setSuccess('Account created! Redirecting to login…')
        setTimeout(() => navigate('/login'), 2000)
      } else {
        setError('Signup failed. Please try again.')
      }
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
        <h1 className="auth-title">Join Harmonia</h1>
        <p className="auth-subtitle">Create your account and feel the rhythm</p>

        {error && (
          <div className="auth-alert" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="auth-alert auth-alert--success" role="status">
            {success}
          </div>
        )}

        <div className="auth-field">
          <label className="auth-label" htmlFor="name">Name</label>
          <input
            className="auth-input"
            type="text"
            id="name"
            name="name"
            placeholder="Your name"
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

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
              placeholder="At least 8 characters"
              autoComplete="new-password"
              minLength={8}
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

        <button className="auth-submit" type="submit" disabled={loading || Boolean(success)}>
          {loading ? 'Creating account…' : 'Sign Up'}
        </button>

        <p className="auth-switch">
          Already a member? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  )
}

export default SignupPage