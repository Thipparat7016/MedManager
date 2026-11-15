export function cleanText(txt = '') {
  return String(txt)
    .toLowerCase()
    .replace(/[\(\)\-\_\/\+\,\.\']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function getBaseFoodKey(foodName) {
  if (!foodName) return ''
  let base = foodName.replace(/\(.*?\)/g, '').trim()
  base = base.replace(/^(เครื่องดื่ม|อาหาร|ผลิตภัณฑ์|กลุ่ม)/, '').trim()
  return base.toLowerCase().replace(/\s+/g, '')
}

export function matchFoodInteractionsForMedication(medName = '', presets = []) {
  if (!medName) return []
  const cleanQ = cleanText(medName)

  const matched = []
  const seenFoodKeys = new Set()

  for (const item of presets) {
    const isHit = item.medication_keys.some(key => {
      const cleanKey = cleanText(key)
      if (!cleanKey) return false
      if (cleanQ.includes(cleanKey)) return true
      if (cleanQ.length >= 3 && cleanKey.includes(cleanQ)) return true
      return false
    })

    if (isHit) {
      const typeKey = (item.interaction_type || '').includes('แนะนำ') ? 'recommend' : 'avoid'
      const baseFood = getBaseFoodKey(item.food_name)
      const dedupeKey = `${typeKey}:${baseFood}`

      if (!seenFoodKeys.has(dedupeKey)) {
        seenFoodKeys.add(dedupeKey)
        matched.push(item)
      }
    }
  }

  return matched
}

export function filterInteractionPresets(query = '', presets = []) {
  if (!query) return presets
  const cleanQ = cleanText(query)

  return presets.filter(item => {
    const medLabel = cleanText(item.medication_label)
    const foodName = cleanText(item.food_name)
    const impact = cleanText(item.impact_details)
    const keys = item.medication_keys.map(cleanText).join(' ')

    return (
      medLabel.includes(cleanQ) ||
      foodName.includes(cleanQ) ||
      impact.includes(cleanQ) ||
      keys.includes(cleanQ)
    )
  })
}

export function matchSupplementPreset(query, presetMap) {
  if (!query) return null
  const q = String(query).trim().toLowerCase()
  if (presetMap[q]) return presetMap[q]

  const cleanQ = cleanText(q)

  for (const [key, val] of Object.entries(presetMap)) {
    const cleanKey = cleanText(key)
    const cleanEn = cleanText(val.en)
    const cleanTh = cleanText(val.th)
    const cleanSearch = cleanText(val.searchQuery)

    if (
      q === key ||
      cleanQ === cleanKey ||
      cleanQ === cleanEn ||
      cleanQ === cleanTh ||
      cleanQ === cleanSearch ||
      cleanQ.includes(cleanKey) ||
      cleanKey.includes(cleanQ) ||
      cleanQ.includes(cleanEn) ||
      cleanEn.includes(cleanQ) ||
      cleanTh.includes(cleanQ) ||
      cleanQ.includes(cleanTh) ||
      cleanSearch.includes(cleanQ)
    ) {
      return val
    }
  }
  return null
}

export function buildSupplementSuggestions(query = '', presetMap = {}) {
  const q = String(query).trim().toLowerCase()
  const cleanQ = cleanText(q)

  const allEntries = Object.entries(presetMap).map(([key, val]) => ({
    key,
    en: val.en,
    th: val.th,
    dosage: val.dosage,
    unit: val.unit,
    type: val.type,
    category: 'อาหารเสริม',
  }))

  if (!q) {
    return allEntries
  }

  return allEntries.filter(item => {
    const itemEn = cleanText(item.en)
    const itemTh = cleanText(item.th)
    const itemKey = cleanText(item.key)

    return (
      itemEn.includes(cleanQ) ||
      itemTh.includes(cleanQ) ||
      itemKey.includes(cleanQ) ||
      cleanQ.includes(itemKey)
    )
  })
}

export function buildCombinedDrugSuggestions(
  query = '',
  categoryFilter = '',
  commonDrugMap = {},
  supplementMap = {}
) {
  const q = query.trim().toLowerCase()

  const drugEntries = Object.entries(commonDrugMap).map(([key, val]) => ({
    key,
    en: val.en,
    th: val.th,
    dosage: val.dosage,
    unit: val.unit,
    type: val.type,
    category: 'ยา',
    image_url: ''
  }))

  const supplementEntries = Object.entries(supplementMap).map(([key, val]) => ({
    key,
    en: val.en,
    th: val.th,
    dosage: val.dosage,
    unit: val.unit,
    type: val.type,
    category: 'อาหารเสริม',
    image_url: ''
  }))

  let combined = []
  if (categoryFilter === 'อาหารเสริม') {
    combined = [...supplementEntries, ...drugEntries]
  } else if (categoryFilter === 'ยา') {
    combined = [...drugEntries, ...supplementEntries]
  } else {
    combined = [...drugEntries, ...supplementEntries]
  }

  if (!q) {
    if (categoryFilter === 'อาหารเสริม') return supplementEntries
    if (categoryFilter === 'ยา') return drugEntries
    return combined
  }

  const matches = combined.filter(item =>
    item.en.toLowerCase().includes(q) ||
    item.th.toLowerCase().includes(q) ||
    item.key.toLowerCase().includes(q)
  )

  if (categoryFilter) {
    matches.sort((a, b) => {
      if (a.category === categoryFilter && b.category !== categoryFilter) return -1
      if (b.category === categoryFilter && a.category !== categoryFilter) return 1
      return 0
    })
  }

  return matches
}

export function matchCommonDrugPreset(query, commonDrugMap) {
  if (!query) return null
  const q = query.trim().toLowerCase()
  if (commonDrugMap[q]) return commonDrugMap[q]

  const cleanQ = q.replace(/[\(\)\-\_\/]/g, ' ').replace(/\s+/g, ' ').trim()

  for (const [key, val] of Object.entries(commonDrugMap)) {
    const cleanKey = key.replace(/_/g, ' ')
    const cleanEn = (val.en || '').toLowerCase().replace(/[\(\)\-\_\/]/g, ' ').replace(/\s+/g, ' ').trim()
    const cleanTh = (val.th || '').toLowerCase().replace(/[\(\)\-\_\/]/g, ' ').replace(/\s+/g, ' ').trim()

    if (
      q === key ||
      cleanQ === cleanKey ||
      cleanQ === cleanEn ||
      cleanQ === cleanTh ||
      cleanQ.includes(cleanKey) ||
      cleanKey.includes(cleanQ) ||
      cleanQ.includes(cleanEn) ||
      cleanEn.includes(cleanQ) ||
      cleanTh.includes(cleanQ) ||
      cleanQ.includes(cleanTh)
    ) {
      return val
    }
  }
  return null
}

export function translateOrSummarizeToThai(type, openFdaRawText, drugName = '') {
  if (!openFdaRawText) {
    if (type === 'indications') return 'ใช้รักษาและบรรเทาอาการตามข้อบ่งใช้ทางการแพทย์ที่แพทย์หรือเภสัชกรกำหนด'
    if (type === 'instructions') return 'รับประทานตามคำแนะนำของแพทย์ เภสัชกร หรือเอกสารกำกับยาอย่างเคร่งครัด'
    return 'ห้ามใช้ในผู้ที่มีประวัติแพ้ยานี้ สตรีมีครรภ์หรือให้นมบุตรควรปรึกษาแพทย์ก่อนใช้'
  }

  const text = (Array.isArray(openFdaRawText) ? openFdaRawText.join(' ') : String(openFdaRawText)).toLowerCase()

  if (type === 'indications') {
    if (text.includes('pain') || text.includes('fever') || text.includes('headache')) {
      return 'บรรเทาอาการปวดเล็กน้อยถึงปานกลาง เช่น ปวดศีรษะ ปวดกล้ามเนื้อ และช่วยลดไข้'
    }
    if (text.includes('blood pressure') || text.includes('hypertension')) {
      return 'รักษาและควบคุมระดับความดันโลหิตสูง ลดความเสี่ยงโรคหลอดเลือดหัวใจ'
    }
    if (text.includes('diabetes') || text.includes('glucose') || text.includes('glycemic')) {
      return 'ควบคุมระดับน้ำตาลในเลือดสำหรับผู้ป่วยโรคเบาหวานชนิดที่ 2'
    }
    if (text.includes('cholesterol') || text.includes('lipid') || text.includes('triglyceride')) {
      return 'ลดระดับคอเลสเตอรอลและไขมันในเลือด ป้องกันโรคหลอดเลือดหัวใจตีบ'
    }
    if (text.includes('allergy') || text.includes('allergic') || text.includes('rhinitis') || text.includes('histamine')) {
      return 'บรรเทาอาการแพ้อากาศ ลมพิษ ผื่นคัน น้ำมูกไหล จาม คันตา'
    }
    if (text.includes('infection') || text.includes('bacteria') || text.includes('antibacterial')) {
      return 'ยาปฏิชีวนะรักษาการติดเชื้อแบคทีเรียตามแพทย์สั่งอย่างเคร่งครัด'
    }
    if (text.includes('acid') || text.includes('reflux') || text.includes('gerd') || text.includes('ulcer') || text.includes('heartburn')) {
      return 'รักษาโรคกรดไหลย้อน แผลในกระเพาะอาหาร และลดการหลั่งกรดในทางเดินอาหาร'
    }
    if (text.includes('cough') || text.includes('expectorant') || text.includes('mucus')) {
      return 'บรรเทาอาการไอ ขับเสมหะ และลดการระคายเคืองในทางเดินหายใจ'
    }
    return `รักษาและบรรเทาอาการตามข้อบ่งใช้ทางการแพทย์ของยา ${drugName}`
  }

  if (type === 'instructions') {
    if (text.includes('before meals') || text.includes('empty stomach')) {
      return 'รับประทานก่อนอาหารอย่างน้อย 30-60 นาที พร้อมดื่มน้ำสะอาด'
    }
    if (text.includes('with food') || text.includes('after meal')) {
      return 'รับประทานพร้อมอาหารหรือหลังอาหารทันที พร้อมดื่มน้ำตามมากๆ'
    }
    if (text.includes('once daily') || text.includes('once a day')) {
      return 'รับประทานวันละ 1 ครั้ง ในเวลาเดียวกันของทุกวัน'
    }
    if (text.includes('every 4 to 6') || text.includes('every 4-6')) {
      return 'รับประทานครั้งละ 1-2 เม็ด ทุก 4-6 ชั่วโมง เมื่อมีอาการ'
    }
    if (text.includes('bedtime')) {
      return 'รับประทานวันละ 1 ครั้ง ก่อนนอน'
    }
    return 'รับประทานตามคำแนะนำของแพทย์หรือเอกสารกำกับยาอย่างเคร่งครัด'
  }

  if (type === 'precautions') {
    const points = ['ห้ามใช้ในผู้ที่มีประวัติแพ้ยานี้']
    if (text.includes('liver') || text.includes('hepatic')) {
      points.push('ระวังการใช้ในผู้ป่วยโรคตับ และหลีกเลี่ยงเครื่องดื่มแอลกอฮอล์')
    }
    if (text.includes('kidney') || text.includes('renal')) {
      points.push('ระวังการใช้ในผู้ป่วยโรคไต')
    }
    if (text.includes('drowsiness') || text.includes('drowsy') || text.includes('sleepy')) {
      points.push('ยานี้อาจทำให้ง่วงซึม หลีกเลี่ยงการขับขี่ยานพาหนะ')
    }
    if (text.includes('pregnancy') || text.includes('pregnant')) {
      points.push('สตรีมีครรภ์หรือให้นมบุตรควรปรึกษาแพทย์ก่อนใช้ยา')
    }
    if (text.includes('bleeding') || text.includes('stomach')) {
      points.push('ระวังภาวะระคายเคืองกระเพาะอาหารและเลือดออกผิดปกติ')
    }
    return points.join(', ')
  }

  return ''
}

export function determineAllowedDrugType(record, drugName) {
  const combinedText = [
    ...(record.dosage_forms_and_strengths || []),
    ...(record.openfda?.dosage_form || []),
    ...(record.openfda?.route || []),
    ...(record.how_supplied || []),
    ...(record.description || []),
    ...(record.dosage_and_administration || [])
  ].join(' ').toLowerCase()

  const routes = (record.openfda?.route || []).map(r => String(r).toUpperCase())
  const isStrictlyNonOralRoute = routes.length > 0 && !routes.includes('ORAL')

  const isCapsule = combinedText.includes('capsule') || combinedText.includes('softgel')
  const isLiquid = combinedText.includes('suspension') || combinedText.includes('oral solution') || combinedText.includes('syrup') || combinedText.includes('elixir') || combinedText.includes('liquid') || (combinedText.includes('solution') && !combinedText.includes('injection'))
  const isTablet = combinedText.includes('tablet') || combinedText.includes('caplet') || combinedText.includes('pill') || combinedText.includes('chewable')

  if (isCapsule && !isStrictlyNonOralRoute) {
    return { type: 'แคปซูล', unit: 'mg', dosage: '250' }
  }
  if (isLiquid && !isStrictlyNonOralRoute) {
    return { type: 'ยาน้ำ', unit: 'ml', dosage: '10' }
  }
  if (isTablet && !isStrictlyNonOralRoute) {
    return { type: 'เม็ด', unit: 'mg', dosage: '500' }
  }

  if (routes.includes('ORAL') && !isStrictlyNonOralRoute) {
    return { type: 'เม็ด', unit: 'mg', dosage: '500' }
  }

  let detectedType = ''
  if (combinedText.includes('injection') || combinedText.includes('injectable') || routes.includes('INTRAVENOUS') || routes.includes('SUBCUTANEOUS') || routes.includes('INTRAMUSCULAR')) {
    detectedType = 'ยาฉีด (Injection)'
  } else if (combinedText.includes('cream') || combinedText.includes('ointment') || combinedText.includes('gel') || combinedText.includes('lotion') || routes.includes('TOPICAL')) {
    detectedType = 'ยาทา/ครีม (Topical / Cream)'
  } else if (combinedText.includes('inhaler') || combinedText.includes('inhalation') || combinedText.includes('spray') || routes.includes('RESPIRATORY')) {
    detectedType = 'ยาพ่น/สูดดม (Inhaler / Spray)'
  } else if (combinedText.includes('ophthalmic') || combinedText.includes('eye drop') || routes.includes('OPHTHALMIC')) {
    detectedType = 'ยาหยอดตา (Eye Drops)'
  } else if (combinedText.includes('transdermal') || combinedText.includes('patch')) {
    detectedType = 'แผ่นแปะผิวหนัง (Transdermal Patch)'
  } else if (combinedText.includes('suppository') || routes.includes('RECTAL')) {
    detectedType = 'ยาเหน็บ (Suppository)'
  } else if (combinedText.includes('powder') && !combinedText.includes('suspension')) {
    detectedType = 'ยาผง (Powder)'
  }

  if (detectedType || isStrictlyNonOralRoute) {
    throw new Error(`ระบบรองรับเฉพาะ "ยาเม็ด", "แคปซูล" และ "ยาน้ำ" เท่านั้น ยา "${drugName}" ตรวจพบเป็น ${detectedType || 'ยาประเภทอื่น'} จึงไม่สามารถนำเข้าข้อมูลได้`)
  }

  return { type: 'เม็ด', unit: 'mg', dosage: '100' }
}
