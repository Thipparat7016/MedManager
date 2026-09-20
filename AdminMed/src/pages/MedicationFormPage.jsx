import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Check, Plus, Image as ImageIcon } from 'lucide-react'
import { dataService } from '../services/dataService'

export default function MedicationFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const isEditing = Boolean(id)

  const [formData, setFormData] = useState({
    name_th: '',
    name_en: '',
    type: 'เม็ด',
    dosage: '',
    unit: 'mg',
    category: 'ยา',
    indications: '',
    instructions: '',
    precautions: '',
    image_url: ''
  })

  const [imagePreview, setImagePreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (isEditing) {
      loadMedication()
    }
  }, [id])

  const loadMedication = async () => {
    const med = await dataService.getMedicationById(id)
    if (med) {
      setFormData({
        id: med.id,
        code: med.code,
        name_th: med.name_th || '',
        name_en: med.name_en || '',
        type: med.type || 'เม็ด',
        dosage: med.dosage || '',
        unit: med.unit || 'mg',
        category: med.category || 'ยา',
        indications: med.indications || '',
        instructions: med.instructions || '',
        precautions: med.precautions || '',
        image_url: med.image_url || ''
      })
      if (med.image_url) {
        setImagePreview(med.image_url)
      }
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
        setFormData(prev => ({ ...prev, image_url: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!formData.name_th.trim() || !formData.name_en.trim() || !formData.dosage.trim()) {
      setErrorMsg('กรุณากรอกข้อมูลที่จำเป็น (*) ให้ครบถ้วน')
      return
    }

    setSaving(true)
    setErrorMsg('')
    try {
      await dataService.saveMedication(formData)
      navigate('/medications')
    } catch (err) {
      console.error('Save medication error:', err)
      setErrorMsg(err?.message ? `เกิดข้อผิดพลาดจาก Supabase: ${err.message}` : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">เพิ่ม / แก้ไขข้อมูลยา</h1>
        <div className="page-actions">
          <button 
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate('/medications')}
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

      {/* Main Grid: Form Left (2fr) + Image Upload Right (1fr) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'start' }}>
        
        {/* Left Form Column */}
        <div>
          {/* Section 1: ข้อมูลพื้นฐาน */}
          <div className="card">
            <div className="card-title">ส่วนที่ 1 — ข้อมูลพื้นฐาน</div>
            
            <div className="form-row" style={{ marginBottom: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  ชื่อยา (ภาษาไทย) <span className="required">*</span>
                </label>
                <input 
                  type="text" 
                  name="name_th"
                  className="form-input" 
                  placeholder="เช่น แอสไพริน"
                  value={formData.name_th}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Drug Name (English) <span className="required">*</span>
                </label>
                <input 
                  type="text" 
                  name="name_en"
                  className="form-input" 
                  placeholder="e.g. Aspirin"
                  value={formData.name_en}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  ประเภทยา <span className="required">*</span>
                </label>
                <select 
                  name="type"
                  className="form-select"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="เม็ด">เม็ด</option>
                  <option value="แคปซูล">แคปซูล</option>
                  <option value="ยาน้ำ">ยาน้ำ</option>
                  <option value="ผง">ผง</option>
                  <option value="ฉีด">ฉีด</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  ขนาดยา <span className="required">*</span>
                </label>
                <input 
                  type="text" 
                  name="dosage"
                  className="form-input" 
                  placeholder="เช่น 100, 500"
                  value={formData.dosage}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  หน่วย <span className="required">*</span>
                </label>
                <input 
                  type="text" 
                  name="unit"
                  className="form-input" 
                  placeholder="mg / ml / IU / g"
                  value={formData.unit}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: หมวดหมู่ */}
          <div className="card">
            <div className="card-title">ส่วนที่ 2 — หมวดหมู่</div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                หมวดหมู่ยา <span className="required">*</span>
              </label>
              <select 
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="ยา">ยา</option>
                <option value="อาหารเสริม">อาหารเสริม</option>
              </select>
            </div>
          </div>

          {/* Section 3: คำแนะนำการใช้ยา */}
          <div className="card">
            <div className="card-title">ส่วนที่ 3 — คำแนะนำการใช้ยา</div>

            <div className="form-group">
              <label className="form-label">
                ข้อบ่งใช้ (Indications) <span className="required">*</span>
              </label>
              <textarea 
                name="indications"
                className="form-textarea"
                placeholder="อธิบายการใช้งานหลักของยา เช่น ลดไข้ ลดปวด..."
                value={formData.indications}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                วิธีรับประทาน / ข้อแนะนำ (Instructions)
              </label>
              <textarea 
                name="instructions"
                className="form-textarea"
                placeholder="ก่อน/หลังอาหาร — จำนวน — ความถี่..."
                value={formData.instructions}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                ข้อควรระวังและผลข้างเคียง
              </label>
              <textarea 
                name="precautions"
                className="form-textarea"
                placeholder="ผู้ที่ไม่ควรใช้ยานี้ หรือผลข้างเคียงที่พบบ่อย..."
                value={formData.precautions}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Right Column: รูปภาพยา */}
        <div>
          <div className="card">
            <div className="card-title">รูปภาพยา</div>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: 'none' }}
            />

            <div 
              className="image-upload-box" 
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Medication preview" />
              ) : (
                <>
                  <div style={{ width: '42px', height: '32px', border: '1.5px dashed var(--color-primary-300)', borderRadius: 'var(--radius-xs)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-primary-50)' }}>
                    <ImageIcon size={18} color="var(--color-primary-500)" />
                  </div>
                  <span style={{ color: 'var(--color-neutral-400)', fontSize: '12.5px' }}>อัปโหลดรูปภาพยา</span>
                </>
              )}
            </div>

            <button 
              type="button"
              className="btn btn-secondary" 
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus size={16} />
              <span>เลือกรูปภาพ</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
