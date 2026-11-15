import {
  THAI_SHORT_MONTHS,
  THAI_SHORT_DAYS,
  parseDateValue,
  toDateKey,
  parseTimeMinutes
} from './dateUtils'
import {
  getCreationDayActiveWindowStart,
  isScheduleTakenOnTime,
  normalizeMedKey,
  normalizeStr,
  toStorageKey
} from './adherenceUtils'

export function buildDefaultSideEffectTrend() {
  return [
    { month: 'สัปดาห์ที่ 1', value: 0 },
    { month: 'สัปดาห์ที่ 2', value: 0 },
    { month: 'สัปดาห์ที่ 3', value: 0 },
    { month: 'สัปดาห์ที่ 4', value: 0 }
  ]
}

export function buildDefaultAdherenceBars(now = new Date()) {
  const list = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    list.push({
      label: `${THAI_SHORT_DAYS[d.getDay()]} ${d.getDate()}`,
      dateLabel: `${d.getDate()} ${THAI_SHORT_MONTHS[d.getMonth()]}`,
      height: 0,
      rate: 0,
      taken: 0,
      total: 0,
      hasData: false,
      active: i === 0
    })
  }
  return list
}

export function formatActivityLogRow(item) {
  const rawAct = (item.activity || '').trim()
  const rawDetails = (item.details || '').trim()

  if (rawAct.startsWith('รับประทานยา') || rawAct === 'ยืนยันกินยา') {
    const medPart = rawAct.includes(':') ? rawAct.split(':').slice(1).join(':').trim() : ''
    return {
      id: item.id,
      time: item.time || '-',
      user_name: item.user_name || 'ผู้ป่วย',
      activity: 'รับประทานยา',
      tone: 'success',
      details: medPart ? `${medPart}${rawDetails ? ` • ${rawDetails}` : ''}` : rawDetails
    }
  }

  if (rawAct.includes('ผลข้างเคียง')) {
    const medPart = rawAct.includes(':') ? rawAct.split(':').slice(1).join(':').trim() : ''
    return {
      id: item.id,
      time: item.time || '-',
      user_name: item.user_name || 'ผู้ป่วย',
      activity: 'ผลข้างเคียง (ADR)',
      tone: 'danger',
      details: medPart ? `${medPart}${rawDetails ? ` • ${rawDetails}` : ''}` : rawDetails
    }
  }

  if (rawAct.includes('ข้าม')) {
    return {
      id: item.id,
      time: item.time || '-',
      user_name: item.user_name || 'ผู้ป่วย',
      activity: 'ข้ามมื้อยา',
      tone: 'warning',
      details: rawDetails || rawAct
    }
  }

  if (rawAct.includes('ลบยา')) {
    return {
      id: item.id,
      time: item.time || '-',
      user_name: item.user_name || 'ผู้ป่วย',
      activity: 'ลบรายการยา',
      tone: 'primary',
      details: rawDetails || rawAct
    }
  }

  if (rawAct.includes('บันทึกยา') || rawAct.includes('ยาของฉัน')) {
    const medPart = rawAct.includes(':') ? rawAct.split(':').slice(1).join(':').trim() : ''
    return {
      id: item.id,
      time: item.time || '-',
      user_name: item.user_name || 'ผู้ป่วย',
      activity: 'เพิ่มรายการยา',
      tone: 'primary',
      details: medPart ? `${medPart}${rawDetails ? ` • ${rawDetails}` : ''}` : rawDetails
    }
  }

  return {
    id: item.id,
    time: item.time || '-',
    user_name: item.user_name || 'ผู้ป่วย',
    activity: rawAct,
    tone: 'primary',
    details: rawDetails
  }
}

export function formatPharmacyActivities({ rawLogs = [], sideEffects = [], users = [] }) {
  const userMap = new Map((users || []).map(u => [String(u.id), u.name]))

  const excludedKeywords = ['เข้าสู่ระบบ', 'สมัครสมาชิก', 'นัดหมาย']
  const pharmacyLogs = (rawLogs || []).filter(item => {
    const act = (item.activity || '').trim()
    return act && !excludedKeywords.some(kw => act.includes(kw))
  })

  const formatted = pharmacyLogs.map(formatActivityLogRow)

  if (formatted.length === 0 && sideEffects.length > 0) {
    return sideEffects.slice(0, 10).map(se => {
      const symptomText = Array.isArray(se.symptoms) && se.symptoms.length > 0
        ? se.symptoms.join(', ')
        : se.details || '-'
      return {
        id: `se-${se.id}`,
        time: se.log_time || '-',
        user_name: (se.user_id && userMap.get(String(se.user_id))) || 'ผู้ป่วยในระบบ',
        activity: 'ผลข้างเคียง (ADR)',
        tone: 'danger',
        details: `${se.medication_name || 'ไม่ระบุยา'} • อาการ: ${symptomText} (ระดับ${se.severity || 'กลาง'})`
      }
    })
  }

  return formatted.slice(0, 10)
}

export function computeDashboardStats({
  medications = [],
  interactions = [],
  users = [],
  sideEffects = [],
  schedules = [],
  activityLogs = [],
  now = new Date()
}) {
  const todayKey = toDateKey(now)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  const totalMeds = medications.length
  const supplementCount = medications.filter(m => (m.category || '').trim() === 'อาหารเสริม').length
  const drugOnlyCount = totalMeds - supplementCount
  const medicationsSub = totalMeds > 0
    ? `ยา ${drugOnlyCount} • อาหารเสริม ${supplementCount} รายการ`
    : 'ยังไม่มีรายการยาในคลัง'

  const totalInteractions = interactions.length
  const avoidCount = interactions.filter(i => (i.interaction_type || '').includes('หลีกเลี่ยง')).length
  const recommendCount = interactions.filter(i => (i.interaction_type || '').includes('แนะนำ')).length
  const cautionCount = Math.max(0, totalInteractions - avoidCount - recommendCount)
  let interactionsSub = 'ยังไม่มีข้อมูลในฐานข้อมูล'
  if (totalInteractions > 0) {
    interactionsSub = cautionCount > 0
      ? `หลีกเลี่ยง ${avoidCount} • ระวัง ${cautionCount} • แนะนำ ${recommendCount}`
      : `หลีกเลี่ยง ${avoidCount} • แนะนำ ${recommendCount} รายการ`
  }

  const highSeverityCount = interactions.filter(i => (i.severity || '').trim() === 'สูง').length
  const highSeverityPct = totalInteractions > 0 ? Math.round((highSeverityCount / totalInteractions) * 100) : 0
  const highSeverityInteractionsSub = highSeverityCount > 0
    ? `เฝ้าระวังพิเศษ (${highSeverityPct}% ของทั้งหมด)`
    : 'ไม่มีรายการความรุนแรงสูง'

  const totalSideEffects = sideEffects.length
  const highSideEffectsCount = sideEffects.filter(s => (s.severity || '').trim() === 'สูง').length
  const thisMonthSideEffectsCount = sideEffects.filter(s => {
    const d = parseDateValue(s.log_date, s.created_at)
    return d && d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }).length
  let sideEffectsSub = 'ยังไม่มีรายงานผลข้างเคียง'
  if (totalSideEffects > 0) {
    sideEffectsSub = highSideEffectsCount > 0
      ? `รุนแรงสูง ${highSideEffectsCount} • เดือนนี้ ${thisMonthSideEffectsCount} รายการ`
      : `สะสมเดือนนี้ ${thisMonthSideEffectsCount} รายการ`
  }

  const validUserIdSet = new Set(users.map(u => String(u.id)))
  const userSyncByUserId = new Map()
  const syncLogs = (activityLogs || []).filter(l => l.activity === 'เข้าสู่ระบบ:MED_SYNC' && l.details)

  users.forEach(u => {
    const uid = String(u.id)
    const uKey = toStorageKey(u.email)
    let bestPayload = null
    for (const row of syncLogs) {
      if (row.user_name !== uKey && row.user_name !== uid) continue
      try {
        const parsed = JSON.parse(row.details)
        if (parsed && Array.isArray(parsed.medications)) {
          if (!bestPayload || (Number(parsed.updatedAt) || 0) > (Number(bestPayload.updatedAt) || 0)) {
            bestPayload = parsed
          }
        }
      } catch {
        // Ignore malformed sync payload
      }
    }
    if (bestPayload) {
      userSyncByUserId.set(uid, bestPayload)
    }
  })

  const validSchedules = schedules.filter(s => {
    if (users.length > 0) {
      if (!s.user_id || !validUserIdSet.has(String(s.user_id))) return false
    }
    if (s.is_taken || s.is_skipped) return true

    const schedDate = parseDateValue(s.date, s.created_at)
    const schedKey = schedDate ? toDateKey(schedDate) : null
    const schedMinutes = parseTimeMinutes(s.time)

    const isBeforeCreationWindow = (createdValue) => {
      if (!createdValue || !schedKey) return false
      const createdDt = new Date(createdValue)
      if (isNaN(createdDt.getTime())) return false
      const createdKey = toDateKey(createdDt)
      if (schedKey < createdKey) return true
      if (schedKey === createdKey) {
        const createdMinutes = createdDt.getHours() * 60 + createdDt.getMinutes()
        return schedMinutes < getCreationDayActiveWindowStart(createdMinutes)
      }
      return false
    }

    if (isBeforeCreationWindow(s.created_at)) return false

    const syncPayload = s.user_id ? userSyncByUserId.get(String(s.user_id)) : null
    if (syncPayload && schedKey) {
      const normName = normalizeMedKey(s.medication_name)
      const delMap = syncPayload.deletedAtMap || {}
      const deletedNames = Array.isArray(syncPayload.deletedNames) ? syncPayload.deletedNames : []
      if (normName && (delMap[normName] || deletedNames.some(n => normalizeMedKey(n) === normName))) {
        return false
      }

      const matchedMed = (syncPayload.medications || []).find(
        m => (s.medication_id && m.id === s.medication_id) || normalizeMedKey(m.name) === normName
      )
      if (matchedMed) {
        if (matchedMed.status && matchedMed.status !== 'active') return false
        if (isBeforeCreationWindow(matchedMed.createdAt)) return false
      }

      const dayOverride = syncPayload.scheduleOverrides && syncPayload.scheduleOverrides[schedKey]
      if (Array.isArray(dayOverride)) {
        const inOverride = dayOverride.some(item => {
          const itemNameNorm = normalizeMedKey(item.medicationName)
          const itemMinutes = parseTimeMinutes(item.originalTime || item.time)
          const postponedMinutes = item.postponedTime ? parseTimeMinutes(item.postponedTime) : null
          return (
            itemNameNorm === normName &&
            (itemMinutes === schedMinutes || postponedMinutes === schedMinutes)
          )
        })
        if (!inOverride) return false
      }
    }

    return true
  })

  const dueSchedules = validSchedules.filter(s => {
    if (s.is_taken || s.is_skipped) return true
    const d = parseDateValue(s.date, s.created_at)
    if (!d) return true
    const key = toDateKey(d)
    if (key < todayKey) return true
    if (key === todayKey) return parseTimeMinutes(s.time) <= nowMinutes
    return false
  })
  const onTimeCount = dueSchedules.filter(s => isScheduleTakenOnTime(s)).length
  const takenCount = dueSchedules.filter(s => Boolean(s.is_taken)).length
  const skippedCount = dueSchedules.filter(s => Boolean(s.is_skipped) && !s.is_taken).length
  const adherencePct = dueSchedules.length > 0 ? Math.round((onTimeCount / dueSchedules.length) * 100) : 0
  let adherenceSub = 'ยังไม่มีประวัติการกินยา'
  if (dueSchedules.length > 0) {
    if (skippedCount > 0) {
      adherenceSub = `ตรงเวลา ${onTimeCount}/${dueSchedules.length} มื้อ • ข้าม ${skippedCount}`
    } else if (takenCount !== onTimeCount) {
      adherenceSub = `ตรงเวลา ${onTimeCount} จาก ${dueSchedules.length} มื้อ (กินแล้ว ${takenCount})`
    } else {
      adherenceSub = `ตรงเวลา ${onTimeCount} จาก ${dueSchedules.length} มื้อ`
    }
  } else if (validSchedules.length > 0) {
    adherenceSub = `รอถึงเวลากินยา (${validSchedules.length} มื้อ)`
  }

  const totalPatients = users.length
  const totalPatientsSub = totalPatients > 0
    ? `${totalPatients} คนในระบบ`
    : 'ยังไม่มีผู้ป่วยในระบบ'

  let tabletCount = 0
  let capsuleCount = 0
  let liquidCount = 0

  medications.forEach(m => {
    const t = m.type || ''
    if (t.includes('เม็ด')) tabletCount++
    else if (t.includes('แคปซูล')) capsuleCount++
    else liquidCount++
  })

  const tabletPct = totalMeds > 0 ? Math.round((tabletCount / totalMeds) * 100) : 0
  const capsulePct = totalMeds > 0 ? Math.round((capsuleCount / totalMeds) * 100) : 0
  const liquidPct = totalMeds > 0 ? Math.max(0, 100 - tabletPct - capsulePct) : 0

  const curYear = now.getFullYear()
  const curMonth = now.getMonth()
  const lastDayOfMonth = new Date(curYear, curMonth + 1, 0).getDate()
  const monthShortName = THAI_SHORT_MONTHS[curMonth]
  const weekRanges = [
    { label: 'สัปดาห์ที่ 1', startDay: 1, endDay: 7 },
    { label: 'สัปดาห์ที่ 2', startDay: 8, endDay: 15 },
    { label: 'สัปดาห์ที่ 3', startDay: 16, endDay: 23 },
    { label: 'สัปดาห์ที่ 4', startDay: 24, endDay: lastDayOfMonth }
  ]

  const sideEffectTrend = weekRanges.map(w => {
    const startDate = new Date(curYear, curMonth, w.startDay)
    const endDate = new Date(curYear, curMonth, w.endDay)
    const startKey = toDateKey(startDate)
    const endKey = toDateKey(endDate)

    const weekCount = sideEffects.filter(s => {
      const d = parseDateValue(s.log_date, s.created_at)
      if (!d) return false
      const key = toDateKey(d)
      return key >= startKey && key <= endKey
    }).length

    const rangeLabel = `${w.startDay} ${monthShortName} - ${w.endDay} ${monthShortName}`
    return {
      month: w.label,
      rangeLabel,
      value: weekCount
    }
  })

  const adherenceBars = []
  for (let i = 6; i >= 0; i--) {
    const dayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    const dayKey = toDateKey(dayDate)
    const dayRows = validSchedules.filter(s => {
      const d = parseDateValue(s.date, s.created_at)
      return d && toDateKey(d) === dayKey
    })
    const dayDueRows = i === 0
      ? dayRows.filter(s => s.is_taken || s.is_skipped || parseTimeMinutes(s.time) <= nowMinutes)
      : dayRows
    const dayTaken = dayDueRows.filter(s => Boolean(s.is_taken)).length
    const dayTotal = dayDueRows.length
    const dayRate = dayTotal > 0 ? Math.round((dayTaken / dayTotal) * 100) : 0

    adherenceBars.push({
      label: `${THAI_SHORT_DAYS[dayDate.getDay()]} ${dayDate.getDate()}`,
      dateLabel: `${dayDate.getDate()} ${THAI_SHORT_MONTHS[dayDate.getMonth()]}`,
      height: dayRate,
      rate: dayRate,
      taken: dayTaken,
      total: dayTotal,
      hasData: dayTotal > 0,
      active: i === 0
    })
  }

  const usageByMedKey = new Map()

  medications.forEach(m => {
    usageByMedKey.set(String(m.id), {
      id: String(m.id),
      name: `${m.name_th} ${m.dosage || ''}${m.unit || ''}`.trim(),
      nameThNorm: normalizeStr(m.name_th),
      nameEnNorm: normalizeStr(m.name_en),
      count: 0
    })
  })

  validSchedules.forEach(s => {
    if (s.is_skipped) return
    let matchedEntry = null
    if (s.medication_id && usageByMedKey.has(String(s.medication_id))) {
      matchedEntry = usageByMedKey.get(String(s.medication_id))
    } else if (s.medication_name) {
      const normSched = normalizeStr(s.medication_name)
      for (const entry of usageByMedKey.values()) {
        if (
          (entry.nameThNorm && (normSched === entry.nameThNorm || normSched.includes(entry.nameThNorm))) ||
          (entry.nameEnNorm && (normSched === entry.nameEnNorm || normSched.includes(entry.nameEnNorm)))
        ) {
          matchedEntry = entry
          break
        }
      }
      if (!matchedEntry && normSched) {
        const customKey = `custom:${normSched}`
        if (!usageByMedKey.has(customKey)) {
          usageByMedKey.set(customKey, {
            id: customKey,
            name: `${s.medication_name} ${s.dosage || ''}${s.unit || ''}`.trim(),
            nameThNorm: normSched,
            nameEnNorm: '',
            count: 0
          })
        }
        matchedEntry = usageByMedKey.get(customKey)
      }
    }
    if (matchedEntry) {
      matchedEntry.count += 1
    }
  })

  const allMedUsage = Array.from(usageByMedKey.values())
  const hasAnyUsage = allMedUsage.some(item => item.count > 0)
  const sortedMedUsage = hasAnyUsage
    ? [...allMedUsage].sort((a, b) => b.count - a.count)
    : allMedUsage

  const maxUsage = Math.max(...sortedMedUsage.slice(0, 5).map(i => i.count), 1)
  const topMeds = sortedMedUsage.slice(0, 5).map(item => ({
    name: item.name,
    count: item.count,
    countLabel: `${item.count} ครั้ง`,
    max: maxUsage
  }))

  return {
    medicationsCount: totalMeds.toString(),
    medicationsSub,
    interactionsCount: totalInteractions.toString(),
    interactionsSub,
    highSeverityInteractionsCount: highSeverityCount.toString(),
    highSeverityInteractionsSub,
    sideEffectsCount: totalSideEffects.toString(),
    sideEffectsSub,
    adherenceRate: `${adherencePct}%`,
    adherenceSub,
    totalPatients: totalPatients.toString(),
    totalPatientsSub,
    sideEffectTrend,
    adherenceBars,
    drugTypeDistribution: {
      tablet: tabletPct,
      capsule: capsulePct,
      liquid: liquidPct
    },
    topMedications: topMeds
  }
}

export function computeSideEffectTrendChart(sideEffectTrend) {
  const sideEffectTrendData = sideEffectTrend || buildDefaultSideEffectTrend()
  const maxTrendValue = Math.max(...sideEffectTrendData.map(d => d.value), 1)
  const stepX = sideEffectTrendData.length > 1 ? 550 / (sideEffectTrendData.length - 1) : 0
  const trendPoints = sideEffectTrendData.map((d, i) => ({
    x: Math.round(50 + i * stepX),
    y: d.value > 0 ? Math.round(160 - (d.value / maxTrendValue) * 120) : 160,
    month: d.month,
    rangeLabel: d.rangeLabel,
    value: d.value
  }))
  const polylinePoints = trendPoints.map(pt => `${pt.x},${pt.y}`).join(' ')
  const polygonPoints = `50,160 ${polylinePoints} 600,160`

  return {
    sideEffectTrendData,
    maxTrendValue,
    trendPoints,
    polylinePoints,
    polygonPoints
  }
}

export function computeDonutArcs(distribution) {
  const circumference = 351.86
  const tabletPct = distribution?.tablet || 0
  const capsulePct = distribution?.capsule || 0
  const liquidPct = distribution?.liquid || 0
  const tabletArc = (tabletPct / 100) * circumference
  const capsuleArc = (capsulePct / 100) * circumference
  const liquidArc = (liquidPct / 100) * circumference

  return {
    circumference,
    tabletPct,
    capsulePct,
    liquidPct,
    tabletArc,
    capsuleArc,
    liquidArc
  }
}

export function getActivityBadgeStyle(tone) {
  if (tone === 'success') {
    return {
      backgroundColor: 'var(--color-success-50)',
      color: 'var(--color-success-700)',
      border: '1px solid var(--color-success-100)'
    }
  }
  if (tone === 'danger') {
    return {
      backgroundColor: 'var(--color-danger-50)',
      color: 'var(--color-danger-700)',
      border: '1px solid var(--color-danger-100)'
    }
  }
  if (tone === 'warning') {
    return {
      backgroundColor: 'var(--color-warning-50)',
      color: 'var(--color-warning-700)',
      border: '1px solid var(--color-warning-100)'
    }
  }
  return {
    backgroundColor: 'var(--color-primary-50)',
    color: 'var(--color-primary-700)',
    border: '1px solid var(--color-primary-200)'
  }
}
