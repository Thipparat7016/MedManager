import React from 'react'

export default function AdrTrendChart({ trendChart, adherenceBars }) {
  const { trendPoints, polylinePoints, polygonPoints } = trendChart

  return (
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
  )
}
