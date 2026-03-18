export default function InventoryLogList({ logs }) {
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getActionClass = (action) => {
    switch (action) {
      case 'added': return 'log-action-added'
      case 'removed': return 'log-action-removed'
      case 'sold': return 'log-action-sold'
      case 'adjusted': return 'log-action-adjusted'
      default: return ''
    }
  }

  return (
    <section className="inventory-logs" aria-label="Inventory activity logs">
      <h3>Recent Activity</h3>
      {logs.length === 0 ? (
        <p className="empty-state">No recent activity found.</p>
      ) : (
        <div className="log-list-wrap">
          <table className="log-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Product</th>
                <th>Action</th>
                <th>Qty</th>
                <th>User</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td className="log-time">{formatDate(log.createdAt)}</td>
                  <td>
                    <div className="log-product">
                      <span className="log-product-name">{log.product?.name || 'Unknown'}</span>
                      <span className="log-product-barcode">{log.product?.barcode}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`log-action-badge ${getActionClass(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="log-qty">{log.quantity}</td>
                  <td className="log-user">{log.performedBy?.email?.split('@')[0]}</td>
                  <td className="log-reason">{log.reason || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
