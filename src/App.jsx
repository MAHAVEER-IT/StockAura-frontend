import { useState, useEffect } from 'react'
import './App.css'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import EmployeeDashboard from './pages/EmployeeDashboard'
import { deleteUser, getUsers, loginRequest, registerUser } from './services/api'

const ADMIN_CREDENTIALS = {
  email: 'admin@gmail.com',
  password: 'admin123',
}

function App() {
  const [currentPage, setCurrentPage] = useState('landing')
  const [authError, setAuthError] = useState('')
  const [activeAdmin, setActiveAdmin] = useState('')
  const [activeEmployee, setActiveEmployee] = useState('')
  const [authToken, setAuthToken] = useState('')
  const [employees, setEmployees] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Load auth state from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken')
    const savedRole = localStorage.getItem('activeRole')
    const savedEmail = localStorage.getItem('activeEmail')
    const savedAdmin = localStorage.getItem('activeAdmin')

    if (savedToken && savedRole === 'admin' && (savedEmail || savedAdmin)) {
      setAuthToken(savedToken)
      setActiveAdmin(savedEmail || savedAdmin)
      setCurrentPage('admin-dashboard')
      // Load users with the saved token
      loadUsers(savedToken).catch(() => {
        // If token is invalid, clear and redirect to login
        handleLogout()
      })
    } else if (savedToken && savedRole === 'employee' && savedEmail) {
      setAuthToken(savedToken)
      setActiveEmployee(savedEmail)
      setCurrentPage('employee-dashboard')
    }
    setIsLoading(false)
  }, [])

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
    const apiRole = role === 'ADMIN' ? 'admin' : 'user'

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

  const handleDeleteEmployee = async (employeeId) => {
    if (!authToken) {
      return
    }

    await deleteUser(authToken, employeeId)
    setEmployees((prev) => prev.filter((employee) => employee.id !== employeeId))
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
        setActiveEmployee('')
        // Save to localStorage for persistence
        localStorage.setItem('authToken', response.token)
        localStorage.setItem('activeAdmin', response.user.email)
        localStorage.setItem('activeRole', 'admin')
        localStorage.setItem('activeEmail', response.user.email)
        await loadUsers(response.token)
        setAuthError('')
        setCurrentPage('admin-dashboard')
        return
      }

      setAuthToken(response.token)
      setActiveEmployee(response.user.email)
      setActiveAdmin('')
      localStorage.setItem('authToken', response.token)
      localStorage.setItem('activeRole', 'employee')
      localStorage.setItem('activeEmail', response.user.email)
      localStorage.removeItem('activeAdmin')
      setAuthError('')
      setCurrentPage('employee-dashboard')
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
    setActiveEmployee('')
    setAuthToken('')
    setEmployees([])
    setAuthError('')
    // Clear localStorage on logout
    localStorage.removeItem('authToken')
    localStorage.removeItem('activeAdmin')
    localStorage.removeItem('activeRole')
    localStorage.removeItem('activeEmail')
  }

  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
  }

  if (currentPage === 'admin-dashboard') {
    return (
      <AdminDashboard
        adminEmail={activeAdmin || ADMIN_CREDENTIALS.email}
        authToken={authToken}
        employees={employees}
        onCreateEmployee={handleCreateEmployee}
        onDeleteEmployee={handleDeleteEmployee}
        onLogout={handleLogout}
      />
    )
  }

  if (currentPage === 'employee-dashboard') {
    return (
      <EmployeeDashboard
        employeeEmail={activeEmployee}
        authToken={authToken}
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
