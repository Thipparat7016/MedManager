/**
 * Medication and Supplement Image Resolver Service
 * Automatic image filling is disabled per administrator policy so admins upload authentic photos manually.
 */

// Retain authentic reference images if needed in future
export const AUTHENTIC_PRODUCT_IMAGES = {
  tiffy: '/images/medications/tiffy.jpg',
  decolgen: '/images/medications/decolgen.jpg',
  sara: '/images/medications/sara.jpg',
  tylenol: '/images/medications/tylenol.jpg',
  gofen: '/images/medications/gofen.jpg',
  amoxicillin: '/images/medications/amoxicillin.jpg',
  fish_oil: '/images/medications/fish_oil.jpg',
  vitamin_c: '/images/medications/vitamin_c.jpg',
}

/**
 * Resolves an authentic image URL for a given drug or supplement.
 * Auto-fill for images is disabled; always returns empty string "" so admin uploads photos manually.
 */
export function resolveMedicationImage() {
  return ''
}

/**
 * Compresses an uploaded image File via an offscreen canvas to a compact JPEG Data URL
 * (typically ~15-30 KB instead of multi-megabyte raw Base64) to minimize Supabase Database Egress.
 */
export function compressImageFile(file, { maxWidth = 360, maxHeight = 360, quality = 0.72 } = {}) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve('')
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์รูปภาพได้'))
    reader.onload = () => {
      const rawDataUrl = typeof reader.result === 'string' ? reader.result : ''
      if (!rawDataUrl) {
        resolve('')
        return
      }
      compressDataUrl(rawDataUrl, { maxWidth, maxHeight, quality })
        .then(resolve)
        .catch(() => resolve(rawDataUrl))
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Compresses any Base64 data:image/... URL using an offscreen HTMLCanvasElement.
 */
export function compressDataUrl(dataUrl, { maxWidth = 360, maxHeight = 360, quality = 0.72 } = {}) {
  return new Promise((resolve) => {
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
      resolve(dataUrl || '')
      return
    }
    if (typeof Image === 'undefined' || typeof document === 'undefined') {
      resolve(dataUrl)
      return
    }
    const img = new Image()
    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width || maxWidth
        let height = img.naturalHeight || img.height || maxHeight

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.max(1, Math.round(width * ratio))
          height = Math.max(1, Math.round(height * ratio))
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(dataUrl)
          return
        }
        // Fill white background so transparent PNGs convert cleanly to compact JPEG
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)

        const compressed = canvas.toDataURL('image/jpeg', quality)
        resolve(compressed.length < dataUrl.length ? compressed : dataUrl)
      } catch {
        resolve(dataUrl)
      }
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

/**
 * Compresses a Base64 data URL only if it exceeds maxLength (default 80 KB).
 */
export async function compressDataUrlIfOversized(
  dataUrl,
  { maxLength = 80000, maxWidth = 360, maxHeight = 360, quality = 0.72 } = {}
) {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
    return dataUrl || ''
  }
  if (dataUrl.length <= maxLength) {
    return dataUrl
  }
  return compressDataUrl(dataUrl, { maxWidth, maxHeight, quality })
}



