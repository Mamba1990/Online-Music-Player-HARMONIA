import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../api/axios'
import PlayButton from '../components/PlayButton'
import PlaylistMenu from '../components/PlaylistMenu'
import { usePlayer } from '../context/PlayerContext'
import { formatDuration } from '../utils/format'
import './TrackPage.css'

const TrackPage = () => {
  const [tracks, setTracks] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const { current, isPlaying, playTrack, shuffle, toggleShuffle } = usePlayer()

  const fetchTracks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.get('/tracks')
      setTracks(response.data?.data || [])
    } catch (err) {
      console.error('Error fetching tracks:', err)
      setError('Failed to fetch tracks. Please try again later.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTracks()
  }, [fetchTracks])

  // Recherche par titre ou artiste
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return tracks
    return tracks.filter(
      (t) => t.title?.toLowerCase().includes(q) || t.artist?.toLowerCase().includes(q)
    )
  }, [tracks, query])

  // Seules les pistes avec un fichier audio peuvent entrer dans la file de lecture
  const playable = useMemo(() => visible.filter((t) => t.filePath), [visible])

  const playAll = () => {
    if (playable.length) playTrack(playable[0], playable)
  }

  const shuffleAll = () => {
    if (!playable.length) return
    if (!shuffle) toggleShuffle()
    const random = playable[Math.floor(Math.random() * playable.length)]
    playTrack(random, playable)
  }

  if (loading) {
    return (
      <div className="tracks-page">
        <p className="tracks-state" role="status">Loading tracks…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="tracks-page">
        <div className="tracks-state tracks-state-error" role="alert">
          <p>{error}</p>
          <button type="button" className="tracks-btn" onClick={fetchTracks}>
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (!tracks.length) {
    return (
      <div className="tracks-page">
        <h1>Tracks</h1>
        <p className="tracks-state">No tracks available yet.</p>
      </div>
    )
  }

  return (
    <div className="tracks-page">
      <header className="tracks-head">
        <div>
          <h1>Tracks</h1>
          <p className="tracks-sub">
            {visible.length} {visible.length === 1 ? 'track' : 'tracks'}
            {query && ` matching “${query}”`}
          </p>
        </div>
        <div className="tracks-actions">
          <button type="button" className="tracks-btn tracks-btn-main" onClick={playAll} disabled={!playable.length}>
            ▶ Play all
          </button>
          <button type="button" className="tracks-btn" onClick={shuffleAll} disabled={!playable.length}>
            Shuffle
          </button>
          {playable.length > 0 && (
            <PlaylistMenu trackIds={playable.map((t) => t._id)} label="Save as playlist" />
          )}
        </div>
      </header>

      <input
        type="search"
        className="tracks-search"
        placeholder="Search by title or artist"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search tracks"
      />

      {!visible.length ? (
        <p className="tracks-state">No track matches your search.</p>
      ) : (
        <ul className="tracks-list">
          {visible.map((track) => {
            const active = current?._id === track._id
            return (
              <li key={track._id} className={`track-row ${active ? 'is-current' : ''}`}>
                <div className="track-cover" aria-hidden="true">
                  {active && isPlaying ? '♪' : (track.title || '?').charAt(0).toUpperCase()}
                </div>
                <div className="track-info">
                  <Link to={`/tracks/${track._id}`} className="track-title">
                    {track.title}
                  </Link>
                  <span className="track-artist">{track.artist}</span>
                </div>
                <span className="track-duration">{formatDuration(track.duration)}</span>
                {track.filePath ? (
                  <>
                    <PlayButton track={track} queue={playable} label={false} />
                    <PlaylistMenu trackIds={[track._id]} />
                  </>
                ) : (
                  <span className="track-noaudio">No audio</span>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default TrackPage
