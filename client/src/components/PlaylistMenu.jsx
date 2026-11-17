import { useCallback, useEffect, useRef, useState } from 'react'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { createPlaylist, errMsg, isMine, listPlaylists, setPlaylistTracks } from '../services/playlists'
import './Playlists.css'

/**
 * Petit menu "ajouter à une playlist".
 * <PlaylistMenu trackIds={[track._id]} />            -> une piste
 * <PlaylistMenu trackIds={ids} label="Save as playlist" /> -> plusieurs pistes
 */
const PlaylistMenu = ({ trackIds, label = '+ Playlist', className = '' }) => {
  const { user } = useCurrentUser()
  const [open, setOpen] = useState(false)
  const [lists, setLists] = useState(null)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null) // { type: 'ok' | 'error', text }
  const rootRef = useRef(null)

  const single = trackIds.length === 1
  const contains = (playlist) => {
    const have = new Set((playlist.tracks || []).map(String))
    return trackIds.length > 0 && trackIds.every((id) => have.has(String(id)))
  }

  const load = useCallback(async () => {
    try {
      const all = await listPlaylists()
      setLists(all.filter((p) => isMine(p, user)))
    } catch (err) {
      setMessage({ type: 'error', text: errMsg(err) })
    }
  }, [user])

  useEffect(() => {
    if (open && user) load()
  }, [open, user, load])

  useEffect(() => {
    if (!open) return undefined
    const onClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const run = async (action) => {
    setBusy(true)
    setMessage(null)
    try {
      await action()
    } catch (err) {
      setMessage({ type: 'error', text: errMsg(err) })
    } finally {
      setBusy(false)
    }
  }

  const toggle = (playlist) =>
    run(async () => {
      const current = (playlist.tracks || []).map(String)
      const removing = single && contains(playlist)
      const next = removing
        ? current.filter((id) => id !== String(trackIds[0]))
        : [...new Set([...current, ...trackIds.map(String)])]
      const updated = await setPlaylistTracks(playlist._id, next)
      setLists((all) => all.map((p) => (p._id === updated._id ? updated : p)))
      setMessage({ type: 'ok', text: removing ? `Removed from “${playlist.name}”.` : `Added to “${playlist.name}”.` })
    })

  const create = (e) => {
    e.preventDefault()
    const clean = name.trim()
    if (!clean) return
    run(async () => {
      const created = await createPlaylist({ name: clean, tracks: trackIds })
      setLists((all) => [created, ...(all || [])])
      setName('')
      setMessage({ type: 'ok', text: `Playlist “${created.name}” created.` })
    })
  }

  return (
    <span className={`pl-menu ${className}`} ref={rootRef}>
      <button
        type="button"
        className="pl-add-btn"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {label}
      </button>

      {open && (
        <div className="pl-pop" role="dialog" aria-label="Add to playlist">
          <p className="pl-pop-title">
            {single ? 'Add to playlist' : `Add ${trackIds.length} tracks to a playlist`}
          </p>

          {!user || lists === null ? (
            <p className="pl-pop-note" role="status">Loading…</p>
          ) : lists.length === 0 ? (
            <p className="pl-pop-note">You have no playlist yet. Create your first one below.</p>
          ) : (
            <ul className="pl-pop-list">
              {lists.map((playlist) => {
                const has = contains(playlist)
                return (
                  <li key={playlist._id}>
                    <button type="button" className="pl-pop-item" onClick={() => toggle(playlist)} disabled={busy}>
                      <span className={`pl-check ${has ? 'is-on' : ''}`} aria-hidden="true">{has ? '✓' : ''}</span>
                      <span className="pl-pop-name">{playlist.name}</span>
                      <span className="pl-pop-count">{(playlist.tracks || []).length}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          <form className="pl-pop-form" onSubmit={create}>
            <input
              className="pl-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="New playlist name"
              maxLength={80}
              aria-label="New playlist name"
            />
            <button type="submit" className="pl-btn pl-btn-main" disabled={busy || !name.trim()}>
              Create
            </button>
          </form>

          {message && (
            <p className={`pl-pop-msg ${message.type === 'error' ? 'is-error' : 'is-ok'}`} role={message.type === 'error' ? 'alert' : 'status'}>
              {message.text}
            </p>
          )}
        </div>
      )}
    </span>
  )
}

export default PlaylistMenu
