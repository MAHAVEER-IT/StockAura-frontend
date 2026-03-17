export default function SupplierList({ suppliers, onEdit, onDelete }) {
  return (
    <div className="supplier-list">
      <h3>Suppliers ({suppliers.length})</h3>
      {suppliers.length === 0 ? (
        <p className="empty-state">No suppliers. Add one above.</p>
      ) : (
        <div className="supplier-list-wrap">
          {suppliers.map((supplier) => (
            <div key={supplier._id} className="supplier-item">
              <div className="supplier-info">
                <h4>{supplier.name}</h4>
                {supplier.contactEmail && <p>{supplier.contactEmail}</p>}
                {supplier.contactPhone && <p>📞 {supplier.contactPhone}</p>}
                {supplier.address && <p>📍 {supplier.address}</p>}
              </div>
              <div className="row-actions">
                <button 
                  className="table-btn"
                  onClick={() => onEdit(supplier._id, { name: supplier.name, contactEmail: supplier.contactEmail, contactPhone: supplier.contactPhone, address: supplier.address })}
                >
                  Edit
                </button>
                <button 
                  className="table-btn danger"
                  onClick={() => onDelete(supplier._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

