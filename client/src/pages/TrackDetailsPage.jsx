import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import apiClient from '../api/axios'

const TrackDetailsPage = () => {
  const { id } = useParams()
  const [track, setTrack] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTrack = async () => {
      try {
        const response = await apiClient.get(`/tracks/${id}`)
        setTrack(response.data?.data ?? response.data)
      } catch (err) {
        console.error('Error fetching track details:', err)
        setError('Failed to fetch track details. Please try again later.')
      }
    }

    fetchTrack()
  }, [id])

  if (error) return <div>{error}</div>
  if (!track) return <div>Loading...</div>

  return (
    <div>
      <h1>{track.title}</h1>
      <p><strong>Artist:</strong> {track.artist}</p>
      <p><strong>Duration:</strong> {track.duration} seconds</p>
    </div>
  )
}

export default TrackDetailsPage