import React, { useState, useEffect } from 'react'
import { Outlet, Navigate, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { dataService } from '../../services/dataService'

export default function AdminLayout() {
  const navigate = useNavigate()
  const isAuth = dataService.isAuthenticated()
  const [adminProfile, setAdminProfile] = useState(null)

  useEffect(() => {
    if (!isAuth) {
      navigate('/login', { replace: true })
      return
    }
    loadProfile()
  }, [isAuth, navigate])

  const loadProfile = async () => {
    const profile = await dataService.getAdminProfile()
    setAdminProfile(profile)
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="app-layout">
      <Sidebar adminProfile={adminProfile} />
      
      <div className="main-wrapper">
        <Topbar adminProfile={adminProfile} />
        <main className="content-area">
          <Outlet context={{ adminProfile, reloadProfile: loadProfile }} />
        </main>
      </div>
    </div>
  )
}
