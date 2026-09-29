import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Check, AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react'
import { dataService } from '../services/dataService'
import { getInteractionsForMedication } from '../services/foodInteractionService'

export default function InteractionFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [medications, setMedications] = useState([])
  const [formData, setFormData] = useState({
    medication_name: '',
    food_name: '',
    interaction_type: '',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: '',
    source_type: '',
    source_name: '',
    url_doi: '',
    publish_year: ''
  })

  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [autoFillSuccess, setAutoFillSuccess] = useState('')

  // Medication dropdown autocomplete states
  const [medSuggestions, setMedSuggestions] = useState([])
  const [showMedDropdown, setShowMedDropdown] = useState(false)
  const [medHighlightIndex, setMedHighlightIndex] = useState(-1)
  const medDropdownRef = useRef(null)

  // Food dropdown autocomplete states
  const [foodSuggestions, setFoodSuggestions] = useState([])
  const [showFoodDropdown, setShowFoodDropdown] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const foodDropdownRef = useRef(null)

  useEffect(() => {
    loadMedications()
    if (isEditing) {
      loadInteraction()
    }
  }, [id])

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (foodDropdownRef.current && !foodDropdownRef.current.contains(e.target)) {
        setShowFoodDropdown(false)
      }
      if (medDropdownRef.current && !medDropdownRef.current.contains(e.target)) {
        setShowMedDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const getAvailableMedicationSuggestions = (query = '') => {
    const q = query.trim().toLowerCase()

    const dbItems = medications
      .filter(m => m.name_th || m.th)
      .map(m => ({
        key: m.id || m.name_en || m.name_th,
        th: m.name_th || m.th,
        en: m.name_en || m.en || '',
        category: m.category || 'ยา',
        dosage: m.dosage,
        unit: m.unit,
        type: m.type
      }))

    if (!q) return dbItems

    return dbItems.filter(item => 
      (item.th && item.th.toLowerCase().includes(q)) || 
      (item.en && item.en.toLowerCase().includes(q)) || 
      (item.category && item.category.toLowerCase().includes(q))
    )
  }

  const updateFoodSuggestions = (medName, filterText = '', medList = medications) => {
    if (!medName) {
      setFoodSuggestions([])
      return
    }
    const medObj = medList.find(m => m.name_th === medName || m.name_en === medName || m.th === medName)
    const searchQuery = medObj
      ? `${medObj.name_th || medObj.th || ''} ${medObj.name_en || medObj.en || ''} ${medObj.generic_name || ''}`
      : medName

    let matches = getInteractionsForMedication(searchQuery)
    if (filterText && filterText.trim()) {
      const q = filterText.trim().toLowerCase()
      matches = matches.filter(item => 
        item.food_name.toLowerCase().includes(q) || 
        item.interaction_type.toLowerCase().includes(q)
      )
    }
    setFoodSuggestions(matches)
    setHighlightIndex(-1)
  }

  const loadMedications = async () => {
    const list = await dataService.getMedications()
    setMedications(list)
  }

  const loadInteraction = async () => {
    const item = await dataService.getInteractionById(id)
    if (item) {
      setFormData({
        id: item.id,
        medication_name: item.medication_name || '',
        food_name: item.food_name || '',
        interaction_type: item.interaction_type || 'หลีกเลี่ยง',
        severity: item.severity || '',
        hours_before: item.hours_before?.toString() || '',
        hours_after: item.hours_after?.toString() || '',
        impact_details: item.impact_details || '',
        source_type: item.source_type || '',
        source_name: item.source_name || '',
        url_doi: item.url_doi || '',
        publish_year: item.publish_year || ''
      })
      if (item.medication_name) {
        updateFoodSuggestions(item.medication_name, '', medications)
      }
    }
  }

  const handleMedInputChange = (e) => {
    const val = e.target.value
    setFormData(prev => ({ 
      ...prev, 
      medication_name: val,
      food_name: '' 
    }))
    setMedSuggestions(getAvailableMedicationSuggestions(val))
    setShowMedDropdown(true)
    setMedHighlightIndex(-1)
    updateFoodSuggestions(val, '')
  }

  const handleMedInputFocus = () => {
    setMedSuggestions(getAvailableMedicationSuggestions(''))
    setShowMedDropdown(true)
    setMedHighlightIndex(-1)
  }

  const handleSelectMedication = (item) => {
    setShowMedDropdown(false)
    const selectedName = item.th || item.name_th
    setFormData(prev => ({
      ...prev,
      medication_name: selectedName,
      food_name: ''
    }))
    const query = `${item.th || ''} ${item.en || ''}`
    updateFoodSuggestions(query, '')
    setShowFoodDropdown(true)
  }

  const handleMedKeyDown = (e) => {
    if (!showMedDropdown || medSuggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setMedHighlightIndex(prev => (prev < medSuggestions.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setMedHighlightIndex(prev => (prev > 0 ? prev - 1 : medSuggestions.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (medHighlightIndex >= 0 && medHighlightIndex < medSuggestions.length) {
        handleSelectMedication(medSuggestions[medHighlightIndex])
      }
    } else if (e.key === 'Escape') {
      setShowMedDropdown(false)
    }
  }

  const handleFoodNameChange = (e) => {
    const val = e.target.value
    setFormData(prev => ({ ...prev, food_name: val }))
    updateFoodSuggestions(formData.medication_name, val)
    setShowFoodDropdown(true)
  }

  const handleFoodInputFocus = () => {
    updateFoodSuggestions(formData.medication_name, '')
    setShowFoodDropdown(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectFoodItem = (item) => {
    setShowFoodDropdown(false)
    const isRecommend = item.interaction_type === 'แนะนำให้รับประทานร่วม' || item.interaction_type === 'แนะนำ'

    if (isRecommend) {
      // -----------------------------------------------------------------------
      // แบบที่ 2: ของแนะนำ
      // ความรุนแรง และ งดก่อน-หลังรับประทาน จะไม่มี action อะไร (เว้นว่างไว้)
      // auto-fill ตรงรายละเอียด และแหล่งอ้างอิงด้วย
      // -----------------------------------------------------------------------
      setFormData(prev => ({
        ...prev,
        food_name: item.food_name,
        interaction_type: 'แนะนำให้รับประทานร่วม',
        severity: '', // ไม่มี action อะไร
        hours_before: '', // ไม่มี action อะไร
        hours_after: '', // ไม่มี action อะไร
        impact_details: item.impact_details || '',
        source_type: item.source_type || 'FDA / WHO / PubMed / Thai FDA',
        source_name: item.source_name || '',
        url_doi: item.url_doi || '',
        publish_year: item.publish_year || ''
      }))
      setAutoFillSuccess(`ดึงข้อมูลแบบ "แนะนำ": กรอกรายละเอียดและแหล่งอ้างอิงอัตโนมัติเรียบร้อยแล้ว`)
    } else {
      // -----------------------------------------------------------------------
      // แบบที่ 1: ของหลีกเลี่ยง (และข้อควรระวัง)
      // auto-fill ทั้งความรุนแรง งดก่อน-หลังรับประทาน และรายละเอียด แล้วก็แหล่งอ้างอิงด้วย
      // -----------------------------------------------------------------------
      setFormData(prev => ({
        ...prev,
        food_name: item.food_name,
        interaction_type: item.interaction_type || 'หลีกเลี่ยง',
        severity: item.severity || 'สูง',
        hours_before: item.hours_before !== undefined ? String(item.hours_before) : '2',
        hours_after: item.hours_after !== undefined ? String(item.hours_after) : '2',
        impact_details: item.impact_details || '',
        source_type: item.source_type || 'FDA / WHO / PubMed / Thai FDA',
        source_name: item.source_name || '',
        url_doi: item.url_doi || '',
        publish_year: item.publish_year || ''
      }))
      setAutoFillSuccess(`ดึงข้อมูลแบบ "หลีกเลี่ยง": กรอกความรุนแรง เวลางด รายละเอียด และแหล่งอ้างอิงอัตโนมัติเรียบร้อยแล้ว`)
    }

    setErrorMsg('')
    setTimeout(() => {
      setAutoFillSuccess('')
    }, 4000)
  }

  const avoidSuggestions = foodSuggestions.filter(item => item.interaction_type === 'หลีกเลี่ยง')
  const recommendSuggestions = foodSuggestions.filter(item => item.interaction_type === 'แนะนำให้รับประทานร่วม' || item.interaction_type === 'แนะนำ')
  const otherSuggestions = foodSuggestions.filter(item => 
    item.interaction_type !== 'หลีกเลี่ยง' && 
    item.interaction_type !== 'แนะนำให้รับประทานร่วม' && 
    item.interaction_type !== 'แนะนำ'
  )
  // Deduplicate items to ensure no repeating food items exist in the dropdown
  const deduplicatedSuggestions = []
  const seenFoodItems = new Set()
  for (const item of [...avoidSuggestions, ...recommendSuggestions, ...otherSuggestions]) {
    const key = `${item.interaction_type}:${(item.food_name || '').trim().toLowerCase()}`
    if (!seenFoodItems.has(key)) {
      seenFoodItems.add(key)
      deduplicatedSuggestions.push(item)
    }
  }
  const orderedSuggestions = deduplicatedSuggestions
  const isRecommend = formData.interaction_type === 'แนะนำ' || formData.interaction_type === 'แนะนำให้รับประทานร่วม'

  const handleKeyDown = (e) => {
    if (!showFoodDropdown || orderedSuggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex(prev => (prev < orderedSuggestions.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex(prev => (prev > 0 ? prev - 1 : orderedSuggestions.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightIndex >= 0 && highlightIndex < orderedSuggestions.length) {
        handleSelectFoodItem(orderedSuggestions[highlightIndex])
      }
    } else if (e.key === 'Escape') {
      setShowFoodDropdown(false)
    }
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!formData.medication_name.trim() || !formData.food_name.trim() || !formData.interaction_type || !formData.impact_details.trim() || !formData.source_name.trim()) {
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
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">{isEditing ? 'แก้ไข ปฏิสัมพันธ์ยา-อาหาร' : 'เพิ่ม ปฏิสัมพันธ์ยา-อาหาร'}</h1>
        <div className="page-actions">
          <button 
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate('/interactions')}
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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          backgroundColor: '#fff1f2',
          color: '#9f1239',
          border: '1px solid #fecdd3',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '13.5px',
          fontWeight: 500,
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          <AlertCircle size={18} style={{ color: '#e11d48', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>{errorMsg}</div>
        </div>
      )}

      {successMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          backgroundColor: '#ecfdf5',
          color: '#065f46',
          border: '1px solid #a7f3d0',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '13.5px',
          fontWeight: 500,
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          <CheckCircle2 size={18} style={{ color: '#059669', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>{successMsg}</div>
        </div>
      )}

      {autoFillSuccess && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          backgroundColor: '#f0fdf4',
          color: '#166534',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '13.5px',
          fontWeight: 500,
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          <CheckCircle2 size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>{autoFillSuccess}</div>
        </div>
      )}

      {/* Card 1: ข้อมูลหลัก */}
      <div className="card">
        <div className="card-title">ข้อมูลหลัก</div>

        {/* Row 1: ชื่อยา + ชื่ออาหาร (พร้อม dropdown list) */}
        <div className="form-row" style={{ marginBottom: '16px' }}>
          {/* ชื่อยา with Dropdown list */}
          <div className="form-group" style={{ marginBottom: 0, position: 'relative' }} ref={medDropdownRef}>
            <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
              ชื่อยา / อาหารเสริม <span className="required">*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                name="medication_name"
                className="form-input" 
                placeholder="เช่น พาราเซตามอล, วิตามินซี"
                value={formData.medication_name}
                onChange={handleMedInputChange}
                onFocus={handleMedInputFocus}
                onClick={handleMedInputFocus}
                onKeyDown={handleMedKeyDown}
                autoComplete="off"
                required
                style={{ paddingRight: '32px' }}
              />
              <ChevronDown 
                size={16} 
                style={{ 
                  position: 'absolute', 
                  right: '10px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: '#94a3b8',
                  pointerEvents: 'none'
                }} 
              />
            </div>

            {/* Dropdown list ยาและอาหารเสริม */}
            {showMedDropdown && (
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
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    {medSuggestions.length} รายการ
                  </span>
                </div>

                <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {medSuggestions.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                      ไม่พบรายการยาหรืออาหารเสริมที่ตรงกัน (สามารถพิมพ์ชื่อยาเองได้)
                    </div>
                  ) : (
                    medSuggestions.map((item, idx) => {
                      const isSupplement = item.category === 'อาหารเสริม'
                      const isHighlight = medHighlightIndex === idx

                      return (
                        <div
                          key={item.key || (item.th + idx)}
                          onMouseDown={(e) => {
                            e.preventDefault()
                            handleSelectMedication(item)
                          }}
                          onMouseEnter={() => setMedHighlightIndex(idx)}
                          style={{
                            padding: '10px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            backgroundColor: isHighlight ? '#f0f9ff' : '#ffffff',
                            borderBottom: '1px solid #f1f5f9',
                            transition: 'background-color 0.1s ease'
                          }}
                        >
                          <div style={{ flex: 1, paddingRight: '12px' }}>
                            <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#0f172a', lineHeight: '1.4' }}>
                              {item.th}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4', marginTop: '2px' }}>
                              {item.en || '-'}
                            </div>
                          </div>

                          <span style={{
                            fontSize: '11px',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            backgroundColor: isSupplement ? '#dcfce7' : '#e0f2fe',
                            color: isSupplement ? '#15803d' : '#0284c7',
                            border: isSupplement ? '1px solid #bbf7d0' : '1px solid #b9e2fe'
                          }}>
                            {isSupplement ? 'อาหารเสริม' : 'ยา'}
                          </span>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ชื่ออาหาร with Dropdown list */}
          <div className="form-group" style={{ marginBottom: 0, position: 'relative' }} ref={foodDropdownRef}>
            <label className="form-label">
              ชื่ออาหาร / กลุ่มอาหาร <span className="required">*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                name="food_name"
                className="form-input" 
                placeholder="่เช่น เครื่องดื่มที่มีคาเฟอีน, นม"
                value={formData.food_name}
                onChange={handleFoodNameChange}
                onFocus={handleFoodInputFocus}
                onClick={handleFoodInputFocus}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                required
                style={{ paddingRight: '32px' }}
              />
              <ChevronDown 
                size={16} 
                style={{ 
                  position: 'absolute', 
                  right: '10px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: '#94a3b8',
                  pointerEvents: 'none'
                }} 
              />
            </div>

            {/* Dropdown list อาหารที่เกี่ยวข้องกับตัวยาหรืออาหารเสริมที่เลือก */}
            {showFoodDropdown && (
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
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    {orderedSuggestions.length} รายการ
                  </span>
                </div>

                <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {orderedSuggestions.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                      {!formData.medication_name 
                        ? 'กรุณาเลือกชื่อยาหรืออาหารเสริมทางด้านซ้ายก่อน' 
                        : 'ไม่พบรายการอาหารที่ตรงกัน (สามารถพิมพ์ชื่ออาหารเองได้)'}
                    </div>
                  ) : (
                    orderedSuggestions.map((item, idx) => {
                      const isAvoid = item.interaction_type === 'หลีกเลี่ยง'
                      const isHighlight = highlightIndex === idx

                      return (
                        <div
                          key={(item.food_name || '') + '-' + (item.interaction_type || '') + '-' + idx}
                          onMouseDown={(e) => {
                            e.preventDefault()
                            handleSelectFoodItem(item)
                          }}
                          onMouseEnter={() => setHighlightIndex(idx)}
                          style={{
                            padding: '10px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            backgroundColor: isHighlight ? '#f0f9ff' : '#ffffff',
                            borderBottom: '1px solid #f1f5f9',
                            transition: 'background-color 0.1s ease'
                          }}
                        >
                          <div style={{ flex: 1, paddingRight: '12px' }}>
                            <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#0f172a', lineHeight: '1.4' }}>
                              {item.food_name}
                            </div>
                          </div>

                          <span style={{
                            fontSize: '11px',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            backgroundColor: isAvoid ? '#fee2e2' : '#dcfce7',
                            color: isAvoid ? '#b91c1c' : '#15803d',
                            border: isAvoid ? '1px solid #fecdd3' : '1px solid #bbf7d0'
                          }}>
                            {isAvoid ? 'หลีกเลี่ยง' : 'แนะนำ'}
                          </span>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: ซ้าย (ประเภทปฏิสัมพันธ์) / ขวา (งดก่อน + งดหลัง อยู่ชิดกัน) */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '24px', 
            marginBottom: '24px',
            alignItems: 'flex-start'
          }}
        >
          {/* ฝั่งซ้าย: ประเภทปฏิสัมพันธ์ */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
              ประเภทปฏิสัมพันธ์ <span className="required">*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                className={`segment-btn ${formData.interaction_type === 'หลีกเลี่ยง' ? 'active' : ''}`}
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    interaction_type: 'หลีกเลี่ยง'
                  }))
                }}
                style={{
                  height: '42px',
                  minHeight: '42px',
                  padding: '0 8px',
                  fontSize: '13.5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <span>หลีกเลี่ยง</span>
              </button>
              <button
                type="button"
                className={`segment-btn ${isRecommend ? 'active' : ''}`}
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    interaction_type: 'แนะนำให้รับประทานร่วม',
                    severity: '',
                    hours_before: '',
                    hours_after: ''
                  }))
                }}
                style={{
                  height: '42px',
                  minHeight: '42px',
                  padding: '0 8px',
                  fontSize: '13.5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <span>แนะนำ</span>
              </button>
            </div>
          </div>

          {/* ฝั่งขวา: มัดรวม งดก่อน + งดหลัง เข้าด้วยกัน (แบ่งครึ่งคนละ 50% และ gap แค่ 8px) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
                <span>งดก่อน (ชั่วโมง)</span>
              </label>
              <input 
                type="number" 
                name="hours_before"
                className="form-input" 
                placeholder={isRecommend ? '-' : 'เช่น 2'}
                value={formData.hours_before}
                onChange={handleChange}
                disabled={isRecommend}
                style={{
                  width: '100%',
                  height: '42px',
                  backgroundColor: isRecommend ? '#f8fafc' : '#ffffff',
                  cursor: isRecommend ? 'not-allowed' : 'text',
                  opacity: isRecommend ? 0.6 : 1
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
                <span>งดหลัง (ชั่วโมง)</span>
              </label>
              <input 
                type="number" 
                name="hours_after"
                className="form-input" 
                placeholder={isRecommend ? '-' : 'เช่น 2'}
                value={formData.hours_after}
                onChange={handleChange}
                disabled={isRecommend}
                style={{
                  width: '100%',
                  height: '42px',
                  backgroundColor: isRecommend ? '#f8fafc' : '#ffffff',
                  cursor: isRecommend ? 'not-allowed' : 'text',
                  opacity: isRecommend ? 0.6 : 1
                }}
              />
            </div>
          </div>
        </div>

        {/* Row 3: ความรุนแรง (แยกออกมาเป็นอีกแถวหนึ่ง) */}
        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>ความรุนแรง</span>
            {isRecommend && (
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'normal' }}>
                (ไม่ต้องระบุสำหรับรายการที่แนะนำ)
              </span>
            )}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', maxWidth: '420px' }}>
            {['สูง', 'กลาง', 'ต่ำ'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                disabled={isRecommend}
                className={`segment-btn ${formData.severity === lvl ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, severity: lvl }))}
                style={{
                  width: '377px',
                  height: '42px',
                  minHeight: '42px',
                  padding: '0 8px',
                  fontSize: '13.5px',
                  opacity: isRecommend ? 0.35 : 1,
                  cursor: isRecommend ? 'not-allowed' : 'pointer'
                }}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Row 5: รายละเอียดผลกระทบและประโยชน์ */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">
            รายละเอียดผลกระทบ / ประโยชน์ <span className="required">*</span>
          </label>
          <textarea 
            name="impact_details"
            className="form-textarea"
            placeholder="อธิบายอันตรายหรือประโยชน์ที่อาจเกิดขึ้นกับผู้ป่วย..."
            value={formData.impact_details}
            onChange={handleChange}
            style={{ minHeight: '110px' }}
            required
          />
        </div>
      </div>

      {/* Card 2: แหล่งอ้างอิง */}
      <div className="card">
        <div className="card-title">แหล่งอ้างอิง</div>

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
              placeholder="เช่น U.S. FDA Drug-Food Interaction Guide, คณะเภสัชศาสตร์ ม.มหิดล"
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
