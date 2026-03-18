/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'
import CreateEmployeeForm from '../components/admin/CreateEmployeeForm'
import EmployeeList from '../components/admin/EmployeeList'
import CreateCategoryForm from '../components/admin/CreateCategoryForm'
import CategoryList from '../components/admin/CategoryList'
import ProductForm from '../components/admin/ProductForm'
import ProductList from '../components/admin/ProductList'
import LowStockAlerts from '../components/admin/LowStockAlerts'
import InventoryLogList from '../components/admin/InventoryLogList'
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
  getInventoryLogs,
  getLowStockProducts,
  createRestockRequest,
  updateStock,
} from '../services/api'
import SupplierManagement from '../components/admin/SupplierManagement'

export default function AdminDashboard({
  adminEmail,
  authToken,
  employees,
  onCreateEmployee,
  onDeleteEmployee,
  onLogout,
}) {
  const [showStaffFeature, setShowStaffFeature] = useState(false)
  const [showCategoryFeature, setShowCategoryFeature] = useState(false)
  const [showProductFeature, setShowProductFeature] = useState(false)
  const [showSupplierFeature, setShowSupplierFeature] = useState(false)
  const [showInventoryLogFeature, setShowInventoryLogFeature] = useState(false)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [inventoryLogs, setInventoryLogs] = useState([])
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [supplierError, setSupplierError] = useState('')
  const [editingProduct, setEditingProduct] = useState(null)
  const [dashboardError, setDashboardError] = useState('')
  const [categoryError, setCategoryError] = useState('')
  const [restockMessage, setRestockMessage] = useState('')

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

  const loadInventoryLogs = async () => {
    if (!authToken) return
    try {
      const response = await getInventoryLogs(authToken)
      setInventoryLogs(response.logs || [])
    } catch (error) {
      console.error('Failed to load logs', error)
    }
  }

  const loadLowStock = async () => {
    if (!authToken) return
    try {
      const response = await getLowStockProducts(authToken)
      setLowStockProducts((response.products || []).map(mapProduct))
    } catch (error) {
      console.error('Failed to load low stock', error)
    }
  }

  const handleRequestRestock = async (product) => {
    if (!authToken) return
    try {
      setRestockMessage('')
      const missing = Math.max(
        1,
        Number(product.lowStockThreshold || 0) - Number(product.quantity || 0) + 10,
      )
      await createRestockRequest(authToken, {
        productId: product.id,
        requestedQty: missing,
        notes: `Auto-suggested restock based on threshold (${product.lowStockThreshold})`,
        sendEmail: true,
      })
      setRestockMessage(`Restock email sent for ${product.name}.`)
    } catch (error) {
      setRestockMessage(error.message)
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
    loadInventoryLogs()
    loadLowStock()
  }, [authToken])

  const handleSaveProduct = async (payload) => {
    const normalized = {
      name: payload.name.trim(),
      description: payload.description || '',
      price: Number(payload.price),
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
      !normalized.expiryDate ||
      !normalized.category ||
      !normalized.supplier
    ) {
      setDashboardError('Please fill all required fields: name, price, expiry date, category, supplier.')
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
    setShowProductFeature(true)
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

  const handleUpdateStock = async (productId, payload) => {
    try {
      await updateStock(authToken, productId, payload)
      await Promise.all([
        loadProducts(),
        loadInventoryLogs(),
        loadLowStock()
      ])
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

        <section className="dashboard-summary">
          <LowStockAlerts products={lowStockProducts} onRequestRestock={handleRequestRestock} />
          {restockMessage ? <p className="dashboard-error">{restockMessage}</p> : null}
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

            <div
              className={`option-content employee-option-content panel-body ${
                showStaffFeature ? 'panel-expanded' : 'panel-collapsed'
              }`}
              aria-hidden={!showStaffFeature}
            >
              <CreateEmployeeForm onCreate={onCreateEmployee} />
              <EmployeeList employees={employees} onDelete={onDeleteEmployee} />
            </div>
            <p
              className={`option-collapsed-note ${showStaffFeature ? 'note-hidden' : 'note-visible'}`}
            >
              Panel collapsed. Click Expand to open.
            </p>
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

            <div
              className={`option-content category-option-content panel-body ${
                showCategoryFeature ? 'panel-expanded' : 'panel-collapsed'
              }`}
              aria-hidden={!showCategoryFeature}
            >
              <CreateCategoryForm onSave={handleCreateCategory} error={categoryError} />
              <CategoryList
                categories={categories}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
                error={categoryError}
              />
            </div>
            <p
              className={`option-collapsed-note ${showCategoryFeature ? 'note-hidden' : 'note-visible'}`}
            >
              Panel collapsed. Click Expand to open.
            </p>
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

<<<<<<< HEAD
            {showProductFeature ? (
              <div className="option-content product-option-content">
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
                  onUpdateStock={handleUpdateStock}
                />
              </div>
            ) : (
              <p className="option-collapsed-note">Panel collapsed. Click Expand to open.</p>
            )}
=======
            <div
              className={`option-content product-option-content panel-body ${
                showProductFeature ? 'panel-expanded' : 'panel-collapsed'
              }`}
              aria-hidden={!showProductFeature}
            >
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
            </div>
            <p
              className={`option-collapsed-note ${showProductFeature ? 'note-hidden' : 'note-visible'}`}
            >
              Panel collapsed. Click Expand to open.
            </p>
>>>>>>> 84691adcb99694212a6726b20a7b3842c71b3a0a
          </article>
        </section>

        <section className="dashboard-grid supplier-grid">
          <article className="option-card" aria-label="Supplier management feature">
            <div className="option-header">
              <h2>Supplier Management Feature</h2>
              <button
                className="option-toggle"
                type="button"
                onClick={() => setShowSupplierFeature((prev) => !prev)}
              >
                {showSupplierFeature ? 'Close' : 'Expand'}
              </button>
            </div>

            <div
              className={`option-content supplier-option-content panel-body ${
                showSupplierFeature ? 'panel-expanded' : 'panel-collapsed'
              }`}
              aria-hidden={!showSupplierFeature}
            >
              <SupplierManagement
                suppliers={suppliers}
                onCreate={handleCreateSupplier}
                onEdit={handleEditSupplier}
                onDelete={handleDeleteSupplier}
                error={supplierError}
              />
            </div>
            <p
              className={`option-collapsed-note ${showSupplierFeature ? 'note-hidden' : 'note-visible'}`}
            >
              Panel collapsed. Click Expand to open.
            </p>
          </article>
        </section>

        <section className="dashboard-grid log-grid">
          <article className="option-card" aria-label="Inventory logs feature">
            <div className="option-header">
              <h2>Inventory Activity Feature</h2>
              <button
                className="option-toggle"
                type="button"
                onClick={() => setShowInventoryLogFeature((prev) => !prev)}
              >
                {showInventoryLogFeature ? 'Close' : 'Expand'}
              </button>
            </div>

            {showInventoryLogFeature ? (
              <div className="option-content log-option-content">
                <InventoryLogList logs={inventoryLogs} />
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
