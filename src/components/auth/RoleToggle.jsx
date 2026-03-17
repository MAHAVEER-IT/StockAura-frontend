const roles = [
  { key: 'ADMIN', label: 'Admin' },
  { key: 'EMPLOYEE', label: 'Employee' },
]

export default function RoleToggle({ role, onChange }) {
  return (
    <div className="role-toggle" role="tablist" aria-label="Select login role">
      {roles.map((entry) => (
        <button
          key={entry.key}
          type="button"
          role="tab"
          aria-selected={role === entry.key}
          className={`role-pill ${role === entry.key ? 'active' : ''}`}
          onClick={() => onChange(entry.key)}
        >
          {entry.label}
        </button>
      ))}
    </div>
  )
}
