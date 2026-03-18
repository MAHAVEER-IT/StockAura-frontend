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
<<<<<<< HEAD
  const [authEmail, setAuthEmail] = useState('')
  const [authRole, setAuthRole] = useState('')
=======
  const [activeAdmin, setActiveAdmin] = useState('')
  const [activeEmployee, setActiveEmployee] = useState('')
>>>>>>> 84691adcb99694212a6726b20a7b3842c71b3a0a
  const [authToken, setAuthToken] = useState('')
  const [employees, setEmployees] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const toUiRole = (apiRole) => (apiRole === 'admin' ? 'ADMIN' : 'EMPLOYEE')

  const handleLogout = () => {
    setCurrentPage('login')
    setAuthEmail('')
    setAuthRole('')
    setAuthToken('')
    setEmployees([])
    setAuthError('')
    // Clear localStorage on logout
    localStorage.removeItem('authToken')
    localStorage.removeItem('authEmail')
    localStorage.removeItem('authRole')
  }

  const loadUsers = async (token) => {
    try {
      const response = await getUsers(token)
      const mapped = (response.users || []).map((user) => ({
        id: user._id,
        email: user.email,
        role: toUiRole(user.role),
      }))
      setEmployees(mapped)
    } catch (error) {
      console.warn('Employee list load failed (admin-only):', error.message)
      setEmployees([])
    }
  }

  // Load auth state from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken')
<<<<<<< HEAD
    const savedEmail = localStorage.getItem('authEmail')
    const savedRole = localStorage.getItem('authRole')

    if (savedToken && savedEmail && savedRole) {
      setAuthToken(savedToken)
      setAuthEmail(savedEmail)
      setAuthRole(savedRole)

      if (savedRole === 'admin') {
        setCurrentPage('admin-dashboard')
        // Load users with the saved token (admin-only)
        loadUsers(savedToken).catch(() => {
          // If token is invalid, clear and redirect to login
          handleLogout()
        })
      } else {
        setCurrentPage('employee-dashboard')
      }
=======
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
>>>>>>> 84691adcb99694212a6726b20a7b3842c71b3a0a
    }
    setIsLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
<<<<<<< HEAD
=======
    const apiRole = role === 'ADMIN' ? 'admin' : 'user'
>>>>>>> 84691adcb99694212a6726b20a7b3842c71b3a0a

    if (!normalizedEmail || !normalizedPassword) {
      return
    }

    try {
      await registerUser({
        email: normalizedEmail,
        password: normalizedPassword,
        role, // 'ADMIN' | 'EMPLOYEE' (mapped in api layer)
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

<<<<<<< HEAD
      const token = response.token
      const emailFromApi = response?.user?.email || normalizedEmail
      const roleFromApi = backendRole || (isAdminLogin ? 'admin' : 'user')

      setAuthToken(token)
      setAuthEmail(emailFromApi)
      setAuthRole(roleFromApi)

      localStorage.setItem('authToken', token)
      localStorage.setItem('authEmail', emailFromApi)
      localStorage.setItem('authRole', roleFromApi)

      setAuthError('')

      if (roleFromApi === 'admin') {
        await loadUsers(token)
        setCurrentPage('admin-dashboard')
      } else {
        setEmployees([])
        setCurrentPage('employee-dashboard')
      }
      return
=======
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
>>>>>>> 84691adcb99694212a6726b20a7b3842c71b3a0a
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

<<<<<<< HEAD
=======
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

>>>>>>> 84691adcb99694212a6726b20a7b3842c71b3a0a
  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
  }

  if (currentPage === 'admin-dashboard') {
    if (authRole && authRole !== 'admin') {
      handleLogout()
      return null
    }
    return (
      <AdminDashboard
        adminEmail={authEmail || ADMIN_CREDENTIALS.email}
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
<<<<<<< HEAD
        userEmail={authEmail || 'employee@stockaura.com'}
=======
        employeeEmail={activeEmployee}
>>>>>>> 84691adcb99694212a6726b20a7b3842c71b3a0a
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
