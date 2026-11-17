import apiClient from '../api/axios'

export const errMsg = (err) =>
  err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.'

export const listPlaylists = async () => (await apiClient.get('/playlists')).data?.data || []

export const getPlaylist = async (id) => {
  const response = await apiClient.get(`/playlists/${id}`)
  return response.data?.data ?? response.data
}

export const createPlaylist = async ({ name, description, tracks }) => {
  const body = { name }
  if (description && description.trim()) body.description = description.trim()
  if (tracks && tracks.length) body.tracks = tracks
  return (await apiClient.post('/playlists', body)).data?.data
}

// Remplace la liste complète des pistes (c'est ce qu'attend l'API)
export const setPlaylistTracks = async (id, trackIds) =>
  (await apiClient.put(`/playlists/${id}`, { tracks: trackIds })).data?.data

export const deletePlaylist = async (id) => apiClient.delete(`/playlists/${id}`)

export const isMine = (playlist, user) =>
  Boolean(user) && String(playlist.createdBy) === String(user._id)

export const canEdit = (playlist, user) =>
  Boolean(user) && (user.role === 'admin' || isMine(playlist, user))
