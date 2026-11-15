import { useState, useEffect, useCallback } from 'react'
import { medicationService } from '../services/medicationService'
import { sortByCreatedAtAsc, filterMedications } from '../utils/medicationUtils'

export function useMedicationList() {
  const [medications, setMedications] = useState([])
  const [filteredMedications, setFilteredMedications] = useState([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ทั้งหมด')
  const [categoryFilter, setCategoryFilter] = useState('ทั้งหมด')
  const [selectedIds, setSelectedIds] = useState([])
  const [loading, setLoading] = useState(true)

  const [viewMed, setViewMed] = useState(null)

  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  const loadMedications = useCallback(async () => {
    setLoading(true)
    const list = await medicationService.getMedications()
    const sortedList = sortByCreatedAtAsc(list)
    setMedications(sortedList)
    setFilteredMedications(sortedList)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadMedications()
  }, [loadMedications])

  const applyFilters = (s = search, t = typeFilter, c = categoryFilter) => {
    const res = filterMedications(medications, { search: s, typeFilter: t, categoryFilter: c })
    setFilteredMedications(res)
    setCurrentPage(1)
  }

  const handleSearch = (e) => {
    if (e) e.preventDefault()
    applyFilters(search, typeFilter, categoryFilter)
  }

  const handleSelectMedication = (selectedName) => {
    setSearch(selectedName)
    applyFilters(selectedName, typeFilter, categoryFilter)
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
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ "${name}"?\n(ข้อมูลปฏิสัมพันธ์ยา-อาหารที่เกี่ยวข้องจะถูกลบออกด้วย)`)) {
      try {
        await medicationService.deleteMedication(id)
        await loadMedications()
        setSelectedIds(prev => prev.filter(item => item !== id))
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการลบข้อมูล: ' + (err?.message || err))
      }
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบรายการยา/อาหารเสริมที่เลือกทั้งหมด ${selectedIds.length} รายการ?\n(ข้อมูลปฏิสัมพันธ์ยา-อาหารที่เกี่ยวข้องจะถูกลบออกด้วย)`)) {
      try {
        await medicationService.deleteMultipleMedications(selectedIds)
        setSelectedIds([])
        await loadMedications()
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการลบข้อมูล: ' + (err?.message || err))
      }
    }
  }

  const totalItems = filteredMedications.length
  const totalPages = Math.ceil(totalItems / pageSize) || 1
  const paginatedData = filteredMedications.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return {
    medications,
    filteredMedications,
    paginatedData,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    categoryFilter,
    setCategoryFilter,
    selectedIds,
    loading,
    viewMed,
    setViewMed,
    currentPage,
    setCurrentPage,
    pageSize,
    totalItems,
    totalPages,
    handleSearch,
    handleSelectMedication,
    toggleSelectAll,
    toggleSelectOne,
    handleDeleteOne,
    handleDeleteSelected
  }
}
