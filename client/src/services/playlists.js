import apiClient from '../api/axios'

export const errMsg = (err) =>
  err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.'

export const listPlaylists = async () => (await apiClient.get('/playlists')).data?.data || []

export const getPlaylist = async (id) => {
  const response = await apiClient.get(`/playlists/${id}`)
  return response.data?.data ?? response.data
}

export const createPlaylist = async ({ name, description, tracks, isPublic }) => {
  const body = { name }
  if (description && description.trim()) body.description = description.trim()
  if (tracks && tracks.length) body.tracks = tracks
  if (typeof isPublic === 'boolean') body.isPublic = isPublic
  return (await apiClient.post('/playlists', body)).data?.data
}

// Remplace la liste complète des pistes (c'est ce qu'attend l'API)
export const setPlaylistTracks = async (id, trackIds) =>
  (await apiClient.put(`/playlists/${id}`, { tracks: trackIds })).data?.data

export const setPlaylistVisibility = async (id, isPublic) =>
  (await apiClient.put(`/playlists/${id}`, { isPublic })).data?.data

export const deletePlaylist = async (id) => apiClient.delete(`/playlists/${id}`)

export const likePlaylist = async (id) => (await apiClient.post(`/playlists/${id}/like`)).data?.data
export const unlikePlaylist = async (id) => (await apiClient.delete(`/playlists/${id}/like`)).data?.data

export const copyPlaylist = async (id) => (await apiClient.post(`/playlists/${id}/copy`)).data?.data

export const listComments = async (id) => (await apiClient.get(`/playlists/${id}/comments`)).data?.data || []
export const addComment = async (id, text) => (await apiClient.post(`/playlists/${id}/comments`, { text })).data?.data
export const deleteComment = async (id, commentId) => apiClient.delete(`/playlists/${id}/comments/${commentId}`)

export const isMine = (playlist, user) =>
  Boolean(user) && String(playlist.createdBy) === String(user._id)

export const canEdit = (playlist, user) =>
  Boolean(user) && (user.role === 'admin' || isMine(playlist, user))
