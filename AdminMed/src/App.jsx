import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './components/layout/AdminLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import MedicationListPage from './pages/MedicationListPage'
import MedicationFormPage from './pages/MedicationFormPage'
import InteractionListPage from './pages/InteractionListPage'
import InteractionFormPage from './pages/InteractionFormPage'
import SettingsPage from './pages/SettingsPage'
import { dataService } from './services/dataService'

function ProtectedRoute({ children }) {
  const isAuth = dataService.isAuthenticated()
  if (!isAuth) {
    return <Navigate to="/login" replace />
  }
  return children
}

function PublicRoute({ children }) {
  const isAuth = dataService.isAuthenticated()
  if (isAuth) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public Login Route */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />

        {/* Protected Admin Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          
          {/* Medications */}
          <Route path="medications" element={<MedicationListPage />} />
          <Route path="medications/new" element={<MedicationFormPage />} />
          <Route path="medications/edit/:id" element={<MedicationFormPage />} />
          
          {/* Interactions */}
          <Route path="interactions" element={<InteractionListPage />} />
          <Route path="interactions/new" element={<InteractionFormPage />} />
          <Route path="interactions/edit/:id" element={<InteractionFormPage />} />
          
          {/* Settings & Users */}
          <Route path="settings" element={<SettingsPage />} />
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
