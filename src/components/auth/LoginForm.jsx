import { useState } from 'react'

const defaultForm = {
  email: '',
  password: '',
}

export default function LoginForm({ role, onSubmit, errorMessage }) {
  const [form, setForm] = useState(defaultForm)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit({
      ...form,
      role,
    })
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <label htmlFor="email">Work Email</label>
      <input
        id="email"
        name="email"
        type="email"
        placeholder={role === 'ADMIN' ? 'admin@stockaura.com' : 'name@warehouse.com'}
        value={form.email}
        onChange={handleChange}
        required
      />

      <label htmlFor="password">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        placeholder="Enter password"
        value={form.password}
        onChange={handleChange}
        required
      />

      <button className="primary-btn login-submit" type="submit">
        Continue as {role === 'ADMIN' ? 'Admin' : 'Employee'}
      </button>

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
    </form>
  )
}
