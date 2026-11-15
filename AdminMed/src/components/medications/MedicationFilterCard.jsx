import React from 'react'
import SearchableMedicationDropdown from '../common/SearchableMedicationDropdown'

export default function MedicationFilterCard({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  onSubmit,
  medications = [],
  onSelectMedication
}) {
  return (
    <div className="card">
      <form onSubmit={onSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.2fr auto', gap: '14px', alignItems: 'flex-end' }}>
          <div>
            <label className="form-label">ค้นหาชื่อยา / อาหารเสริม</label>
            <SearchableMedicationDropdown
              value={search}
              onChange={onSearchChange}
              onSelect={(item) => {
                const val = item ? item.th : ''
                if (onSelectMedication) {
                  onSelectMedication(val)
                } else {
                  onSearchChange(val)
                }
              }}
              items={medications}
              placeholder="เลือกหรือพิมพ์ค้นหาชื่อยา, อาหารเสริม..."
            />
          </div>

          <div>
            <label className="form-label">ประเภทยา</label>
            <select
              className="form-select"
              value={typeFilter}
              onChange={(e) => onTypeFilterChange(e.target.value)}
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
              onChange={(e) => onCategoryFilterChange(e.target.value)}
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
  )
}
