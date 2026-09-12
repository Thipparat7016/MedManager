import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Eye, Edit, Trash2, X } from 'lucide-react'
import { dataService } from '../services/dataService'

export default function InteractionListPage() {
  const navigate = useNavigate()
  const [interactions, setInteractions] = useState([])
  const [filteredList, setFilteredList] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState('ทั้งหมด')
  const [typeFilter, setTypeFilter] = useState('ทั้งหมด')
  const [activePill, setActivePill] = useState('all') // 'all' | 'high' | 'medium' | 'caution' | 'recommend'

  // Selected for batch delete
  const [selectedIds, setSelectedIds] = useState([])

  // Modal view
  const [viewItem, setViewItem] = useState(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const list = await dataService.getInteractions()
    setInteractions(list)
    setFilteredList(list)
    setLoading(false)
  }

  const applyFilters = (pill = activePill, s = search, sev = severityFilter, typ = typeFilter) => {
    let res = [...interactions]

    if (s.trim()) {
      const q = s.toLowerCase()
      res = res.filter(i => 
        (i.medication_name && i.medication_name.toLowerCase().includes(q)) ||
        (i.food_name && i.food_name.toLowerCase().includes(q)) ||
        (i.code && i.code.toLowerCase().includes(q))
      )
    }

    if (sev !== 'ทั้งหมด') {
      res = res.filter(i => i.severity === sev)
    }

    if (typ !== 'ทั้งหมด') {
      res = res.filter(i => i.interaction_type === typ)
    }

    if (pill === 'high') {
      res = res.filter(i => i.severity === 'สูง')
    } else if (pill === 'medium') {
      res = res.filter(i => i.severity === 'กลาง')
    } else if (pill === 'caution') {
      res = res.filter(i => i.interaction_type === 'ข้อควรระวัง')
    } else if (pill === 'recommend') {
      res = res.filter(i => i.interaction_type === 'แนะนำ' || i.interaction_type === 'แนะนำให้รับประทานร่วม')
    }

    setFilteredList(res)
    setCurrentPage(1)
  }

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault()
    applyFilters(activePill, search, severityFilter, typeFilter)
  }

  const handlePillClick = (pill) => {
    setActivePill(pill)
    applyFilters(pill, search, severityFilter, typeFilter)
  }

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredList.map(i => i.id))
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
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลปฏิสัมพันธ์ "${name}"?`)) {
      await dataService.deleteInteraction(id)
      await loadData()
      setSelectedIds(prev => prev.filter(item => item !== id))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบปฏิสัมพันธ์ที่เลือกทั้งหมด ${selectedIds.length} รายการ?`)) {
      await dataService.deleteMultipleInteractions(selectedIds)
      setSelectedIds([])
      await loadData()
    }
  }

  const totalItems = filteredList.length
  const totalPages = Math.ceil(totalItems / pageSize) || 1
  const paginatedData = filteredList.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span>Admin</span>
        <span>&gt;</span>
        <span>ปฏิสัมพันธ์ยา-อาหาร</span>
      </div>

      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">ปฏิสัมพันธ์ยา-อาหาร</h1>
        <div className="page-actions">
          <Link to="/interactions/new" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} />
            <span>เพิ่มปฏิสัมพันธ์</span>
          </Link>
        </div>
      </div>

      {/* Filter Card */}
      <div className="card">
        <div className="card-title" style={{ fontSize: '14.5px', marginBottom: '14px' }}>ค้นหาและกรอง</div>
        <form onSubmit={handleSearchSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.2fr auto', gap: '14px', alignItems: 'flex-end' }}>
            <div>
              <label className="form-label">ค้นหา</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="ชื่อยา, ชื่ออาหาร..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: '34px' }}
                />
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: '#94a3b8' }} />
              </div>
            </div>

            <div>
              <label className="form-label">ความรุนแรง</label>
              <select 
                className="form-select"
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <option value="ทั้งหมด">ทั้งหมด</option>
                <option value="สูง">สูง</option>
                <option value="กลาง">กลาง</option>
                <option value="ต่ำ">ต่ำ</option>
              </select>
            </div>

            <div>
              <label className="form-label">ประเภท</label>
              <select 
                className="form-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="ทั้งหมด">ทั้งหมด</option>
                <option value="หลีกเลี่ยง">หลีกเลี่ยง</option>
                <option value="แนะนำ">แนะนำ</option>
                <option value="ข้อควรระวัง">ข้อควรระวัง</option>
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

      {/* Quick Filter Stat Pills (Row of 5 cards) */}
      <div className="quick-filter-row">
        <button 
          type="button" 
          className={`filter-pill-card ${activePill === 'all' ? 'active' : ''}`}
          onClick={() => handlePillClick('all')}
        >
          <span className="filter-pill-count">{interactions.length}</span>
          <span className="filter-pill-label">ทั้งหมด</span>
        </button>

        <button 
          type="button" 
          className={`filter-pill-card ${activePill === 'high' ? 'active' : ''}`}
          onClick={() => handlePillClick('high')}
        >
          <span className="filter-pill-count">{interactions.filter(i => i.severity === 'สูง').length}</span>
          <span className="filter-pill-label">หลีกเลี่ยง (สูง)</span>
        </button>

        <button 
          type="button" 
          className={`filter-pill-card ${activePill === 'medium' ? 'active' : ''}`}
          onClick={() => handlePillClick('medium')}
        >
          <span className="filter-pill-count">{interactions.filter(i => i.severity === 'กลาง').length}</span>
          <span className="filter-pill-label">หลีกเลี่ยง (กลาง)</span>
        </button>

        <button 
          type="button" 
          className={`filter-pill-card ${activePill === 'caution' ? 'active' : ''}`}
          onClick={() => handlePillClick('caution')}
        >
          <span className="filter-pill-count">{interactions.filter(i => i.interaction_type === 'ข้อควรระวัง').length}</span>
          <span className="filter-pill-label">ข้อควรระวัง</span>
        </button>

        <button 
          type="button" 
          className={`filter-pill-card ${activePill === 'recommend' ? 'active' : ''}`}
          onClick={() => handlePillClick('recommend')}
        >
          <span className="filter-pill-count">{interactions.filter(i => i.interaction_type === 'แนะนำ' || i.interaction_type === 'แนะนำให้รับประทานร่วม').length}</span>
          <span className="filter-pill-label">แนะนำ</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>
            ปฏิสัมพันธ์ทั้งหมด ({totalItems} รายการ)
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
                    checked={paginatedData.length > 0 && paginatedData.every(i => selectedIds.includes(i.id))}
                  />
                </th>
                <th style={{ width: '70px', textAlign: 'center' }}>#</th>
                <th style={{ width: '20%' }}>ชื่อยา (TH/EN)</th>
                <th style={{ width: '18%' }}>อาหาร/กลุ่มอาหาร</th>
                <th style={{ width: '16%' }}>ประเภท</th>
                <th style={{ width: '10%', textAlign: 'center' }}>ความรุนแรง</th>
                <th style={{ width: '14%' }}>ช่วงเวลางด</th>
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
                paginatedData.map((item) => (
                  <tr key={item.id}>
                    <td style={{ textAlign: 'center' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelectOne(item.id)}
                      />
                    </td>
                    <td style={{ color: '#64748b', textAlign: 'center' }}>{item.code || '001'}</td>
                    <td style={{ fontWeight: 500 }}>
                      {item.medication_name}
                    </td>
                    <td>{item.food_name}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{item.interaction_type}</td>
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span className={`badge-severity ${item.severity === 'สูง' ? 'high' : item.severity === 'ต่ำ' ? 'low' : 'medium'}`}>
                        {item.severity}
                      </span>
                    </td>
                    <td style={{ color: '#475569', fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {item.hours_note || `${item.hours_before || 2} ชม. ก่อน-${item.hours_after || 2} ชม. หลัง`}
                    </td>
                    <td style={{ color: '#64748b', fontSize: '12.5px' }}>
                      {item.source_name || 'FDA 2024'}
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '4px 10px', fontSize: '12px', height: '30px' }}
                          onClick={() => navigate(`/interactions/edit/${item.id}`)}
                        >
                          แก้ไข
                        </button>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '4px 10px', fontSize: '12px', height: '30px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => setViewItem(item)}
                        >
                          <Eye size={13} /> ดู
                        </button>
                        <button 
                          className="btn btn-danger-outline" 
                          style={{ padding: '4px 10px', fontSize: '12px', height: '30px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => handleDeleteOne(item.id, item.medication_name)}
                        >
                          <X size={13} /> ลบ
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
              <span style={{ padding: '0 4px', color: '#94a3b8' }}>...</span>
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

      {/* Interaction Detail Modal */}
      {viewItem && (
        <div className="modal-overlay" onClick={() => setViewItem(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">รายละเอียดปฏิสัมพันธ์: {viewItem.medication_name}</div>
              <button 
                onClick={() => setViewItem(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px', marginTop: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><strong>อาหาร/กลุ่มอาหาร:</strong> {viewItem.food_name}</div>
                <div><strong>ประเภท:</strong> {viewItem.interaction_type}</div>
                <div><strong>ความรุนแรง:</strong> {viewItem.severity}</div>
                <div><strong>ช่วงเวลางด:</strong> {viewItem.hours_note || `${viewItem.hours_before} ชม. ก่อน - ${viewItem.hours_after} ชม. หลัง`}</div>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>รายละเอียดผลกระทบ:</div>
                <div style={{ color: '#475569', fontSize: '13px', lineHeight: 1.6 }}>{viewItem.impact_details || '-'}</div>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>แหล่งอ้างอิง:</div>
                <div style={{ color: '#475569', fontSize: '13px' }}>
                  {viewItem.source_name} ({viewItem.source_type}) - {viewItem.publish_year}
                  {viewItem.url_doi && (
                    <div style={{ marginTop: '4px' }}>
                      <a href={viewItem.url_doi} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>
                        {viewItem.url_doi}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => setViewItem(null)}
              >
                ปิด
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  const id = viewItem.id
                  setViewItem(null)
                  navigate(`/interactions/edit/${id}`)
                }}
              >
                แก้ไขข้อมูลนี้
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
