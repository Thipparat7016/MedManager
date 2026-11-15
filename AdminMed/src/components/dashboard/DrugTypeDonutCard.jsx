import React from 'react'

export default function DrugTypeDonutCard({ medicationsCount, donutMetrics }) {
  const {
    circumference,
    tabletPct,
    capsulePct,
    liquidPct,
    tabletArc,
    capsuleArc,
    liquidArc
  } = donutMetrics

  return (
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
            {medicationsCount || '0'}
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
  )
}
