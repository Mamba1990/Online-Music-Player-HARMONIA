import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthorChip from '../components/AuthorChip'
import LikeButton from '../components/LikeButton'
import apiClient from '../api/axios'
import { usePlayer } from '../context/PlayerContext'
import { useCurrentUser } from '../hooks/useCurrentUser'
import {
  canEdit,
  copyPlaylist,
  createPlaylist,
  deletePlaylist,
  errMsg,
  getPlaylist,
  isMine,
  listPlaylists,
} from '../services/playlists'
import '../components/Playlists.css'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'mine', label: 'Mine' },
  { id: 'others', label: 'From others' },
]

const PlaylistsPage = () => {
  const navigate = useNavigate()
  const { user } = useCurrentUser()
  const { playTrack } = usePlayer()
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [makePublic, setMakePublic] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [filter, setFilter] = useState('all')
  // Choix des pistes avant la création
  const [pickerOpen, setPickerOpen] = useState(false)
  const [tracks, setTracks] = useState(null)
  const [tracksError, setTracksError] = useState('')
  const [trackQuery, setTrackQuery] = useState('')
  const [selected, setSelected] = useState([])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setPlaylists(await listPlaylists())
    } catch (err) {
      console.error('Error fetching playlists:', err)
      setError('Failed to fetch playlists. Please try again later.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const togglePicker = async () => {
    const next = !pickerOpen
    setPickerOpen(next)
    if (next && tracks === null) {
      setTracksError('')
      try {
        const response = await apiClient.get('/tracks')
        setTracks(response.data?.data || [])
      } catch (err) {
        console.error('Error fetching tracks:', err)
        setTracksError('Could not load the tracks.')
        setTracks([])
      }
    }
  }

  const toggleTrack = (id) =>
    setSelected((all) => (all.includes(id) ? all.filter((x) => x !== id) : [...all, id]))

  const pickable = useMemo(() => {
    const q = trackQuery.trim().toLowerCase()
    const list = tracks || []
    if (!q) return list
    return list.filter((t) => t.title?.toLowerCase().includes(q) || t.artist?.toLowerCase().includes(q))
  }, [tracks, trackQuery])

  // Mes playlists d'abord, puis le filtre choisi
  const visible = useMemo(() => {
    const sorted = [...playlists].sort((a, b) => Number(isMine(b, user)) - Number(isMine(a, user)))
    if (filter === 'mine') return sorted.filter((p) => isMine(p, user))
    if (filter === 'others') return sorted.filter((p) => !isMine(p, user))
    return sorted
  }, [playlists, user, filter])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    setNotice(null)
    try {
      const created = await createPlaylist({ name: name.trim(), description, isPublic: makePublic, tracks: selected })
      setPlaylists((all) => [created, ...all])
      setName('')
      setDescription('')
      const added = selected.length
      setSelected([])
      setTrackQuery('')
      setPickerOpen(false)
      setNotice({
        type: 'ok',
        text: added
          ? `Playlist “${created.name}” created with ${added} ${added === 1 ? 'track' : 'tracks'}.`
          : `Playlist “${created.name}” created. You can add tracks from here or from the Tracks page.`,
      })
    } catch (err) {
      setNotice({ type: 'error', text: errMsg(err) })
    } finally {
      setBusy(false)
    }
  }

  const handlePlay = async (playlist) => {
    setNotice(null)
    try {
      const full = await getPlaylist(playlist._id)
      const list = (full.tracks || []).filter((t) => t.filePath)
      if (list.length) playTrack(list[0], list)
      else setNotice({ type: 'error', text: 'This playlist has no playable track yet.' })
    } catch (err) {
      setNotice({ type: 'error', text: errMsg(err) })
    }
  }

  const handleCopy = async (playlist) => {
    setBusy(true)
    setNotice(null)
    try {
      const copy = await copyPlaylist(playlist._id)
      navigate(`/playlists/${copy._id}`)
    } catch (err) {
      setNotice({ type: 'error', text: errMsg(err) })
      setBusy(false)
    }
  }

  const handleDelete = async (playlist) => {
    setBusy(true)
    setNotice(null)
    try {
      await deletePlaylist(playlist._id)
      setPlaylists((all) => all.filter((p) => p._id !== playlist._id))
      setConfirmId(null)
      setNotice({ type: 'ok', text: `Playlist “${playlist.name}” deleted.` })
    } catch (err) {
      setNotice({ type: 'error', text: errMsg(err) })
    } finally {
      setBusy(false)
    }
  }

  const updateLike = (id, result) =>
    setPlaylists((all) => all.map((p) => (p._id === id ? { ...p, ...result } : p)))

  return (
    <div className="pl-page">
      <header className="pl-head">
        <h1>Playlists</h1>
        <p className="pl-sub">
          {playlists.length} {playlists.length === 1 ? 'playlist' : 'playlists'}
        </p>
      </header>

      <form className="pl-create" onSubmit={handleCreate}>
        <input
          className="pl-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New playlist name"
          maxLength={80}
          aria-label="Playlist name"
        />
        <input
          className="pl-input"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          maxLength={200}
          aria-label="Playlist description"
        />
        <label className="pl-check-row">
          <input type="checkbox" checked={makePublic} onChange={(e) => setMakePublic(e.target.checked)} />
          Public
        </label>
        <button type="submit" className="pl-btn pl-btn-main" disabled={busy || !name.trim()}>
          Create playlist
        </button>
        <div className="pl-picker">
          <button
            type="button"
            className="pl-btn"
            onClick={togglePicker}
            aria-expanded={pickerOpen}
            aria-controls="pl-picker-panel"
          >
            {pickerOpen ? 'Hide tracks' : 'Add tracks'}
            {selected.length > 0 && ` (${selected.length} selected)`}
          </button>
          {pickerOpen && (
            <div className="pl-picker-panel" id="pl-picker-panel">
              <input
                type="search"
                className="pl-input"
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                placeholder="Search by title or artist"
                aria-label="Search tracks"
              />
              {tracks === null ? (
                <p className="pl-pop-note" role="status">Loading tracks…</p>
              ) : tracksError ? (
                <p className="pl-pop-note is-error" role="alert">{tracksError}</p>
              ) : pickable.length === 0 ? (
                <p className="pl-pop-note">No track found.</p>
              ) : (
                <ul className="pl-picker-list">
                  {pickable.map((track) => {
                    const on = selected.includes(track._id)
                    return (
                      <li key={track._id}>
                        <label className={`pl-picker-item ${on ? 'is-on' : ''}`}>
                          <input type="checkbox" checked={on} onChange={() => toggleTrack(track._id)} />
                          <span className="pl-pop-name">{track.title}</span>
                          <span className="pl-pop-count">{track.artist}</span>
                        </label>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      </form>

      <div className="pl-filters" role="tablist" aria-label="Filter playlists">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            className={`pl-filter ${filter === f.id ? 'is-active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {notice && (
        <p className={`pl-notice ${notice.type === 'error' ? 'is-error' : 'is-ok'}`} role={notice.type === 'error' ? 'alert' : 'status'}>
          {notice.text}
        </p>
      )}

      {loading ? (
        <p className="pl-state" role="status">Loading playlists…</p>
      ) : error ? (
        <div className="pl-state is-error" role="alert">
          <p>{error}</p>
          <button type="button" className="pl-btn" onClick={load}>Try again</button>
        </div>
      ) : visible.length === 0 ? (
        <p className="pl-state">
          {filter === 'others' ? 'Nobody else shared a playlist yet.' : 'No playlists yet. Create one above, or from the Tracks page.'}
        </p>
      ) : (
        <ul className="pl-grid">
          {visible.map((playlist) => {
            const count = (playlist.tracks || []).length
            const mine = isMine(playlist, user)
            return (
              <li key={playlist._id} className="pl-card">
                <div className="pl-cover" aria-hidden="true">♫</div>
                <div className="pl-card-body">
                  <Link to={`/playlists/${playlist._id}`} className="pl-card-title">{playlist.name}</Link>
                  <p className="pl-card-desc">{playlist.description || 'No description'}</p>
                  <p className="pl-card-meta">
                    {count} {count === 1 ? 'track' : 'tracks'}
                    <span className={`pl-badge ${playlist.isPublic ? '' : 'is-private'}`}>
                      {playlist.isPublic ? 'Public' : 'Private'}
                    </span>
                    {mine ? <span className="pl-badge">Yours</span> : <AuthorChip author={playlist.author} prefix="by " />}
                  </p>
                </div>
                <div className="pl-card-actions">
                  <LikeButton
                    playlistId={playlist._id}
                    liked={playlist.liked}
                    count={playlist.likesCount}
                    onChange={(result) => updateLike(playlist._id, result)}
                  />
                  <button type="button" className="pl-btn pl-btn-main" onClick={() => handlePlay(playlist)} disabled={count === 0}>
                    ▶ Play all
                  </button>
                  <Link to={`/playlists/${playlist._id}`} className="pl-btn">Open</Link>
                  {!mine && (
                    <button type="button" className="pl-btn" onClick={() => handleCopy(playlist)} disabled={busy}>
                      Save to mine
                    </button>
                  )}
                  {canEdit(playlist, user) &&
                    (confirmId === playlist._id ? (
                      <>
                        <button type="button" className="pl-btn pl-btn-danger" onClick={() => handleDelete(playlist)} disabled={busy}>
                          Confirm delete
                        </button>
                        <button type="button" className="pl-btn" onClick={() => setConfirmId(null)}>Cancel</button>
                      </>
                    ) : (
                      <button type="button" className="pl-btn" onClick={() => setConfirmId(playlist._id)}>Delete</button>
                    ))}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default PlaylistsPage
