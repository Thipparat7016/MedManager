import React from 'react'
import { Search, Trash2 } from 'lucide-react'
import PaginationFooter from '../common/PaginationFooter'

export default function AppUsersTableCard({
  appUsers,
  userSearch,
  selectedUserIds,
  userPage,
  totalPages,
  onUserSearchChange,
  onUserSearchSubmit,
  onDeleteSelectedUsers,
  onDeleteUser,
  onPageChange
}) {
  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div className="card-title" style={{ margin: 0 }}>รายชื่อบัญชีผู้ใช้งาน</div>
          {selectedUserIds.length > 0 && (
            <button
              onClick={onDeleteSelectedUsers}
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
        <form onSubmit={onUserSearchSubmit} style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                className="form-input"
                placeholder="ค้นหา ชื่อ, อีเมล, ID..."
                value={userSearch}
                onChange={(e) => onUserSearchChange(e.target.value)}
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
                <th style={{ width: '10%', textAlign: 'center' }}>ID</th>
                <th style={{ width: '28%', textAlign: 'left' }}>ชื่อ-นามสกุล</th>
                <th style={{ width: '32%', textAlign: 'left' }}>อีเมล</th>
                <th style={{ width: '16%', textAlign: 'left' }}>เบอร์โทรศัพท์</th>
                <th style={{ width: '12%', textAlign: 'center' }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {appUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-neutral-400)' }}>
                    ไม่พบข้อมูลผู้ใช้ในระบบ
                  </td>
                </tr>
              ) : (
                appUsers.map((u) => (
                  <tr key={u.id}>
                    <td style={{ color: 'var(--color-neutral-500)', textAlign: 'center' }}>{u.code || '001'}</td>
                    <td style={{ color: 'var(--color-neutral-800)', textAlign: 'left' }}>{u.name}</td>
                    <td style={{ color: 'var(--color-neutral-600)', textAlign: 'left' }}>{u.email}</td>
                    <td style={{ color: 'var(--color-neutral-600)', textAlign: 'left' }}>{u.phone}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        title="ลบ"
                        onClick={() => onDeleteUser(u.id, u.name)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ef4444',
                          borderRadius: '6px',
                          transition: 'opacity 0.15s, background-color 0.15s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <PaginationFooter
          currentPage={userPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          summaryText={`แสดง ${appUsers.length > 0 ? 1 : 0}-${appUsers.length} จาก ${appUsers.length} รายการ`}
        />
      </div>
    </div>
  )
}
