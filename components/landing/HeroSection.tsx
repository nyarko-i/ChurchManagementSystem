import Link from "next/link"

const CHART_BARS = [40,65,45,80,55,90,70,85,60,95,75,88]
const RECENT_TITHES = [
  ["Kwame Mensah", "GHS 200"],
  ["Abena Osei", "GHS 150"],
  ["Kofi Asante", "GHS 300"],
]

export default function HeroSection() {
  return (
    <section className="lp-hero">
      <div className="lp-hero-bg" />
      <div className="lp-hero-grid" />

      <div className="lp-hero-content">
        <div className="lp-hero-badge">Built for African Churches</div>
        <h1 className="lp-hero-title">
          Manage your<br />church with <em>clarity</em>
        </h1>
        <p className="lp-hero-sub">
          ChurchCore brings together members, tithes, welfare, offerings, expenses, and SMS — all in one elegant platform built for modern churches.
        </p>
        <div className="lp-hero-actions">
          <Link href="/login" className="lp-btn-primary">Get Started Free</Link>
          <a href="#features" className="lp-btn-secondary">See Features</a>
        </div>
      </div>

      {/* Dashboard Mockup */}
      <div className="lp-hero-visual">
        <div className="lp-mockup">
          <div className="lp-mockup-bar">
            <div className="lp-mockup-dot" style={{ background: "#FF5F57" }} />
            <div className="lp-mockup-dot" style={{ background: "#FFBD2E" }} />
            <div className="lp-mockup-dot" style={{ background: "#28C840" }} />
            <span className="lp-mockup-title">ChurchCore Dashboard</span>
          </div>
          <div className="lp-mockup-body">
            <div className="lp-mockup-row">
              <div className="lp-mockup-card">
                <div className="lp-mockup-card-label">Total Members</div>
                <div className="lp-mockup-card-value">248</div>
              </div>
              <div className="lp-mockup-card">
                <div className="lp-mockup-card-label">Tithe This Month</div>
                <div className="lp-mockup-card-value gold">GHS 12,450</div>
              </div>
            </div>
            <div className="lp-mockup-row">
              <div className="lp-mockup-card">
                <div className="lp-mockup-card-label">Welfare Balance</div>
                <div className="lp-mockup-card-value green">GHS 4,200</div>
              </div>
              <div className="lp-mockup-card">
                <div className="lp-mockup-card-label">Offerings</div>
                <div className="lp-mockup-card-value gold">GHS 8,750</div>
              </div>
            </div>
            <div className="lp-mockup-chart">
              {CHART_BARS.map((h, i) => (
                <div key={i} className="lp-chart-bar" style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="lp-mockup-list">
              {RECENT_TITHES.map(([name, amt], i) => (
                <div key={i} className="lp-mockup-list-item">
                  <span className="lp-list-name">{name}</span>
                  <span className="lp-list-amount">{amt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}