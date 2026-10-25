import { useEffect, useState } from 'react'
import apiClient from '../api/axios'

const ProfilePage = () => {
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!localStorage.getItem('token')) {
        setError('User is not authenticated. Please log in.')
        return
      }

      try {
        const { data } = await apiClient.get('/users/profile')
        setProfile(data.user)
      } catch (err) {
        setError(
          err.response?.data?.message || 'An unexpected error occurred. Please try again.'
        )
      }
    }

    fetchProfile()
  }, [])

  if (error) return <div>Error: {error}</div>
  if (!profile) return <div>Loading...</div>

  return (
    <div>
      <h1>Profile Page</h1>
      <p>Name: {profile.name}</p>
      <p>Email: {profile.email}</p>
    </div>
  )
}

export default ProfilePage