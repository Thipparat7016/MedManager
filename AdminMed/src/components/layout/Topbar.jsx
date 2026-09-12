import React from 'react'
import { Bell } from 'lucide-react'

export default function Topbar({ adminProfile }) {
  // Format Thai date or default to design date
  const getThaiDate = () => {
    const days = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์']
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ]
    const now = new Date()
    const dayName = days[now.getDay()]
    const dateNum = now.getDate()
    const monthName = months[now.getMonth()]
    const yearBE = now.getFullYear() + 543
    return `ยินดีต้อนรับ • ${dayName}ที่ ${dateNum} ${monthName} ${yearBE}`
  }

  return (
    <header className="topbar">
    
      <div className="topbar-welcome">
        {getThaiDate()}
      </div>

      <div className="topbar-actions">
        <button className="topbar-avatar-btn" title="โปรไฟล์" style={{ overflow: 'hidden', padding: 0 }}>
          {adminProfile?.avatar_url ? (
            <img 
              src={adminProfile.avatar_url} 
              alt="Admin Avatar" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-circle)' }} 
            />
          ) : (
            adminProfile?.first_name?.[0] || 'A'
          )}
        </button>
      </div>

    </header>
  )
}
