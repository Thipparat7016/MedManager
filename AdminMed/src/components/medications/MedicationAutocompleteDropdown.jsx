import React from 'react'

export default function MedicationAutocompleteDropdown({
  isVisible,
  field,
  suggestions,
  highlightIndex,
  onSelect,
  onHoverIndex
}) {
  if (!isVisible || suggestions.length === 0) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: 'calc(100% + 4px)',
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.15), 0 4px 12px -2px rgba(0, 0, 0, 0.08)',
        zIndex: 100,
        overflow: 'hidden'
      }}
    >
      <div style={{
        padding: '8px 14px',
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '11.5px',
        color: '#475569',
        fontWeight: 600
      }}>
        <span style={{ fontSize: '11px', color: '#64748b' }}>{suggestions.length} รายการ</span>
      </div>

      <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
        {suggestions.map((item, idx) => (
          <div
            key={item.en + idx}
            onMouseDown={(e) => {
              e.preventDefault()
              onSelect(item)
            }}
            onMouseEnter={() => onHoverIndex(idx)}
            style={{
              padding: '10px 14px',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              backgroundColor: highlightIndex === idx ? '#f0f9ff' : '#ffffff',
              borderBottom: '1px solid #f1f5f9',
              transition: 'background-color 0.1s ease'
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#0f172a', lineHeight: '1.4' }}>
              {field === 'name_th' ? item.th : item.en}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4', marginTop: '2px' }}>
              {field === 'name_th' ? item.en : item.th}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
