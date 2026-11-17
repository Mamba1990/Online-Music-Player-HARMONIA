import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { buildAudioUrl } from '../utils/audioUrl'

const STORAGE_KEY = 'harmonia:player'
const RATES = [0.75, 1, 1.25, 1.5, 2]

const PlayerContext = createContext(null)

// Les préférences (volume, shuffle...) sont facultatives : tout est protégé par try/catch
const readPrefs = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

const writePrefs = (prefs) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    /* stockage indisponible : on ignore */
  }
}

export const usePlayer = () => {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer doit être utilisé dans <PlayerProvider>')
  return ctx
}

export const PlayerProvider = ({ children }) => {
  const audioRef = useRef(null)
  const historyRef = useRef([])
  const [prefs] = useState(readPrefs)

  const [queue, setQueue] = useState([])
  const [index, setIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [volume, setVolumeState] = useState(
    typeof prefs.volume === 'number' ? prefs.volume : 0.8
  )
  const [muted, setMuted] = useState(Boolean(prefs.muted))
  const [shuffle, setShuffle] = useState(Boolean(prefs.shuffle))
  const [repeat, setRepeat] = useState(
    ['off', 'all', 'one'].includes(prefs.repeat) ? prefs.repeat : 'off'
  )
  const [rate, setRateState] = useState(1)

  const current = index >= 0 ? queue[index] || null : null
  const currentUrl = current ? buildAudioUrl(current.filePath) : ''

  // Charge et lance la piste quand elle change
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (!currentUrl) {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      return
    }
    setError('')
    setIsLoading(true)
    audio.src = currentUrl
    audio.playbackRate = rate
    const attempt = audio.play()
    if (attempt && attempt.catch) attempt.catch(() => setIsPlaying(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUrl])

  // Volume et sourdine
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume
    audio.muted = muted
  }, [volume, muted])

  // Mémorise les préférences
  useEffect(() => {
    writePrefs({ volume, muted, shuffle, repeat })
  }, [volume, muted, shuffle, repeat])

  const restart = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = 0
    audio.play().catch(() => {})
  }, [])

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !audio.getAttribute('src')) return
    if (audio.paused) audio.play().catch(() => {})
    else audio.pause()
  }, [])

  const playTrack = useCallback(
    (track, list) => {
      if (!track) return
      const nextQueue = Array.isArray(list) && list.length ? list : [track]
      const target = nextQueue.findIndex((t) => t._id === track._id)
      historyRef.current = []
      setQueue(nextQueue)
      setIndex(target >= 0 ? target : 0)
      // Même piste déjà chargée : on la relance depuis le début
      if (current && current._id === track._id && audioRef.current?.ended) restart()
    },
    [current, restart]
  )

  // Passe à la piste suivante. auto = true quand la piste vient de se terminer
  const advance = useCallback(
    (auto = false) => {
      if (!queue.length) return
      let target = -1
      if (shuffle && queue.length > 1) {
        do {
          target = Math.floor(Math.random() * queue.length)
        } while (target === index)
      } else if (index + 1 < queue.length) {
        target = index + 1
      } else if (repeat === 'all') {
        target = 0
      }

      if (target === -1) {
        // Fin de la file sans répétition : on s'arrête sur le début de la dernière piste
        if (auto && audioRef.current) audioRef.current.currentTime = 0
        return
      }
      if (target === index) {
        restart()
        return
      }
      historyRef.current.push(index)
      setIndex(target)
    },
    [queue, index, shuffle, repeat, restart]
  )

  const previous = useCallback(() => {
    const audio = audioRef.current
    // Après 3 secondes, "précédent" recommence la piste, comme sur les lecteurs classiques
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0
      return
    }
    if (historyRef.current.length) {
      setIndex(historyRef.current.pop())
    } else if (index > 0) {
      setIndex(index - 1)
    } else if (repeat === 'all' && queue.length) {
      setIndex(queue.length - 1)
    } else if (audio) {
      audio.currentTime = 0
    }
  }, [index, repeat, queue])

  const seek = useCallback((seconds) => {
    const audio = audioRef.current
    if (!audio || !Number.isFinite(seconds)) return
    audio.currentTime = Math.max(0, seconds)
  }, [])

  const skipBy = useCallback((delta) => {
    const audio = audioRef.current
    if (!audio) return
    const max = Number.isFinite(audio.duration) ? audio.duration : Infinity
    audio.currentTime = Math.min(max, Math.max(0, audio.currentTime + delta))
  }, [])

  const setVolume = useCallback((value) => {
    const v = Math.min(1, Math.max(0, Number(value)))
    setVolumeState(v)
    setMuted(v === 0)
  }, [])

  const toggleMute = useCallback(() => {
    if (muted && volume === 0) setVolumeState(0.5)
    setMuted((m) => !m)
  }, [muted, volume])

  const toggleShuffle = useCallback(() => setShuffle((s) => !s), [])

  const cycleRepeat = useCallback(
    () => setRepeat((r) => (r === 'off' ? 'all' : r === 'all' ? 'one' : 'off')),
    []
  )

  const cycleRate = useCallback(() => {
    setRateState((r) => {
      const next = RATES[(RATES.indexOf(r) + 1) % RATES.length]
      if (audioRef.current) audioRef.current.playbackRate = next
      return next
    })
  }, [])

  const addToQueue = useCallback(
    (track) => {
      if (!track) return
      if (!queue.length) {
        playTrack(track, [track])
        return
      }
      setQueue((q) => (q.some((t) => t._id === track._id) ? q : [...q, track]))
    },
    [queue.length, playTrack]
  )

  const playFromQueue = useCallback((i) => {
    historyRef.current = []
    setIndex(i)
  }, [])

  const clearQueue = useCallback(() => {
    historyRef.current = []
    setQueue([])
    setIndex(-1)
    setIsPlaying(false)
    setIsLoading(false)
  }, [])

  // Touches multimédia du clavier et écran de verrouillage
  useEffect(() => {
    if (!current || !('mediaSession' in navigator) || !window.MediaMetadata) return
    navigator.mediaSession.metadata = new window.MediaMetadata({
      title: current.title,
      artist: current.artist,
      album: 'Harmonia',
    })
  }, [current])

  useEffect(() => {
    if (!('mediaSession' in navigator)) return undefined
    const ms = navigator.mediaSession
    const setHandler = (action, handler) => {
      try {
        ms.setActionHandler(action, handler)
      } catch {
        /* action non prise en charge */
      }
    }
    setHandler('play', () => audioRef.current?.play().catch(() => {}))
    setHandler('pause', () => audioRef.current?.pause())
    setHandler('previoustrack', previous)
    setHandler('nexttrack', () => advance(false))
    return () => {
      ;['play', 'pause', 'previoustrack', 'nexttrack'].forEach((a) => setHandler(a, null))
    }
  }, [previous, advance])

  const handleEnded = () => {
    if (repeat === 'one') restart()
    else advance(true)
  }

  const value = useMemo(
    () => ({
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
      playTrack,
      toggle,
      next: () => advance(false),
      previous,
      seek,
      skipBy,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
      cycleRate,
      addToQueue,
      playFromQueue,
      clearQueue,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
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
      playTrack,
      toggle,
      advance,
      previous,
      seek,
      skipBy,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
      cycleRate,
      addToQueue,
      playFromQueue,
      clearQueue,
    ]
  )

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onPlaying={() => setIsLoading(false)}
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onEnded={handleEnded}
        onError={() => {
          if (!currentUrl) return
          setIsLoading(false)
          setIsPlaying(false)
          setError('Unable to play this track.')
        }}
      />
    </PlayerContext.Provider>
  )
}
