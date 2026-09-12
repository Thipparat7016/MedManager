import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { dataService } from '../services/dataService'

export default function InteractionFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [medications, setMedications] = useState([])
  const [formData, setFormData] = useState({
    medication_name: '',
    food_name: '',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '2',
    hours_after: '2',
    impact_details: '',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: '',
    url_doi: '',
    publish_year: '2024'
  })

  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    loadMedications()
    if (isEditing) {
      loadInteraction()
    }
  }, [id])

  const loadMedications = async () => {
    const list = await dataService.getMedications()
    setMedications(list)
    if (!isEditing && list.length > 0 && !formData.medication_name) {
      setFormData(prev => ({ ...prev, medication_name: list[0].name_th }))
    }
  }

  const loadInteraction = async () => {
    const item = await dataService.getInteractionById(id)
    if (item) {
      setFormData({
        id: item.id,
        medication_name: item.medication_name || '',
        food_name: item.food_name || '',
        interaction_type: item.interaction_type || 'หลีกเลี่ยง',
        severity: item.severity || 'สูง',
        hours_before: item.hours_before?.toString() || '2',
        hours_after: item.hours_after?.toString() || '2',
        impact_details: item.impact_details || '',
        source_type: item.source_type || '',
        source_name: item.source_name || '',
        url_doi: item.url_doi || '',
        publish_year: item.publish_year || ''
      })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!formData.medication_name.trim() || !formData.food_name.trim() || !formData.impact_details.trim() || !formData.source_name.trim()) {
      setErrorMsg('กรุณากรอกข้อมูลที่จำเป็น (*) ให้ครบถ้วน')
      return
    }

    setSaving(true)
    setErrorMsg('')
    try {
      await dataService.saveInteraction(formData)
      setSuccessMsg('บันทึกข้อมูลปฏิสัมพันธ์สำเร็จแล้ว!')
      setTimeout(() => {
        navigate('/interactions')
      }, 800)
    } catch (err) {
      console.error('Save interaction error:', err)
      setErrorMsg(err?.message ? `เกิดข้อผิดพลาดจาก Supabase: ${err.message}` : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">เพิ่ม / แก้ไข ปฏิสัมพันธ์ยา-อาหาร</h1>
        <div className="page-actions">
          <button 
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate('/dashboard')}
          >
            ยกเลิก
          </button>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Check size={16} />
            <span>{saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: 'var(--color-danger-50)', color: 'var(--color-danger-700)', border: '1px solid var(--color-danger-100)', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '13.5px' }}>
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: 'var(--color-success-50)', color: 'var(--color-success-700)', border: '1px solid var(--color-success-100)', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '13.5px' }}>
          {successMsg}
        </div>
      )}

      {/* Card 1: ข้อมูลหลัก */}
      <div className="card">
        <div className="card-title">ข้อมูลหลัก</div>

        {/* Row 1: ชื่อยา + ชื่ออาหาร */}
        <div className="form-row" style={{ marginBottom: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              ชื่อยา <span className="required">*</span>
            </label>
            <select
              name="medication_name"
              className="form-select"
              value={formData.medication_name}
              onChange={handleChange}
            >
              <option value="">เลือกยาจากระบบ</option>
              {medications.map(m => (
                <option key={m.id} value={m.name_th}>
                  {m.name_th} ({m.name_en}) - {m.dosage} {m.unit}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              ชื่ออาหาร / กลุ่มอาหาร <span className="required">*</span>
            </label>
            <input 
              type="text" 
              name="food_name"
              className="form-input" 
              placeholder="เช่น น้ำผลไม้ส้ม, แอลกอฮอล์"
              value={formData.food_name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Row 2: ประเภทปฏิสัมพันธ์ (Segmented control) */}
        <div className="form-group">
          <label className="form-label">
            ประเภทปฏิสัมพันธ์ <span className="required">*</span>
          </label>
          <div className="segmented-group">
            {['หลีกเลี่ยง', 'แนะนำให้รับประทานร่วม', 'ข้อควรระวัง'].map((type) => (
              <button
                key={type}
                type="button"
                className={`segment-btn ${formData.interaction_type === type ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, interaction_type: type }))}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Row 3: ความรุนแรง (Segmented control) */}
        <div className="form-group">
          <label className="form-label">
            ความรุนแรง <span className="required">*</span>
          </label>
          <div className="segmented-group">
            {['สูง', 'กลาง', 'ต่ำ'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                className={`segment-btn ${formData.severity === lvl ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, severity: lvl }))}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Row 4: งดก่อน / งดหลัง */}
        <div className="form-row" style={{ marginBottom: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">งดก่อนรับประทานยา (ชั่วโมง)</label>
            <input 
              type="number" 
              name="hours_before"
              className="form-input" 
              placeholder="เช่น 2"
              value={formData.hours_before}
              onChange={handleChange}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">งดหลังรับประทานยา (ชั่วโมง)</label>
            <input 
              type="number" 
              name="hours_after"
              className="form-input" 
              placeholder="เช่น 2"
              value={formData.hours_after}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Row 5: รายละเอียดผลกระทบ */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">
            รายละเอียดผลกระทบ <span className="required">*</span>
          </label>
          <textarea 
            name="impact_details"
            className="form-textarea"
            placeholder="อธิบายอันตรายที่อาจเกิดขึ้นกับผู้ป่วย..."
            value={formData.impact_details}
            onChange={handleChange}
            style={{ minHeight: '110px' }}
            required
          />
        </div>
      </div>

      {/* Card 2: แหล่งอ้างอิง */}
      <div className="card">
        <div className="card-title">แหล่งอ้างอิง (บังคับ 1 แหล่งขึ้นไป)</div>

        <div className="form-row" style={{ marginBottom: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">ประเภทแหล่งที่มา</label>
            <input 
              type="text" 
              name="source_type"
              className="form-input" 
              placeholder="FDA / WHO / PubMed / Thai FDA"
              value={formData.source_type}
              onChange={handleChange}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              ชื่อแหล่งอ้างอิง <span className="required">*</span>
            </label>
            <input 
              type="text" 
              name="source_name"
              className="form-input" 
              placeholder="FDA Drug Interaction Database"
              value={formData.source_name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">URL / DOI</label>
            <input 
              type="text" 
              name="url_doi"
              className="form-input" 
              placeholder="https://..."
              value={formData.url_doi}
              onChange={handleChange}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">ปีที่เผยแพร่</label>
            <input 
              type="text" 
              name="publish_year"
              className="form-input" 
              placeholder="2024"
              value={formData.publish_year}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
