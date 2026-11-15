import { useState, useEffect, useCallback } from 'react'
import { dashboardService } from '../services/dashboardService'
import { formatLastUpdatedTime } from '../utils/dateUtils'
import {
  buildDefaultAdherenceBars,
  computeSideEffectTrendChart,
  computeDonutArcs
} from '../utils/dashboardStatsUtils'

export function useDashboard() {
  const [stats, setStats] = useState(null)
  const [activities, setActivities] = useState([])
  const [lastUpdated, setLastUpdated] = useState('อัปเดตเมื่อสักครู่')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadData = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setIsRefreshing(true)
    const [dashStats, activityLogs] = await Promise.all([
      dashboardService.getDashboardStats(),
      dashboardService.getPharmacyActivities()
    ])
    setStats(dashStats)
    setActivities(activityLogs)
    setLastUpdated(formatLastUpdatedTime(new Date()))
    if (!silent) {
      setTimeout(() => setIsRefreshing(false), 300)
    }
  }, [])

  useEffect(() => {
    loadData()

    const unsubscribeRealtime = dashboardService.subscribeToDashboardRealtime(() => {
      loadData({ silent: true })
    })

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        loadData({ silent: true })
      }
    }
    window.addEventListener('focus', handleVisibilityOrFocus)
    document.addEventListener('visibilitychange', handleVisibilityOrFocus)

    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadData({ silent: true })
      }
    }, 10000)

    return () => {
      unsubscribeRealtime()
      window.removeEventListener('focus', handleVisibilityOrFocus)
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus)
      clearInterval(pollInterval)
    }
  }, [loadData])

  const sideEffectTrendChart = computeSideEffectTrendChart(stats?.sideEffectTrend)
  const adherenceBars = stats?.adherenceBars || buildDefaultAdherenceBars()
  const donutMetrics = computeDonutArcs(stats?.drugTypeDistribution)

  return {
    stats,
    activities,
    lastUpdated,
    isRefreshing,
    loadData,
    sideEffectTrendChart,
    adherenceBars,
    donutMetrics
  }
}
