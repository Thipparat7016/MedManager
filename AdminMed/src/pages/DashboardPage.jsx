import React from 'react'
import { RefreshCw } from 'lucide-react'
import DashboardKpiGrid from '../components/dashboard/DashboardKpiGrid'
import AdrTrendChart from '../components/dashboard/AdrTrendChart'
import DrugTypeDonutCard from '../components/dashboard/DrugTypeDonutCard'
import { useDashboard } from '../hooks/useDashboard'
import './DashboardPage.css'

export default function DashboardPage() {
  const {
    stats,
    lastUpdated,
    isRefreshing,
    loadData,
    sideEffectTrendChart,
    adherenceBars,
    donutMetrics
  } = useDashboard()

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <div className="page-actions">
          <button
            className="btn btn-primary"
            onClick={() => loadData()}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>รีเฟรช</span>
          </button>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>{lastUpdated}</span>
        </div>
      </div>

      {/* 6 Pharmacist KPI Stat Cards in 2 Rows */}
      <DashboardKpiGrid stats={stats} />

      {/* Middle Section: ADR Trend + Adherence Chart & Drug Type Donut */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <AdrTrendChart
          trendChart={sideEffectTrendChart}
          adherenceBars={adherenceBars}
        />

        <DrugTypeDonutCard
          medicationsCount={stats?.medicationsCount}
          donutMetrics={donutMetrics}
        />
      </div>

      {/* Bottom Row: Clinical Medication Logs & Top Medications */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
      </div>
    </div>
  )
}
