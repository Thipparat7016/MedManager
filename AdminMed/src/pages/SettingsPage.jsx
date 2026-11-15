import React from 'react'
import AdminProfileCard from '../components/settings/AdminProfileCard'
import AdminPersonalInfoCard from '../components/settings/AdminPersonalInfoCard'
import AppUsersTableCard from '../components/settings/AppUsersTableCard'
import { useSettings } from '../hooks/useSettings'
import './SettingsPage.css'

export default function SettingsPage() {
  const {
    activeTab,
    handleTabChange,
    fileInputRef,
    formData,
    saving,
    saveSuccess,
    appUsers,
    userSearch,
    setUserSearch,
    selectedUserIds,
    userPage,
    setUserPage,
    totalPages,
    handleUserSearch,
    handleDeleteUser,
    handleDeleteSelectedUsers,
    handleChange,
    handleAvatarChange,
    handleSave
  } = useSettings()

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <h1 className="page-title">ตั้งค่าระบบและจัดการผู้ใช้งาน</h1>
      </div>

      {/* Tabs */}
      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => handleTabChange('admin')}
        >
          โปรไฟล์แอดมิน
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => handleTabChange('users')}
        >
          ผู้ใช้แอป
        </button>
      </div>

      {activeTab === 'admin' ? (
        /* Tab 1: Profile */
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
          <AdminProfileCard
            fileInputRef={fileInputRef}
            formData={formData}
            onAvatarChange={handleAvatarChange}
          />

          <AdminPersonalInfoCard
            formData={formData}
            saving={saving}
            saveSuccess={saveSuccess}
            onChange={handleChange}
            onSave={handleSave}
          />
        </div>
      ) : (
        /* Tab 2: Users Tab */
        <AppUsersTableCard
          appUsers={appUsers}
          userSearch={userSearch}
          selectedUserIds={selectedUserIds}
          userPage={userPage}
          totalPages={totalPages}
          onUserSearchChange={setUserSearch}
          onUserSearchSubmit={handleUserSearch}
          onDeleteSelectedUsers={handleDeleteSelectedUsers}
          onDeleteUser={handleDeleteUser}
          onPageChange={setUserPage}
        />
      )}
    </div>
  )
}
