import { useRef, useState } from 'react'
import Avatar from '../components/Avatar'
import { useCurrentUser } from '../hooks/useCurrentUser'
import './ProfilePage.css'

const ProfilePage = () => {
  const { user, status, uploadAvatar, removeAvatar } = useCurrentUser()
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState(null) // { type: 'ok' | 'error', text }
  const fileRef = useRef(null)

  if (!localStorage.getItem('token')) {
    return <div className="profile-page"><p className="profile-state">User is not authenticated. Please log in.</p></div>
  }
  if (status === 'error' && !user) {
    return <div className="profile-page"><p className="profile-state profile-error">Unable to load your profile. Please try again.</p></div>
  }
  if (!user) {
    return <div className="profile-page"><p className="profile-state" role="status">Loading…</p></div>
  }

  const run = async (action, okText) => {
    setBusy(true)
    setFeedback(null)
    try {
      await action()
      setFeedback({ type: 'ok', text: okText })
    } catch (err) {
      setFeedback({ type: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) run(() => uploadAvatar(file), 'Profile photo updated.')
  }

  return (
    <div className="profile-page">
      <section className="profile-card">
        <Avatar src={user.avatar} name={user.name} size={132} className="profile-avatar" />
        <h1>{user.name}</h1>
        <p className="profile-email">{user.email}</p>

        <div className="profile-actions">
          <button type="button" className="profile-btn profile-btn-main" onClick={() => fileRef.current?.click()} disabled={busy}>
            {busy ? 'Saving…' : 'Change photo'}
          </button>
          {user.avatar && (
            <button type="button" className="profile-btn" onClick={() => run(removeAvatar, 'Profile photo removed.')} disabled={busy}>
              Remove photo
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="profile-file" onChange={handleFile} />

        {feedback && (
          <p className={`profile-feedback ${feedback.type === 'error' ? 'profile-error' : 'profile-ok'}`} role={feedback.type === 'error' ? 'alert' : 'status'}>
            {feedback.text}
          </p>
        )}
        <p className="profile-hint">PNG, JPEG or WebP. Your photo is cropped to a square.</p>
      </section>
    </div>
  )
}

export default ProfilePage
