import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import apiClient from '../api/axios'
import PlayButton from '../components/PlayButton'
import { formatDuration } from '../utils/format'
import './TrackDetailsPage.css'

const TrackDetailsPage = () => {
  const { id } = useParams()
  const [track, setTrack] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTrack = async () => {
      setTrack(null)
      setError(null)
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

  if (error) {
    return (
      <div className="track-details">
        <Link to="/tracks" className="track-details-back">← All tracks</Link>
        <p className="track-details-error" role="alert">{error}</p>
      </div>
    )
  }

  if (!track) {
    return (
      <div className="track-details">
        <p className="track-details-state" role="status">Loading…</p>
      </div>
    )
  }

  return (
    <div className="track-details">
      <Link to="/tracks" className="track-details-back">← All tracks</Link>

      <article className="track-details-card">
        <div className="track-details-cover" aria-hidden="true">
          {(track.title || '?').charAt(0).toUpperCase()}
        </div>
        <div className="track-details-body">
          <p className="track-details-label">Track</p>
          <h1>{track.title}</h1>
          <p className="track-details-artist">{track.artist}</p>

          <dl className="track-details-meta">
            <div>
              <dt>Duration</dt>
              <dd>{formatDuration(track.duration)}</dd>
            </div>
            {track.createdAt && (
              <div>
                <dt>Added</dt>
                <dd>{new Date(track.createdAt).toLocaleDateString()}</dd>
              </div>
            )}
          </dl>

          {track.filePath ? (
            <PlayButton track={track} queue={[track]} />
          ) : (
            <p className="track-details-state">No audio file for this track.</p>
          )}
        </div>
      </article>
    </div>
  )
}

export default TrackDetailsPage
