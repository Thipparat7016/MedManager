import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom'
import { authService } from '../services/authService'
import { adminProfileService } from '../services/adminProfileService'
import { userService } from '../services/userService'
import { compressImageFile } from '../services/drugImageService'

export function useSettings() {
  const navigate = useNavigate()
  const { adminProfile, reloadProfile } = useOutletContext()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'users' ? 'users' : 'admin'
  const [activeTab, setActiveTab] = useState(initialTab)
  const fileInputRef = useRef(null)

  const handleLogout = async () => {
    if (window.confirm('คุณต้องการออกจากระบบหรือไม่?')) {
      await authService.logout()
      navigate('/login', { replace: true })
    }
  }

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'Admin',
    avatar_url: ''
  })
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const [appUsers, setAppUsers] = useState([])
  const [userSearch, setUserSearch] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState([])
  const [userPage, setUserPage] = useState(1)
  const pageSize = 5
  const totalPages = Math.ceil(appUsers.length / pageSize) || 1

  const loadUsers = useCallback(async (q = '') => {
    const list = await userService.getAppUsers({ search: q })
    setAppUsers(list)
  }, [])

  useEffect(() => {
    if (adminProfile) {
      setFormData({
        id: adminProfile.id,
        first_name: adminProfile.first_name || 'Admin',
        last_name: adminProfile.last_name || 'medicine',
        email: adminProfile.email || 'admin@gmail.com',
        phone: adminProfile.phone || '095-326-5723',
        role: adminProfile.role || 'Admin',
        avatar_url: adminProfile.avatar_url || ''
      })
    }
    loadUsers()
  }, [adminProfile, loadUsers])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (tab === 'users') {
      setSearchParams({ tab: 'users' })
    } else {
      setSearchParams({})
    }
  }

  const handleUserSearch = (e) => {
    if (e) e.preventDefault()
    loadUsers(userSearch)
  }

  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีผู้ใช้ "${name}"?`)) {
      await userService.deleteAppUser(id)
      await loadUsers(userSearch)
      setSelectedUserIds(prev => prev.filter(item => item !== id))
    }
  }

  const handleDeleteSelectedUsers = async () => {
    if (selectedUserIds.length === 0) return
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีผู้ใช้ที่เลือกทั้งหมด ${selectedUserIds.length} รายการ?`)) {
      await userService.deleteMultipleAppUsers(selectedUserIds)
      setSelectedUserIds([])
      await loadUsers(userSearch)
    }
  }

  const handleToggleSelectAllUsers = (checked) => {
    if (checked) {
      setSelectedUserIds(appUsers.map(u => u.id))
    } else {
      setSelectedUserIds([])
    }
  }

  const handleToggleSelectOneUser = (id) => {
    setSelectedUserIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const compressed = await compressImageFile(file, {
          maxWidth: 240,
          maxHeight: 240,
          quality: 0.72
        })
        setFormData(prev => ({ ...prev, avatar_url: compressed }))
      } catch (err) {
        console.warn('Avatar compression error:', err)
      }
    }
  }

  const handleRemoveAvatar = () => {
    setFormData(prev => ({ ...prev, avatar_url: '' }))
  }

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    setSaving(true)
    const updated = await adminProfileService.updateAdminProfile(formData)
    if (reloadProfile) {
      await reloadProfile()
    }
    if (updated?.avatar_url) {
      setFormData(prev => ({ ...prev, avatar_url: updated.avatar_url }))
    }
    setSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2500)
  }

  return {
    activeTab,
    handleTabChange,
    fileInputRef,
    handleLogout,
    formData,
    saving,
    saveSuccess,
    appUsers,
    userSearch,
    setUserSearch,
    selectedUserIds,
    userPage,
    setUserPage,
    totalPages,
    handleUserSearch,
    handleDeleteUser,
    handleDeleteSelectedUsers,
    handleToggleSelectAllUsers,
    handleToggleSelectOneUser,
    handleChange,
    handleAvatarChange,
    handleRemoveAvatar,
    handleSave
  }
}
