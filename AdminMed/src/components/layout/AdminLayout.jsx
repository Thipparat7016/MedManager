import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useAdminLayout } from '../../hooks/useAdminLayout'

export default function AdminLayout() {
  const { isAuth, adminProfile, reloadProfile } = useAdminLayout()

  if (!isAuth) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="app-layout">
      <Sidebar adminProfile={adminProfile} />

      <div className="main-wrapper">
        <Topbar adminProfile={adminProfile} />
        <main className="content-area">
          <Outlet context={{ adminProfile, reloadProfile }} />
        </main>
      </div>
    </div>
  )
}
