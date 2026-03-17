import { useState } from 'react'

const initialForm = {
  email: '',
  password: '',
  role: 'EMPLOYEE',
}

export default function CreateEmployeeForm({ onCreate }) {
  const [form, setForm] = useState(initialForm)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onCreate(form)
    setForm(initialForm)
  }

  return (
    <form className="employee-form" onSubmit={handleSubmit}>
      <h3>Create Staff Login</h3>

      <div className="employee-form-grid">
        <div className="field-group">
          <label htmlFor="employee-email">Employee Email</label>
          <input
            id="employee-email"
            name="email"
            type="email"
            placeholder="employee@company.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="employee-password">Employee Password</label>
          <input
            id="employee-password"
            name="password"
            type="password"
            placeholder="Create temporary password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="employee-role">Assign Role</label>
          <select
            id="employee-role"
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="ADMIN">ADMIN</option>
            <option value="EMPLOYEE">EMPLOYEE</option>
          </select>
        </div>
      </div>

      <button className="primary-btn" type="submit">
        Add Account
      </button>
    </form>
  )
}
