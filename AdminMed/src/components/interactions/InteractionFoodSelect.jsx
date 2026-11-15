import React from 'react'
import { ChevronDown } from 'lucide-react'

export default function InteractionFoodSelect({
  containerRef,
  value,
  medicationName,
  onChange,
  onFocus,
  onClick,
  onKeyDown,
  showDropdown,
  orderedSuggestions,
  highlightIndex,
  onSelect,
  onHoverIndex
}) {
  return (
    <div className="form-group" style={{ marginBottom: 0, position: 'relative' }} ref={containerRef}>
      <label className="form-label">
        ชื่ออาหาร / กลุ่มอาหาร <span className="required">*</span>
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          name="food_name"
          className="form-input"
          placeholder="่เช่น เครื่องดื่มที่มีคาเฟอีน, นม"
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

      {/* Dropdown list อาหารที่เกี่ยวข้องกับตัวยาหรืออาหารเสริมที่เลือก */}
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
              {orderedSuggestions.length} รายการ
            </span>
          </div>

          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            {orderedSuggestions.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                {!medicationName
                  ? 'กรุณาเลือกชื่อยาหรืออาหารเสริมทางด้านซ้ายก่อน'
                  : 'ไม่พบรายการอาหารที่ตรงกัน (สามารถพิมพ์ชื่ออาหารเองได้)'}
              </div>
            ) : (
              orderedSuggestions.map((item, idx) => {
                const isAvoid = item.interaction_type === 'หลีกเลี่ยง'
                const isHighlight = highlightIndex === idx

                return (
                  <div
                    key={(item.food_name || '') + '-' + (item.interaction_type || '') + '-' + idx}
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
                        {item.food_name}
                      </div>
                    </div>

                    <span style={{
                      fontSize: '11px',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      backgroundColor: isAvoid ? '#fee2e2' : '#dcfce7',
                      color: isAvoid ? '#b91c1c' : '#15803d',
                      border: isAvoid ? '1px solid #fecdd3' : '1px solid #bbf7d0'
                    }}>
                      {isAvoid ? 'หลีกเลี่ยง' : 'แนะนำ'}
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
