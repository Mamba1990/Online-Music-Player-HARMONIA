import { useCallback, useEffect, useState } from 'react'
import { addComment, deleteComment, errMsg, listComments } from '../services/playlists'
import AuthorChip from './AuthorChip'

const MAX_LENGTH = 500

const Comments = ({ playlistId }) => {
  const [comments, setComments] = useState(null)
  const [error, setError] = useState('')
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setError('')
    try {
      setComments(await listComments(playlistId))
    } catch (err) {
      setError(errMsg(err))
      setComments([])
    }
  }, [playlistId])

  useEffect(() => {
    setComments(null)
    load()
  }, [load])

  const submit = async (e) => {
    e.preventDefault()
    const clean = text.trim()
    if (!clean) return
    setBusy(true)
    setError('')
    try {
      const created = await addComment(playlistId, clean)
      setComments((all) => [created, ...(all || [])])
      setText('')
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  const remove = async (comment) => {
    setBusy(true)
    setError('')
    try {
      await deleteComment(playlistId, comment._id)
      setComments((all) => all.filter((c) => c._id !== comment._id))
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="pl-comments" aria-label="Comments">
      <h2>Comments{comments ? ` (${comments.length})` : ''}</h2>

      <form className="pl-comment-form" onSubmit={submit}>
        <textarea
          className="pl-input pl-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment…"
          maxLength={MAX_LENGTH}
          rows={2}
          aria-label="Write a comment"
        />
        <div className="pl-comment-bar">
          <span className="pl-counter">{text.length}/{MAX_LENGTH}</span>
          <button type="submit" className="pl-btn pl-btn-main" disabled={busy || !text.trim()}>
            Post
          </button>
        </div>
      </form>

      {error && <p className="pl-notice is-error" role="alert">{error}</p>}

      {comments === null ? (
        <p className="pl-state" role="status">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="pl-state">No comments yet. Be the first to write one.</p>
      ) : (
        <ul className="pl-comment-list">
          {comments.map((comment) => (
            <li key={comment._id} className="pl-comment">
              <div className="pl-comment-head">
                <AuthorChip author={comment.author} size={28} />
                <time className="pl-comment-date" dateTime={comment.createdAt}>
                  {new Date(comment.createdAt).toLocaleString()}
                </time>
                {comment.canDelete && (
                  <button type="button" className="pl-link" onClick={() => remove(comment)} disabled={busy}>
                    Delete
                  </button>
                )}
              </div>
              <p className="pl-comment-text">{comment.text}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default Comments
