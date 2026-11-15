import React from 'react'
import { ChevronDown } from 'lucide-react'

export default function InteractionMedicationSelect({
  containerRef,
  value,
  onChange,
  onFocus,
  onClick,
  onKeyDown,
  showDropdown,
  suggestions,
  highlightIndex,
  onSelect,
  onHoverIndex
}) {
  return (
    <div className="form-group" style={{ marginBottom: 0, position: 'relative' }} ref={containerRef}>
      <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
        ชื่อยา / อาหารเสริม <span className="required">*</span>
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          name="medication_name"
          className="form-input"
          placeholder="เช่น พาราเซตามอล, วิตามินซี"
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onClick={onClick}
          onKeyDown={onKeyDown}
          autoComplete="off"
          required
          style={{ paddingRight: '32px' }}
        />
        <ChevronDown
          size={16}
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8',
            pointerEvents: 'none'
          }}
        />
      </div>

      {/* Dropdown list ยาและอาหารเสริม */}
      {showDropdown && (
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
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              {suggestions.length} รายการ
            </span>
          </div>

          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            {suggestions.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                ไม่พบรายการยาหรืออาหารเสริมที่ตรงกัน (สามารถพิมพ์ชื่อยาเองได้)
              </div>
            ) : (
              suggestions.map((item, idx) => {
                const isSupplement = item.category === 'อาหารเสริม'
                const isHighlight = highlightIndex === idx

                return (
                  <div
                    key={item.key || (item.th + idx)}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      onSelect(item)
                    }}
                    onMouseEnter={() => onHoverIndex(idx)}
                    style={{
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      backgroundColor: isHighlight ? '#f0f9ff' : '#ffffff',
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background-color 0.1s ease'
                    }}
                  >
                    <div style={{ flex: 1, paddingRight: '12px' }}>
                      <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#0f172a', lineHeight: '1.4' }}>
                        {item.th}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4', marginTop: '2px' }}>
                        {item.en || '-'}
                      </div>
                    </div>

                    <span style={{
                      fontSize: '11px',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      backgroundColor: isSupplement ? '#e8e4fb' : '#e0f2fe',
                      color: isSupplement ? '#7C6CD8' : '#0284c7',
                      border: isSupplement ? '1px solid #c9c3ee' : '1px solid #b9e2fe'
                    }}>
                      {isSupplement ? 'อาหารเสริม' : 'ยา'}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
