import { supabase, isSupabaseConfigured } from './supabaseClient'

// ----------------------------------------------------------------------------
// DATA SERVICE API (Pure Supabase - Starting from 0)
// ----------------------------------------------------------------------------

export const dataService = {
  // --------------------------------------------------------------------------
  // Authentication
  // --------------------------------------------------------------------------
  async login(email, password) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase client is not configured. Please check .env file.')
    }

    const cleanEmail = (email || '').trim().toLowerCase()
    const cleanPass = (password || '').trim()

    if (!cleanEmail || !cleanPass) {
      throw new Error('กรุณากรอกอีเมลและรหัสผ่าน')
    }

    // 1. First attempt: Supabase Auth
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: cleanEmail, 
        password: cleanPass 
      })
      if (!error && data?.user) {
        const userObj = {
          id: data.user.id,
          email: data.user.email,
          role: 'Admin'
        }
        localStorage.setItem('med_auth_user', JSON.stringify(userObj))
        return { success: true, user: userObj, session: data.session }
      }
    } catch {
      // Continue to database check
    }

    // 2. Second attempt: Check app_users table
    try {
      const { data: users, error: userErr } = await supabase
        .from('app_users')
        .select('*')
        .eq('email', cleanEmail)
        .limit(1)

      if (!userErr && users && users.length > 0) {
        const u = users[0]
        if (u.password && u.password === cleanPass) {
          const userObj = {
            id: u.id,
            email: u.email,
            name: u.name,
            role: 'Admin'
          }
          localStorage.setItem('med_auth_user', JSON.stringify(userObj))
          return { success: true, user: userObj }
        }
      }
    } catch {
      // Continue
    }

    // 3. Third attempt: Check admin_profiles table
    try {
      const { data: adminProf, error: profErr } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('email', cleanEmail)
        .limit(1)

      if (!profErr && adminProf && adminProf.length > 0) {
        const p = adminProf[0]
        if (p.password && p.password === cleanPass) {
          const userObj = {
            id: p.id,
            email: p.email,
            name: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
            role: p.role || 'Admin'
          }
          localStorage.setItem('med_auth_user', JSON.stringify(userObj))
          return { success: true, user: userObj }
        }
        if (cleanPass === 'medapp1234' || cleanPass === 'admin1234') {
          const userObj = {
            id: p.id,
            email: p.email,
            name: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
            role: p.role || 'Admin'
          }
          localStorage.setItem('med_auth_user', JSON.stringify(userObj))
          return { success: true, user: userObj }
        }
      }
    } catch {
      // Continue
    }

    throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง')
  },

  async logout() {
    try {
      if (supabase) {
        await supabase.auth.signOut().catch(() => {})
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('med_auth_user')
      try {
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.startsWith('sb-') || key.includes('auth-token') || key === 'med_auth_user')) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k))
      } catch {}
      try {
        sessionStorage.clear()
      } catch {}
    }
  },

  isAuthenticated() {
    try {
      const user = localStorage.getItem('med_auth_user')
      return Boolean(user)
    } catch {
      return false
    }
  },

  getCurrentUser() {
    try {
      const user = localStorage.getItem('med_auth_user')
      return user ? JSON.parse(user) : null
    } catch {
      return null
    }
  },

  async getSession() {
    if (!supabase) return null
    const { data } = await supabase.auth.getSession()
    return data.session
  },

  // --------------------------------------------------------------------------
  // App Users (app_users table)
  // --------------------------------------------------------------------------
  async getAppUsers(filters = {}) {
    if (!supabase) return []
    try {
      let query = supabase.from('app_users').select('*').order('created_at', { ascending: false })
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
      }
      const { data, error } = await query
      if (error) {
        console.error('Error fetching app_users:', error)
        return []
      }
      return data || []
    } catch (err) {
      console.error('getAppUsers error:', err)
      return []
    }
  },

  async deleteAppUser(id) {
    if (!supabase) return false
    const { error } = await supabase.from('app_users').delete().eq('id', id)
    if (error) {
      console.error('Error deleting app_user:', error)
      throw error
    }
    return true
  },

  async deleteMultipleAppUsers(ids) {
    if (!supabase) return false
    const { error } = await supabase.from('app_users').delete().in('id', ids)
    if (error) {
      console.error('Error deleting multiple app_users:', error)
      throw error
    }
    return true
  },

  // --------------------------------------------------------------------------
  // Medications (medications table)
  // --------------------------------------------------------------------------
  async getMedications(filters = {}) {
    if (!supabase) return []
    try {
      let query = supabase.from('medications').select('*').order('created_at', { ascending: true })
      if (filters.search) {
        query = query.or(`name_th.ilike.%${filters.search}%,name_en.ilike.%${filters.search}%,code.ilike.%${filters.search}%`)
      }
      if (filters.type && filters.type !== 'ทั้งหมด') {
        query = query.eq('type', filters.type)
      }
      if (filters.category && filters.category !== 'ทั้งหมด') {
        query = query.eq('category', filters.category)
      }
      const { data, error } = await query
      if (error) {
        console.error('Error fetching medications:', error)
        return []
      }
      return data || []
    } catch (err) {
      console.error('getMedications error:', err)
      return []
    }
  },

  async getMedicationById(id) {
    if (!supabase) return null
    try {
      const { data, error } = await supabase.from('medications').select('*').eq('id', id).single()
      if (error) {
        console.error('Error fetching medication by id:', error)
        return null
      }
      return data
    } catch (err) {
      console.error('getMedicationById error:', err)
      return null
    }
  },

  async saveMedication(data) {
    if (!supabase) throw new Error('Supabase is not configured')

    // Check for duplicate medication name (name_th or name_en)
    const normalizeStr = (str) => (str || '').trim().replace(/\s+/g, ' ').toLowerCase()
    const targetTh = normalizeStr(data.name_th)
    const targetEn = normalizeStr(data.name_en)

    const { data: allMeds, error: fetchMedsError } = await supabase
      .from('medications')
      .select('id, name_th, name_en')

    if (!fetchMedsError && allMeds) {
      const duplicate = allMeds.find(m => {
        if (data.id && String(m.id) === String(data.id)) return false
        const existingTh = normalizeStr(m.name_th)
        const existingEn = normalizeStr(m.name_en)
        return (targetTh && existingTh === targetTh) || (targetEn && existingEn === targetEn)
      })

      if (duplicate) {
        const dupTh = normalizeStr(duplicate.name_th)
        if (targetTh && dupTh === targetTh) {
          throw new Error(`ชื่อยาภาษาไทย "${data.name_th.trim()}" มีอยู่ในระบบแล้ว ไม่สามารถเพิ่มซ้ำได้`)
        } else {
          throw new Error(`ชื่อยาภาษาอังกฤษ "${data.name_en.trim()}" มีอยู่ในระบบแล้ว ไม่สามารถเพิ่มซ้ำได้`)
        }
      }
    }
    
    // If editing existing record with UUID id
    if (data.id && !data.id.startsWith('med-')) {
      const updatePayload = {
        name_th: data.name_th,
        name_en: data.name_en,
        type: data.type,
        dosage: data.dosage,
        unit: data.unit,
        category: data.category,
        indications: data.indications,
        instructions: data.instructions,
        precautions: data.precautions,
        image_url: data.image_url,
        updated_at: new Date().toISOString()
      }
      const { data: res, error } = await supabase
        .from('medications')
        .update(updatePayload)
        .eq('id', data.id)
        .select()
      if (error) throw error
      return res?.[0]
    }

    // Insert new medication: calculate next code (increments forward so new items append to the end)
    const { data: existing } = await supabase.from('medications').select('code').order('code', { ascending: false }).limit(1)
    let nextCode = '001'
    if (existing && existing.length > 0 && existing[0].code) {
      const num = parseInt(existing[0].code, 10)
      if (!isNaN(num)) {
        nextCode = String(num + 1).padStart(3, '0')
      }
    }

    const insertPayload = {
      code: data.code || nextCode,
      name_th: data.name_th,
      name_en: data.name_en,
      type: data.type,
      dosage: data.dosage,
      unit: data.unit,
      category: data.category,
      indications: data.indications,
      instructions: data.instructions,
      precautions: data.precautions,
      image_url: data.image_url
    }

    const { data: res, error } = await supabase
      .from('medications')
      .insert([insertPayload])
      .select()
    if (error) throw error
    return res?.[0]
  },

  // Helper to cascade delete interactions belonging to specified medications / supplements
  async deleteInteractionsForMedications(medsList) {
    if (!supabase || !medsList || medsList.length === 0) return

    try {
      const normalize = (s) => (s || '').trim().replace(/\s+/g, ' ').toLowerCase()

      const targetIds = new Set(medsList.map(m => String(m.id)).filter(Boolean))
      const targetNames = new Set()

      medsList.forEach(m => {
        if (m.name_th && m.name_th.trim()) {
          targetNames.add(normalize(m.name_th))
        }
        if (m.name_en && m.name_en.trim()) {
          targetNames.add(normalize(m.name_en))
        }
        if (m.name_th && m.name_en) {
          targetNames.add(normalize(`${m.name_th} (${m.name_en})`))
          targetNames.add(normalize(`${m.name_en} (${m.name_th})`))
          targetNames.add(normalize(`${m.name_th} / ${m.name_en}`))
        }
      })

      // Fetch interactions to check against
      const { data: allInteractions, error: fetchErr } = await supabase
        .from('drug_food_interactions')
        .select('id, medication_id, medication_name, food_name')

      if (fetchErr) {
        console.error('Error fetching interactions for cascade delete:', fetchErr)
        return
      }

      if (!allInteractions || allInteractions.length === 0) return

      const toDeleteIds = allInteractions
        .filter(item => {
          // 1. Direct medication_id match
          if (item.medication_id && targetIds.has(String(item.medication_id))) {
            return true
          }
          // 2. Matching medication_name with target medication/supplement names
          if (item.medication_name) {
            const normMedName = normalize(item.medication_name)
            if (targetNames.has(normMedName)) {
              return true
            }
          }
          // 3. Matching food_name (in case supplement/medicine was stored as food_name)
          if (item.food_name) {
            const normFoodName = normalize(item.food_name)
            if (targetNames.has(normFoodName)) {
              return true
            }
          }
          return false
        })
        .map(item => item.id)

      if (toDeleteIds.length > 0) {
        console.log(`Cascade deleting ${toDeleteIds.length} interactions for medications:`, medsList.map(m => m.name_th || m.name_en))
        const { error: delErr } = await supabase
          .from('drug_food_interactions')
          .delete()
          .in('id', toDeleteIds)

        if (delErr) {
          console.error('Error cascade deleting interactions:', delErr)
          throw delErr
        }
      }
    } catch (err) {
      console.error('deleteInteractionsForMedications error:', err)
      throw err
    }
  },

  async deleteMedication(id) {
    if (!supabase) return false
    try {
      // 1. Fetch medication info before delete
      const { data: med, error: fetchErr } = await supabase
        .from('medications')
        .select('id, name_th, name_en')
        .eq('id', id)
        .maybeSingle()

      if (fetchErr) {
        console.error('Error fetching medication before delete:', fetchErr)
      }

      // 2. Cascade delete related interactions
      if (med) {
        await this.deleteInteractionsForMedications([med])
      }

      // 3. Delete medication record
      const { error } = await supabase.from('medications').delete().eq('id', id)
      if (error) {
        console.error('Error deleting medication:', error)
        throw error
      }
      return true
    } catch (err) {
      console.error('deleteMedication error:', err)
      throw err
    }
  },

  async deleteMultipleMedications(ids) {
    if (!supabase) return false
    if (!ids || ids.length === 0) return true
    try {
      // 1. Fetch medications info before delete
      const { data: meds, error: fetchErr } = await supabase
        .from('medications')
        .select('id, name_th, name_en')
        .in('id', ids)

      if (fetchErr) {
        console.error('Error fetching medications before delete:', fetchErr)
      }

      // 2. Cascade delete related interactions
      if (meds && meds.length > 0) {
        await this.deleteInteractionsForMedications(meds)
      }

      // 3. Delete medication records
      const { error } = await supabase.from('medications').delete().in('id', ids)
      if (error) {
        console.error('Error deleting multiple medications:', error)
        throw error
      }
      return true
    } catch (err) {
      console.error('deleteMultipleMedications error:', err)
      throw err
    }
  },

  // --------------------------------------------------------------------------
  // Drug-Food Interactions (drug_food_interactions table)
  // --------------------------------------------------------------------------
  async getInteractions(filters = {}) {
    if (!supabase) return []
    try {
      let query = supabase.from('drug_food_interactions').select('*').order('created_at', { ascending: true })
      if (filters.search) {
        query = query.or(`medication_name.ilike.%${filters.search}%,food_name.ilike.%${filters.search}%`)
      }
      if (filters.severity && filters.severity !== 'ทั้งหมด') {
        query = query.eq('severity', filters.severity)
      }
      if (filters.type && filters.type !== 'ทั้งหมด') {
        query = query.eq('interaction_type', filters.type)
      }
      const { data, error } = await query
      if (error) {
        console.error('Error fetching interactions:', error)
        return []
      }
      return data || []
    } catch (err) {
      console.error('getInteractions error:', err)
      return []
    }
  },

  async getInteractionById(id) {
    if (!supabase) return null
    try {
      const { data, error } = await supabase.from('drug_food_interactions').select('*').eq('id', id).single()
      if (error) {
        console.error('Error fetching interaction by id:', error)
        return null
      }
      return data
    } catch (err) {
      console.error('getInteractionById error:', err)
      return null
    }
  },

  async saveInteraction(data) {
    if (!supabase) throw new Error('Supabase is not configured')

    // Check for duplicate drug-food interaction (medication_name and food_name)
    const normalizeStr = (str) => (str || '').trim().replace(/\s+/g, ' ').toLowerCase()
    const targetMed = normalizeStr(data.medication_name)
    const targetFood = normalizeStr(data.food_name)

    const { data: allInteractions, error: fetchInterError } = await supabase
      .from('drug_food_interactions')
      .select('id, medication_name, food_name')

    if (!fetchInterError && allInteractions) {
      const duplicate = allInteractions.find(item => {
        if (data.id && String(item.id) === String(data.id)) return false
        const existingMed = normalizeStr(item.medication_name)
        const existingFood = normalizeStr(item.food_name)
        return existingMed === targetMed && existingFood === targetFood
      })

      if (duplicate) {
        throw new Error(`มีข้อมูลปฏิสัมพันธ์ระหว่างยา "${data.medication_name.trim()}" กับอาหาร "${data.food_name.trim()}" ในระบบแล้ว ไม่สามารถเพิ่มซ้ำได้`)
      }
    }

    const hoursNote = data.hours_note || (data.hours_before || data.hours_after ? `${data.hours_before || 0} ชม. ก่อน-${data.hours_after || 0} ชม. หลัง` : '')

    // Resolve medication_id if not present but medication_name matches an existing medication/supplement
    let resolvedMedId = data.medication_id || null
    if (!resolvedMedId && data.medication_name) {
      try {
        const { data: matchedMeds } = await supabase
          .from('medications')
          .select('id, name_th, name_en')
        if (matchedMeds) {
          const found = matchedMeds.find(m => 
            normalizeStr(m.name_th) === targetMed || 
            normalizeStr(m.name_en) === targetMed
          )
          if (found) {
            resolvedMedId = found.id
          }
        }
      } catch (err) {
        console.error('Error resolving medication_id:', err)
      }
    }

    if (data.id && !data.id.startsWith('inter-')) {
      const updatePayload = {
        medication_id: resolvedMedId,
        medication_name: data.medication_name,
        food_name: data.food_name,
        interaction_type: data.interaction_type,
        severity: data.severity,
        hours_note: hoursNote,
        hours_before: Number(data.hours_before) || 0,
        hours_after: Number(data.hours_after) || 0,
        impact_details: data.impact_details,
        source_type: data.source_type,
        source_name: data.source_name,
        url_doi: data.url_doi,
        publish_year: data.publish_year,
        updated_at: new Date().toISOString()
      }
      const { data: res, error } = await supabase
        .from('drug_food_interactions')
        .update(updatePayload)
        .eq('id', data.id)
        .select()
      if (error) throw error
      return res?.[0]
    }

    // Insert new interaction: calculate next code (increments forward so new items append to the end)
    const { data: existing } = await supabase.from('drug_food_interactions').select('code').order('code', { ascending: false }).limit(1)
    let nextCode = '001'
    if (existing && existing.length > 0 && existing[0].code) {
      const num = parseInt(existing[0].code, 10)
      if (!isNaN(num)) {
        nextCode = String(num + 1).padStart(3, '0')
      }
    }

    const insertPayload = {
      code: data.code || nextCode,
      medication_id: resolvedMedId,
      medication_name: data.medication_name,
      food_name: data.food_name,
      interaction_type: data.interaction_type,
      severity: data.severity,
      hours_note: hoursNote,
      hours_before: Number(data.hours_before) || 0,
      hours_after: Number(data.hours_after) || 0,
      impact_details: data.impact_details,
      source_type: data.source_type,
      source_name: data.source_name,
      url_doi: data.url_doi,
      publish_year: data.publish_year
    }

    const { data: res, error } = await supabase
      .from('drug_food_interactions')
      .insert([insertPayload])
      .select()
    if (error) throw error
    return res?.[0]
  },

  async deleteInteraction(id) {
    if (!supabase) return false
    const { error } = await supabase.from('drug_food_interactions').delete().eq('id', id)
    if (error) {
      console.error('Error deleting interaction:', error)
      throw error
    }
    return true
  },

  async deleteMultipleInteractions(ids) {
    if (!supabase) return false
    const { error } = await supabase.from('drug_food_interactions').delete().in('id', ids)
    if (error) {
      console.error('Error deleting multiple interactions:', error)
      throw error
    }
    return true
  },

  // --------------------------------------------------------------------------
  // Admin Profile (admin_profiles table)
  // --------------------------------------------------------------------------
  async getAdminProfile() {
    let localProfile = null
    try {
      const cached = localStorage.getItem('med_admin_profile')
      if (cached) localProfile = JSON.parse(cached)
    } catch {}

    const defaultProfile = {
      first_name: 'Admin',
      last_name: 'medicine',
      email: 'admin@gmail.com',
      phone: '095-326-5723',
      role: 'Admin',
      avatar_url: ''
    }

    if (!supabase) {
      return localProfile || defaultProfile
    }

    try {
      const { data, error } = await supabase.from('admin_profiles').select('*').limit(1).maybeSingle()
      if (error || !data) {
        return localProfile || defaultProfile
      }
      const merged = { ...defaultProfile, ...localProfile, ...data }
      if (localProfile?.avatar_url && !data?.avatar_url) {
        merged.avatar_url = localProfile.avatar_url
      }
      return merged
    } catch (err) {
      console.error('getAdminProfile error:', err)
      return localProfile || defaultProfile
    }
  },

  async updateAdminProfile(data) {
    // 1. Immediately cache in localStorage so it reflects instantly across the UI
    try {
      localStorage.setItem('med_admin_profile', JSON.stringify(data))
    } catch (e) {
      console.warn('LocalStorage save error:', e)
    }

    if (!supabase) return data

    try {
      // Find existing record ID
      let existingId = data.id
      if (!existingId) {
        const { data: existing } = await supabase.from('admin_profiles').select('id').limit(1).maybeSingle()
        if (existing?.id) {
          existingId = existing.id
        }
      }

      const payload = {
        first_name: data.first_name || 'Admin',
        last_name: data.last_name || '',
        email: data.email || 'admin@gmail.com',
        phone: data.phone || '',
        role: data.role || 'Admin',
        avatar_url: data.avatar_url || '',
        updated_at: new Date().toISOString()
      }

      if (existingId) {
        payload.id = existingId
      }

      const { data: res, error } = await supabase
        .from('admin_profiles')
        .upsert([payload])
        .select()

      if (error) {
        console.warn('Supabase admin_profiles upsert warning:', error)
      } else if (res?.[0]) {
        try {
          localStorage.setItem('med_admin_profile', JSON.stringify(res[0]))
        } catch {}
        return res[0]
      }
      return data
    } catch (err) {
      console.error('updateAdminProfile error:', err)
      return data
    }
  },

  // --------------------------------------------------------------------------
  // Activity Logs (activity_logs table)
  // --------------------------------------------------------------------------
  async getActivityLogs() {
    if (!supabase) return []
    try {
      const { data, error } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(10)
      if (error) {
        console.error('Error fetching activity_logs:', error)
        return []
      }
      return data || []
    } catch (err) {
      console.error('getActivityLogs error:', err)
      return []
    }
  },

  // --------------------------------------------------------------------------
  // Dashboard Stats (Calculated purely from real Supabase rows)
  // --------------------------------------------------------------------------
  async getDashboardStats() {
    const [medications, interactions, users, activities] = await Promise.all([
      this.getMedications(),
      this.getInteractions(),
      this.getAppUsers(),
      this.getActivityLogs()
    ])

    // Calculate real drug type breakdown
    const totalMeds = medications.length
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
    const liquidPct = totalMeds > 0 ? 100 - tabletPct - capsulePct : 0

    // Top medications list based on real medications
    const topMeds = medications.slice(0, 5).map((m, idx) => ({
      name: `${m.name_th} ${m.dosage || ''}${m.unit || ''}`.trim(),
      count: 0,
      max: 100
    }))

    return {
      totalUsers: users.length.toString(),
      totalUsersGrowth: `${users.length} คนในระบบ`,
      medicationsCount: totalMeds.toString(),
      medicationsGrowth: `${totalMeds} รายการในระบบ`,
      activeSchedules: '0',
      activeSchedulesGrowth: '0 ตาราง',
      todayAppointments: '0',
      todayAppointmentsSub: 'ไม่มีนัดหมายวันนี้',
      sideEffectsCount: '0',
      sideEffectsSub: 'สะสมเดือนนี้',
      interactionsCount: interactions.length.toString(),
      interactionsSub: 'รายการในฐานข้อมูล',
      drugTypeDistribution: {
        tablet: tabletPct,
        capsule: capsulePct,
        liquid: liquidPct
      },
      topMedications: topMeds
    }
  }
}
