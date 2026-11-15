import React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import AlertBanner from '../components/common/AlertBanner'
import { useLogin } from '../hooks/useLogin'
import './LoginPage.css'

export default function LoginPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    toggleShowPassword,
    loading,
    errorMsg,
    handleLogin
  } = useLogin()

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

        <AlertBanner variant="login-error" message={errorMsg} />

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">อีเมล</label>
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
            <label className="form-label">รหัสผ่าน</label>
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
                onClick={toggleShowPassword}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-neutral-400)',
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
            style={{ width: '100%', marginTop: '20px' }}
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    </div>
  )
}
