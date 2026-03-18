import { useEffect, useState } from 'react'
import ProductList from '../components/admin/ProductList'
import InventoryLogList from '../components/admin/InventoryLogList'
import LowStockAlerts from '../components/admin/LowStockAlerts'
import ExpiryAlerts from '../components/employee/ExpiryAlerts'
import { getProducts, getInventoryLogs, getLowStockProducts, updateStock } from '../services/api'

export default function EmployeeDashboard({ userEmail, authToken, onLogout }) {
  const [products, setProducts] = useState([])
  const [inventoryLogs, setInventoryLogs] = useState([])
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const mapProduct = (product) => ({
    id: product._id,
    name: product.name,
    description: product.description || '',
    price: product.price,
    barcode: product.barcode,
    quantity: product.quantity || 0,
    lowStockThreshold: product.lowStockThreshold || 20,
    expiryDate: product.expiryDate || '',
    expiry: product.expiryDate ? new Date(product.expiryDate).toLocaleDateString('en-IN') : '',
    image: product.imageUrl,
    imageUrl: product.imageUrl,
    category: product.category?.name || 'Uncategorized',
    supplier: product.supplier?.name || 'Unknown',
  })

  const loadData = async () => {
    if (!authToken) return
    
    try {
      setLoading(true)
      const [productsRes, logsRes, lowStockRes] = await Promise.all([
        getProducts(authToken),
        getInventoryLogs(authToken),
        getLowStockProducts(authToken)
      ])
      
      setProducts((productsRes.products || []).map(mapProduct))
      setInventoryLogs(logsRes.logs || [])
      setLowStockProducts((lowStockRes.products || []).map(mapProduct))
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStock = async (productId, payload) => {
    try {
      await updateStock(authToken, productId, payload)
      await loadData() // Refresh all data
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    loadData()
  }, [authToken])

  if (loading) {
    return (
      <div className="dashboard-shell">
        <div className="loading-state">Loading inventory...</div>
      </div>
    )
  }

  return (
    <div className="dashboard-shell employee-dashboard">
      <header className="top-nav">
        <div className="brand-wrap">
          <div className="brand-orb employee-orb" />
          <p className="brand-name">StockAura Employee</p>
        </div>
        <div className="user-info">
          <span>👤 {userEmail}</span>
          <button className="ghost-btn" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-intro">
          <h1>Grocery Inventory Management</h1>
          <p>Monitor stock levels, update quantities, and track all inventory movements.</p>
          {error && <p className="dashboard-error">{error}</p>}
        </section>

        {/* Low Stock Alerts */}
        <section className="dashboard-summary">
          <LowStockAlerts products={lowStockProducts} />
        </section>

        {/* Expiry Alerts (Employee-only) */}
        <section className="dashboard-summary">
          <ExpiryAlerts products={products} days={7} />
        </section>

        {/* Products Grid - Core Employee Feature */}
        <section className="dashboard-grid product-grid">
          <article className="option-card full-width">
            <div className="option-header">
              <h2>📦 Product Inventory</h2>
              <span className="badge">Sort & Filter</span>
            </div>
            <div className="option-content">
              <ProductList 
                products={products}
                onUpdateStock={handleUpdateStock}
                employeeMode={true}
              />
            </div>
          </article>
        </section>

        {/* Recent Activity - Read Only */}
        <section className="dashboard-grid log-grid">
          <article className="option-card">
            <div className="option-header">
              <h2>📊 Recent Activity</h2>
            </div>
            <div className="option-content">
              <InventoryLogList logs={inventoryLogs} />
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}

