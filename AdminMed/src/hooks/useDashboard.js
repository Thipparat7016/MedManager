import { useState, useEffect, useCallback, useRef } from 'react'
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
  const lastFetchedAtRef = useRef(0)
  const isFetchingRef = useRef(false)

  const loadData = useCallback(async ({ silent = false } = {}) => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true
    if (!silent) setIsRefreshing(true)
    try {
      const { stats: dashStats, activities: activityLogs } = await dashboardService.getDashboardOverview()
      setStats(dashStats)
      setActivities(activityLogs)
      lastFetchedAtRef.current = Date.now()
      setLastUpdated(formatLastUpdatedTime(new Date()))
    } finally {
      isFetchingRef.current = false
      if (!silent) {
        setTimeout(() => setIsRefreshing(false), 300)
      }
    }
  }, [])

  useEffect(() => {
    loadData()

    const unsubscribeRealtime = dashboardService.subscribeToDashboardRealtime(() => {
      loadData({ silent: true })
    })

    const handleVisibilityOrFocus = () => {
      // Only refetch on window focus if data is older than 60 seconds
      if (document.visibilityState === 'visible' && Date.now() - lastFetchedAtRef.current > 60000) {
        loadData({ silent: true })
      }
    }
    window.addEventListener('focus', handleVisibilityOrFocus)
    document.addEventListener('visibilitychange', handleVisibilityOrFocus)

    return () => {
      unsubscribeRealtime()
      window.removeEventListener('focus', handleVisibilityOrFocus)
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus)
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
