import { supabase } from './supabaseClient'
import { formatPharmacyActivities, computeDashboardStats } from '../utils/dashboardStatsUtils'

export const dashboardService = {
  async getMedicationsSummary() {
    if (!supabase) return []
    try {
      // Exclude image_url, indications, instructions, precautions to avoid downloading Base64 images on Dashboard
      const { data, error } = await supabase
        .from('medications')
        .select('id, code, name_th, name_en, type, dosage, unit, category, created_at')
        .order('created_at', { ascending: true })
      if (error) {
        console.error('Error fetching medications summary:', error)
        return []
      }
      return data || []
    } catch (err) {
      console.error('getMedicationsSummary error:', err)
      return []
    }
  },

  async getInteractionsSummary() {
    if (!supabase) return []
    try {
      const { data, error } = await supabase
        .from('drug_food_interactions')
        .select('id, interaction_type, severity')
      if (error) {
        console.error('Error fetching interactions summary:', error)
        return []
      }
      return data || []
    } catch (err) {
      console.error('getInteractionsSummary error:', err)
      return []
    }
  },

  async getUsersSummary() {
    if (!supabase) return []
    try {
      const { data, error } = await supabase
        .from('app_users')
        .select('id, code, name, email, status, created_at')
        .order('created_at', { ascending: false })
      if (error) {
        console.error('Error fetching app_users summary:', error)
        return []
      }
      return data || []
    } catch (err) {
      console.error('getUsersSummary error:', err)
      return []
    }
  },

  async getActivityLogs(limit = 40) {
    if (!supabase) return []
    try {
      // Exclude MED_SYNC rows in SQL so large sync JSON blobs are not downloaded with activity logs
      const { data, error } = await supabase
        .from('activity_logs')
        .select('id, time, user_name, activity, details, created_at')
        .neq('activity', 'เข้าสู่ระบบ:MED_SYNC')
        .order('created_at', { ascending: false })
        .limit(limit)
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

  async getUserSyncLogs(limit = 30) {
    if (!supabase) return []
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('id, user_name, activity, details, created_at')
        .eq('activity', 'เข้าสู่ระบบ:MED_SYNC')
        .order('created_at', { ascending: false })
        .limit(limit)
      if (error) {
        console.warn('Error fetching user sync logs:', error)
        return []
      }
      return data || []
    } catch (err) {
      console.warn('getUserSyncLogs error:', err)
      return []
    }
  },

  async getSideEffects(limit = 200) {
    if (!supabase) return []
    try {
      const { data, error } = await supabase
        .from('side_effects')
        .select('id, user_id, medication_name, symptoms, severity, log_date, log_time, details, created_at')
        .order('created_at', { ascending: false })
        .limit(limit)
      if (error) {
        console.warn('Error fetching side_effects:', error)
        return []
      }
      return data || []
    } catch (err) {
      console.warn('getSideEffects error:', err)
      return []
    }
  },

  async getUserSchedules(limit = 1000) {
    if (!supabase) return []
    try {
      const { data, error } = await supabase
        .from('user_schedules')
        .select('id, user_id, medication_id, medication_name, dosage, unit, time, date, is_taken, taken_at, is_skipped, created_at')
        .order('created_at', { ascending: false })
        .limit(limit)
      if (error) {
        console.warn('Error fetching user_schedules:', error)
        return []
      }
      return data || []
    } catch (err) {
      console.warn('getUserSchedules error:', err)
      return []
    }
  },

  async getPharmacyActivities() {
    const [rawLogs, sideEffects, users] = await Promise.all([
      dashboardService.getActivityLogs(40),
      dashboardService.getSideEffects(50),
      dashboardService.getUsersSummary()
    ])

    return formatPharmacyActivities({ rawLogs, sideEffects, users })
  },

  async getDashboardStats() {
    const { stats } = await dashboardService.getDashboardOverview()
    return stats
  },

  async getDashboardOverview() {
    const [medications, interactions, users, sideEffects, schedules, recentLogs, syncLogs] = await Promise.all([
      dashboardService.getMedicationsSummary(),
      dashboardService.getInteractionsSummary(),
      dashboardService.getUsersSummary(),
      dashboardService.getSideEffects(200),
      dashboardService.getUserSchedules(1000),
      dashboardService.getActivityLogs(40),
      dashboardService.getUserSyncLogs(30)
    ])

    const stats = computeDashboardStats({
      medications,
      interactions,
      users,
      sideEffects,
      schedules,
      activityLogs: [...recentLogs, ...syncLogs]
    })

    const activities = formatPharmacyActivities({
      rawLogs: recentLogs,
      sideEffects,
      users
    })

    return { stats, activities }
  },

  subscribeToDashboardRealtime(onUpdate) {
    if (!supabase || typeof onUpdate !== 'function') return () => {}
    let debounceTimer = null
    const triggerUpdate = () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        onUpdate()
      }, 2000)
    }

    const channel = supabase
      .channel(`adminmed-dashboard-realtime-${Date.now()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'side_effects' }, triggerUpdate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_schedules' }, triggerUpdate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'medications' }, triggerUpdate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drug_food_interactions' }, triggerUpdate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_users' }, triggerUpdate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs' }, triggerUpdate)
      .subscribe()

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      try {
        supabase.removeChannel(channel)
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}
