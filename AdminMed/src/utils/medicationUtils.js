import { normalizeStr } from './adherenceUtils'

export function sortByCreatedAtAsc(list = []) {
  return [...list].sort((a, b) => {
    const timeA = new Date(a.created_at || 0).getTime()
    const timeB = new Date(b.created_at || 0).getTime()
    if (timeA !== timeB) return timeA - timeB
    return String(a.id || '').localeCompare(String(b.id || ''))
  })
}

export function filterMedications(medications = [], { search = '', typeFilter = 'ทั้งหมด', categoryFilter = 'ทั้งหมด' } = {}) {
  let res = [...medications]
  if (search.trim()) {
    const q = search.toLowerCase()
    res = res.filter(m =>
      (m.name_th && m.name_th.toLowerCase().includes(q)) ||
      (m.name_en && m.name_en.toLowerCase().includes(q)) ||
      (m.code && m.code.toLowerCase().includes(q))
    )
  }
  if (typeFilter !== 'ทั้งหมด') {
    res = res.filter(m => m.type === typeFilter || (typeFilter === 'เม็ด' && m.type === 'ยาเม็ด') || (typeFilter === 'ยาเม็ด' && m.type === 'เม็ด'))
  }
  if (categoryFilter !== 'ทั้งหมด') {
    res = res.filter(m => m.category === categoryFilter)
  }
  return res
}

export function filterInteractions(
  interactions = [],
  { pill = 'all', search = '', severityFilter = 'ทั้งหมด', typeFilter = 'ทั้งหมด' } = {}
) {
  let res = [...interactions]

  if (search.trim()) {
    const q = search.toLowerCase()
    res = res.filter(i =>
      (i.medication_name && i.medication_name.toLowerCase().includes(q)) ||
      (i.food_name && i.food_name.toLowerCase().includes(q)) ||
      (i.code && i.code.toLowerCase().includes(q))
    )
  }

  if (severityFilter !== 'ทั้งหมด') {
    res = res.filter(i => i.severity === severityFilter)
  }

  if (typeFilter !== 'ทั้งหมด') {
    if (typeFilter === 'แนะนำ') {
      res = res.filter(i => i.interaction_type === 'แนะนำ' || i.interaction_type === 'แนะนำให้รับประทานร่วม')
    } else {
      res = res.filter(i => i.interaction_type === typeFilter)
    }
  }

  if (pill === 'high') {
    res = res.filter(i => i.severity === 'สูง')
  } else if (pill === 'medium') {
    res = res.filter(i => i.severity === 'กลาง')
  } else if (pill === 'recommend') {
    res = res.filter(i => i.interaction_type === 'แนะนำ' || i.interaction_type === 'แนะนำให้รับประทานร่วม')
  }

  return res
}

export function orderAndDeduplicateFoodSuggestions(foodSuggestions = []) {
  const avoidSuggestions = foodSuggestions.filter(item => item.interaction_type === 'หลีกเลี่ยง')
  const recommendSuggestions = foodSuggestions.filter(item => item.interaction_type === 'แนะนำให้รับประทานร่วม' || item.interaction_type === 'แนะนำ')
  const otherSuggestions = foodSuggestions.filter(item =>
    item.interaction_type !== 'หลีกเลี่ยง' &&
    item.interaction_type !== 'แนะนำให้รับประทานร่วม' &&
    item.interaction_type !== 'แนะนำ'
  )

  const deduplicatedSuggestions = []
  const seenFoodItems = new Set()
  for (const item of [...avoidSuggestions, ...recommendSuggestions, ...otherSuggestions]) {
    const key = `${item.interaction_type}:${(item.food_name || '').trim().toLowerCase()}`
    if (!seenFoodItems.has(key)) {
      seenFoodItems.add(key)
      deduplicatedSuggestions.push(item)
    }
  }
  return deduplicatedSuggestions
}

export function findCascadeInteractionIds(allInteractions = [], medsList = []) {
  const targetIds = new Set(medsList.map(m => String(m.id)).filter(Boolean))
  const targetNames = new Set()

  medsList.forEach(m => {
    if (m.name_th && m.name_th.trim()) {
      targetNames.add(normalizeStr(m.name_th))
    }
    if (m.name_en && m.name_en.trim()) {
      targetNames.add(normalizeStr(m.name_en))
    }
    if (m.name_th && m.name_en) {
      targetNames.add(normalizeStr(`${m.name_th} (${m.name_en})`))
      targetNames.add(normalizeStr(`${m.name_en} (${m.name_th})`))
      targetNames.add(normalizeStr(`${m.name_th} / ${m.name_en}`))
    }
  })

  return allInteractions
    .filter(item => {
      if (item.medication_id && targetIds.has(String(item.medication_id))) {
        return true
      }
      if (item.medication_name) {
        const normMedName = normalizeStr(item.medication_name)
        if (targetNames.has(normMedName)) {
          return true
        }
      }
      if (item.food_name) {
        const normFoodName = normalizeStr(item.food_name)
        if (targetNames.has(normFoodName)) {
          return true
        }
      }
      return false
    })
    .map(item => item.id)
}
