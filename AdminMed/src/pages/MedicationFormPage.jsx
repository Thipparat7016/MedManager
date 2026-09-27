import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Check, Plus, Image as ImageIcon, Sparkles, Loader2, CheckCircle2, AlertCircle, Pill, Search } from 'lucide-react'
import { dataService } from '../services/dataService'
import { fetchDrugFromOpenFda, getDrugSuggestions, fetchMedicalEntity } from '../services/openFdaService'

export default function MedicationFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const dropdownRefEn = useRef(null)
  const dropdownRefTh = useRef(null)
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
  const [isFetchingFda, setIsFetchingFda] = useState(false)
  const [fdaSuccessMsg, setFdaSuccessMsg] = useState('')
  const [fdaErrorMsg, setFdaErrorMsg] = useState('')

  // Autocomplete dropdown state
  const [activeDropdownField, setActiveDropdownField] = useState(null) // 'name_en' | 'name_th' | null
  const [suggestions, setSuggestions] = useState([])
  const [highlightIndex, setHighlightIndex] = useState(-1)

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideEn = !dropdownRefEn.current || !dropdownRefEn.current.contains(event.target)
      const isOutsideTh = !dropdownRefTh.current || !dropdownRefTh.current.contains(event.target)
      if (isOutsideEn && isOutsideTh) {
        setActiveDropdownField(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAutoFill = async (overrideName, overrideCategory) => {
    const query = overrideName || formData.name_en || formData.name_th
    const category = overrideCategory || formData.category
    if (!query || !query.trim()) {
      setFdaErrorMsg('กรุณากรอกชื่อยาหรืออาหารเสริมก่อนกดดึงข้อมูล เช่น Paracetamol, Vitamin C, Fish Oil')
      setFdaSuccessMsg('')
      return
    }

    setIsFetchingFda(true)
    setFdaErrorMsg('')
    setFdaSuccessMsg('')
    try {
      const data = await fetchMedicalEntity(query.trim(), category)
      setFormData(prev => ({
        ...prev,
        name_en: data.name_en || prev.name_en,
        name_th: data.name_th || prev.name_th,
        type: data.type || prev.type,
        dosage: data.dosage || prev.dosage,
        unit: data.unit || prev.unit,
        category: data.category || prev.category,
        indications: data.indications || prev.indications,
        instructions: data.instructions || prev.instructions,
        precautions: data.precautions || prev.precautions,
      }))
      setFdaSuccessMsg(`ดึงข้อมูลสำเร็จจาก ${data.source}: ${data.name_en} ${data.name_th ? `(${data.name_th})` : ''}`)
    } catch (err) {
      console.warn('Auto-fill error:', err)
      setFdaErrorMsg(err.message || 'ไม่สามารถดึงข้อมูลได้')
    } finally {
      setIsFetchingFda(false)
    }
  }

  const handleSelectDrug = (item) => {
    setActiveDropdownField(null)
    setFormData(prev => ({
      ...prev,
      name_en: item.en,
      name_th: item.th,
      type: item.type || prev.type,
      dosage: item.dosage || prev.dosage,
      unit: item.unit || prev.unit,
      category: item.category || prev.category
    }))
    handleAutoFill(item.key || item.en || item.th, item.category)
  }

  const handleEnglishNameChange = (e) => {
    const val = e.target.value
    setFormData(prev => ({ ...prev, name_en: val }))
    setSuggestions(getDrugSuggestions(val, formData.category))
    setActiveDropdownField('name_en')
    setHighlightIndex(-1)
  }

  const handleThaiNameChange = (e) => {
    const val = e.target.value
    setFormData(prev => ({ ...prev, name_th: val }))
    setSuggestions(getDrugSuggestions(val, formData.category))
    setActiveDropdownField('name_th')
    setHighlightIndex(-1)
  }

  const handleKeyDown = (e, field) => {
    if (activeDropdownField !== field || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleAutoFill()
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
        handleSelectDrug(suggestions[highlightIndex])
      } else {
        setActiveDropdownField(null)
        handleAutoFill()
      }
    } else if (e.key === 'Escape') {
      setActiveDropdownField(null)
    }
  }

  const renderDropdownMenu = (field) => {
    if (activeDropdownField !== field || suggestions.length === 0) return null

    const currentQuery = field === 'name_en' ? formData.name_en : formData.name_th

    return (
      <div 
        style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          backgroundColor: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.15), 0 4px 12px -2px rgba(0, 0, 0, 0.08)',
          zIndex: 100,
          overflow: 'hidden'
        }}
      >
        <div style={{
          padding: '8px 14px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11.5px',
          color: '#475569',
          fontWeight: 600
        }}>
          <span style={{ fontSize: '11px', color: '#64748b' }}>{suggestions.length} รายการ</span>
        </div>

        <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
          {suggestions.map((item, idx) => (
            <div
              key={item.en + idx}
              onMouseDown={(e) => {
                e.preventDefault()
                handleSelectDrug(item)
              }}
              onMouseEnter={() => setHighlightIndex(idx)}
              style={{
                padding: '10px 14px',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                backgroundColor: highlightIndex === idx ? '#f0f9ff' : '#ffffff',
                borderBottom: '1px solid #f1f5f9',
                transition: 'background-color 0.1s ease'
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#0f172a', lineHeight: '1.4' }}>
                {field === 'name_th' ? item.th : item.en}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4', marginTop: '2px' }}>
                {field === 'name_th' ? item.en : item.th}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }



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
    if (name === 'category') {
      const q = activeDropdownField === 'name_en' ? formData.name_en : formData.name_th
      setSuggestions(getDrugSuggestions(q, value))
    }
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
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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

      {/* openFDA Status Alerts */}
          {fdaSuccessMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              backgroundColor: '#ecfdf5',
              color: '#065f46',
              border: '1px solid #a7f3d0',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '13.5px',
              fontWeight: 500,
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}>
              <CheckCircle2 size={18} style={{ color: '#059669', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>{fdaSuccessMsg}</div>
            </div>
          )}

          {fdaErrorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              backgroundColor: '#fff1f2',
              color: '#9f1239',
              border: '1px solid #fecdd3',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '13.5px',
              fontWeight: 500,
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}>
              <AlertCircle size={18} style={{ color: '#e11d48', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>{fdaErrorMsg}</div>
            </div>
          )}

          {/* Section 1: ข้อมูลพื้นฐาน */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div className="card-title" style={{ marginBottom: 0 }}>ส่วนที่ 1 — ข้อมูลพื้นฐาน</div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
              {/* Thai Name with Autocomplete Dropdown */}
              <div className="form-group" style={{ marginBottom: 0, position: 'relative' }} ref={dropdownRefTh}>
                <label className="form-label">
                  {formData.category === 'อาหารเสริม' ? 'ชื่ออาหารเสริม (ภาษาไทย)' : 'ชื่อยา (ภาษาไทย)'} <span className="required">*</span>
                </label>
                <input 
                  type="text" 
                  name="name_th"
                  className="form-input" 
                  placeholder={formData.category === 'อาหารเสริม' ? 'เช่น วิตามินซี, น้ำมันปลา, คอลลาเจน, ซิงค์' : 'เช่น พาราเซตามอล, ทิฟฟี่, แอสไพริน'}
                  value={formData.name_th}
                  onChange={handleThaiNameChange}
                  onFocus={() => {
                    setActiveDropdownField('name_th')
                    setSuggestions(getDrugSuggestions(formData.name_th, formData.category))
                  }}
                  onClick={() => {
                    setActiveDropdownField('name_th')
                    setSuggestions(getDrugSuggestions(formData.name_th, formData.category))
                  }}
                  onKeyDown={(e) => handleKeyDown(e, 'name_th')}
                  autoComplete="off"
                  required
                />
                {renderDropdownMenu('name_th')}
              </div>

              {/* English Name with Autocomplete Dropdown */}
              <div className="form-group" style={{ marginBottom: 0, position: 'relative' }} ref={dropdownRefEn}>
                <label className="form-label">
                  {formData.category === 'อาหารเสริม' ? 'ชื่ออาหารเสริม (ภาษาอังกฤษ)' : 'ชื่อยา (ภาษาอังกฤษ)'} <span className="required">*</span>
                </label>
                <input 
                  type="text" 
                  name="name_en"
                  className="form-input" 
                  placeholder={formData.category === 'อาหารเสริม' ? 'เช่น Vitamin C, Fish Oil, Collagen, Zinc' : 'เช่น Paracetamol, Metformin, Aspirin'}
                  value={formData.name_en}
                  onChange={handleEnglishNameChange}
                  onFocus={() => {
                    setActiveDropdownField('name_en')
                    setSuggestions(getDrugSuggestions(formData.name_en, formData.category))
                  }}
                  onClick={() => {
                    setActiveDropdownField('name_en')
                    setSuggestions(getDrugSuggestions(formData.name_en, formData.category))
                  }}
                  onKeyDown={(e) => handleKeyDown(e, 'name_en')}
                  autoComplete="off"
                  required
                />
                {renderDropdownMenu('name_en')}
              </div>

              {/* Category (moved to 3rd column) */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  หมวดหมู่ <span className="required">*</span>
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  {formData.category === 'อาหารเสริม' ? 'รูปแบบ / ประเภท' : 'ประเภทยา'} <span className="required">*</span>
                </label>
                <select 
                  name="type"
                  className="form-select"
                  value={formData.type === 'ยาเม็ด' ? 'เม็ด' : formData.type}
                  onChange={handleChange}
                >
                  <option value="เม็ด">{formData.category === 'อาหารเสริม' ? 'เม็ด' : 'ยาเม็ด'}</option>
                  <option value="แคปซูล">แคปซูล</option>
                  <option value="ยาน้ำ">ยาน้ำ</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  {formData.category === 'อาหารเสริม' ? 'ขนาด / ปริมาณ' : 'ขนาดยา'} <span className="required">*</span>
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

          {/* Section 2: คำแนะนำการใช้ยา / อาหารเสริม */}
          <div className="card">
            <div className="card-title">
              {formData.category === 'อาหารเสริม' ? 'ส่วนที่ 2 — คำแนะนำการรับประทาน / ข้อมูลอาหารเสริม' : 'ส่วนที่ 2 — คำแนะนำการใช้ยา'}
            </div>

            <div className="form-group">
              <label className="form-label">
                {formData.category === 'อาหารเสริม' ? 'สรรพคุณ' : 'สรรพคุณ'} <span className="required">*</span>
              </label>
              <textarea 
                name="indications"
                className="form-textarea"
                placeholder={formData.category === 'อาหารเสริม' ? 'อธิบายประโยชน์หลักของอาหารเสริม เช่น เสริมสร้างภูมิคุ้มกัน ต้านอนุมูลอิสระ บำรุงผิวพรรณ...' : 'อธิบายการใช้งานหลักของยา เช่น ลดไข้ ลดปวด...'}
                value={formData.indications}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                วิธีรับประทาน / ข้อแนะนำ
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
                {formData.category === 'อาหารเสริม' ? 'ข้อควรระวังและคำเตือน' : 'ข้อควรระวังและผลข้างเคียง'}
              </label>
              <textarea 
                name="precautions"
                className="form-textarea"
                placeholder={formData.category === 'อาหารเสริม' ? 'ผู้ที่ไม่ควรรับประทาน คำเตือน หรือข้อควรระวังในการใช้ร่วมกับยา...' : 'ผู้ที่ไม่ควรใช้ยานี้ หรือผลข้างเคียงที่พบบ่อย...'}
                value={formData.precautions}
                onChange={handleChange}
              />
            </div>
          </div>
    </div>
  )
}
