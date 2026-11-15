import React, { useMemo } from 'react'
import SearchableMedicationDropdown from '../common/SearchableMedicationDropdown'

export default function InteractionFilterCard({
  search,
  onSearchChange,
  severityFilter,
  onSeverityFilterChange,
  typeFilter,
  onTypeFilterChange,
  onSubmit,
  medications = [],
  interactions = [],
  onSelectMedication
}) {
  const combinedItems = useMemo(() => {
    const list = [...medications]
    interactions.forEach(inter => {
      if (inter.medication_name && !list.some(m => (m.name_th || m.th) === inter.medication_name)) {
        list.push({
          id: inter.id,
          name_th: inter.medication_name,
          category: inter.medication_name.includes('อาหารเสริม') || inter.medication_name.includes('คอมเพล็กซ์') ? 'อาหารเสริม' : 'ยา'
        })
      }
    })
    return list
  }, [medications, interactions])

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
              items={combinedItems}
              placeholder="เลือกหรือพิมพ์ค้นหาชื่อยา, อาหาร..."
            />
          </div>

          <div>
            <label className="form-label">ความรุนแรง</label>
            <select
              className="form-select"
              value={severityFilter}
              onChange={(e) => onSeverityFilterChange(e.target.value)}
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
              onChange={(e) => onTypeFilterChange(e.target.value)}
            >
              <option value="ทั้งหมด">ทั้งหมด</option>
              <option value="หลีกเลี่ยง">หลีกเลี่ยง</option>
              <option value="แนะนำ">แนะนำ</option>
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
