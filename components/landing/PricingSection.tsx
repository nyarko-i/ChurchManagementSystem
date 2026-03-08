import Link from "next/link"

const PLANS = [
  {
    plan: "Starter", price: "Free", per: "", featured: false,
    desc: "Perfect for small congregations just getting started.",
    features: ["Up to 100 members", "Tithe & offerings", "Basic reports", "1 staff account"],
    cta: "Start Free",
  },
  {
    plan: "Growth", price: "GHS 99", per: "/mo", featured: true,
    desc: "Everything you need to run a growing church.",
    features: ["Up to 500 members", "All modules", "SMS automation", "5 staff accounts", "Priority support"],
    cta: "Get Started",
  },
  {
    plan: "Pro", price: "GHS 199", per: "/mo", featured: false,
    desc: "For large churches and multi-branch organizations.",
    features: ["Unlimited members", "All modules", "Unlimited SMS", "Unlimited staff", "Dedicated support", "Custom reports"],
    cta: "Contact Us",
  },
]

export default function PricingSection() {
  return (
    <section id="pricing" className="lp-pricing">
      <div style={{ textAlign: "center", marginBottom: "60px" }}>
        <div className="lp-section-label" style={{ textAlign: "center" }}>Simple Pricing</div>
        <div className="lp-section-title" style={{ margin: "0 auto", textAlign: "center" }}>
          Plans for every congregation
        </div>
      </div>
      <div className="lp-pricing-grid">
        {PLANS.map((p) => (
          <div key={p.plan} className={`lp-pricing-card${p.featured ? " featured" : ""}`}>
            {p.featured && <div className="lp-pricing-badge">POPULAR</div>}
            <div className="lp-pricing-plan">{p.plan}</div>
            <div className="lp-pricing-price">{p.price}<span>{p.per}</span></div>
            <div className="lp-pricing-desc">{p.desc}</div>
            <ul className="lp-pricing-features">
              {p.features.map((f) => <li key={f}>{f}</li>)}
            </ul>
            <Link href="/login" className="lp-pricing-btn">{p.cta}</Link>
          </div>
        ))}
      </div>
    </section>
  )
}