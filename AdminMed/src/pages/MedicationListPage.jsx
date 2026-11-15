import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import MedicationFilterCard from '../components/medications/MedicationFilterCard'
import MedicationTableCard from '../components/medications/MedicationTableCard'
import MedicationDetailModal from '../components/medications/MedicationDetailModal'
import { useMedicationList } from '../hooks/useMedicationList'

export default function MedicationListPage() {
  const navigate = useNavigate()
  const {
    medications,
    paginatedData,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    categoryFilter,
    setCategoryFilter,
    selectedIds,
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
  } = useMedicationList()

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">ข้อมูลยาพื้นฐาน</h1>
        <div className="page-actions">
          <Link to="/medications/new" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} />
            <span>เพิ่มยาใหม่</span>
          </Link>
        </div>
      </div>

      {/* Filter Card */}
      <MedicationFilterCard
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        onSubmit={handleSearch}
        medications={medications}
        onSelectMedication={handleSelectMedication}
      />

      {/* Table Card */}
      <MedicationTableCard
        totalItems={totalItems}
        selectedIds={selectedIds}
        paginatedData={paginatedData}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        onToggleSelectAll={toggleSelectAll}
        onToggleSelectOne={toggleSelectOne}
        onDeleteSelected={handleDeleteSelected}
        onEdit={(medId) => navigate(`/medications/edit/${medId}`)}
        onView={(item) => setViewMed(item)}
        onDeleteOne={handleDeleteOne}
        onPageChange={setCurrentPage}
      />

      {/* Medication Detail Modal */}
      <MedicationDetailModal
        viewMed={viewMed}
        onClose={() => setViewMed(null)}
        onEdit={(medId) => {
          setViewMed(null)
          navigate(`/medications/edit/${medId}`)
        }}
      />
    </div>
  )
}
