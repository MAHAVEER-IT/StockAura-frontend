export default function ExpiryAlerts({ products = [], days = 7 }) {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const msPerDay = 24 * 60 * 60 * 1000

  const expiringSoon = products
    .map((p) => {
      const expiryDate = p?.expiryDate ? new Date(p.expiryDate) : null
      if (!expiryDate || Number.isNaN(expiryDate.getTime())) {
        return null
      }
      const daysLeft = Math.ceil((expiryDate.getTime() - startOfToday.getTime()) / msPerDay)
      return { ...p, _daysLeft: daysLeft }
    })
    .filter((p) => p && p._daysLeft >= 0 && p._daysLeft <= days)
    .sort((a, b) => a._daysLeft - b._daysLeft)

  if (expiringSoon.length === 0) {
    return null
  }

  return (
    <section className="low-stock-alerts" aria-label="Expiry alerts">
      <div className="alert-header">
        <span className="alert-icon">⏳</span>
        <h3>Expiring Soon (≤ {days} days) ({expiringSoon.length})</h3>
      </div>
      <div className="alert-list">
        {expiringSoon.map((product) => (
          <div key={product.id} className="alert-item">
            <div className="alert-product-info">
              <span className="alert-product-name">{product.name}</span>
              <span className="alert-barcode">{product.barcode}</span>
            </div>
            <div className="alert-stock-info">
              <span className="current-stock">Expiry: {product.expiry || 'N/A'}</span>
              <span className="threshold">
                {product._daysLeft === 0 ? 'Today' : `${product._daysLeft} day(s) left`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

