import { supabase } from './supabaseClient'

export const userService = {
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
  }
}
