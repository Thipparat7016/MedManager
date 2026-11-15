import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { medicationService } from '../services/medicationService'
import { interactionService } from '../services/interactionService'
import { getInteractionsForMedication } from '../services/foodInteractionService'
import { orderAndDeduplicateFoodSuggestions } from '../utils/medicationUtils'

export function useInteractionForm() {
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

  const [medSuggestions, setMedSuggestions] = useState([])
  const [showMedDropdown, setShowMedDropdown] = useState(false)
  const [medHighlightIndex, setMedHighlightIndex] = useState(-1)
  const medDropdownRef = useRef(null)

  const [foodSuggestions, setFoodSuggestions] = useState([])
  const [showFoodDropdown, setShowFoodDropdown] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const foodDropdownRef = useRef(null)

  const updateFoodSuggestions = useCallback((medName, filterText = '', medList = medications) => {
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
  }, [medications])

  useEffect(() => {
    const loadMedications = async () => {
      const list = await medicationService.getMedications()
      setMedications(list)
    }

    const loadInteraction = async () => {
      const item = await interactionService.getInteractionById(id)
      if (item) {
        setFormData({
          id: item.id,
          medication_id: item.medication_id || '',
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

    loadMedications()
    if (isEditing) {
      loadInteraction()
    }
  }, [id, isEditing])

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
        id: m.id,
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

  const handleMedInputChange = (e) => {
    const val = e.target.value
    setFormData(prev => ({
      ...prev,
      medication_id: '',
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
      medication_id: item.id || null,
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
      setFormData(prev => ({
        ...prev,
        food_name: item.food_name,
        interaction_type: 'แนะนำให้รับประทานร่วม',
        severity: '',
        hours_before: '',
        hours_after: '',
        impact_details: item.impact_details || '',
        source_type: item.source_type || 'FDA / WHO / PubMed / Thai FDA',
        source_name: item.source_name || '',
        url_doi: item.url_doi || '',
        publish_year: item.publish_year || ''
      }))
      setAutoFillSuccess(`ดึงข้อมูลแบบ "แนะนำ": กรอกรายละเอียดและแหล่งอ้างอิงอัตโนมัติเรียบร้อยแล้ว`)
    } else {
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

  const orderedSuggestions = orderAndDeduplicateFoodSuggestions(foodSuggestions)
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

  const handleSelectInteractionType = (typeVal) => {
    setFormData(prev => ({
      ...prev,
      interaction_type: typeVal,
      ...(typeVal === 'แนะนำให้รับประทานร่วม' ? { severity: '', hours_before: '', hours_after: '' } : {})
    }))
  }

  const handleSelectSeverity = (sevVal) => {
    setFormData(prev => ({ ...prev, severity: sevVal }))
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
      await interactionService.saveInteraction(formData)
      setSuccessMsg('บันทึกข้อมูลปฏิสัมพันธ์สำเร็จแล้ว!')
      setTimeout(() => {
        navigate('/interactions')
      }, 800)
    } catch (err) {
      console.error('Save interaction error:', err)
      setErrorMsg(err?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => navigate('/interactions')

  return {
    isEditing,
    medications,
    formData,
    saving,
    errorMsg,
    successMsg,
    autoFillSuccess,
    medSuggestions,
    showMedDropdown,
    medHighlightIndex,
    setMedHighlightIndex,
    medDropdownRef,
    showFoodDropdown,
    highlightIndex,
    setHighlightIndex,
    foodDropdownRef,
    orderedSuggestions,
    isRecommend,
    handleMedInputChange,
    handleMedInputFocus,
    handleSelectMedication,
    handleMedKeyDown,
    handleFoodNameChange,
    handleFoodInputFocus,
    handleChange,
    handleSelectFoodItem,
    handleKeyDown,
    handleSelectInteractionType,
    handleSelectSeverity,
    handleSubmit,
    handleCancel
  }
}
