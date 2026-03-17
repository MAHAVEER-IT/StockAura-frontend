import { useState } from 'react'

export default function CategoryList({ categories, onEdit, onDelete, error }) {
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', description: '' })

  const handleEditStart = (category) => {
    setEditingId(category._id)
    setEditForm({
      name: category.name,
      description: category.description || '',
    })
  }

  const handleEditChange = (event) => {
    const { name, value } = event.target
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleEditSave = (categoryId) => {
    if (editForm.name.trim()) {
      onEdit(categoryId, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
      })
      setEditingId(null)
    }
  }

  const handleEditCancel = () => {
    setEditingId(null)
  }

  return (
    <section className="category-list" aria-label="Category list management">
      <h3>Categories</h3>

      {error && <p className="list-error">{error}</p>}

      {categories.length === 0 ? (
        <p className="empty-state">No categories yet. Add your first category.</p>
      ) : (
        <div className="category-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) =>
                editingId === category._id ? (
                  <tr key={category._id} className="editing-row">
                    <td>
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                        required
                      />
                    </td>
                    <td>
                      <textarea
                        name="description"
                        value={editForm.description}
                        onChange={handleEditChange}
                        rows="2"
                      />
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="table-btn success"
                          type="button"
                          onClick={() => handleEditSave(category._id)}
                        >
                          Save
                        </button>
                        <button
                          className="table-btn"
                          type="button"
                          onClick={handleEditCancel}
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={category._id}>
                    <td className="category-name">{category.name}</td>
                    <td className="category-desc">{category.description || '—'}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="table-btn"
                          type="button"
                          onClick={() => handleEditStart(category)}
                        >
                          Edit
                        </button>
                        <button
                          className="table-btn danger"
                          type="button"
                          onClick={() => onDelete(category._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
