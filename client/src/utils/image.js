const TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_FILE_BYTES = 8 * 1024 * 1024
const MAX_DATA_URL = 110000 // le serveur accepte jusqu'à 120 000 caractères

// Recadre l'image en carré, la réduit à `size` px et renvoie une data URL JPEG légère
export const resizeToDataUrl = async (file, size = 256) => {
  if (!file || !TYPES.includes(file.type)) {
    throw new Error('Please choose a PNG, JPEG or WebP image.')
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error('This image is too large (8 MB maximum).')
  }

  let bitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error('Unable to read this image.')
  }

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff' // fond pour les PNG transparents
  ctx.fillRect(0, 0, size, size)

  const side = Math.min(bitmap.width, bitmap.height)
  ctx.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    size,
    size
  )
  if (bitmap.close) bitmap.close()

  for (const quality of [0.85, 0.7, 0.5]) {
    const url = canvas.toDataURL('image/jpeg', quality)
    if (url.length <= MAX_DATA_URL) return url
  }
  throw new Error('This image is too detailed. Please try another one.')
}
