import React, { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import { dataService } from '../services/dataService'

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [activities, setActivities] = useState([])
  const [lastUpdated, setLastUpdated] = useState('อัปเดตเมื่อสักครู่')
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsRefreshing(true)
    const [dashStats, activityLogs] = await Promise.all([
      dataService.getDashboardStats(),
      dataService.getActivityLogs()
    ])
    setStats(dashStats)
    setActivities(activityLogs)
    setLastUpdated('อัปเดตเมื่อสักครู่')
    setTimeout(() => setIsRefreshing(false), 300)
  }

  // Monthly user growth data
  const userGrowthData = [
    { month: 'ม.ค.', value: 0 },
    { month: 'ก.พ.', value: 0 },
    { month: 'มี.ค.', value: 0 },
    { month: 'เม.ย.', value: 0 },
    { month: 'พ.ค.', value: 0 },
    { month: 'มิ.ย.', value: 0 },
    { month: 'ก.ค.', value: 0 }
  ]

  // 14-day adherence data
  const adherenceBars = [
    { label: 'จ', height: 0 },
    { label: 'อ', height: 0 },
    { label: 'พ', height: 0 },
    { label: 'พฤ', height: 0 },
    { label: 'ศ', height: 0 },
    { label: 'ส', height: 0 },
    { label: 'อา', height: 0 },
    { label: 'จ', height: 0 },
    { label: 'อ', height: 0 },
    { label: 'พ', height: 0 },
    { label: 'พฤ', height: 0 },
    { label: 'ศ', height: 0 },
    { label: 'ส', height: 0 },
    { label: 'อา', height: 0, active: true }
  ]

  return (
    <div>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span>Admin</span>
        <span>&gt;</span>
        <span>แดชบอร์ด</span>
      </div>

      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <div className="page-actions">
          <button 
            className="btn btn-secondary" 
            onClick={loadData}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>รีเฟรช</span>
          </button>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>{lastUpdated}</span>
        </div>
      </div>

      {/* 6 Stat Cards in 2 Rows */}
      <div className="stat-cards-grid">
        {/* Card 1 */}
        <div className="stat-card">
          <div className="stat-value">{stats?.totalUsers || '0'}</div>
          <div className="stat-label">ผู้ใช้ทั้งหมด</div>
          <div className="stat-sub">{stats?.totalUsersGrowth || '0 คนในระบบ'}</div>
        </div>

        {/* Card 2 */}
        <div className="stat-card">
          <div className="stat-value">{stats?.medicationsCount || '0'}</div>
          <div className="stat-label">ยาในระบบ</div>
          <div className="stat-sub">{stats?.medicationsGrowth || '0 รายการในระบบ'}</div>
        </div>

        {/* Card 3 */}
        <div className="stat-card">
          <div className="stat-value">{stats?.activeSchedules || '0'}</div>
          <div className="stat-label">ตารางยาที่ใช้งาน</div>
          <div className="stat-sub">{stats?.activeSchedulesGrowth || '0 ตารางใหม่'}</div>
        </div>

        {/* Card 4 */}
        <div className="stat-card">
          <div className="stat-value">{stats?.todayAppointments || '0'}</div>
          <div className="stat-label">นัดหมายวันนี้</div>
          <div className="stat-sub">{stats?.todayAppointmentsSub || 'ไม่มีนัดหมายวันนี้'}</div>
        </div>

        {/* Card 5 */}
        <div className="stat-card">
          <div className="stat-value">{stats?.sideEffectsCount || '0'}</div>
          <div className="stat-label">บันทึกผลข้างเคียง</div>
          <div className="stat-sub">{stats?.sideEffectsSub || 'สะสมเดือนนี้'}</div>
        </div>

        {/* Card 6 */}
        <div className="stat-card">
          <div className="stat-value">{stats?.interactionsCount || '0'}</div>
          <div className="stat-label">ปฏิสัมพันธ์ยา-อาหาร</div>
          <div className="stat-sub">{stats?.interactionsSub || 'รายการในฐานข้อมูล'}</div>
        </div>
      </div>

      {/* Middle Section: User Growth Chart & Drug Type Donut */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
        
        {/* Left: Charts Container */}
        <div className="card" style={{ padding: '24px 28px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '20px' }}>
            การเติบโตของผู้ใช้ (7 เดือนล่าสุด)
          </div>

          {/* SVG Line Chart */}
          <div style={{ width: '100%', height: '180px', position: 'relative' }}>
            <svg viewBox="0 0 700 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#1e293b" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <line x1="50" y1="160" x2="600" y2="160" stroke="#e2e8f0" strokeWidth="1" />

              {/* Area fill */}
              <polygon
                points="50,160 50,160 140,160 230,160 320,160 410,160 500,160 600,160 600,160"
                fill="url(#lineGrad)"
              />

              {/* Smooth Path */}
              <polyline
                fill="none"
                stroke="#0f172a"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="50,160 140,160 230,160 320,160 410,160 500,160 600,160"
              />

              {/* Data Dots */}
              {[
                { x: 50, y: 160 },
                { x: 140, y: 160 },
                { x: 230, y: 160 },
                { x: 320, y: 160 },
                { x: 410, y: 160 },
                { x: 500, y: 160 },
                { x: 600, y: 160 }
              ].map((pt, i) => (
                <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
              ))}

              {/* X Axis Labels */}
              {userGrowthData.map((d, i) => (
                <text 
                  key={i} 
                  x={50 + i * 91.6} 
                  y="185" 
                  textAnchor="middle" 
                  fill="#94a3b8" 
                  fontSize="11" 
                  fontFamily="inherit"
                >
                  {d.month}
                </text>
              ))}
            </svg>
          </div>

          {/* Adherence Rate Mini Bar Chart */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '12px' }}>
              Adherence Rate รายวัน (14 วันล่าสุด)
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '60px', gap: '6px' }}>
              {adherenceBars.map((bar, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div 
                    style={{
                      width: '100%',
                      height: `${Math.max(bar.height, 4)}%`,
                      backgroundColor: bar.active ? '#0f172a' : '#e2e8f0',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.3s ease'
                    }}
                  />
                  <span style={{ fontSize: '9.5px', color: '#94a3b8' }}>{bar.label}</span>
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
                stroke="#e2e8f0"
                strokeWidth="24"
              />
              {stats?.drugTypeDistribution?.tablet > 0 && (
                <circle
                  r="56"
                  cx="80"
                  cy="80"
                  fill="transparent"
                  stroke="#0f172a"
                  strokeWidth="24"
                  strokeDasharray={`${(stats.drugTypeDistribution.tablet / 100) * 352} 352`}
                  strokeDashoffset="0"
                  transform="rotate(-90 80 80)"
                />
              )}
            </svg>

            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                {stats?.medicationsCount || '0'}
              </span>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>รายการยา</div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
              สัดส่วนประเภทยา
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>เม็ด (Tablet)</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{stats?.drugTypeDistribution?.tablet || 0}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>แคปซูล (Capsule)</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{stats?.drugTypeDistribution?.capsule || 0}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>อื่นๆ (Liquid)</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{stats?.drugTypeDistribution?.liquid || 0}%</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Row: Recent Activities & Top Medications */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        
        {/* Left: กิจกรรมล่าสุด */}
        <div className="card" style={{ padding: '24px' }}>
          <div className="card-title">กิจกรรมล่าสุด</div>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>เวลา</th>
                <th style={{ width: '130px' }}>ผู้ใช้</th>
                <th style={{ width: '130px' }}>กิจกรรม</th>
                <th>รายละเอียด</th>
              </tr>
            </thead>
            <tbody>
              {activities.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '28px', color: '#94a3b8' }}>
                    ยังไม่มีบันทึกกิจกรรมในระบบ
                  </td>
                </tr>
              ) : (
                activities.map((act) => (
                  <tr key={act.id}>
                    <td style={{ color: '#64748b', fontSize: '12.5px' }}>{act.time}</td>
                    <td style={{ fontWeight: 500 }}>{act.user_name}</td>
                    <td>
                      <span 
                        style={{
                          fontSize: '12px',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          backgroundColor: act.activity === 'ยืนยันกินยา' ? '#f0fdf4' : act.activity === 'ข้ามยา' ? '#fef2f2' : '#f8fafc',
                          color: act.activity === 'ยืนยันกินยา' ? '#166534' : act.activity === 'ข้ามยา' ? '#991b1b' : '#334155'
                        }}
                      >
                        {act.activity}
                      </span>
                    </td>
                    <td style={{ color: '#475569' }}>{act.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Right: ยาที่ใช้มากที่สุด */}
        <div className="card" style={{ padding: '24px' }}>
          <div className="card-title">ยาที่ใช้มากที่สุด</div>
          {stats?.topMedications?.length === 0 ? (
            <div style={{ padding: '28px 0', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
              ยังไม่มีข้อมูลยาในระบบ
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
              {stats?.topMedications?.map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 500, color: '#1e293b' }}>{item.name}</span>
                    <span style={{ color: '#64748b', fontSize: '12px' }}>{item.count}</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div 
                      style={{
                        height: '100%',
                        width: `${(item.count / item.max) * 100}%`,
                        backgroundColor: '#0f172a',
                        borderRadius: '4px'
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
