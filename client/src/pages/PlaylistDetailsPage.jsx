import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AuthorChip from '../components/AuthorChip'
import Comments from '../components/Comments'
import LikeButton from '../components/LikeButton'
import PlayButton from '../components/PlayButton'
import { usePlayer } from '../context/PlayerContext'
import { useCurrentUser } from '../hooks/useCurrentUser'
import {
  canEdit,
  copyPlaylist,
  errMsg,
  getPlaylist,
  isMine,
  setPlaylistTracks,
  setPlaylistVisibility,
} from '../services/playlists'
import { formatDuration } from '../utils/format'
import '../components/Playlists.css'

const PlaylistDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useCurrentUser()
  const { current, playTrack, shuffle, toggleShuffle } = usePlayer()
  const [playlist, setPlaylist] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    const fetchPlaylist = async () => {
      setPlaylist(null)
      setError(null)
      try {
        setPlaylist(await getPlaylist(id))
      } catch (err) {
        console.error('Error fetching playlist details:', err)
        setError(
          err.response?.status === 404
            ? 'This playlist does not exist, or it is private.'
            : 'Failed to fetch playlist details. Please try again later.'
        )
      }
    }
    fetchPlaylist()
  }, [id])

  const tracks = useMemo(() => playlist?.tracks || [], [playlist])
  const playable = useMemo(() => tracks.filter((t) => t.filePath), [tracks])
  const editable = playlist ? canEdit(playlist, user) : false
  const mine = playlist ? isMine(playlist, user) : false

  if (error) {
    return (
      <div className="pl-page">
        <Link to="/playlists" className="pl-back">← All playlists</Link>
        <p className="pl-state is-error" role="alert">{error}</p>
      </div>
    )
  }
  if (!playlist) {
    return <div className="pl-page"><p className="pl-state" role="status">Loading…</p></div>
  }

  const playAll = () => playable.length && playTrack(playable[0], playable)
  const shuffleAll = () => {
    if (!playable.length) return
    if (!shuffle) toggleShuffle()
    playTrack(playable[Math.floor(Math.random() * playable.length)], playable)
  }

  const run = async (action) => {
    setBusy(true)
    setNotice(null)
    try {
      await action()
    } catch (err) {
      setNotice({ type: 'error', text: errMsg(err) })
    } finally {
      setBusy(false)
    }
  }

  const removeTrack = (track) =>
    run(async () => {
      const nextIds = tracks.filter((t) => t._id !== track._id).map((t) => t._id)
      await setPlaylistTracks(playlist._id, nextIds)
      setPlaylist((p) => ({ ...p, tracks: p.tracks.filter((t) => t._id !== track._id) }))
      setNotice({ type: 'ok', text: `“${track.title}” removed from the playlist.` })
    })

  const toggleVisibility = () =>
    run(async () => {
      const updated = await setPlaylistVisibility(playlist._id, !playlist.isPublic)
      setPlaylist((p) => ({ ...p, isPublic: updated.isPublic }))
      setNotice({
        type: 'ok',
        text: updated.isPublic ? 'This playlist is now public.' : 'This playlist is now private.',
      })
    })

  const saveCopy = () =>
    run(async () => {
      const copy = await copyPlaylist(playlist._id)
      navigate(`/playlists/${copy._id}`)
    })

  return (
    <div className="pl-page">
      <Link to="/playlists" className="pl-back">← All playlists</Link>

      <header className="pl-hero">
        <div className="pl-cover pl-cover-big" aria-hidden="true">♫</div>
        <div className="pl-hero-body">
          <p className="pl-label">
            Playlist · {playlist.isPublic ? 'Public' : 'Private'}
          </p>
          <h1>{playlist.name}</h1>
          {playlist.description && <p className="pl-hero-desc">{playlist.description}</p>}
          <p className="pl-card-meta">
            <AuthorChip author={playlist.author} prefix={mine ? 'You · ' : 'by '} size={26} />
            <span>{tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}</span>
          </p>
          <div className="pl-hero-actions">
            <button type="button" className="pl-btn pl-btn-main" onClick={playAll} disabled={!playable.length}>▶ Play all</button>
            <button type="button" className="pl-btn" onClick={shuffleAll} disabled={!playable.length}>Shuffle</button>
            <LikeButton
              playlistId={playlist._id}
              liked={playlist.liked}
              count={playlist.likesCount}
              onChange={(result) => setPlaylist((p) => ({ ...p, ...result }))}
            />
            {!mine && (
              <button type="button" className="pl-btn" onClick={saveCopy} disabled={busy}>Save to my playlists</button>
            )}
            {editable && (
              <button type="button" className="pl-btn" onClick={toggleVisibility} disabled={busy}>
                {playlist.isPublic ? 'Make private' : 'Make public'}
              </button>
            )}
          </div>
        </div>
      </header>

      {notice && (
        <p className={`pl-notice ${notice.type === 'error' ? 'is-error' : 'is-ok'}`} role={notice.type === 'error' ? 'alert' : 'status'}>
          {notice.text}
        </p>
      )}

      {tracks.length === 0 ? (
        <p className="pl-state">
          This playlist has no tracks yet.{mine && <> <Link to="/tracks">Browse tracks</Link> and use “+ Playlist”.</>}
        </p>
      ) : (
        <ul className="pl-tracks">
          {tracks.map((track, i) => (
            <li key={track._id} className={`pl-track ${current?._id === track._id ? 'is-current' : ''}`}>
              <span className="pl-track-n">{i + 1}</span>
              <div className="pl-track-info">
                <Link to={`/tracks/${track._id}`} className="pl-track-title">{track.title}</Link>
                <span className="pl-track-artist">{track.artist}</span>
              </div>
              <span className="pl-track-duration">{formatDuration(track.duration)}</span>
              {track.filePath ? (
                <PlayButton track={track} queue={playable} label={false} />
              ) : (
                <span className="pl-track-artist">No audio</span>
              )}
              {editable && (
                <button type="button" className="pl-btn" onClick={() => removeTrack(track)} disabled={busy} aria-label={`Remove ${track.title} from playlist`}>
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <Comments playlistId={playlist._id} />
    </div>
  )
}

export default PlaylistDetailsPage
