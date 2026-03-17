import { useEffect, useState } from 'react'
import CreateEmployeeForm from '../components/admin/CreateEmployeeForm'
import EmployeeList from '../components/admin/EmployeeList'
import CreateCategoryForm from '../components/admin/CreateCategoryForm'
import CategoryList from '../components/admin/CategoryList'
import ProductForm from '../components/admin/ProductForm'
import ProductList from '../components/admin/ProductList'
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../services/api'

export default function AdminDashboard({
  adminEmail,
  authToken,
  employees,
  onCreateEmployee,
  onDeleteEmployee,
  onLogout,
}) {
  const [showStaffFeature, setShowStaffFeature] = useState(true)
  const [showCategoryFeature, setShowCategoryFeature] = useState(true)
  const [showProductFeature, setShowProductFeature] = useState(true)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  const [dashboardError, setDashboardError] = useState('')
  const [categoryError, setCategoryError] = useState('')

  const mapProduct = (product) => ({
    id: product._id,
    name: product.name,
    price: product.price,
    barcode: product.barcode,
    expiry: product.expiryDate ? String(product.expiryDate).slice(0, 10) : '',
    image: product.imageUrl,
    category: product.category,
  })

  const loadProducts = async () => {
    if (!authToken) {
      return
    }

    try {
      const response = await getProducts(authToken)
      setProducts((response.products || []).map(mapProduct))
      setDashboardError('')
    } catch (error) {
      setDashboardError(error.message)
    }
  }

  const loadCategories = async () => {
    if (!authToken) {
      return
    }

    try {
      const response = await getCategories(authToken)
      setCategories(response.categories || [])
      setCategoryError('')
    } catch (error) {
      setCategoryError(error.message)
    }
  }

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [authToken])

  const handleSaveProduct = async (payload) => {
    const normalized = {
      name: payload.name.trim(),
      price: Number(payload.price),
      barcode: payload.barcode.trim(),
      expiry: payload.expiry,
      imageFile: payload.imageFile,
      category: payload.category,
    }

    if (
      !normalized.name ||
      !Number.isFinite(normalized.price) ||
      normalized.price < 0 ||
      !normalized.barcode ||
      !normalized.expiry ||
      !normalized.category
    ) {
      return
    }

    if (!editingProduct && !normalized.imageFile) {
      setDashboardError('Product image is required.')
      return
    }

    const apiPayload = {
      name: normalized.name,
      price: normalized.price,
      barcode: normalized.barcode,
      expiryDate: normalized.expiry,
      category: normalized.category,
      image: normalized.imageFile,
      imageUrl: editingProduct ? editingProduct.image : '',
    }

    if (editingProduct) {
      try {
        const response = await updateProduct(authToken, editingProduct.id, apiPayload)
        setProducts((prev) =>
          prev.map((product) =>
            product.id === editingProduct.id ? mapProduct(response.product) : product,
          ),
        )
        setEditingProduct(null)
        setDashboardError('')
      } catch (error) {
        setDashboardError(error.message)
      }
      return
    }

    try {
      const response = await createProduct(authToken, apiPayload)
      setProducts((prev) => [mapProduct(response.product), ...prev])
      setDashboardError('')
    } catch (error) {
      setDashboardError(error.message)
    }
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
  }

  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(authToken, id)
      setProducts((prev) => prev.filter((product) => product.id !== id))
      setEditingProduct((prev) => (prev?.id === id ? null : prev))
      setDashboardError('')
    } catch (error) {
      setDashboardError(error.message)
    }
  }

  const handleCancelEdit = () => {
    setEditingProduct(null)
  }

  const handleCreateCategory = async (payload) => {
    try {
      const response = await createCategory(authToken, payload)
      setCategories((prev) => [response.category, ...prev])
      setCategoryError('')
    } catch (error) {
      setCategoryError(error.message)
    }
  }

  const handleEditCategory = async (categoryId, payload) => {
    try {
      const response = await updateCategory(authToken, categoryId, payload)
      setCategories((prev) =>
        prev.map((cat) => (cat._id === categoryId ? response.category : cat))
      )
      setCategoryError('')
    } catch (error) {
      setCategoryError(error.message)
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteCategory(authToken, categoryId)
      setCategories((prev) => prev.filter((cat) => cat._id !== categoryId))
      setCategoryError('')
    } catch (error) {
      setCategoryError(error.message)
    }
  }

  return (
    <div className="dashboard-shell">
      <header className="top-nav">
        <div className="brand-wrap">
          <div className="brand-orb" />
          <p className="brand-name">StockAura Admin</p>
        </div>
        <button className="ghost-btn" type="button" onClick={onLogout}>
          Logout
        </button>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-intro">
          <p className="hero-kicker">Admin Dashboard</p>
          <h1>Welcome, {adminEmail}</h1>
          <p>
            Manage employee access and products from one place. Add, edit, and delete
            products with local image upload, category, name, price, barcode, and
            expiry.
          </p>
          {dashboardError ? <p className="dashboard-error">{dashboardError}</p> : null}
        </section>

        <section className="dashboard-grid employee-grid">
          <article className="option-card" aria-label="Staff access feature">
            <div className="option-header">
              <h2>Staff Access Feature</h2>
              <button
                className="option-toggle"
                type="button"
                onClick={() => setShowStaffFeature((prev) => !prev)}
              >
                {showStaffFeature ? 'Close' : 'Expand'}
              </button>
            </div>

            {showStaffFeature ? (
              <div className="option-content employee-option-content">
                <CreateEmployeeForm onCreate={onCreateEmployee} />
                <EmployeeList employees={employees} onDelete={onDeleteEmployee} />
              </div>
            ) : (
              <p className="option-collapsed-note">Panel collapsed. Click Expand to open.</p>
            )}
          </article>
        </section>

        <section className="dashboard-grid category-grid">
          <article className="option-card" aria-label="Category management feature">
            <div className="option-header">
              <h2>Category Management Feature</h2>
              <button
                className="option-toggle"
                type="button"
                onClick={() => setShowCategoryFeature((prev) => !prev)}
              >
                {showCategoryFeature ? 'Close' : 'Expand'}
              </button>
            </div>

            {showCategoryFeature ? (
              <div className="option-content category-option-content">
                <CreateCategoryForm onSave={handleCreateCategory} error={categoryError} />
                <CategoryList
                  categories={categories}
                  onEdit={handleEditCategory}
                  onDelete={handleDeleteCategory}
                  error={categoryError}
                />
              </div>
            ) : (
              <p className="option-collapsed-note">Panel collapsed. Click Expand to open.</p>
            )}
          </article>
        </section>

        <section className="dashboard-grid product-grid">
          <article className="option-card" aria-label="Product management feature">
            <div className="option-header">
              <h2>Product Management Feature</h2>
              <button
                className="option-toggle"
                type="button"
                onClick={() => setShowProductFeature((prev) => !prev)}
              >
                {showProductFeature ? 'Close' : 'Expand'}
              </button>
            </div>

            {showProductFeature ? (
              <div className="option-content product-option-content">
                <ProductForm
                  editingProduct={editingProduct}
                  onSave={handleSaveProduct}
                  onCancelEdit={handleCancelEdit}
                  categories={categories}
                />
                <ProductList
                  products={products}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                />
              </div>
            ) : (
              <p className="option-collapsed-note">Panel collapsed. Click Expand to open.</p>
            )}
          </article>
        </section>
      </main>
    </div>
  )
}
