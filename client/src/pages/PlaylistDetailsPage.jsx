import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import apiClient from '../api/axios'

const PlaylistDetailsPage = () => {
  const { id } = useParams()
  const [playlist, setPlaylist] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const response = await apiClient.get(`/playlists/${id}`)
        setPlaylist(response.data?.data ?? response.data)
      } catch (err) {
        console.error('Error fetching playlist details:', err)
        setError('Failed to fetch playlist details. Please try again later.')
      }
    }

    fetchPlaylist()
  }, [id])

  if (error) return <div>{error}</div>
  if (!playlist) return <div>Loading...</div>

  const tracks = playlist.tracks || []

  return (
    <div>
      <h1>{playlist.name}</h1>
      <p>{playlist.description}</p>
      <h2>Tracks:</h2>
      {tracks.length === 0 ? (
        <p>This playlist has no tracks yet.</p>
      ) : (
        <ul>
          {tracks.map((track) => (
            <li key={track._id}>
              <strong>{track.title}</strong> by {track.artist}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default PlaylistDetailsPage