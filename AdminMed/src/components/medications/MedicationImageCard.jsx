import React from 'react'
import { Upload, Trash2 } from 'lucide-react'

export default function MedicationImageCard({
  fileInputRef,
  imagePreview,
  onImageChange,
  onRemoveImage,
  onImageError
}) {
  return (
    <div style={{ position: 'sticky', top: '24px' }}>
      <div className="card" style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div className="card-title" style={{ marginBottom: 0, fontSize: '15px' }}>
            รูปภาพยา / อาหารเสริม
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={onImageChange}
          accept="image/*"
          style={{ display: 'none' }}
        />

        {imagePreview ? (
          <div>
            <div style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '4 / 3',
              maxHeight: '260px',
              backgroundColor: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              marginBottom: '14px'
            }}>
              <img
                src={imagePreview}
                alt="Medication Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  borderRadius: '8px'
                }}
                onError={onImageError}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  backgroundColor: '#e0f2fe',
                  color: '#0284c7',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  padding: '8px 12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0284c7'
                  e.currentTarget.style.backgroundColor = '#f0f9ff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1'
                  e.currentTarget.style.backgroundColor = '#f8fafc'
                }}
              >
                <Upload size={14} />
                <span>เปลี่ยนภาพ</span>
              </button>
              <button
                type="button"
                className="btn btn-delete"
                onClick={onRemoveImage}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  padding: '8px 12px'
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed #cbd5e1',
              borderRadius: '12px',
              aspectRatio: '4 / 3',
              maxHeight: '260px',
              padding: '20px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: '#f8fafc',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#0284c7'
              e.currentTarget.style.backgroundColor = '#f0f9ff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#cbd5e1'
              e.currentTarget.style.backgroundColor = '#f8fafc'
            }}
          >
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px'
            }}>
              <Upload size={22} />
            </div>
            <div style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b', marginBottom: '4px', lineHeight: '1.4' }}>
              คลิกเพื่ออัปโหลดรูปภาพ
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
