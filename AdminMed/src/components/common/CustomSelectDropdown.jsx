import React from 'react'
import { ChevronDown } from 'lucide-react'

export default function CustomSelectDropdown({
  isOpen,
  onToggle,
  selectedValue,
  placeholder,
  options,
  onSelect,
  containerRef
}) {
  return (
    <div style={{ position: 'relative' }} ref={containerRef}>
      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '10px 14px',
          fontSize: '14px',
          backgroundColor: '#ffffff',
          border: isOpen ? '2px solid var(--color-primary-500)' : '1px solid var(--border-input)',
          boxShadow: isOpen ? '0 0 0 3px #DFF2FF' : 'none',
          borderRadius: 'var(--radius-sm)',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          minHeight: '41px',
          boxSizing: 'border-box'
        }}
      >
        <span style={{
          color: selectedValue ? '#0f172a' : 'var(--color-neutral-400)',
          fontWeight: selectedValue ? 500 : 400
        }}>
          {selectedValue || placeholder}
        </span>
        <ChevronDown
          size={16}
          style={{
            color: '#64748b',
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            flexShrink: 0,
            marginLeft: '8px'
          }}
        />
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
            boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.06)',
            zIndex: 100,
            overflow: 'hidden'
          }}
        >
          {options.map((item, idx) => {
            const isSelected = selectedValue === item
            return (
              <div
                key={item}
                onMouseDown={(e) => {
                  e.preventDefault()
                  onSelect(item)
                }}
                style={{
                  padding: '10px 14px',
                  cursor: 'pointer',
                  fontSize: '13.5px',
                  color: isSelected ? '#0284c7' : '#0f172a',
                  fontWeight: isSelected ? 600 : 400,
                  backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                  borderBottom: idx === options.length - 1 ? 'none' : '1px solid #f1f5f9',
                  transition: 'background-color 0.1s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isSelected ? '#f0f9ff' : '#ffffff'}
              >
                {item}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
