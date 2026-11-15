import { useState, useEffect, useCallback } from 'react'
import { interactionService } from '../services/interactionService'
import { medicationService } from '../services/medicationService'
import { sortByCreatedAtAsc, filterInteractions } from '../utils/medicationUtils'

export function useInteractionList() {
  const [interactions, setInteractions] = useState([])
  const [medications, setMedications] = useState([])
  const [filteredList, setFilteredList] = useState([])
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState('ทั้งหมด')
  const [typeFilter, setTypeFilter] = useState('ทั้งหมด')
  const [activePill, setActivePill] = useState('all')
  const [selectedIds, setSelectedIds] = useState([])
  const [loading, setLoading] = useState(true)

  const [viewItem, setViewItem] = useState(null)

  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  const loadData = useCallback(async () => {
    setLoading(true)
    const [list, meds] = await Promise.all([
      interactionService.getInteractions(),
      medicationService.getMedications()
    ])
    const sortedList = sortByCreatedAtAsc(list)
    setInteractions(sortedList)
    setFilteredList(sortedList)
    setMedications(meds || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const applyFilters = (pill = activePill, s = search, sev = severityFilter, typ = typeFilter) => {
    const res = filterInteractions(interactions, {
      pill,
      search: s,
      severityFilter: sev,
      typeFilter: typ
    })
    setFilteredList(res)
    setCurrentPage(1)
  }

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault()
    applyFilters(activePill, search, severityFilter, typeFilter)
  }

  const handleSelectMedication = (selectedName) => {
    setSearch(selectedName)
    applyFilters(activePill, selectedName, severityFilter, typeFilter)
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
      await interactionService.deleteInteraction(id)
      await loadData()
      setSelectedIds(prev => prev.filter(item => item !== id))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบปฏิสัมพันธ์ที่เลือกทั้งหมด ${selectedIds.length} รายการ?`)) {
      await interactionService.deleteMultipleInteractions(selectedIds)
      setSelectedIds([])
      await loadData()
    }
  }

  const totalItems = filteredList.length
  const totalPages = Math.ceil(totalItems / pageSize) || 1
  const paginatedData = filteredList.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return {
    interactions,
    medications,
    filteredList,
    paginatedData,
    search,
    setSearch,
    severityFilter,
    setSeverityFilter,
    typeFilter,
    setTypeFilter,
    activePill,
    selectedIds,
    loading,
    viewItem,
    setViewItem,
    currentPage,
    setCurrentPage,
    pageSize,
    totalItems,
    totalPages,
    handleSearchSubmit,
    handleSelectMedication,
    handlePillClick,
    toggleSelectAll,
    toggleSelectOne,
    handleDeleteOne,
    handleDeleteSelected
  }
}
