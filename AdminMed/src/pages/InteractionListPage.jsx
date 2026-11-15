import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import InteractionFilterCard from '../components/interactions/InteractionFilterCard'
import InteractionTableCard from '../components/interactions/InteractionTableCard'
import InteractionDetailModal from '../components/interactions/InteractionDetailModal'
import { useInteractionList } from '../hooks/useInteractionList'
import './InteractionListPage.css'

export default function InteractionListPage() {
  const navigate = useNavigate()
  const {
    interactions,
    medications,
    paginatedData,
    search,
    setSearch,
    severityFilter,
    setSeverityFilter,
    typeFilter,
    setTypeFilter,
    selectedIds,
    viewItem,
    setViewItem,
    currentPage,
    setCurrentPage,
    pageSize,
    totalItems,
    totalPages,
    handleSearchSubmit,
    handleSelectMedication,
    toggleSelectAll,
    toggleSelectOne,
    handleDeleteOne,
    handleDeleteSelected
  } = useInteractionList()

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">ปฏิสัมพันธ์ยา-อาหาร</h1>
        <div className="page-actions">
          <Link to="/interactions/new" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} />
            <span>เพิ่มปฏิสัมพันธ์</span>
          </Link>
        </div>
      </div>

      {/* Filter Card */}
      <InteractionFilterCard
        search={search}
        onSearchChange={setSearch}
        severityFilter={severityFilter}
        onSeverityFilterChange={setSeverityFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        onSubmit={handleSearchSubmit}
        medications={medications}
        interactions={interactions}
        onSelectMedication={handleSelectMedication}
      />

      {/* Table Card */}
      <InteractionTableCard
        totalItems={totalItems}
        selectedIds={selectedIds}
        paginatedData={paginatedData}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        onToggleSelectAll={toggleSelectAll}
        onToggleSelectOne={toggleSelectOne}
        onDeleteSelected={handleDeleteSelected}
        onEdit={(itemId) => navigate(`/interactions/edit/${itemId}`)}
        onView={(item) => setViewItem(item)}
        onDeleteOne={handleDeleteOne}
        onPageChange={setCurrentPage}
      />

      {/* Interaction Detail Modal */}
      <InteractionDetailModal
        viewItem={viewItem}
        onClose={() => setViewItem(null)}
        onEdit={(itemId) => {
          setViewItem(null)
          navigate(`/interactions/edit/${itemId}`)
        }}
      />
    </div>
  )
}
