import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { medicationService } from '../services/medicationService'
import { getDrugSuggestions, fetchMedicalEntity } from '../services/openFdaService'

export function useMedicationForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const dropdownRefEn = useRef(null)
  const dropdownRefTh = useRef(null)
  const dropdownRefCategory = useRef(null)
  const dropdownRefType = useRef(null)
  const dropdownRefUnit = useRef(null)
  const isEditing = Boolean(id)

  const [openCustomDropdown, setOpenCustomDropdown] = useState(null)

  const [formData, setFormData] = useState({
    name_th: '',
    name_en: '',
    type: '',
    dosage: '',
    unit: '',
    category: '',
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

  const [activeDropdownField, setActiveDropdownField] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [highlightIndex, setHighlightIndex] = useState(-1)

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideEn = !dropdownRefEn.current || !dropdownRefEn.current.contains(event.target)
      const isOutsideTh = !dropdownRefTh.current || !dropdownRefTh.current.contains(event.target)
      if (isOutsideEn && isOutsideTh) {
        setActiveDropdownField(null)
      }

      const isOutsideCat = !dropdownRefCategory.current || !dropdownRefCategory.current.contains(event.target)
      const isOutsideType = !dropdownRefType.current || !dropdownRefType.current.contains(event.target)
      const isOutsideUnit = !dropdownRefUnit.current || !dropdownRefUnit.current.contains(event.target)
      if (isOutsideCat && isOutsideType && isOutsideUnit) {
        setOpenCustomDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const loadMedication = async () => {
      const med = await medicationService.getMedicationById(id)
      if (med) {
        setFormData({
          id: med.id,
          code: med.code,
          name_th: med.name_th || '',
          name_en: med.name_en || '',
          type: med.type || '',
          dosage: med.dosage || '',
          unit: med.unit || '',
          category: med.category || '',
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

    if (isEditing) {
      loadMedication()
    }
  }, [id, isEditing])

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
        precautions: data.precautions || prev.precautions
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

  const handleRemoveImage = () => {
    setImagePreview('')
    setFormData(prev => ({ ...prev, image_url: '' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleEnglishNameChange = (e) => {
    const val = e.target.value
    setOpenCustomDropdown(null)
    setFormData(prev => ({ ...prev, name_en: val }))
    setSuggestions(getDrugSuggestions(val, formData.category))
    setActiveDropdownField('name_en')
    setHighlightIndex(-1)
  }

  const handleThaiNameChange = (e) => {
    const val = e.target.value
    setOpenCustomDropdown(null)
    setFormData(prev => ({ ...prev, name_th: val }))
    setSuggestions(getDrugSuggestions(val, formData.category))
    setActiveDropdownField('name_th')
    setHighlightIndex(-1)
  }

  const handleEnglishFocus = () => {
    setOpenCustomDropdown(null)
    setSuggestions(getDrugSuggestions(formData.name_en, formData.category))
    setActiveDropdownField('name_en')
  }

  const handleThaiFocus = () => {
    setOpenCustomDropdown(null)
    setSuggestions(getDrugSuggestions(formData.name_th, formData.category))
    setActiveDropdownField('name_th')
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === 'category') {
      const q = activeDropdownField === 'name_en' ? formData.name_en : formData.name_th
      setSuggestions(getDrugSuggestions(q, value))
    }
  }

  const handleSelectCustomDropdown = (fieldKey, value) => {
    setFormData(prev => ({ ...prev, [fieldKey]: value }))
    setOpenCustomDropdown(null)
    if (fieldKey === 'category') {
      const q = activeDropdownField === 'name_en' ? formData.name_en : formData.name_th
      setSuggestions(getDrugSuggestions(q, value))
    }
  }

  const handleToggleCustomDropdown = (fieldKey) => {
    setActiveDropdownField(null)
    setOpenCustomDropdown(prev => (prev === fieldKey ? null : fieldKey))
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
    if (
      !formData.name_th.trim() ||
      !formData.name_en.trim() ||
      !formData.category ||
      !formData.type ||
      !formData.dosage.trim() ||
      !formData.unit.trim()
    ) {
      setErrorMsg('กรุณากรอกข้อมูลที่จำเป็น (*) ให้ครบถ้วน')
      return
    }

    setSaving(true)
    setErrorMsg('')
    try {
      await medicationService.saveMedication(formData)
      navigate('/medications')
    } catch (err) {
      console.error('Save medication error:', err)
      setErrorMsg(err?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => navigate('/medications')

  return {
    isEditing,
    fileInputRef,
    dropdownRefEn,
    dropdownRefTh,
    dropdownRefCategory,
    dropdownRefType,
    dropdownRefUnit,
    openCustomDropdown,
    formData,
    imagePreview,
    saving,
    errorMsg,
    isFetchingFda,
    fdaSuccessMsg,
    fdaErrorMsg,
    activeDropdownField,
    suggestions,
    highlightIndex,
    setHighlightIndex,
    handleAutoFill,
    handleSelectDrug,
    handleRemoveImage,
    handleEnglishNameChange,
    handleThaiNameChange,
    handleEnglishFocus,
    handleThaiFocus,
    handleKeyDown,
    handleChange,
    handleSelectCustomDropdown,
    handleToggleCustomDropdown,
    handleImageChange,
    handleSubmit,
    handleCancel
  }
}
