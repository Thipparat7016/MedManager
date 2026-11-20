import { supabase } from './supabaseClient'
import { compressDataUrlIfOversized } from './drugImageService'

export const adminProfileService = {
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
    const optimizedAvatar = await compressDataUrlIfOversized(data.avatar_url, {
      maxLength: 50000,
      maxWidth: 240,
      maxHeight: 240,
      quality: 0.72
    })
    const cleanData = { ...data, avatar_url: optimizedAvatar }

    try {
      localStorage.setItem('med_admin_profile', JSON.stringify(cleanData))
    } catch (e) {
      console.warn('LocalStorage save error:', e)
    }

    if (!supabase) return cleanData

    try {
      let existingId = cleanData.id
      if (!existingId) {
        const { data: existing } = await supabase.from('admin_profiles').select('id').limit(1).maybeSingle()
        if (existing?.id) {
          existingId = existing.id
        }
      }

      const payload = {
        first_name: cleanData.first_name || 'Admin',
        last_name: cleanData.last_name || '',
        email: cleanData.email || 'admin@gmail.com',
        phone: cleanData.phone || '',
        role: cleanData.role || 'Admin',
        avatar_url: optimizedAvatar || '',
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
  }
}
