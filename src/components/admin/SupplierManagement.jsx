import CreateSupplierForm from './CreateSupplierForm'
import SupplierList from './SupplierList'

export default function SupplierManagement({ suppliers, onCreate, onEdit, onDelete, error }) {
  return (
    <div className="supplier-management">
      <CreateSupplierForm onSave={onCreate} error={error} />
      <SupplierList 
        suppliers={suppliers}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  )
}

