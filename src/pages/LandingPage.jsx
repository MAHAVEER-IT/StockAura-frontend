import landingPageIcon from '../assets/landingpage-icon.png'

const metrics = [
	{ label: 'Warehouse Accuracy', value: '99.3%' },
	{ label: 'Order Fulfillment', value: '2.4x Faster' },
	{ label: 'Stockout Reduction', value: '-41%' },
]

const features = [
	{
		title: 'Live Stock Pulse',
		text: 'Watch item movement in real time across every aisle, shelf, and store.',
	},
	{
		title: 'Smart Reorder Logic',
		text: 'Use demand trends and lead-time forecasting to refill exactly when needed.',
	},
	{
		title: 'Supplier Command Hub',
		text: 'Track vendor performance, costs, and fulfillment reliability in one view.',
	},
]

export default function LandingPage({ onOpenLogin }) {
	return (
		<div className="landing-shell">
			<header className="top-nav">
				<div className="brand-wrap">
					<div className="brand-orb" />
					<p className="brand-name">StockAura</p>
				</div>
				<nav className="nav-links">
					<a href="#features">Features</a>
					<a href="#proof">Proof</a>
					<a href="#contact">Contact</a>
				</nav>
				<button className="ghost-btn" type="button" onClick={onOpenLogin}>
					Sign In
				</button>
			</header>

			<main>
				<section className="hero">
					<div className="hero-layout">
						<div>
							<p className="hero-kicker">Inventory Intelligence Platform</p>
							<h1>Control Inventory Without the Chaos</h1>
							<p className="hero-copy">
								A fresh, AI-assisted inventory workspace that keeps stock levels healthy,
								teams aligned, and cash flow moving in the right direction.
							</p>
							<div className="hero-cta">
								<button className="primary-btn" type="button" onClick={onOpenLogin}>
									Start Free Trial
								</button>
								<button className="secondary-btn" type="button" onClick={onOpenLogin}>
									Book Live Demo
								</button>
							</div>
						</div>

						<div className="hero-visual" aria-hidden="true">
							<img src={landingPageIcon} alt="Inventory management visual" />
						</div>
					</div>

					<div className="hero-grid" aria-label="Inventory performance snapshot">
						<article className="glass-card card-large">
							<p className="card-label">Inventory Health Score</p>
							<h3>87 / 100</h3>
							<div className="mini-bars" aria-hidden="true">
								<span />
								<span />
								<span />
								<span />
							</div>
						</article>

						{metrics.map((metric) => (
							<article className="glass-card" key={metric.label}>
								<p className="card-label">{metric.label}</p>
								<h3>{metric.value}</h3>
							</article>
						))}
					</div>
				</section>

				<section className="feature-strip" id="features">
					{features.map((feature) => (
						<article className="feature-card" key={feature.title}>
							<h2>{feature.title}</h2>
							<p>{feature.text}</p>
						</article>
					))}
				</section>

				<section className="proof" id="proof">
					<div>
						<p className="hero-kicker">Trusted by teams scaling fast</p>
						<h2>Designed for modern operations, not old spreadsheets.</h2>
					</div>
					<div className="proof-pill">12k+ active operators</div>
					<div className="proof-pill">$3.8B products tracked monthly</div>
					<div className="proof-pill">4.9/5 customer satisfaction</div>
				</section>
			</main>

			<footer className="footer" id="contact">
				<p>Ready to modernize your inventory flow?</p>
				<button className="primary-btn" type="button" onClick={onOpenLogin}>
					Get Started Today
				</button>
			</footer>
		</div>
	)
}
