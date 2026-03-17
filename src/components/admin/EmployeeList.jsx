export default function EmployeeList({ employees }) {
  return (
    <section className="employee-list" aria-label="Created employee logins">
      <h3>Employee Accounts</h3>

      {employees.length === 0 ? (
        <p className="empty-state">No employees yet. Create one using the form.</p>
      ) : (
        <div className="employee-list-wrap">
          <ul>
            {employees.map((employee) => (
              <li key={employee.email}>
                <div>
                  <p className="employee-email">{employee.email}</p>
                  <p className="employee-role">Role: {employee.role}</p>
                  <p className="employee-pass">Password: *****</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
