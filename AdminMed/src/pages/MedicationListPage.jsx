import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Eye, Edit, Trash2, X } from 'lucide-react'
import { dataService } from '../services/dataService'

export default function MedicationListPage() {
  const navigate = useNavigate()
  const [medications, setMedications] = useState([])
  const [filteredMedications, setFilteredMedications] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ทั้งหมด')
  const [categoryFilter, setCategoryFilter] = useState('ทั้งหมด')

  // Selected for batch delete
  const [selectedIds, setSelectedIds] = useState([])

  // Modal view
  const [viewMed, setViewMed] = useState(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  useEffect(() => {
    loadMedications()
  }, [])

  const loadMedications = async () => {
    setLoading(true)
    const list = await dataService.getMedications()

    // เรียงตามเวลาที่สร้าง จากเก่าไปใหม่ (ข้อมูลที่เพิ่มทีหลังจะไปต่อท้ายเสมอ ไม่มาแทรกตรงกลาง)
    const sortedList = [...list].sort((a, b) => {
      const timeA = new Date(a.created_at || 0).getTime()
      const timeB = new Date(b.created_at || 0).getTime()
      if (timeA !== timeB) return timeA - timeB
      return String(a.id || '').localeCompare(String(b.id || ''))
    })

    setMedications(sortedList)
    setFilteredMedications(sortedList)
    setLoading(false)
  }

  const handleSearch = (e) => {
    if (e) e.preventDefault()
    let res = [...medications]
    if (search.trim()) {
      const q = search.toLowerCase()
      res = res.filter(m =>
        (m.name_th && m.name_th.toLowerCase().includes(q)) ||
        (m.name_en && m.name_en.toLowerCase().includes(q)) ||
        (m.code && m.code.toLowerCase().includes(q))
      )
    }
    if (typeFilter !== 'ทั้งหมด') {
      res = res.filter(m => m.type === typeFilter || (typeFilter === 'เม็ด' && m.type === 'ยาเม็ด') || (typeFilter === 'ยาเม็ด' && m.type === 'เม็ด'))
    }
    if (categoryFilter !== 'ทั้งหมด') {
      res = res.filter(m => m.category === categoryFilter)
    }
    setFilteredMedications(res)
    setCurrentPage(1)
  }

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredMedications.map(m => m.id))
    } else {
      setSelectedIds([])
    }
  }

  const toggleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const handleDeleteOne = async (id, name) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบยา "${name}"?`)) {
      await dataService.deleteMedication(id)
      await loadMedications()
      setSelectedIds(prev => prev.filter(item => item !== id))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบยาที่เลือกทั้งหมด ${selectedIds.length} รายการ?`)) {
      await dataService.deleteMultipleMedications(selectedIds)
      setSelectedIds([])
      await loadMedications()
    }
  }

  // Slice for current page
  const totalItems = filteredMedications.length
  const totalPages = Math.ceil(totalItems / pageSize) || 1
  const paginatedData = filteredMedications.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">ข้อมูลยาพื้นฐาน</h1>
        <div className="page-actions">
          <Link to="/medications/new" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} />
            <span>เพิ่มยาใหม่</span>
          </Link>
        </div>
      </div>

      {/* Filter Card */}
      <div className="card">
        <form onSubmit={handleSearch}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.2fr auto', gap: '14px', alignItems: 'flex-end' }}>
            <div>
              <label className="form-label">ค้นหา</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="ชื่อยา,อาหารเสริม"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: '34px' }}
                />
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: '#94a3b8' }} />
              </div>
            </div>

            <div>
              <label className="form-label">ประเภทยา</label>
              <select
                className="form-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="ทั้งหมด">ทั้งหมด</option>
                <option value="เม็ด">ยาเม็ด</option>
                <option value="แคปซูล">แคปซูล</option>
                <option value="ยาน้ำ">ยาน้ำ</option>
              </select>
            </div>

            <div>
              <label className="form-label">หมวดหมู่</label>
              <select
                className="form-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="ทั้งหมด">ทั้งหมด</option>
                <option value="ยา">ยา</option>
                <option value="อาหารเสริม">อาหารเสริม</option>
              </select>
            </div>

            <div>
              <button type="submit" className="btn btn-primary" style={{ height: '41px', padding: '0 24px' }}>
                ค้นหา
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Table Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>
            ยาทั้งหมด ({totalItems} รายการ)
          </div>
          {selectedIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
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
                    onChange={toggleSelectAll}
                    checked={paginatedData.length > 0 && paginatedData.every(m => selectedIds.includes(m.id))}
                  />
                </th>
                <th style={{ width: '80px', textAlign: 'center' }}>ID</th>
                <th style={{ width: '32%' }}>ชื่อยา (TH/EN)</th>
                <th style={{ width: '15%', textAlign: 'center' }}>ประเภท</th>
                <th style={{ width: '15%', textAlign: 'center'   }}>ขนาด</th>
                <th style={{ width: '15%', textAlign: 'center' }}>หมวดหมู่</th>
                <th style={{ width: '190px', textAlign: 'center' }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    ไม่พบข้อมูลยาในระบบ (กดปุ่ม "เพิ่มยาใหม่" เพื่อเพิ่มข้อมูล)
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <tr key={item.id}>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelectOne(item.id)}
                      />
                    </td>
                    <td style={{ color: 'var(--color-neutral-500)', textAlign: 'center' }}>
                      {String((currentPage - 1) * pageSize + index + 1).padStart(3, '0')}
                    </td>
                    <td>
                      {item.name_th} {item.name_en ? `/ ${item.name_en}` : ''}
                    </td>
                    <td style={{ textAlign: 'center' }}>{item.type}</td>
                    <td style={{ textAlign: 'center' }}>{item.dosage} {item.unit}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={item.category === 'ยา' ? 'pill-chip-purple' : 'pill-chip-amber'}>
                        {item.category}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                        <button
                          type="button"
                          title="แก้ไข"
                          onClick={() => navigate(`/medications/edit/${item.id}`)}
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
                          onClick={() => setViewMed(item)}
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
                          onClick={() => handleDeleteOne(item.id, item.name_th)}
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

        {/* Footer & Pagination */}
        <div className="table-footer">
          <div>
            แสดง {totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(currentPage * pageSize, totalItems)} จาก {totalItems} รายการ
          </div>
          <div className="pagination">
            <button
              className="page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              &lt;
            </button>
            <button
              className={`page-btn ${currentPage === 1 ? 'active' : ''}`}
              onClick={() => setCurrentPage(1)}
            >
              1
            </button>
            {totalPages >= 2 && (
              <button
                className={`page-btn ${currentPage === 2 ? 'active' : ''}`}
                onClick={() => setCurrentPage(2)}
              >
                2
              </button>
            )}
            {totalPages >= 3 && (
              <button
                className={`page-btn ${currentPage === 3 ? 'active' : ''}`}
                onClick={() => setCurrentPage(3)}
              >
                3
              </button>
            )}
            {totalPages > 3 && (
              <span style={{ padding: '0 4px', color: 'var(--color-neutral-400)' }}>...</span>
            )}
            <button
              className="page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Medication Detail Modal */}
      {viewMed && (
        <div className="modal-overlay" onClick={() => setViewMed(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">รายละเอียดข้อมูลยา: {viewMed.name_th} ({viewMed.name_en})</div>
              <button
                onClick={() => setViewMed(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-neutral-400)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px', marginTop: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><strong>รหัสยา:</strong> {viewMed.code}</div>
                <div><strong>หมวดหมู่:</strong> {viewMed.category}</div>
                <div><strong>ประเภทยา:</strong> {viewMed.type}</div>
                <div><strong>ขนาดยา:</strong> {viewMed.dosage} {viewMed.unit}</div>
              </div>
              <div style={{ borderTop: '1px solid var(--color-neutral-100)', paddingTop: '10px' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-neutral-800)', marginBottom: '4px' }}>ข้อบ่งใช้ (Indications):</div>
                <div style={{ color: 'var(--color-neutral-600)', fontSize: '13.5px' }}>{viewMed.indications || '-'}</div>
              </div>
              <div style={{ borderTop: '1px solid var(--color-neutral-100)', paddingTop: '10px' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-neutral-800)', marginBottom: '4px' }}>วิธีรับประทาน / คำแนะนำ (Instructions):</div>
                <div style={{ color: 'var(--color-neutral-600)', fontSize: '13.5px' }}>{viewMed.instructions || '-'}</div>
              </div>
              <div style={{ borderTop: '1px solid var(--color-neutral-100)', paddingTop: '10px' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-neutral-800)', marginBottom: '4px' }}>ข้อควรระวังและผลข้างเคียง (Precautions):</div>
                <div style={{ color: 'var(--color-neutral-600)', fontSize: '13.5px' }}>{viewMed.precautions || '-'}</div>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setViewMed(null)}
              >
                ปิด
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  const id = viewMed.id
                  setViewMed(null)
                  navigate(`/medications/edit/${id}`)
                }}
              >
                แก้ไขยานี้
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
