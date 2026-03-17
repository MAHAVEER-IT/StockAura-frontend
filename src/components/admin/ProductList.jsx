const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
})

export default function ProductList({ products, onEdit, onDelete }) {
  return (
    <section className="product-list" aria-label="Product list management">
      <h3>Products</h3>

      {products.length === 0 ? (
        <p className="empty-state">No products yet. Add your first product.</p>
      ) : (
        <div className="product-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Barcode</th>
                <th>Expiry</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <img className="product-thumb" src={product.image} alt={product.name} />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{money.format(product.price)}</td>
                  <td>{product.barcode}</td>
                  <td>{product.expiry}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="table-btn"
                        type="button"
                        onClick={() => onEdit(product)}
                      >
                        Edit
                      </button>
                      <button
                        className="table-btn danger"
                        type="button"
                        onClick={() => onDelete(product.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
