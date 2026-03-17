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
  getSuppliers,
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
  onLogout,
}) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
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

  const loadSuppliers = async () => {
    if (!authToken) {
      return
    }

    try {
      const response = await getSuppliers(authToken)
      setSuppliers(response.suppliers || [])
    } catch (error) {
      console.error('Failed to load suppliers:', error.message)
    }
  }

  useEffect(() => {
    loadProducts()
    loadCategories()
    loadSuppliers()
  }, [authToken])

  const handleSaveProduct = async (payload) => {
    const normalized = {
      name: payload.name.trim(),
      price: Number(payload.price),
      barcode: payload.barcode.trim(),
      expiry: payload.expiry,
      imageFile: payload.imageFile,
      category: payload.category,
      supplier: payload.supplier,
      quantity: payload.quantity || '0',
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
          <CreateEmployeeForm onCreate={onCreateEmployee} />
          <EmployeeList employees={employees} />
        </section>

        <section className="dashboard-grid category-grid">
          <CreateCategoryForm onSave={handleCreateCategory} error={categoryError} />
          <CategoryList
            categories={categories}
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategory}
            error={categoryError}
          />
        </section>

        <section className="dashboard-grid product-grid">
          <ProductForm
            editingProduct={editingProduct}
            onSave={handleSaveProduct}
            onCancelEdit={handleCancelEdit}
            categories={categories}
            suppliers={suppliers}
          />
          <ProductList
            products={products}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
          />
        </section>
      </main>
    </div>
  )
}
