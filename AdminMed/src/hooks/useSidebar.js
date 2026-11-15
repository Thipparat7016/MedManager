import { useLocation, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'

export function useSidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  const isMedicationActive = location.pathname.startsWith('/medications')
  const isInteractionActive = location.pathname.startsWith('/interactions')
  const isDashboardActive = location.pathname === '/'

  const handleLogout = async () => {
    if (window.confirm('คุณต้องการออกจากระบบหรือไม่?')) {
      await authService.logout()
      navigate('/login', { replace: true })
    }
  }

  return {
    isDashboardActive,
    isMedicationActive,
    isInteractionActive,
    handleLogout
  }
}
