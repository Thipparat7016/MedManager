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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      throw error
    }
    if (data?.user) {
      localStorage.setItem('med_auth_user', JSON.stringify({
        id: data.user.id,
        email: data.user.email,
        role: 'Admin'
      }))
    }
    return { success: true, user: data.user, session: data.session }
  },

  async logout() {
    if (supabase) {
      await supabase.auth.signOut().catch(() => {})
    }
    localStorage.removeItem('med_auth_user')
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
      let query = supabase.from('medications').select('*').order('created_at', { ascending: false })
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

    // Insert new medication: calculate next code
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

  async deleteMedication(id) {
    if (!supabase) return false
    const { error } = await supabase.from('medications').delete().eq('id', id)
    if (error) {
      console.error('Error deleting medication:', error)
      throw error
    }
    return true
  },

  async deleteMultipleMedications(ids) {
    if (!supabase) return false
    const { error } = await supabase.from('medications').delete().in('id', ids)
    if (error) {
      console.error('Error deleting multiple medications:', error)
      throw error
    }
    return true
  },

  // --------------------------------------------------------------------------
  // Drug-Food Interactions (drug_food_interactions table)
  // --------------------------------------------------------------------------
  async getInteractions(filters = {}) {
    if (!supabase) return []
    try {
      let query = supabase.from('drug_food_interactions').select('*').order('created_at', { ascending: false })
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

    const hoursNote = data.hours_note || (data.hours_before || data.hours_after ? `${data.hours_before || 0} ชม. ก่อน-${data.hours_after || 0} ชม. หลัง` : '')

    if (data.id && !data.id.startsWith('inter-')) {
      const updatePayload = {
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

    // Insert new interaction: calculate next code
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
