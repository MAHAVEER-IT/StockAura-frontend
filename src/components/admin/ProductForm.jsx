import { useEffect, useState } from 'react'

const defaultProduct = {
  name: '',
  price: '',
  barcode: '',
  expiry: '',
  imageFile: null,
  imageName: '',
<<<<<<< HEAD
  category: '',
}

export default function ProductForm({ editingProduct, onSave, onCancelEdit, categories = [] }) {
=======
  category: 'Grocery',
}

const categoryOptions = [
  'Grocery',
  'Beverages',
  'Dairy',
  'Snacks',
  'Household',
]

export default function ProductForm({ editingProduct, onSave, onCancelEdit }) {
>>>>>>> d2c3aef343459005e67fafa492442ee69a1e0e45
  const [form, setForm] = useState(defaultProduct)

  useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name,
        price: String(editingProduct.price),
        barcode: editingProduct.barcode,
        expiry: editingProduct.expiry,
        imageFile: null,
        imageName: '',
<<<<<<< HEAD
        category: editingProduct.category?._id || editingProduct.category || '',
=======
        category: editingProduct.category,
>>>>>>> d2c3aef343459005e67fafa492442ee69a1e0e45
      })
      return
    }

    setForm(defaultProduct)
  }, [editingProduct])

<<<<<<< HEAD
  // Set default category when categories load
  useEffect(() => {
    if (categories.length > 0 && !form.category && !editingProduct) {
      setForm((prev) => ({
        ...prev,
        category: categories[0]._id,
      }))
    }
  }, [categories, editingProduct])

=======
>>>>>>> d2c3aef343459005e67fafa492442ee69a1e0e45
  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null
    setForm((prev) => ({
      ...prev,
      imageFile: file,
      imageName: file ? file.name : '',
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave({
      ...form,
      price: Number(form.price),
    })

    if (!editingProduct) {
      setForm(defaultProduct)
    }
  }

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>

      <div className="product-form-grid">
        <div className="field-group">
          <label htmlFor="product-name">Product Name</label>
          <input
            id="product-name"
            name="name"
            type="text"
            placeholder="e.g. Premium Rice 25kg"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="product-price">Price</label>
          <input
            id="product-price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.price}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="product-barcode">Barcode</label>
          <input
            id="product-barcode"
            name="barcode"
            type="text"
            placeholder="Enter barcode"
            value={form.barcode}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="product-expiry">Expiry Date</label>
          <input
            id="product-expiry"
            name="expiry"
            type="date"
            value={form.expiry}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="product-category">Category</label>
          <select
            id="product-category"
            name="category"
            value={form.category}
            onChange={handleChange}
<<<<<<< HEAD
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
=======
          >
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
>>>>>>> d2c3aef343459005e67fafa492442ee69a1e0e45
              </option>
            ))}
          </select>
        </div>

        <div className="field-group field-group-wide">
          <label htmlFor="product-image">Product Image</label>
          <input
            id="product-image"
            name="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            required={!editingProduct}
          />
          {form.imageName ? <p className="file-note">Selected: {form.imageName}</p> : null}
          {editingProduct ? (
            <p className="file-note">Leave empty to keep existing image.</p>
          ) : null}
        </div>
      </div>

      <div className="product-form-actions">
        <button className="primary-btn" type="submit">
          {editingProduct ? 'Update Product' : 'Add Product'}
        </button>
        {editingProduct ? (
          <button className="ghost-btn" type="button" onClick={onCancelEdit}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  )
}
