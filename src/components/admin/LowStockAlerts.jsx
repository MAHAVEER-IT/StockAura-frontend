export default function LowStockAlerts({ products, onRequestRestock }) {
  const lowStockCount = products.length

  if (lowStockCount === 0) return null

  return (
    <section className="low-stock-alerts" aria-label="Low stock alerts">
      <div className="alert-header">
        <span className="alert-icon">⚠️</span>
        <h3>Low Stock Alerts ({lowStockCount})</h3>
      </div>
      <div className="alert-list">
        {products.map((product) => (
          <div key={product.id} className="alert-item">
            <div className="alert-product-info">
              <span className="alert-product-name">{product.name}</span>
              <span className="alert-barcode">{product.barcode}</span>
            </div>
            <div className="alert-stock-info">
              <span className="current-stock">Stock: {product.quantity}</span>
              <span className="threshold">Limit: {product.lowStockThreshold}</span>
            </div>
            {onRequestRestock ? (
              <div className="alert-actions">
                <button
                  className="ghost-btn"
                  type="button"
                  onClick={() => onRequestRestock(product)}
                >
                  Request Restock (Email)
                </button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  )
}
