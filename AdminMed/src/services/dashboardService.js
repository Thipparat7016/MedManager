import { supabase } from './supabaseClient'
import { userService } from './userService'
import { medicationService } from './medicationService'
import { interactionService } from './interactionService'
import { formatPharmacyActivities, computeDashboardStats } from '../utils/dashboardStatsUtils'

export const dashboardService = {
  async getActivityLogs(limit = 10) {
    if (!supabase) return []
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
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

  async getSideEffects() {
    if (!supabase) return []
    try {
      const { data, error } = await supabase
        .from('side_effects')
        .select('*')
        .order('created_at', { ascending: false })
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

  async getUserSchedules() {
    if (!supabase) return []
    try {
      const { data, error } = await supabase
        .from('user_schedules')
        .select('*')
        .order('created_at', { ascending: false })
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
      dashboardService.getSideEffects(),
      userService.getAppUsers()
    ])

    return formatPharmacyActivities({ rawLogs, sideEffects, users })
  },

  async getDashboardStats() {
    const [medications, interactions, users, sideEffects, schedules, activityLogs] = await Promise.all([
      medicationService.getMedications(),
      interactionService.getInteractions(),
      userService.getAppUsers(),
      dashboardService.getSideEffects(),
      dashboardService.getUserSchedules(),
      dashboardService.getActivityLogs(500)
    ])

    return computeDashboardStats({
      medications,
      interactions,
      users,
      sideEffects,
      schedules,
      activityLogs
    })
  },

  subscribeToDashboardRealtime(onUpdate) {
    if (!supabase || typeof onUpdate !== 'function') return () => {}
    let debounceTimer = null
    const triggerUpdate = () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        onUpdate()
      }, 250)
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
