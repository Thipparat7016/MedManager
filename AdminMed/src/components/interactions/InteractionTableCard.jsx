import React from 'react'
import { Edit, Eye, Trash2 } from 'lucide-react'
import PaginationFooter from '../common/PaginationFooter'

export default function InteractionTableCard({
  totalItems,
  selectedIds,
  paginatedData,
  currentPage,
  pageSize,
  totalPages,
  onToggleSelectAll,
  onToggleSelectOne,
  onDeleteSelected,
  onEdit,
  onView,
  onDeleteOne,
  onPageChange
}) {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>
          ปฏิสัมพันธ์ทั้งหมด ({totalItems} รายการ)
        </div>
        {selectedIds.length > 0 && (
          <button
            onClick={onDeleteSelected}
            style={{
              background: 'none',
              border: 'none',
              color: '#ef4444',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            ลบที่เลือก ({selectedIds.length})
          </button>
        )}
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '48px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  onChange={onToggleSelectAll}
                  checked={paginatedData.length > 0 && paginatedData.every(i => selectedIds.includes(i.id))}
                />
              </th>
              <th style={{ width: '70px', textAlign: 'center' }}>ID</th>
              <th style={{ width: '20%' }}>ชื่อยา / อาหารเสริม (TH/EN)</th>
              <th style={{ width: '18%' }}>อาหาร / กลุ่มอาหาร</th>
              <th style={{ width: '16%', textAlign: 'center' }}>ประเภทปฏิสัมพันธ์</th>
              <th style={{ width: '10%', textAlign: 'center' }}>ความรุนแรง</th>
              <th style={{ width: '14%', textAlign: 'center' }}>ช่วงเวลางด</th>
              <th style={{ width: '12%' }}>แหล่งอ้างอิง</th>
              <th style={{ width: '190px', textAlign: 'center' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                  ไม่พบข้อมูลปฏิสัมพันธ์ในระบบ (กดปุ่ม "เพิ่มปฏิสัมพันธ์" เพื่อเพิ่มข้อมูล)
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => (
                <tr key={item.id}>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => onToggleSelectOne(item.id)}
                    />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {String((currentPage - 1) * pageSize + index + 1).padStart(3, '0')}
                  </td>
                  <td>
                    {item.medication_name}
                  </td>
                  <td>{item.food_name}</td>
                  <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{item.interaction_type}</td>
                  <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {item.severity ? (
                      <span className={`badge-severity ${item.severity === 'สูง' ? 'high' : item.severity === 'ต่ำ' ? 'low' : 'medium'}`}>
                        {item.severity}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-neutral-400)' }}>-</span>
                    )}
                  </td>
                  <td style={{ color: 'var(--color-neutral-600)', fontSize: '13px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                    {item.hours_note || (item.hours_before || item.hours_after ? `${item.hours_before || 0} ชม. ก่อน-${item.hours_after || 0} ชม. หลัง` : '-')}
                  </td>
                  <td style={{ color: 'var(--color-neutral-500)', fontSize: '12.5px' }}>
                    {item.source_name || 'FDA 2024'}
                  </td>
                  <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                      <button
                        type="button"
                        title="แก้ไข"
                        onClick={() => onEdit(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#B87108',
                          borderRadius: '6px',
                          transition: 'opacity 0.15s, background-color 0.15s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(184, 113, 8, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        type="button"
                        title="ดูรายละเอียด"
                        onClick={() => onView(item)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#4DB06F',
                          borderRadius: '6px',
                          transition: 'opacity 0.15s, background-color 0.15s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(77, 176, 111, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        type="button"
                        title="ลบ"
                        onClick={() => onDeleteOne(item.id, item.medication_name)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ef4444',
                          borderRadius: '6px',
                          transition: 'opacity 0.15s, background-color 0.15s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PaginationFooter
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        summaryText={`แสดง ${totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0}-${Math.min(currentPage * pageSize, totalItems)} จาก ${totalItems} รายการ`}
      />
    </div>
  )
}
