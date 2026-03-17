import { useState } from 'react'

export default function CreateSupplierForm({ onSave, error }) {
const [form, setForm] = useState({
    name: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
  })

  const [localError, setLocalError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmedName = form.name.trim()
    setLocalError('')
    if (!trimmedName) {
      setLocalError('Supplier name is required')
      return
    }
    onSave({
      name: trimmedName,
      contactEmail: form.contactEmail.trim(),
      contactPhone: form.contactPhone.trim(),
      address: form.address.trim(),
    })
    setForm({ name: '', contactEmail: '', contactPhone: '', address: '' })
  }

  return (
    <form className="supplier-form" onSubmit={handleSubmit}>
      <h3>Add New Supplier</h3>

      {error && <p className="form-error">{error}</p>}
      {localError && <p className="form-error">{localError}</p>}

      <div className="supplier-form-grid">
        <div className="field-group">
          <label htmlFor="supplier-name">Supplier Name</label>
          <input
            id="supplier-name"
            name="name"
            type="text"
            placeholder="e.g. ABC Distributors"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="supplier-email">Contact Email</label>
          <input
            id="supplier-email"
            name="contactEmail"
            type="email"
            placeholder="supplier@company.com"
            value={form.contactEmail}
            onChange={handleChange}
          />
        </div>

        <div className="field-group">
          <label htmlFor="supplier-phone">Contact Phone</label>
          <input
            id="supplier-phone"
            name="contactPhone"
            type="tel"
            placeholder="123-456-7890"
            value={form.contactPhone}
            onChange={handleChange}
          />
        </div>

        <div className="field-group">
          <label htmlFor="supplier-address">Address</label>
          <textarea
            id="supplier-address"
            name="address"
            placeholder="123 Main St, City, State"
            value={form.address}
            onChange={handleChange}
            rows="2"
          />
        </div>
      </div>

      <button type="submit" className="primary-btn">
        Add Supplier
      </button>
    </form>
  )
}

