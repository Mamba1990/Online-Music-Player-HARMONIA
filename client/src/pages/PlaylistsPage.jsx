import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePlayer } from '../context/PlayerContext'
import { useCurrentUser } from '../hooks/useCurrentUser'
import {
  canEdit,
  createPlaylist,
  deletePlaylist,
  errMsg,
  getPlaylist,
  isMine,
  listPlaylists,
} from '../services/playlists'
import '../components/Playlists.css'

const PlaylistsPage = () => {
  const { user } = useCurrentUser()
  const { playTrack } = usePlayer()
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

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

  // Mes playlists d'abord
  const sorted = useMemo(
    () => [...playlists].sort((a, b) => Number(isMine(b, user)) - Number(isMine(a, user))),
    [playlists, user]
  )

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    setNotice(null)
    try {
      const created = await createPlaylist({ name: name.trim(), description })
      setPlaylists((all) => [created, ...all])
      setName('')
      setDescription('')
      setNotice({ type: 'ok', text: `Playlist “${created.name}” created. Add tracks from the Tracks page.` })
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
        <button type="submit" className="pl-btn pl-btn-main" disabled={busy || !name.trim()}>
          Create playlist
        </button>
      </form>

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
      ) : sorted.length === 0 ? (
        <p className="pl-state">No playlists yet. Create one above, or from the Tracks page.</p>
      ) : (
        <ul className="pl-grid">
          {sorted.map((playlist) => {
            const count = (playlist.tracks || []).length
            return (
              <li key={playlist._id} className="pl-card">
                <div className="pl-cover" aria-hidden="true">♫</div>
                <div className="pl-card-body">
                  <Link to={`/playlists/${playlist._id}`} className="pl-card-title">{playlist.name}</Link>
                  <p className="pl-card-desc">{playlist.description || 'No description'}</p>
                  <p className="pl-card-meta">
                    {count} {count === 1 ? 'track' : 'tracks'}
                    {isMine(playlist, user) && <span className="pl-badge">Yours</span>}
                  </p>
                </div>
                <div className="pl-card-actions">
                  <button type="button" className="pl-btn pl-btn-main" onClick={() => handlePlay(playlist)} disabled={count === 0}>
                    ▶ Play all
                  </button>
                  <Link to={`/playlists/${playlist._id}`} className="pl-btn">Open</Link>
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
