export const THAI_DAYS = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์']

export const THAI_FULL_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
]

export const THAI_MONTH_MAP = {
  'มกราคม': 0, 'ม.ค.': 0, 'ม.ค': 0,
  'กุมภาพันธ์': 1, 'ก.พ.': 1, 'ก.พ': 1,
  'มีนาคม': 2, 'มี.ค.': 2, 'มี.ค': 2,
  'เมษายน': 3, 'เม.ย.': 3, 'เม.ย': 3,
  'พฤษภาคม': 4, 'พ.ค.': 4, 'พ.ค': 4,
  'มิถุนายน': 5, 'มิ.ย.': 5, 'มิ.ย': 5,
  'กรกฎาคม': 6, 'ก.ค.': 6, 'ก.ค': 6,
  'สิงหาคม': 7, 'ส.ค.': 7, 'ส.ค': 7,
  'กันยายน': 8, 'ก.ย.': 8, 'ก.ย': 8,
  'ตุลาคม': 9, 'ต.ค.': 9, 'ต.ค': 9,
  'พฤศจิกายน': 10, 'พ.ย.': 10, 'พ.ย': 10,
  'ธันวาคม': 11, 'ธ.ค.': 11, 'ธ.ค': 11
}

export const THAI_SHORT_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

export const THAI_SHORT_DAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

export function getThaiWelcomeDate(now = new Date()) {
  const dayName = THAI_DAYS[now.getDay()]
  const dateNum = now.getDate()
  const monthName = THAI_FULL_MONTHS[now.getMonth()]
  const yearBE = now.getFullYear() + 543
  return `ยินดีต้อนรับ • ${dayName}ที่ ${dateNum} ${monthName} ${yearBE}`
}

export function formatLastUpdatedTime(now = new Date()) {
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} น.`
  return `อัปเดตล่าสุด ${timeStr}`
}

export function parseFlexibleDate(raw) {
  if (!raw || typeof raw !== 'string') return null
  let str = raw.trim()
  if (!str) return null

  str = str.replace(/^(เริ่มต้น|ตั้งแต่วันที่|เริ่ม|วันที่)\s*/, '')

  if (str.includes('T')) {
    const parsedIso = new Date(str)
    if (!isNaN(parsedIso.getTime())) {
      return new Date(parsedIso.getFullYear(), parsedIso.getMonth(), parsedIso.getDate())
    }
  }

  const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (isoMatch) {
    let y = parseInt(isoMatch[1], 10)
    if (y > 2400) y -= 543
    const m = parseInt(isoMatch[2], 10) - 1
    const d = parseInt(isoMatch[3], 10)
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return new Date(y, m, d)
    }
  }

  const thaiMatch = str.match(/^(\d{1,2})\s+([^\s\d]+)\s+(\d{2,4})$/)
  if (thaiMatch) {
    const d = parseInt(thaiMatch[1], 10)
    const m = THAI_MONTH_MAP[thaiMatch[2]]
    let y = parseInt(thaiMatch[3], 10)
    if (y > 2400) y -= 543
    else if (y < 100) y = y > 50 ? 2500 + y - 543 : 2000 + y
    if (m !== undefined && !isNaN(d) && !isNaN(y)) {
      return new Date(y, m, d)
    }
  }

  const slashMatch = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/)
  if (slashMatch) {
    const d = parseInt(slashMatch[1], 10)
    const m = parseInt(slashMatch[2], 10) - 1
    let y = parseInt(slashMatch[3], 10)
    if (y > 2400) y -= 543
    else if (y < 100) y = y > 50 ? 2500 + y - 543 : 2000 + y
    if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
      return new Date(y, m, d)
    }
  }

  const parsed = new Date(str)
  if (!isNaN(parsed.getTime())) {
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
  }

  return null
}

export function parseDateValue(rawStr, fallbackIso) {
  return parseFlexibleDate(rawStr) || parseFlexibleDate(fallbackIso)
}

export function toDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function parseScheduleTimeMinutes(raw) {
  if (!raw || typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!trimmed) return null
  if (trimmed.includes('T')) {
    const dt = new Date(trimmed)
    if (!isNaN(dt.getTime())) {
      return dt.getHours() * 60 + dt.getMinutes()
    }
  }
  const clean = trimmed.replace('น.', '').trim()
  const match = clean.match(/^(\d{1,2}):(\d{2})/)
  if (!match) return null
  const h = parseInt(match[1], 10)
  const m = parseInt(match[2], 10)
  if (isNaN(h) || isNaN(m)) return null
  return h * 60 + m
}

export function parseTimeMinutes(timeStr) {
  const parsed = parseScheduleTimeMinutes(timeStr)
  return parsed !== null ? parsed : 0
}
