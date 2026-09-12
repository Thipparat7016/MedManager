import React from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Home, LayoutGrid, Sparkles, Settings, LogOut } from 'lucide-react'
import { dataService } from '../../services/dataService'

export default function Sidebar({ adminProfile }) {
  const location = useLocation()
  const navigate = useNavigate()

  const isMedicationActive = location.pathname.startsWith('/medications')
  const isInteractionActive = location.pathname.startsWith('/interactions')

  const handleLogout = () => {
    if (window.confirm('คุณต้องการออกจากระบบหรือไม่?')) {
      dataService.logout()
      navigate('/login')
    }
  }

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <h1 className="sidebar-brand-title">MedManager</h1>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `nav-item ${isActive || location.pathname === '/' ? 'active' : ''}`}
        >
          <Home className="nav-icon" />
          <span>แดชบอร์ด</span>
        </NavLink>

        <NavLink 
          to="/medications" 
          className={`nav-item ${isMedicationActive ? 'active' : ''}`}
        >
          <LayoutGrid className="nav-icon" />
          <span>ข้อมูลยาพื้นฐาน</span>
        </NavLink>

        <NavLink 
          to="/interactions" 
          className={`nav-item ${isInteractionActive ? 'active' : ''}`}
        >
          <Sparkles className="nav-icon" />
          <span>ปฏิสัมพันธ์ยา-อาหาร</span>
        </NavLink>

        <NavLink 
          to="/settings" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Settings className="nav-icon" />
          <span>ตั้งค่าระบบ</span>
        </NavLink>
      </nav>

      {/* Footer Profile with Logout Icon */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <NavLink to="/settings" className="sidebar-user" style={{ flex: 1, textDecoration: 'none', minWidth: 0, marginRight: '8px' }}>
            <div className="user-avatar-badge" style={{ overflow: 'hidden', padding: 0 }}>
              {adminProfile?.avatar_url ? (
                <img 
                  src={adminProfile.avatar_url} 
                  alt="Admin Avatar" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-circle)' }} 
                />
              ) : (
                adminProfile?.first_name?.[0] || 'A'
              )}
            </div>
            <div className="user-info" style={{ overflow: 'hidden' }}>
              <div className="user-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {adminProfile ? `${adminProfile.first_name || ''} ${adminProfile.last_name || ''}`.trim() || 'Admin' : 'Admin'}
              </div>
              <div className="user-role">{adminProfile?.role || 'Admin'}</div>
            </div>
          </NavLink>

          <button
            onClick={handleLogout}
            title="ออกจากระบบ"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-neutral-400)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-danger-500)'
              e.currentTarget.style.backgroundColor = 'var(--color-danger-100)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-neutral-400)'
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </aside>
  )
}
