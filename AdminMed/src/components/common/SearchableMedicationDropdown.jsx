import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Search, ChevronDown, X } from 'lucide-react'

export default function SearchableMedicationDropdown({
  value = '',
  onChange,
  onSelect,
  items = [],
  placeholder = 'เลือกหรือพิมพ์ชื่อยา, อาหารเสริม...'
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const containerRef = useRef(null)
  const listRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Standardize items list
  const normalizedItems = useMemo(() => {
    const map = new Map()
    items.forEach((item, index) => {
      const th = (item.name_th || item.th || item.medication_name || '').trim()
      const en = (item.name_en || item.en || '').trim()
      const category = (item.category || '').trim() || (th.includes('อาหารเสริม') || en.toLowerCase().includes('supplement') ? 'อาหารเสริม' : 'ยา')
      if (!th) return

      const key = `${th}__${category}`
      if (!map.has(key)) {
        map.set(key, {
          id: item.id || `item-${index}`,
          th,
          en,
          category
        })
      }
    })
    return Array.from(map.values())
  }, [items])

  // Filter items based on current search value
  const filteredItems = useMemo(() => {
    if (!value || !value.trim()) return normalizedItems
    const q = value.trim().toLowerCase()
    return normalizedItems.filter(item =>
      item.th.toLowerCase().includes(q) ||
      item.en.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    )
  }, [normalizedItems, value])

  const handleSelect = (item) => {
    if (!item) {
      onChange('')
      if (onSelect) onSelect(null)
    } else {
      onChange(item.th)
      if (onSelect) onSelect(item)
    }
    setIsOpen(false)
    setHighlightIndex(-1)
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange('')
    if (onSelect) onSelect(null)
    setIsOpen(false)
  }

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true)
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex(prev => (prev < filteredItems.length ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightIndex === 0) {
        handleSelect(null)
      } else if (highlightIndex > 0 && highlightIndex <= filteredItems.length) {
        handleSelect(filteredItems[highlightIndex - 1])
      } else {
        setIsOpen(false)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          className="form-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setIsOpen(true)
            setHighlightIndex(-1)
          }}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          style={{ paddingLeft: '34px', paddingRight: value ? '54px' : '32px' }}
        />
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8',
            pointerEvents: 'none'
          }}
        />

        <div
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '2px'
          }}
        >
          {value && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px',
                cursor: 'pointer',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '50%'
              }}
              title="ล้างการเลือก"
            >
              <X size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(prev => !prev)}
            style={{
              background: 'none',
              border: 'none',
              padding: '4px',
              cursor: 'pointer',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ChevronDown
              size={16}
              style={{
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}
            />
          </button>
        </div>
      </div>

      {isOpen && (
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
          {/* Header count */}
          <div
            style={{
              padding: '8px 14px',
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11.5px',
              color: '#475569',
              fontWeight: 600
            }}
          >
            <span>รายการยาและอาหารเสริม</span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              {filteredItems.length} รายการ
            </span>
          </div>

          <div ref={listRef} style={{ maxHeight: '250px', overflowY: 'auto' }}>
            {/* Option "All" */}
            <div
              onMouseDown={(e) => {
                e.preventDefault()
                handleSelect(null)
              }}
              onMouseEnter={() => setHighlightIndex(0)}
              style={{
                padding: '9px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                backgroundColor: highlightIndex === 0 ? '#f0f9ff' : '#ffffff',
                borderBottom: '1px solid #f1f5f9',
                color: !value ? '#0284c7' : '#334155',
                fontWeight: !value ? 600 : 500,
                fontSize: '13px'
              }}
            >
              <span>ทั้งหมด (แสดงทุกรายการ)</span>
              {!value && (
                <span
                  style={{
                    fontSize: '11px',
                    color: '#0284c7',
                    backgroundColor: '#e0f2fe',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}
                >
                  เลือกอยู่
                </span>
              )}
            </div>

            {filteredItems.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                ไม่พบรายการที่ตรงกับ "{value}"
              </div>
            ) : (
              filteredItems.map((item, idx) => {
                const itemIndex = idx + 1
                const isSelected = value.trim().toLowerCase() === item.th.toLowerCase()
                const isHighlight = highlightIndex === itemIndex
                const isSupplement = item.category === 'อาหารเสริม'

                return (
                  <div
                    key={item.id || item.th + idx}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      handleSelect(item)
                    }}
                    onMouseEnter={() => setHighlightIndex(itemIndex)}
                    style={{
                      padding: '9px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      backgroundColor: isHighlight ? '#f0f9ff' : isSelected ? '#f8fafc' : '#ffffff',
                      borderBottom: '1px solid #f8fafc',
                      transition: 'background-color 0.1s ease'
                    }}
                  >
                    <div style={{ flex: 1, paddingRight: '12px' }}>
                      <div
                        style={{
                          fontWeight: isSelected ? 700 : 600,
                          fontSize: '13.5px',
                          color: isSelected ? '#0284c7' : '#0f172a',
                          lineHeight: '1.4'
                        }}
                      >
                        {item.th}
                      </div>
                      {item.en && (
                        <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4', marginTop: '2px' }}>
                          {item.en}
                        </div>
                      )}
                    </div>

                    <span
                      style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        backgroundColor: isSupplement ? '#e8e4fb' : '#e0f2fe',
                        color: isSupplement ? '#7C6CD8' : '#0284c7',
                        border: isSupplement ? '1px solid #c9c3ee' : '1px solid #b9e2fe'
                      }}
                    >
                      {item.category}
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
