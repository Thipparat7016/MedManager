import React, { useState, useEffect, useRef } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { Camera, Check, Search, X } from 'lucide-react'
import { dataService } from '../services/dataService'

export default function SettingsPage() {
  const { adminProfile, reloadProfile } = useOutletContext()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'users' ? 'users' : 'admin'
  const [activeTab, setActiveTab] = useState(initialTab)
  const fileInputRef = useRef(null)

  // Admin Profile Form
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'Admin',
    avatar_url: ''
  })
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // App Users Tab State
  const [appUsers, setAppUsers] = useState([])
  const [userSearch, setUserSearch] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState([])
  const [userPage, setUserPage] = useState(1)
  const pageSize = 5

  useEffect(() => {
    if (adminProfile) {
      setFormData({
        id: adminProfile.id,
        first_name: adminProfile.first_name || 'Admin',
        last_name: adminProfile.last_name || 'medicine',
        email: adminProfile.email || 'admin@gmail.com',
        phone: adminProfile.phone || '095-326-5723',
        role: adminProfile.role || 'Admin',
        avatar_url: adminProfile.avatar_url || ''
      })
    }
    loadUsers()
  }, [adminProfile])

  const loadUsers = async (q = '') => {
    const list = await dataService.getAppUsers({ search: q })
    setAppUsers(list)
  }

  const handleUserSearch = (e) => {
    if (e) e.preventDefault()
    loadUsers(userSearch)
  }

  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีผู้ใช้ "${name}"?`)) {
      await dataService.deleteAppUser(id)
      await loadUsers(userSearch)
      setSelectedUserIds(prev => prev.filter(item => item !== id))
    }
  }

  const handleDeleteSelectedUsers = async () => {
    if (selectedUserIds.length === 0) return
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีผู้ใช้ที่เลือกทั้งหมด ${selectedUserIds.length} รายการ?`)) {
      await dataService.deleteMultipleAppUsers(selectedUserIds)
      setSelectedUserIds([])
      await loadUsers(userSearch)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar_url: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    setSaving(true)
    const updated = await dataService.updateAdminProfile(formData)
    if (reloadProfile) {
      await reloadProfile()
    }
    if (updated?.avatar_url) {
      setFormData(prev => ({ ...prev, avatar_url: updated.avatar_url }))
    }
    setSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2500)
  }

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
          onClick={() => {
            setActiveTab('admin')
            setSearchParams({})
          }}
        >
          โปรไฟล์แอดมิน
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('users')
            setSearchParams({ tab: 'users' })
          }}
        >
          ผู้ใช้แอป
        </button>
      </div>

      {activeTab === 'admin' ? (
        /* Tab 1: Profile */
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
          
          {/* Left: Profile Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 24px' }}>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleAvatarChange} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />

            {/* Circular Avatar */}
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '130px',
                  height: '130px',
                  borderRadius: 'var(--radius-circle)',
                  backgroundColor: '#DFF2FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  border: '3px solid #B9E2FE',
                  cursor: 'pointer'
                }}
                title="คลิกเพื่ออัปโหลดรูปภาพ"
              >
                {formData.avatar_url ? (
                  <img src={formData.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div 
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: 'var(--radius-circle)',
                      border: '2.5px solid var(--color-primary-400)',
                      backgroundColor: 'transparent'
                    }} 
                  />
                )}
              </div>

              {/* Edit Icon Badge */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-circle)',
                  backgroundColor: '#DFF2FF',
                  color: '#0284C7',
                  border: '2px solid #ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)'
                }}
                title="เปลี่ยนรูปโปรไฟล์"
              >
                <Camera size={16} />
              </button>
            </div>

            {/* Admin Name & Badge */}
            <div style={{ fontSize: '19px', fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: '8px' }}>
              {formData.first_name} {formData.last_name}
            </div>

            <div 
              style={{
                fontSize: '12.5px',
                padding: '4px 16px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: '#DFF2FF',
                color: '#0284C7',
                border: '1px solid #B9E2FE',
                fontWeight: 600
              }}
            >
              {formData.role}
            </div>
          </div>

          {/* Right: Personal Info Card */}
          <div className="card">
            <div className="card-title">ข้อมูลส่วนตัว</div>

            {saveSuccess && (
              <div style={{ padding: '12px 16px', backgroundColor: 'var(--color-success-50)', color: 'var(--color-success-700)', border: '1px solid var(--color-success-100)', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={16} /> บันทึกข้อมูลส่วนตัวสำเร็จแล้ว
              </div>
            )}

            <form onSubmit={handleSave}>
              <div className="form-row" style={{ marginBottom: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">
                    ชื่อ <span className="required">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="first_name"
                    className="form-input" 
                    placeholder="สมชาย"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">
                    นามสกุล <span className="required">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="last_name"
                    className="form-input" 
                    placeholder="ใจดี"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row" style={{ marginBottom: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">
                    อีเมล <span className="required">*</span>
                  </label>
                  <input 
                    type="email" 
                    name="email"
                    className="form-input" 
                    placeholder="admin@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">
                    เบอร์โทรศัพท์ <span className="required">*</span>
                  </label>
                  <input 
                    type="tel" 
                    name="phone"
                    className="form-input" 
                    placeholder="081-234-5678"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">
                  ตำแหน่ง <span className="required">*</span>
                </label>
                <input 
                  type="text" 
                  name="role"
                  className="form-input" 
                  placeholder="Admin"
                  value={formData.role}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 24px' }}
                >
                  <Check size={16} />
                  <span>{saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}</span>
                </button>
              </div>
            </form>
          </div>

        </div>
      ) : (
        /* Tab 2: Users Tab matching Image 1 */
        <div>
          {/* Table Card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div className="card-title" style={{ margin: 0 }}>รายชื่อบัญชีผู้ใช้งาน (Users)</div>
              {selectedUserIds.length > 0 && (
                <button 
                  onClick={handleDeleteSelectedUsers}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-danger-500)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '4px 8px'
                  }}
                >
                  ลบที่เลือก ({selectedUserIds.length})
                </button>
              )}
            </div>

            {/* Search Form */}
            <form onSubmit={handleUserSearch} style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="ค้นหา ชื่อ, อีเมล, ID..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    style={{ paddingLeft: '34px' }}
                  />
                  <Search size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--color-neutral-400)' }} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '0 24px' }}>
                  ค้นหา
                </button>
              </div>
            </form>

            {/* Users Table */}
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>#</th>
                    <th>ชื่อ-นามสกุล</th>
                    <th>อีเมล</th>
                    <th style={{ width: '120px', textAlign: 'right' }}>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {appUsers.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-neutral-400)' }}>
                        ไม่พบข้อมูลผู้ใช้ในระบบ
                      </td>
                    </tr>
                  ) : (
                    appUsers.map((u) => (
                      <tr key={u.id}>
                        <td style={{ color: 'var(--color-neutral-500)' }}>{u.code || '001'}</td>
                        <td style={{ fontWeight: 600, color: 'var(--color-neutral-800)' }}>{u.name}</td>
                        <td style={{ color: 'var(--color-neutral-600)' }}>{u.email}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            className="btn btn-danger-outline" 
                            style={{ padding: '4px 10px', fontSize: '12px', height: '28px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => handleDeleteUser(u.id, u.name)}
                          >
                            <X size={12} /> ลบ
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer & Pagination */}
            <div className="table-footer">
              <div>
                แสดง {appUsers.length > 0 ? 1 : 0}-{appUsers.length} จาก {appUsers.length} รายการ
              </div>
              <div className="pagination">
                <button className="page-btn" disabled={userPage === 1} onClick={() => setUserPage(p => Math.max(1, p - 1))}>
                  &lt;
                </button>
                <button className={`page-btn ${userPage === 1 ? 'active' : ''}`} onClick={() => setUserPage(1)}>
                  1
                </button>
                <button className={`page-btn ${userPage === 2 ? 'active' : ''}`} onClick={() => setUserPage(2)}>
                  2
                </button>
                <button className={`page-btn ${userPage === 3 ? 'active' : ''}`} onClick={() => setUserPage(3)}>
                  3
                </button>
                <span style={{ padding: '0 4px', color: 'var(--color-neutral-400)' }}>...</span>
                <button className="page-btn" onClick={() => setUserPage(p => p + 1)}>
                  &gt;
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
