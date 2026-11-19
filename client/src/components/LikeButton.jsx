import { useState } from 'react'
import { errMsg, likePlaylist, unlikePlaylist } from '../services/playlists'

// Bouton cœur avec compteur. onChange reçoit { likesCount, liked } après chaque clic.
const LikeButton = ({ playlistId, liked, count, onChange }) => {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const toggle = async () => {
    setBusy(true)
    setError('')
    try {
      const result = liked ? await unlikePlaylist(playlistId) : await likePlaylist(playlistId)
      onChange(result)
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      className={`pl-like ${liked ? 'is-liked' : ''}`}
      onClick={toggle}
      disabled={busy}
      aria-pressed={liked}
      aria-label={liked ? 'Remove your like' : 'Like this playlist'}
      title={error || (liked ? 'Remove your like' : 'Like this playlist')}
    >
      <span aria-hidden="true">{liked ? '♥' : '♡'}</span> {count}
    </button>
  )
}

export default LikeButton
