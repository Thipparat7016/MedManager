import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'

export function useLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  const toggleShowPassword = () => setShowPassword(prev => !prev)

  const handleLogin = async (e) => {
    if (e) e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setErrorMsg('กรุณากรอกอีเมลและรหัสผ่าน')
      return
    }

    setLoading(true)
    setErrorMsg('')
    try {
      await authService.login(email.trim(), password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      console.error('Login error:', err)
      setErrorMsg(err?.message || 'เข้าสู่ระบบไม่สำเร็จ โปรดตรวจสอบข้อมูลอีกครั้ง')
    } finally {
      setLoading(false)
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    toggleShowPassword,
    loading,
    errorMsg,
    handleLogin
  }
}
