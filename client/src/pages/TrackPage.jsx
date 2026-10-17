import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../api/axios'
import AudioPlayer from '../components/AudioPlayer'

const TrackPage = () => {
  const [tracks, setTracks] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await apiClient.get('/tracks')
        setTracks(response.data?.data || [])
      } catch (err) {
        console.error('Error fetching tracks:', err)
        setError('Failed to fetch tracks. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchTracks()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>
  if (!tracks.length) return <div>No tracks available</div>

  return (
    <div>
      <h1>Tracks</h1>
      <ul>
        {tracks.map((track) => (
          <li key={track._id}>
            <Link to={`/tracks/${track._id}`}>{track.title}</Link>
            {track.filePath && <AudioPlayer src={track.filePath} />}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TrackPage