import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { dataService } from '../../services/dataService'

export default function AdminLayout() {
  const [adminProfile, setAdminProfile] = useState(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const profile = await dataService.getAdminProfile()
    setAdminProfile(profile)
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
