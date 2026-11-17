import { useEffect, useSyncExternalStore } from 'react'
import apiClient from '../api/axios'
import { resizeToDataUrl } from '../utils/image'

// Petit store partagé : la barre de navigation et la page profil voient le même utilisateur
let state = { user: null, status: 'idle', token: null } // status : idle | loading | ready | error
const listeners = new Set()

const emit = (patch) => {
  state = { ...state, ...patch }
  listeners.forEach((listener) => listener())
}
const subscribe = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
const getSnapshot = () => state

const readToken = () => {
  try {
    return localStorage.getItem('token')
  } catch {
    return null
  }
}

export const clearCurrentUser = () => emit({ user: null, status: 'idle', token: null })

export const loadCurrentUser = async () => {
  const token = readToken()
  if (!token) {
    if (state.user || state.status !== 'idle') clearCurrentUser()
    return
  }
  if (state.token === token && (state.status === 'loading' || state.status === 'ready')) return

  emit({ status: 'loading', token, user: state.token === token ? state.user : null })
  try {
    const { data } = await apiClient.get('/users/profile')
    if (readToken() === token) emit({ user: data.user, status: 'ready' })
  } catch {
    if (readToken() === token) emit({ status: 'error' })
  }
}

const errorMessage = (err) =>
  err.response?.data?.message || err.message || 'Something went wrong. Please try again.'

export const useCurrentUser = () => {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot)
  const token = readToken()

  useEffect(() => {
    if (!token) {
      if (snapshot.user || snapshot.status !== 'idle') clearCurrentUser()
    } else if (snapshot.token !== token) {
      loadCurrentUser()
    }
  }, [token, snapshot.token, snapshot.user, snapshot.status])

  const uploadAvatar = async (file) => {
    try {
      const avatar = await resizeToDataUrl(file)
      const { data } = await apiClient.put('/users/avatar', { avatar })
      emit({ user: data.user })
    } catch (err) {
      throw new Error(errorMessage(err))
    }
  }

  const removeAvatar = async () => {
    try {
      const { data } = await apiClient.delete('/users/avatar')
      emit({ user: data.user })
    } catch (err) {
      throw new Error(errorMessage(err))
    }
  }

  return {
    user: token ? snapshot.user : null,
    status: snapshot.status,
    uploadAvatar,
    removeAvatar,
  }
}
