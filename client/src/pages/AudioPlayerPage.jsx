import './AudioPlayer.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

// Transforme le filePath stocké en base en URL lisible par le navigateur
const buildAudioUrl = (src) => {
  if (!src) return ''

  const clean = src.replace(/\\/g, '/')

  // Déjà une URL complète et valide
  if (/^https?:\/\//i.test(clean) && !clean.startsWith('http:/l')) return clean

  // On garde la partie à partir de "uploads/" (gère /app/uploads/x.mp3 et http:/localhost:4000/uploads/x.mp3)
  const index = clean.lastIndexOf('uploads/')
  const relative = index >= 0 ? clean.slice(index) : clean.replace(/^\/+/, '')

  // On encode chaque segment : espaces, accents, #, ? ...
  const encoded = relative.split('/').map(encodeURIComponent).join('/')

  return `${API_URL}/${encoded}`
}

const AudioPlayer = ({ src }) => {
  const url = buildAudioUrl(src)
  if (!url) return null

  return (
    <audio
      key={url}
      className="audio-player"
      controls
      preload="metadata"
      src={url}
    >
      Your browser does not support the audio element.
    </audio>
  )
}

export default AudioPlayer