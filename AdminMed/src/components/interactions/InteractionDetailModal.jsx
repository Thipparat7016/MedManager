import React from 'react'
import { X } from 'lucide-react'

export default function InteractionDetailModal({ viewItem, onClose, onEdit }) {
  if (!viewItem) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">รายละเอียดปฏิสัมพันธ์: {viewItem.medication_name}</div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-neutral-400)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px', marginTop: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><strong>อาหาร/กลุ่มอาหาร:</strong> {viewItem.food_name}</div>
            <div><strong>ประเภทปฏิสัมพันธ์:</strong> {viewItem.interaction_type}</div>
            <div>
              <strong>ความรุนแรง:</strong>{' '}
              {viewItem.severity && viewItem.severity !== '-' && !(viewItem.interaction_type || '').includes('แนะนำ') ? (
                <span className={`badge-severity ${viewItem.severity === 'สูง' ? 'high' : viewItem.severity === 'ต่ำ' ? 'low' : 'medium'}`} style={{ marginLeft: '4px' }}>
                  {viewItem.severity}
                </span>
              ) : (
                <span style={{ color: 'var(--color-neutral-400)', marginLeft: '4px' }}>-</span>
              )}
            </div>
            <div>
              <strong>ช่วงเวลางด:</strong>{' '}
              {(viewItem.interaction_type || '').includes('แนะนำ')
                ? '-'
                : viewItem.hours_note || (Number(viewItem.hours_before) || Number(viewItem.hours_after) ? `${viewItem.hours_before || 0} ชม. ก่อน - ${viewItem.hours_after || 0} ชม. หลัง` : '-')}
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--color-neutral-100)', paddingTop: '10px' }}>
            <div style={{ fontWeight: 600, color: 'var(--color-neutral-800)', marginBottom: '4px' }}>รายละเอียดผลกระทบ:</div>
            <div style={{ color: 'var(--color-neutral-600)', fontSize: '13.5px', lineHeight: 1.6 }}>{viewItem.impact_details || '-'}</div>
          </div>
          <div style={{ borderTop: '1px solid var(--color-neutral-100)', paddingTop: '10px' }}>
            <div style={{ fontWeight: 600, color: 'var(--color-neutral-800)', marginBottom: '4px' }}>แหล่งอ้างอิง:</div>
            <div style={{ color: 'var(--color-neutral-600)', fontSize: '13.5px' }}>
              {viewItem.source_name} ({viewItem.source_type}) - {viewItem.publish_year}
              {viewItem.url_doi && (
                <div style={{ marginTop: '4px' }}>
                  <a href={viewItem.url_doi} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary-600)' }}>
                    {viewItem.url_doi}
                  </a>
                </div>
              )}
            </div>
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
            onClick={() => onEdit(viewItem.id)}
          >
            แก้ไข
          </button>
        </div>
      </div>
    </div>
  )
}
