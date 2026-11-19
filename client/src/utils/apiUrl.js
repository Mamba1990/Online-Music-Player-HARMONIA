export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

// Adresse de la photo d'un auteur (le serveur n'envoie jamais les images dans les listes)
export const authorAvatarUrl = (author) =>
  author?.hasAvatar ? `${API_URL}/users/${author._id}/avatar?v=${author.v || 0}` : ''
