import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/axios'

const LoginPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const response = await apiClient.post('/auth/login', formData)
      localStorage.setItem('token', response.data.token)
      navigate('/profile')
    } catch (err) {
      console.error('Login error:', err) // temporaire : à retirer une fois le problème trouvé
      setError(err.response?.data?.message || err.message || 'Login failed')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Log In</h1>
      {error && <div className="error">{error}</div>}
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit">Log In</button>
    </form>
  )
}

export default LoginPage