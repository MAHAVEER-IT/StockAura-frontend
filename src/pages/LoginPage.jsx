import { useState } from 'react'
import landingPageIcon from '../assets/landingpage-icon.png'
import LoginForm from '../components/auth/LoginForm'
import RoleToggle from '../components/auth/RoleToggle'

export default function LoginPage({ onBack, onLogin, authError }) {
  const [role, setRole] = useState('ADMIN')

  return (
    <div className="login-shell">
      <header className="top-nav">
        <div className="brand-wrap">
          <div className="brand-orb" />
          <p className="brand-name">StockAura</p>
        </div>
        <button className="ghost-btn" type="button" onClick={onBack}>
          Back To Landing
        </button>
      </header>

      <main className="login-main">
        <section className="login-card" aria-label="Role based login">
          <p className="hero-kicker">Secure Access</p>
          <h1 className="login-title">Welcome back to your inventory cockpit</h1>
          <p className="login-copy">
            Choose your role and sign in to continue managing stock, purchase orders,
            and warehouse operations.
          </p>

          <RoleToggle role={role} onChange={setRole} />
          <LoginForm role={role} onSubmit={onLogin} errorMessage={authError} />

          <p className="login-note">
            {role === 'ADMIN'
              ? 'Admin login for now: admin@gmail.com / admin123 (from backend users)'
              : 'Employee login is validated from backend user accounts.'}
          </p>
        </section>

        <aside className="login-visual" aria-hidden="true">
          <img src={landingPageIcon} alt="Inventory dashboard icon" />
          <div className="visual-badge">Role-aware login</div>
          <div className="visual-badge">Light theme UI</div>
        </aside>
      </main>
    </div>
  )
}
