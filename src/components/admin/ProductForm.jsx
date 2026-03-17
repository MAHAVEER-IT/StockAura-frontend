import { useEffect, useState } from 'react'

const defaultProduct = {
  name: '',
  description: '',
  price: '',
  quantity: '100',
  lowStockThreshold: '20',
  expiryDate: '',
  imageFile: null,
  imageName: '',
  category: '',
  supplier: '',
}

export default function ProductForm({ editingProduct, onSave, onCancelEdit, categories = [], suppliers = [] }) {
  const [form, setForm] = useState(defaultProduct)

  useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name,
        description: editingProduct.description || '',
        price: String(editingProduct.price),
        quantity: String(editingProduct.quantity || 100),
        lowStockThreshold: String(editingProduct.lowStockThreshold || 20),
        expiryDate: editingProduct.expiryDate || editingProduct.expiry || '',
        imageFile: null,
        imageName: '',
        category: editingProduct.category?._id || editingProduct.category || '',
        supplier: editingProduct.supplier?._id || editingProduct.supplier || '',
      })
      return
    }

    setForm(defaultProduct)
  }, [editingProduct])


  useEffect(() => {
    if (categories.length > 0 && !form.category && !editingProduct) {
      setForm((prev) => ({
        ...prev,
        category: categories[0]._id,
      }))
    }
  }, [categories, editingProduct, form.category])

  useEffect(() => {
    if (suppliers.length > 0 && !form.supplier && !editingProduct) {
      setForm((prev) => ({
        ...prev,
        supplier: suppliers[0]._id,
      }))
    }
  }, [suppliers, editingProduct, form.supplier])

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

        <div className="field-group field-group-wide">
          <label htmlFor="product-description">Description</label>
          <textarea
            id="product-description"
            name="description"
            placeholder="Enter product description (optional)"
            value={form.description}
            onChange={handleChange}
            rows="3"
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
          <label htmlFor="product-quantity">Initial Quantity</label>
          <input
            id="product-quantity"
            name="quantity"
            type="number"
            min="0"
            placeholder="100"
            value={form.quantity}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="product-lowStockThreshold">Low Stock Threshold</label>
          <input
            id="product-lowStockThreshold"
            name="lowStockThreshold"
            type="number"
            min="1"
            placeholder="20"
            value={form.lowStockThreshold}
            onChange={handleChange}
          />
        </div>

        <div className="field-group">
          <label htmlFor="product-expiryDate">Expiry Date</label>
          <input
            id="product-expiryDate"
            name="expiryDate"
            type="date"
            value={form.expiryDate}
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
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label htmlFor="product-supplier">Supplier</label>
          <select
            id="product-supplier"
            name="supplier"
            value={form.supplier}
            onChange={handleChange}
            required
          >
            <option value="">Select a supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier._id} value={supplier._id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field-group field-group-wide">
          <p className="file-note">Barcode will be auto-generated when you create product.</p>

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
