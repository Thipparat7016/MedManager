import React, { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import { dataService } from '../services/dataService'

const THAI_SHORT_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
const THAI_SHORT_DAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

function buildDefaultSideEffectTrend() {
  return [
    { month: 'สัปดาห์ที่ 1', value: 0 },
    { month: 'สัปดาห์ที่ 2', value: 0 },
    { month: 'สัปดาห์ที่ 3', value: 0 },
    { month: 'สัปดาห์ที่ 4', value: 0 }
  ]
}

function buildDefaultAdherenceBars() {
  const now = new Date()
  const list = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    list.push({
      label: `${THAI_SHORT_DAYS[d.getDay()]} ${d.getDate()}`,
      dateLabel: `${d.getDate()} ${THAI_SHORT_MONTHS[d.getMonth()]}`,
      height: 0,
      rate: 0,
      taken: 0,
      total: 0,
      hasData: false,
      active: i === 0
    })
  }
  return list
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [activities, setActivities] = useState([])
  const [lastUpdated, setLastUpdated] = useState('อัปเดตเมื่อสักครู่')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadData = async ({ silent = false } = {}) => {
    if (!silent) setIsRefreshing(true)
    const [dashStats, activityLogs] = await Promise.all([
      dataService.getDashboardStats(),
      dataService.getPharmacyActivities()
    ])
    setStats(dashStats)
    setActivities(activityLogs)
    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} น.`
    setLastUpdated(`อัปเดตล่าสุด ${timeStr}`)
    if (!silent) {
      setTimeout(() => setIsRefreshing(false), 300)
    }
  }

  useEffect(() => {
    loadData()

    const unsubscribeRealtime = dataService.subscribeToDashboardRealtime(() => {
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
  }, [])

  // 1-month (4 weeks) ADR / side-effect trend data (real Supabase data)
  const sideEffectTrendData = stats?.sideEffectTrend || buildDefaultSideEffectTrend()
  const maxTrendValue = Math.max(...sideEffectTrendData.map(d => d.value), 1)
  const stepX = sideEffectTrendData.length > 1 ? 550 / (sideEffectTrendData.length - 1) : 0
  const trendPoints = sideEffectTrendData.map((d, i) => ({
    x: Math.round(50 + i * stepX),
    y: d.value > 0 ? Math.round(160 - (d.value / maxTrendValue) * 120) : 160,
    month: d.month,
    rangeLabel: d.rangeLabel,
    value: d.value
  }))
  const polylinePoints = trendPoints.map(pt => `${pt.x},${pt.y}`).join(' ')
  const polygonPoints = `50,160 ${polylinePoints} 600,160`

  // 7-day daily adherence data (real Supabase data)
  const adherenceBars = stats?.adherenceBars || buildDefaultAdherenceBars()

  // Donut chart arc calculations (circumference = 2 * pi * 56 ≈ 351.86)
  const circumference = 351.86
  const tabletPct = stats?.drugTypeDistribution?.tablet || 0
  const capsulePct = stats?.drugTypeDistribution?.capsule || 0
  const liquidPct = stats?.drugTypeDistribution?.liquid || 0
  const tabletArc = (tabletPct / 100) * circumference
  const capsuleArc = (capsulePct / 100) * circumference
  const liquidArc = (liquidPct / 100) * circumference

  const getActivityBadgeStyle = (tone) => {
    if (tone === 'success') {
      return {
        backgroundColor: 'var(--color-success-50)',
        color: 'var(--color-success-700)',
        border: '1px solid var(--color-success-100)'
      }
    }
    if (tone === 'danger') {
      return {
        backgroundColor: 'var(--color-danger-50)',
        color: 'var(--color-danger-700)',
        border: '1px solid var(--color-danger-100)'
      }
    }
    if (tone === 'warning') {
      return {
        backgroundColor: 'var(--color-warning-50)',
        color: 'var(--color-warning-700)',
        border: '1px solid var(--color-warning-100)'
      }
    }
    return {
      backgroundColor: 'var(--color-primary-50)',
      color: 'var(--color-primary-700)',
      border: '1px solid var(--color-primary-200)'
    }
  }

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
      <div className="stat-cards-grid">
        {/* Card 1: Medications & Supplements */}
        <div className="stat-card">
          <div className="stat-value">{stats?.medicationsCount || '0'}</div>
          <div className="stat-label">ยาและอาหารเสริมในระบบ</div>
          <div className="stat-sub">{stats?.medicationsSub || 'ยังไม่มีรายการยาในคลัง'}</div>
        </div>

        {/* Card 2: Total Drug-Food Interactions */}
        <div className="stat-card">
          <div className="stat-value">{stats?.interactionsCount || '0'}</div>
          <div className="stat-label">ปฏิสัมพันธ์ยา-อาหารทั้งหมด</div>
          <div className="stat-sub">{stats?.interactionsSub || 'ยังไม่มีข้อมูลในฐานข้อมูล'}</div>
        </div>

        {/* Card 3: High-Severity Interactions */}
        <div className="stat-card">
          <div className="stat-value">{stats?.highSeverityInteractionsCount || '0'}</div>
          <div className="stat-label">ปฏิสัมพันธ์ระดับรุนแรงสูง</div>
          <div className="stat-sub">{stats?.highSeverityInteractionsSub || 'ไม่มีรายการความรุนแรงสูง'}</div>
        </div>

        {/* Card 4: Side Effect / ADR Reports */}
        <div className="stat-card">
          <div className="stat-value">{stats?.sideEffectsCount || '0'}</div>
          <div className="stat-label">รายงานผลข้างเคียง (ADR)</div>
          <div className="stat-sub">{stats?.sideEffectsSub || 'ยังไม่มีรายงานผลข้างเคียง'}</div>
        </div>

        {/* Card 5: Medication Adherence Rate */}
        <div className="stat-card">
          <div className="stat-value">{stats?.adherenceRate || '0%'}</div>
          <div className="stat-label">อัตราการกินยาตรงเวลา</div>
          <div className="stat-sub">{stats?.adherenceSub || 'ยังไม่มีประวัติการกินยา'}</div>
        </div>

        {/* Card 6: Patients in System */}
        <div className="stat-card">
          <div className="stat-value">{stats?.totalPatients || '0'}</div>
          <div className="stat-label">ผู้ป่วยในระบบ</div>
          <div className="stat-sub">{stats?.totalPatientsSub || 'ยังไม่มีผู้ป่วยในระบบ'}</div>
        </div>
      </div>

      {/* Middle Section: ADR Trend + Adherence Chart & Drug Type Donut */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
        
        {/* Left: Charts Container */}
        <div className="card" style={{ padding: '24px 28px' }}>
          <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--color-neutral-800)', marginBottom: '20px' }}>
            แนวโน้มรายงานผลข้างเคียง (1 เดือนล่าสุด)
          </div>

          {/* SVG Line Chart */}
          <div style={{ width: '100%', height: '180px', position: 'relative' }}>
            <svg viewBox="0 0 700 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0284C7" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <line x1="50" y1="160" x2="600" y2="160" stroke="var(--color-neutral-100)" strokeWidth="1" />

              {/* Area fill */}
              <polygon
                points={polygonPoints}
                fill="url(#lineGrad)"
              />

              {/* Smooth Path */}
              <polyline
                fill="none"
                stroke="var(--color-primary-500)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylinePoints}
              />

              {/* Data Dots & Value Labels */}
              {trendPoints.map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r="4" fill="var(--color-primary-500)" stroke="#ffffff" strokeWidth="2">
                    <title>{pt.rangeLabel ? `${pt.month} (${pt.rangeLabel}): ${pt.value} รายการ` : `${pt.month}: ${pt.value} รายการ`}</title>
                  </circle>
                  {pt.value > 0 && (
                    <text
                      x={pt.x}
                      y={pt.y - 10}
                      textAnchor="middle"
                      fill="var(--color-primary-700)"
                      fontSize="11"
                      fontWeight="600"
                      fontFamily="inherit"
                    >
                      {pt.value}
                    </text>
                  )}
                </g>
              ))}

              {/* X Axis Labels */}
              {trendPoints.map((pt, i) => (
                <text 
                  key={i} 
                  x={pt.x} 
                  y="185" 
                  textAnchor="middle" 
                  fill="var(--color-neutral-400)" 
                  fontSize="12" 
                  fontFamily="inherit"
                >
                  {pt.month}
                </text>
              ))}
            </svg>
          </div>

          {/* Adherence Rate Mini Bar Chart */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-neutral-100)' }}>
            <div style={{ fontSize: '12px', color: 'var(--color-neutral-500)', marginBottom: '12px' }}>
              Adherence Rate รายวัน (7 วันล่าสุด)
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '60px', gap: '8px' }}>
              {adherenceBars.map((bar, i) => (
                <div key={i} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                  <div 
                    title={bar.dateLabel ? `${bar.dateLabel}: ${bar.rate}% (${bar.taken}/${bar.total} มื้อ)` : `${bar.label}: ${bar.rate}%`}
                    style={{
                      width: '100%',
                      height: `${Math.max(bar.height, 4)}%`,
                      backgroundColor: bar.active ? 'var(--color-primary-500)' : bar.hasData ? 'var(--color-primary-300)' : 'var(--color-neutral-100)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.3s ease'
                    }}
                  />
                  <span style={{ fontSize: '10.5px', color: 'var(--color-neutral-500)' }}>{bar.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Donut Chart - สัดส่วนประเภทยา */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: '24px' }}>
            {/* SVG Donut Chart */}
            <svg width="150" height="150" viewBox="0 0 160 160">
              <circle
                r="56"
                cx="80"
                cy="80"
                fill="transparent"
                stroke="var(--color-neutral-100)"
                strokeWidth="24"
              />
              {tabletPct > 0 && (
                <circle
                  r="56"
                  cx="80"
                  cy="80"
                  fill="transparent"
                  stroke="var(--color-primary-500)"
                  strokeWidth="24"
                  strokeDasharray={`${tabletArc} ${circumference}`}
                  strokeDashoffset="0"
                  transform="rotate(-90 80 80)"
                />
              )}
              {capsulePct > 0 && (
                <circle
                  r="56"
                  cx="80"
                  cy="80"
                  fill="transparent"
                  stroke="var(--color-primary-300)"
                  strokeWidth="24"
                  strokeDasharray={`${capsuleArc} ${circumference}`}
                  strokeDashoffset={-tabletArc}
                  transform="rotate(-90 80 80)"
                />
              )}
              {liquidPct > 0 && (
                <circle
                  r="56"
                  cx="80"
                  cy="80"
                  fill="transparent"
                  stroke="var(--color-primary-200)"
                  strokeWidth="24"
                  strokeDasharray={`${liquidArc} ${circumference}`}
                  strokeDashoffset={-(tabletArc + capsuleArc)}
                  transform="rotate(-90 80 80)"
                />
              )}
            </svg>

            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                {stats?.medicationsCount || '0'}
              </span>
              <div style={{ fontSize: '11.5px', color: 'var(--color-neutral-400)' }}>รายการยา</div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--color-neutral-100)', paddingTop: '14px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-neutral-800)', marginBottom: '8px' }}>
              สัดส่วนประเภทยา
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-neutral-600)' }}>
                <span>เม็ด (Tablet)</span>
                <span style={{ fontWeight: 600, color: 'var(--color-primary-700)' }}>{tabletPct}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-neutral-600)' }}>
                <span>แคปซูล (Capsule)</span>
                <span style={{ fontWeight: 600, color: 'var(--color-primary-700)' }}>{capsulePct}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-neutral-600)' }}>
                <span>อื่นๆ (Liquid)</span>
                <span style={{ fontWeight: 600, color: 'var(--color-primary-700)' }}>{liquidPct}%</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Row: Clinical Medication Logs & Top Medications */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        
        {/* Left: ติดตามการใช้ยาและผลข้างเคียงล่าสุด */}
        <div className="card" style={{ padding: '24px' }}>
          <div className="card-title">ติดตามการใช้ยาและผลข้างเคียงล่าสุด</div>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>เวลา</th>
                <th style={{ width: '130px' }}>ผู้ป่วย</th>
                <th style={{ width: '140px' }}>กิจกรรม</th>
                <th>รายละเอียด</th>
              </tr>
            </thead>
            <tbody>
              {activities.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '28px', color: 'var(--color-neutral-400)' }}>
                    ยังไม่มีบันทึกการใช้ยาหรือผลข้างเคียงในระบบ
                  </td>
                </tr>
              ) : (
                activities.map((act) => (
                  <tr key={act.id}>
                    <td style={{ color: 'var(--color-neutral-500)', fontSize: '13px' }}>{act.time}</td>
                    <td style={{ fontWeight: 600, color: 'var(--color-neutral-800)' }}>{act.user_name}</td>
                    <td>
                      <span 
                        style={{
                          fontSize: '12px',
                          fontWeight: 500,
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-pill)',
                          whiteSpace: 'nowrap',
                          ...getActivityBadgeStyle(act.tone)
                        }}
                      >
                        {act.activity}
                      </span>
                    </td>
                    <td style={{ color: 'var(--color-neutral-600)' }}>{act.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Right: ยาที่ใช้มากที่สุด */}
        <div className="card" style={{ padding: '24px' }}>
          <div className="card-title">ยาที่ใช้มากที่สุด</div>
          {!stats?.topMedications || stats.topMedications.length === 0 ? (
            <div style={{ padding: '28px 0', textAlign: 'center', color: 'var(--color-neutral-400)', fontSize: '13px' }}>
              ยังไม่มีข้อมูลยาในระบบ
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
              {stats.topMedications.map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-neutral-800)' }}>{item.name}</span>
                    <span style={{ color: 'var(--color-neutral-500)', fontSize: '12px' }}>{item.countLabel ?? item.count}</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-neutral-100)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                    <div 
                      style={{
                        height: '100%',
                        width: `${item.max > 0 ? Math.min(100, (item.count / item.max) * 100) : 0}%`,
                        background: 'linear-gradient(135deg, var(--color-primary-400) 0%, var(--color-primary-500) 100%)',
                        borderRadius: 'var(--radius-pill)'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
