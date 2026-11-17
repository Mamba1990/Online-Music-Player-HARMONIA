const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

// Construit l'URL jouable d'une piste à partir de son filePath
export const buildAudioUrl = (src) => {
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
