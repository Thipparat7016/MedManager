import React from 'react'
import { AlertCircle, CheckCircle2, Check } from 'lucide-react'

export default function AlertBanner({ variant = 'error', message }) {
  if (!message) return null

  if (variant === 'login-error') {
    return (
      <div style={{ padding: '12px 14px', backgroundColor: 'var(--color-danger-50)', color: 'var(--color-danger-700)', border: '1px solid var(--color-danger-100)', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '13px' }}>
        {message}
      </div>
    )
  }

  if (variant === 'settings-success') {
    return (
      <div style={{ padding: '12px 16px', backgroundColor: 'var(--color-success-50)', color: 'var(--color-success-700)', border: '1px solid var(--color-success-100)', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Check size={16} /> {message}
      </div>
    )
  }

  if (variant === 'autofill-success') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        backgroundColor: '#f0fdf4',
        color: '#166534',
        border: '1px solid #bbf7d0',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '13.5px',
        fontWeight: 500,
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}>
        <CheckCircle2 size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>{message}</div>
      </div>
    )
  }

  if (variant === 'success') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        backgroundColor: '#ecfdf5',
        color: '#065f46',
        border: '1px solid #a7f3d0',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '13.5px',
        fontWeight: 500,
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}>
        <CheckCircle2 size={18} style={{ color: '#059669', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>{message}</div>
      </div>
    )
  }

  const marginBottom = variant === 'fda-error' ? '16px' : '20px'

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '12px 16px',
      backgroundColor: '#fff1f2',
      color: '#9f1239',
      border: '1px solid #fecdd3',
      borderRadius: '8px',
      marginBottom,
      fontSize: '13.5px',
      fontWeight: 500,
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    }}>
      <AlertCircle size={18} style={{ color: '#e11d48', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>{message}</div>
    </div>
  )
}
