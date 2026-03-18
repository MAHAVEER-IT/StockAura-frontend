export default function EmployeeList({ employees, onDelete }) {
  const handleDelete = async (employeeId, email) => {
    const isConfirmed = window.confirm(`Remove employee account: ${email}?`)
    if (!isConfirmed) {
      return
    }

    try {
      await onDelete(employeeId)
    } catch (error) {
      window.alert(error.message || 'Failed to remove employee account')
    }
  }

  return (
    <section className="employee-list" aria-label="Created employee logins">
      <h3>Employee Accounts</h3>

      {employees.length === 0 ? (
        <p className="empty-state">No employees yet. Create one using the form.</p>
      ) : (
        <div className="employee-list-wrap">
          <ul>
            {employees.map((employee) => (
              <li key={employee.id || employee._id || employee.email}>
                <div>
                  <p className="employee-email">{employee.email}</p>
                  <p className="employee-role">Role: {employee.role}</p>
                  <p className="employee-pass">Password: *****</p>
                </div>
                <div className="employee-row-actions">
                  {(() => {
                    const employeeId = employee.id || employee._id
                    const isAdminRole =
                      String(employee.role).toUpperCase() === 'ADMIN' ||
                      String(employee.role).toLowerCase() === 'admin'

                    return (
                      <button
                        className="table-btn danger"
                        type="button"
                        onClick={() => handleDelete(employeeId, employee.email)}
                        disabled={!employeeId || isAdminRole}
                        title={
                          isAdminRole
                            ? 'Admin account removal is disabled'
                            : !employeeId
                              ? 'User id missing'
                              : 'Remove staff account'
                        }
                      >
                        Remove
                      </button>
                    )
                  })()}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
