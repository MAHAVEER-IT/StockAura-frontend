import { useMemo, useState } from 'react'

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
})

export default function ProductList({ products, onEdit, onDelete, onUpdateStock }) {
  const employeeMode = !onEdit && !onDelete
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceSortOrder, setPriceSortOrder] = useState('none')
  const [expirySortOrder, setExpirySortOrder] = useState('none')
  const [stockActionId, setStockActionId] = useState(null)
  const [stockAdjustment, setStockAdjustment] = useState({ quantity: 1, reason: '' })

  const normalizedProducts = useMemo(
    () =>
      products.map((product) => ({
        ...product,
        categoryLabel: product.category?.name || product.category || 'N/A',
        isLowStock: product.quantity <= product.lowStockThreshold,
      })),
    [products],
  )

  const categoryOptions = useMemo(() => {
    const options = new Set(normalizedProducts.map((product) => product.categoryLabel))
    return ['all', ...Array.from(options)]
  }, [normalizedProducts])

  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()

    const filtered = normalizedProducts.filter((product) => {
      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        String(product.barcode).toLowerCase().includes(q)
      const matchesCategory =
        selectedCategory === 'all' || product.categoryLabel === selectedCategory

      return matchesSearch && matchesCategory
    })

    if (priceSortOrder === 'none' && expirySortOrder === 'none') {
      return filtered
    }

    return [...filtered].sort((a, b) => {
      const expiryA = Number.isNaN(new Date(a.expiry).getTime())
        ? Number.MAX_SAFE_INTEGER
        : new Date(a.expiry).getTime()
      const expiryB = Number.isNaN(new Date(b.expiry).getTime())
        ? Number.MAX_SAFE_INTEGER
        : new Date(b.expiry).getTime()
      const expiryDiff = expiryA - expiryB
      const priceDiff = Number(a.price) - Number(b.price)

      if (expirySortOrder !== 'none' && expiryDiff !== 0) {
        return expirySortOrder === 'asc' ? expiryDiff : -expiryDiff
      }

      if (priceSortOrder !== 'none' && priceDiff !== 0) {
        return priceSortOrder === 'asc' ? priceDiff : -priceDiff
      }

      return 0
    })
  }, [normalizedProducts, searchTerm, selectedCategory, priceSortOrder, expirySortOrder])

  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setPriceSortOrder('none')
    setExpirySortOrder('none')
  }

  const handleQuickStock = async (id, action) => {
    if (!onUpdateStock) return
    await onUpdateStock(id, {
      action,
      quantity: Number(stockAdjustment.quantity),
      reason: stockAdjustment.reason || `Quick ${action}`,
    })
    setStockActionId(null)
    setStockAdjustment({ quantity: 1, reason: '' })
  }

  return (
    <section className="product-list data-grid-container" aria-label="Product list management">
      <div className="list-header-flex">
        <h3>Inventory Data Grid</h3>
        <div className="quick-stats">
          <span className="stat-label">Total Items: {products.length}</span>
          <span className="stat-label low-stock">Low Stock: {products.filter(p => (p.quantity || 0) <= (p.lowStockThreshold || 0)).length}</span>
        </div>
      </div>

      <div className="product-filter-bar grid-filters" aria-label="Product filters">
        <div className="product-filter-field search-field">
          <label htmlFor="product-search">Search Inventory</label>
          <input
            id="product-search"
            type="text"
            placeholder="Name, SKU, or Barcode..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="product-filter-field">
          <label htmlFor="product-category-filter">Category</label>
          <select
            id="product-category-filter"
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
          >
            <option value="all">All Categories</option>
            {categoryOptions
              .filter((option) => option !== 'all')
              .map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
          </select>
        </div>

        <button className="reset-btn" type="button" onClick={handleResetFilters}>
          Reset
        </button>
      </div>

      {products.length === 0 ? (
        <div className="empty-grid-state">
          <p>No products available in the ledger.</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-grid-state">
          <p>No matching records found.</p>
        </div>
      ) : (
        <div className="product-table-wrap grid-table-wrap">
          <table className="data-grid">
            <thead>
              <tr>
                <th className="sticky-col">Product</th>
                <th>Category</th>
                <th>
                  <div className="sort-header">
                    <span>Price</span>
                    <button className={`sort-btn ${priceSortOrder !== 'none' ? 'active' : ''}`} onClick={() => setPriceSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}>
                      {priceSortOrder === 'desc' ? '▼' : '▲'}
                    </button>
                  </div>
                </th>
                <th>Stock Level</th>
                <th>Barcode</th>
                <th>
                  <div className="sort-header">
                    <span>Expiry</span>
                    <button className={`sort-btn ${expirySortOrder !== 'none' ? 'active' : ''}`} onClick={() => setExpirySortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}>
                      {expirySortOrder === 'desc' ? '▼' : '▲'}
                    </button>
                  </div>
                </th>
                {employeeMode ? null : <th className="action-col">Manage</th>}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className={product.isLowStock ? 'row-low-stock' : ''}>
                  <td className="sticky-col">
                    <div className="product-cell">
                      <img className="product-thumb" src={product.image} alt="" />
                      <div className="product-meta">
                        <span className="product-name">{product.name}</span>
                        {product.isLowStock && <span className="low-stock-badge">Low Stock</span>}
                      </div>
                    </div>
                  </td>
                  <td><span className="category-tag">{product.categoryLabel}</span></td>
                  <td className="price-cell">{money.format(product.price)}</td>
                  <td>
                    <div className="stock-cell">
                      <span className={`stock-qty ${product.isLowStock ? 'critical' : ''}`}>
                        {product.quantity}
                      </span>
                      <button 
                        className="quick-adjust-btn" 
                        onClick={() => setStockActionId(stockActionId === product.id ? null : product.id)}
                      >
                        ±
                      </button>
                      {stockActionId === product.id && (
                        <div className="stock-popover">
                          <input 
                            type="number" 
                            min="1" 
                            value={stockAdjustment.quantity}
                            onChange={(e) => setStockAdjustment(prev => ({ ...prev, quantity: e.target.value }))}
                          />
                          <div className="popover-actions">
                            <button className="pop-btn add" onClick={() => handleQuickStock(product.id, 'added')}>Add</button>
                            <button className="pop-btn sub" onClick={() => handleQuickStock(product.id, 'sold')}>Sold</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="barcode-cell"><code>{product.barcode}</code></td>
                  <td>{product.expiry || 'N/A'}</td>
                  {employeeMode ? null : (
                    <td className="action-col">
                      <div className="row-actions">
                        <button
                          className="row-action-btn"
                          type="button"
                          onClick={() => onEdit && onEdit(product)}
                          title="Edit"
                          disabled={!onEdit}
                        >
                          Edit
                        </button>
                        <button
                          className="row-action-btn danger"
                          type="button"
                          onClick={() => onDelete && onDelete(product.id)}
                          title="Delete"
                          disabled={!onDelete}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
