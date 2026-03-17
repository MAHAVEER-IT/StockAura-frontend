import { useState } from 'react'

export default function CreateCategoryForm({ onSave, error }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (form.name.trim()) {
      onSave({
        name: form.name.trim(),
        description: form.description.trim(),
      })
      setForm({ name: '', description: '' })
    }
  }

  return (
    <form className="category-form" onSubmit={handleSubmit}>
      <h3>Add New Category</h3>

      {error && <p className="form-error">{error}</p>}

      <div className="category-form-grid">
        <div className="field-group">
          <label htmlFor="category-name">Category Name</label>
          <input
            id="category-name"
            name="name"
            type="text"
            placeholder="e.g. Beverages"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="category-desc">Description</label>
          <textarea
            id="category-desc"
            name="description"
            placeholder="Optional description"
            value={form.description}
            onChange={handleChange}
            rows="3"
          />
        </div>
      </div>

      <button type="submit" className="primary-btn">
        Create Category
      </button>
    </form>
  )
}
