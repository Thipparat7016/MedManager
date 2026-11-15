import React from 'react'
import { Camera } from 'lucide-react'

export default function AdminProfileCard({
  fileInputRef,
  formData,
  onAvatarChange
}) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 24px' }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onAvatarChange}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* Circular Avatar */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '130px',
            height: '130px',
            borderRadius: 'var(--radius-circle)',
            backgroundColor: '#DFF2FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            border: '3px solid #B9E2FE',
            cursor: 'pointer'
          }}
          title="คลิกเพื่ออัปโหลดรูปภาพ"
        >
          {formData.avatar_url ? (
            <img src={formData.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: 'var(--radius-circle)',
                border: '2.5px solid var(--color-primary-400)',
                backgroundColor: 'transparent'
              }}
            />
          )}
        </div>

        {/* Edit Icon Badge */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            position: 'absolute',
            bottom: '4px',
            right: '4px',
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-circle)',
            backgroundColor: '#DFF2FF',
            color: '#0284C7',
            border: '2px solid #ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)'
          }}
          title="เปลี่ยนรูปโปรไฟล์"
        >
          <Camera size={16} />
        </button>
      </div>

      {/* Admin Name & Badge */}
      <div style={{ fontSize: '19px', fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: '8px' }}>
        {formData.first_name} {formData.last_name}
      </div>

      <div
        style={{
          fontSize: '12.5px',
          padding: '4px 16px',
          borderRadius: 'var(--radius-pill)',
          backgroundColor: '#DFF2FF',
          color: '#0284C7',
          border: '1px solid #B9E2FE',
          fontWeight: 600
        }}
      >
        {formData.role}
      </div>
    </div>
  )
}
