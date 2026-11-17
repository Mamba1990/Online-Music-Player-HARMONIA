// 187 -> "3:07"
export const formatDuration = (value) => {
  const total = Math.round(Number(value))
  if (!Number.isFinite(total) || total < 0) return '–'
  const minutes = Math.floor(total / 60)
  const seconds = String(total % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}
