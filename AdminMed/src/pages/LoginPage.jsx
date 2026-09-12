import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { dataService } from '../services/dataService'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e) => {
    if (e) e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setErrorMsg('กรุณากรอกอีเมลและรหัสผ่าน')
      return
    }

    setLoading(true)
    setErrorMsg('')
    try {
      await dataService.login(email.trim(), password)
      navigate('/dashboard')
    } catch (err) {
      console.error('Supabase Auth error:', err)
      if (err?.message?.includes('Invalid login credentials')) {
        setErrorMsg('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
      } else if (err?.message?.includes('Email not confirmed')) {
        setErrorMsg('อีเมลนี้ยังไม่ได้ยืนยันตัวตน (Email not confirmed)')
      } else {
        setErrorMsg(err?.message || 'เข้าสู่ระบบไม่สำเร็จ โปรดตรวจสอบข้อมูลอีกครั้ง')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Logo Icon */}
        <div className="login-logo-box">
          <div className="login-pill-icon" />
        </div>

        {/* Title & Subtitle */}
        <h1 className="login-title">MedManager Admin</h1>
        <p className="login-subtitle">ระบบจัดการยาสำหรับผู้ดูแลระบบ</p>

        {errorMsg && (
          <div style={{ padding: '10px 12px', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '8px', marginBottom: '16px', fontSize: '12.5px' }}>
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label" style={{ fontSize: '12px', color: '#475569' }}>อีเมล</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="กรอกอีเมล"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '6px' }}>
            <label className="form-label" style={{ fontSize: '12px', color: '#475569' }}>รหัสผ่าน</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="form-input" 
                placeholder="กรอกรหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: '36px' }}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: 0,
                  display: 'flex'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '12px', fontSize: '14px', borderRadius: '10px', marginTop: '20px' }}
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    </div>
  )
}
