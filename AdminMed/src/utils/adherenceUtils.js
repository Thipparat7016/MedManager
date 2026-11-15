import { parseScheduleTimeMinutes } from './dateUtils'

export function normalizeStr(str) {
  return (str || '').trim().replace(/\s+/g, ' ').toLowerCase()
}

export function normalizeMedKey(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[()（）[\]{}.,/#!$%^&*;:{}=\-_`~?+]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function toStorageKey(emailOrId) {
  return (emailOrId || '').trim().toLowerCase().replace(/[^a-z0-9@._-]/gi, '_')
}

export function getMealWindowCategory(minutes, mealTiming) {
  if (mealTiming === 'ก่อนนอน') return 'ก่อนนอน'
  if (minutes >= 300 && minutes <= 659) return 'เช้า'
  if (minutes >= 660 && minutes <= 899) return 'กลางวัน'
  if (minutes >= 900 && minutes <= 1199) return 'เย็น'
  return 'ก่อนนอน'
}

export function getMealWindowStartMinutes(meal) {
  if (meal === 'เช้า') return 300
  if (meal === 'กลางวัน') return 660
  if (meal === 'เย็น') return 900
  return 1200
}

/** Returns the start minute of the meal window active at `createdMinutes` on a calendar day. */
export function getCreationDayActiveWindowStart(createdMinutes) {
  if (createdMinutes < 300) return 0
  if (createdMinutes < 660) return 300
  if (createdMinutes < 900) return 660
  if (createdMinutes < 1200) return 900
  return 1200
}

export function isScheduleTakenOnTime(item) {
  const isTaken = Boolean(item?.is_taken ?? item?.isTaken)
  const takenAt = item?.taken_at ?? item?.takenAt
  if (!item || !isTaken || !takenAt) return false

  const takenMinutes = parseScheduleTimeMinutes(takenAt)
  if (takenMinutes === null) return false

  const origMinutes = parseScheduleTimeMinutes(item.original_time || item.originalTime || item.time)
  const postponedMinutes = parseScheduleTimeMinutes(item.postponed_time || item.postponedTime)
  const currentTargetMinutes = parseScheduleTimeMinutes(item.time)
  const mealTiming = item.meal_timing || item.mealTiming

  if (origMinutes !== null) {
    const scheduledMeal = getMealWindowCategory(origMinutes, mealTiming)
    const takenMeal = getMealWindowCategory(takenMinutes)
    if (scheduledMeal === takenMeal) {
      return true
    }

    const mealStartMinutes = getMealWindowStartMinutes(scheduledMeal)
    const minutesBeforeMealStart = (((mealStartMinutes - takenMinutes) % 1440) + 1440) % 1440
    if (minutesBeforeMealStart >= 0 && minutesBeforeMealStart <= 30) {
      return true
    }

    const minutesBeforeScheduled = (((origMinutes - takenMinutes) % 1440) + 1440) % 1440
    if (minutesBeforeScheduled >= 0 && minutesBeforeScheduled <= 30) {
      return true
    }
  }

  const effectivePostponed =
    postponedMinutes !== null
      ? postponedMinutes
      : (item.postponed_time || item.postponedTime) && origMinutes !== null
      ? (((origMinutes + 30) % 1440) + 1440) % 1440
      : currentTargetMinutes !== null && origMinutes !== null && currentTargetMinutes !== origMinutes
      ? currentTargetMinutes
      : null

  if (effectivePostponed !== null) {
    const diffBeforePostponed = (((effectivePostponed - takenMinutes) % 1440) + 1440) % 1440
    if (diffBeforePostponed >= 0 && diffBeforePostponed <= 30) {
      return true
    }
  }

  return false
}
