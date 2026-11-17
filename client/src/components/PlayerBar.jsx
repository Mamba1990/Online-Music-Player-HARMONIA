import { useEffect, useState } from 'react'
import { usePlayer } from '../context/PlayerContext'
import './PlayerBar.css'

const ICONS = {
  play: 'M8 5v14l11-7z',
  pause: 'M6 19h4V5H6v14zm8-14v14h4V5h-4z',
  next: 'M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z',
  previous: 'M6 6h2v12H6zm3.5 6l8.5 6V6z',
  shuffle:
    'M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z',
  repeat: 'M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z',
  volume:
    'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z',
  mute: 'M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z',
  queue:
    'M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z',
  close: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
}

const Icon = ({ name, size = 22 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d={ICONS[name]} />
  </svg>
)

const formatTime = (value) => {
  if (!Number.isFinite(value) || value < 0) return '0:00'
  const total = Math.floor(value)
  const minutes = Math.floor(total / 60)
  const seconds = String(total % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

const PlayerBar = () => {
  const {
    audioRef,
    current,
    queue,
    index,
    isPlaying,
    isLoading,
    error,
    volume,
    muted,
    shuffle,
    repeat,
    rate,
    toggle,
    next,
    previous,
    seek,
    skipBy,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    cycleRate,
    playFromQueue,
    clearQueue,
  } = usePlayer()

  const [time, setTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [showQueue, setShowQueue] = useState(false)

  // Le temps est suivi ici (et non dans le contexte) pour ne pas redessiner tout le site 4 fois par seconde
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return undefined
    const onTime = () => setTime(audio.currentTime)
    const onMeta = () => setAudioDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('durationchange', onMeta)
    onMeta()
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('durationchange', onMeta)
    }
  }, [audioRef])

  useEffect(() => {
    setTime(0)
    setAudioDuration(0)
  }, [current?._id])

  // Réserve de la place en bas de page quand la barre est visible
  useEffect(() => {
    document.body.classList.toggle('has-player', Boolean(current))
    return () => document.body.classList.remove('has-player')
  }, [current])

  // Raccourcis clavier : espace, flèches gauche/droite, M, N, P
  useEffect(() => {
    if (!current) return undefined
    const onKey = (e) => {
      const tag = e.target.tagName
      const typing =
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        e.target.isContentEditable ||
        (tag === 'INPUT' && e.target.type !== 'range')
      if (typing || e.ctrlKey || e.metaKey || e.altKey) return
      const onRange = tag === 'INPUT' && e.target.type === 'range'

      switch (e.key) {
        case ' ':
          if (tag === 'BUTTON') return
          e.preventDefault()
          toggle()
          break
        case 'ArrowRight':
          if (onRange) return
          e.preventDefault()
          skipBy(5)
          break
        case 'ArrowLeft':
          if (onRange) return
          e.preventDefault()
          skipBy(-5)
          break
        case 'm':
        case 'M':
          toggleMute()
          break
        case 'n':
        case 'N':
          next()
          break
        case 'p':
        case 'P':
          previous()
          break
        case 'Escape':
          setShowQueue(false)
          break
        default:
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current, toggle, skipBy, toggleMute, next, previous])

  if (!current) return null

  const total = audioDuration || current.duration || 0
  const progress = total ? Math.min(100, (time / total) * 100) : 0
  const shownVolume = muted ? 0 : volume

  return (
    <section className="player-bar" aria-label="Music player">
      {showQueue && (
        <div className="player-queue" role="dialog" aria-label="Queue">
          <div className="player-queue-head">
            <h3>Queue · {queue.length}</h3>
            <div>
              <button type="button" className="player-link" onClick={clearQueue}>
                Clear
              </button>
              <button
                type="button"
                className="player-icon-btn"
                onClick={() => setShowQueue(false)}
                aria-label="Close queue"
              >
                <Icon name="close" size={20} />
              </button>
            </div>
          </div>
          <ol>
            {queue.map((track, i) => (
              <li key={`${track._id}-${i}`}>
                <button
                  type="button"
                  className={`player-queue-item ${i === index ? 'is-current' : ''}`}
                  onClick={() => playFromQueue(i)}
                >
                  <span className="player-queue-num">{i === index && isPlaying ? '▶' : i + 1}</span>
                  <span className="player-queue-text">
                    <strong>{track.title}</strong>
                    <small>{track.artist}</small>
                  </span>
                  <span className="player-queue-time">{formatTime(track.duration)}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="player-inner">
        <div className="player-track">
          <div className={`player-cover ${isPlaying ? 'is-playing' : ''}`} aria-hidden="true">
            {(current.title || '♪').charAt(0).toUpperCase()}
          </div>
          <div className="player-meta">
            <strong title={current.title}>{current.title}</strong>
            <span title={current.artist}>{current.artist}</span>
            {error && <em className="player-error">{error}</em>}
          </div>
          <div className={`player-eq ${isPlaying ? 'is-playing' : ''}`} aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
        </div>

        <div className="player-center">
          <div className="player-controls">
            <button
              type="button"
              className={`player-icon-btn ${shuffle ? 'is-active' : ''}`}
              onClick={toggleShuffle}
              aria-label="Shuffle"
              aria-pressed={shuffle}
              title="Shuffle"
            >
              <Icon name="shuffle" />
            </button>
            <button
              type="button"
              className="player-icon-btn"
              onClick={previous}
              aria-label="Previous track"
              title="Previous (P)"
            >
              <Icon name="previous" size={26} />
            </button>
            <button
              type="button"
              className="player-play"
              onClick={toggle}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              title="Play / pause (Space)"
            >
              {isLoading && isPlaying ? (
                <span className="player-spinner" />
              ) : (
                <Icon name={isPlaying ? 'pause' : 'play'} size={28} />
              )}
            </button>
            <button
              type="button"
              className="player-icon-btn"
              onClick={next}
              aria-label="Next track"
              title="Next (N)"
            >
              <Icon name="next" size={26} />
            </button>
            <button
              type="button"
              className={`player-icon-btn ${repeat !== 'off' ? 'is-active' : ''}`}
              onClick={cycleRepeat}
              aria-label={`Repeat: ${repeat}`}
              title={`Repeat: ${repeat}`}
            >
              <Icon name="repeat" />
              {repeat === 'one' && <span className="player-badge">1</span>}
            </button>
          </div>

          <div className="player-seek">
            <span className="player-time">{formatTime(time)}</span>
            <input
              type="range"
              className="player-range player-range-seek"
              min={0}
              max={total || 0}
              step={0.1}
              value={Math.min(time, total || 0)}
              onChange={(e) => {
                setTime(Number(e.target.value))
                seek(Number(e.target.value))
              }}
              style={{ '--p': `${progress}%` }}
              aria-label="Seek"
              disabled={!total}
            />
            <span className="player-time">{formatTime(total)}</span>
          </div>
        </div>

        <div className="player-extra">
          <button
            type="button"
            className="player-chip"
            onClick={cycleRate}
            aria-label={`Playback speed ${rate}x`}
            title="Playback speed"
          >
            {rate}x
          </button>
          <div className="player-volume">
            <button
              type="button"
              className="player-icon-btn"
              onClick={toggleMute}
              aria-label={muted || volume === 0 ? 'Unmute' : 'Mute'}
              title="Mute (M)"
            >
              <Icon name={muted || volume === 0 ? 'mute' : 'volume'} />
            </button>
            <input
              type="range"
              className="player-range"
              min={0}
              max={1}
              step={0.01}
              value={shownVolume}
              onChange={(e) => setVolume(e.target.value)}
              style={{ '--p': `${shownVolume * 100}%` }}
              aria-label="Volume"
            />
          </div>
          <button
            type="button"
            className={`player-icon-btn ${showQueue ? 'is-active' : ''}`}
            onClick={() => setShowQueue((s) => !s)}
            aria-label="Queue"
            aria-expanded={showQueue}
            title="Queue"
          >
            <Icon name="queue" />
          </button>
        </div>
      </div>
    </section>
  )
}

export default PlayerBar
