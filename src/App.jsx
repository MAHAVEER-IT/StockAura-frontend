import { useState } from 'react'
import './App.css'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import { getUsers, loginRequest, registerUser } from './services/api'

const ADMIN_CREDENTIALS = {
  email: 'admin@gmail.com',
  password: 'admin123',
}

function App() {
  const [currentPage, setCurrentPage] = useState('landing')
  const [authError, setAuthError] = useState('')
  const [activeAdmin, setActiveAdmin] = useState('')
  const [authToken, setAuthToken] = useState('')
  const [employees, setEmployees] = useState([])

  const toUiRole = (apiRole) => (apiRole === 'admin' ? 'ADMIN' : 'EMPLOYEE')

  const loadUsers = async (token) => {
    const response = await getUsers(token)
    const mapped = (response.users || []).map((user) => ({
      id: user._id,
      email: user.email,
      role: toUiRole(user.role),
    }))
    setEmployees(mapped)
  }

  const handleOpenLogin = () => {
    setAuthError('')
    setCurrentPage('login')
  }

  const handleCreateEmployee = async ({ email, password, role }) => {
    if (!authToken) {
      return
    }

    const normalizedEmail = email.trim().toLowerCase()
    const normalizedPassword = password.trim()
    const apiRole = role === 'ADMIN' ? 'admin' : 'employee'

    if (!normalizedEmail || !normalizedPassword) {
      return
    }

    try {
      await registerUser({
        email: normalizedEmail,
        password: normalizedPassword,
        role: apiRole,
      })
      await loadUsers(authToken)
      setAuthError('')
    } catch (error) {
      setAuthError(error.message)
    }
  }

  const handleLogin = async ({ email, password, role }) => {
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedPassword = password.trim()

    try {
      const response = await loginRequest({
        email: normalizedEmail,
        password: normalizedPassword,
      })

      const backendRole = response?.user?.role
      const isAdminLogin = role === 'ADMIN'
      const isAdminUser = backendRole === 'admin'

      if (isAdminLogin && !isAdminUser) {
        setAuthError('This account is not assigned as ADMIN.')
        return
      }

      if (!isAdminLogin && isAdminUser) {
        setAuthError('Please switch role toggle to ADMIN for this account.')
        return
      }

      if (isAdminLogin) {
        setAuthToken(response.token)
        setActiveAdmin(response.user.email)
        await loadUsers(response.token)
        setAuthError('')
        setCurrentPage('admin-dashboard')
        return
      }

      setAuthError('Employee login is connected. Employee dashboard will be added next.')
    } catch (error) {
      if (
        normalizedEmail === ADMIN_CREDENTIALS.email &&
        normalizedPassword === ADMIN_CREDENTIALS.password
      ) {
        setAuthError(
          'Admin credentials are correct in UI, but backend login failed. Check backend server and MongoDB connection.',
        )
        return
      }

      setAuthError(error.message)
    }
  }

  const handleLogout = () => {
    setCurrentPage('login')
    setActiveAdmin('')
    setAuthToken('')
    setEmployees([])
    setAuthError('')
  }

  if (currentPage === 'admin-dashboard') {
    return (
      <AdminDashboard
        adminEmail={activeAdmin || ADMIN_CREDENTIALS.email}
        authToken={authToken}
        employees={employees}
        onCreateEmployee={handleCreateEmployee}
        onLogout={handleLogout}
      />
    )
  }

  if (currentPage === 'login') {
    return (
      <LoginPage
        onBack={() => setCurrentPage('landing')}
        onLogin={handleLogin}
        authError={authError}
      />
    )
  }

  return <LandingPage onOpenLogin={handleOpenLogin} />
}

export default App
