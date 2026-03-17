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
import SupplierManagement from '../components/admin/SupplierManagement'

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
  const [supplierError, setSupplierError] = useState('')
  const [editingProduct, setEditingProduct] = useState(null)
  const [dashboardError, setDashboardError] = useState('')
  const [categoryError, setCategoryError] = useState('')

  const mapProduct = (product) => ({
    id: product._id,
    name: product.name,
    description: product.description || '',
    price: product.price,
    barcode: product.barcode,
    quantity: product.quantity || 0,
    lowStockThreshold: product.lowStockThreshold || 20,
    expiry: product.expiryDate ? String(product.expiryDate).slice(0, 10) : '',
    image: product.imageUrl,
    imageUrl: product.imageUrl,
    category: product.category,
    supplier: product.supplier,
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
      setSupplierError('')
    } catch (error) {
      setSupplierError(error.message)
    }
  }

  const handleCreateSupplier = async (payload) => {
    try {
      const response = await createSupplier(authToken, payload)
      setSuppliers((prev) => [response.supplier, ...prev])
      setSupplierError('')
    } catch (error) {
      setSupplierError(error.message)
    }
  }

  const handleEditSupplier = async (id, payload) => {
    try {
      const response = await updateSupplier(authToken, id, payload)
      setSuppliers((prev) =>
        prev.map((sup) => (sup._id === id ? response.supplier : sup))
      )
      setSupplierError('')
    } catch (error) {
      setSupplierError(error.message)
    }
  }

  const handleDeleteSupplier = async (id) => {
    try {
      await deleteSupplier(authToken, id)
      setSuppliers((prev) => prev.filter((sup) => sup._id !== id))
      setSupplierError('')
    } catch (error) {
      setSupplierError(error.message)
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
      description: payload.description || '',
      price: Number(payload.price),
      barcode: payload.barcode.trim(),
      quantity: payload.quantity || '100',
      lowStockThreshold: payload.lowStockThreshold || '20',
      expiryDate: payload.expiryDate,
      imageFile: payload.imageFile,
      category: payload.category,
      supplier: payload.supplier,
    }

    if (
      !normalized.name ||
      !Number.isFinite(normalized.price) ||
      normalized.price < 0 ||
      !normalized.barcode ||
      !normalized.expiryDate ||
      !normalized.category ||
      !normalized.supplier
    ) {
      setDashboardError('Please fill all required fields: name, price, barcode, expiry date, category, supplier.')
      return
    }

    if (!editingProduct && !normalized.imageFile) {
      setDashboardError('Product image is required.')
      return
    }

    const apiPayload = {
      name: normalized.name,
      description: normalized.description,
      price: normalized.price,
      barcode: normalized.barcode,
      quantity: normalized.quantity,
      lowStockThreshold: normalized.lowStockThreshold,
      expiryDate: normalized.expiryDate,
      category: normalized.category,
      supplier: normalized.supplier,
      image: normalized.imageFile,
      imageUrl: editingProduct ? editingProduct.imageUrl || editingProduct.image : '',
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

        <section className="dashboard-grid supplier-grid">
          <SupplierManagement
            suppliers={suppliers}
            onCreate={handleCreateSupplier}
            onEdit={handleEditSupplier}
            onDelete={handleDeleteSupplier}
            error={supplierError}
          />
        </section>
      </main>
    </div>
  )
}
