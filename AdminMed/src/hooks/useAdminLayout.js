import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { adminProfileService } from '../services/adminProfileService'

export function useAdminLayout() {
  const navigate = useNavigate()
  const isAuth = authService.isAuthenticated()
  const [adminProfile, setAdminProfile] = useState(null)

  const loadProfile = useCallback(async () => {
    const profile = await adminProfileService.getAdminProfile()
    setAdminProfile(profile)
  }, [])

  useEffect(() => {
    if (!isAuth) {
      navigate('/login', { replace: true })
      return
    }
    loadProfile()
  }, [isAuth, navigate, loadProfile])

  return {
    isAuth,
    adminProfile,
    reloadProfile: loadProfile
  }
}
