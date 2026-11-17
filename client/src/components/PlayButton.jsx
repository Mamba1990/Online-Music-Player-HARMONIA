import { usePlayer } from '../context/PlayerContext'
import './PlayButton.css'

/**
 * Bouton "lecture" pour une piste d'une liste.
 * <PlayButton track={track} queue={tracks} />
 * - queue : la liste dans laquelle lire la suite (suivant/précédent)
 */
const PlayButton = ({ track, queue, label = true, className = '' }) => {
  const { current, isPlaying, playTrack, toggle, addToQueue } = usePlayer()
  const active = current?._id === track._id
  const playing = active && isPlaying

  const handlePlay = () => (active ? toggle() : playTrack(track, queue))

  return (
    <span className={`play-actions ${className}`}>
      <button
        type="button"
        className={`play-btn ${playing ? 'is-playing' : ''}`}
        onClick={handlePlay}
        aria-label={`${playing ? 'Pause' : 'Play'} ${track.title}`}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
          <path d={playing ? 'M6 19h4V5H6v14zm8-14v14h4V5h-4z' : 'M8 5v14l11-7z'} />
        </svg>
        {label && <span>{playing ? 'Pause' : 'Play'}</span>}
      </button>
      <button
        type="button"
        className="play-queue-btn"
        onClick={() => addToQueue(track)}
        aria-label={`Add ${track.title} to queue`}
        title="Add to queue"
      >
        + Queue
      </button>
    </span>
  )
}

export default PlayButton
