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


