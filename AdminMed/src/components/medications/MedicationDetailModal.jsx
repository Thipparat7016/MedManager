import React from 'react'
import { X } from 'lucide-react'

export default function MedicationDetailModal({ viewMed, onClose, onEdit }) {
  if (!viewMed) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">รายละเอียดข้อมูลยา: {viewMed.name_th} ({viewMed.name_en})</div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-neutral-400)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px', marginTop: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><strong>รหัสยา:</strong> {viewMed.code}</div>
            <div><strong>หมวดหมู่:</strong> <span className={viewMed.category === 'ยา' ? 'pill-chip-blue' : 'pill-chip-amber'} style={{ marginLeft: '4px' }}>{viewMed.category}</span></div>
            <div><strong>ประเภทยา:</strong> {viewMed.type}</div>
            <div><strong>ขนาดยา:</strong> {viewMed.dosage} {viewMed.unit}</div>
          </div>
          <div style={{ borderTop: '1px solid var(--color-neutral-100)', paddingTop: '10px' }}>
            <div style={{ fontWeight: 600, color: 'var(--color-neutral-800)', marginBottom: '4px' }}>สรรพคุณ:</div>
            <div style={{ color: 'var(--color-neutral-600)', fontSize: '13.5px' }}>{viewMed.indications || '-'}</div>
          </div>
          <div style={{ borderTop: '1px solid var(--color-neutral-100)', paddingTop: '10px' }}>
            <div style={{ fontWeight: 600, color: 'var(--color-neutral-800)', marginBottom: '4px' }}>วิธีรับประทาน / คำแนะนำ:</div>
            <div style={{ color: 'var(--color-neutral-600)', fontSize: '13.5px' }}>{viewMed.instructions || '-'}</div>
          </div>
          <div style={{ borderTop: '1px solid var(--color-neutral-100)', paddingTop: '10px' }}>
            <div style={{ fontWeight: 600, color: 'var(--color-neutral-800)', marginBottom: '4px' }}>ข้อควรระวัง / ผลข้างเคียง:</div>
            <div style={{ color: 'var(--color-neutral-600)', fontSize: '13.5px' }}>{viewMed.precautions || '-'}</div>
          </div>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            className="btn btn-ghost"
            onClick={onClose}
          >
            ปิด
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onEdit(viewMed.id)}
          >
            แก้ไขยานี้
          </button>
        </div>
      </div>
    </div>
  )
}
