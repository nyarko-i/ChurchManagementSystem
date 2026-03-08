const FEATURES = [
  { icon: "👥", name: "Member Management", desc: "Maintain a complete registry of your congregation. Track personal details, attendance history, and spiritual growth milestones." },
  { icon: "📖", name: "Tithe Tracking", desc: "Record weekly and monthly tithes with precision. Generate signed records and view per-member giving history at a glance." },
  { icon: "🏥", name: "Welfare Fund", desc: "Manage welfare contributions and process bereavement, childbirth, and marriage payouts with full audit trails." },
  { icon: "🙏", name: "Offerings & Contributions", desc: "Track Sunday, midweek, and special service offerings. Manage special contribution types with flexible categories." },
  { icon: "📊", name: "Finance Dashboard", desc: "A real-time overview of all three accounts — main, welfare, and special — with beautiful charts and exportable reports." },
  { icon: "📱", name: "SMS Automation", desc: "Send birthday greetings, tithe reminders, and welfare alerts automatically. Bulk SMS to the whole congregation in one click." },
  { icon: "📄", name: "Monthly Reports", desc: "Generate printable reports for every module. Share clean, professional documents at board meetings or with leadership." },
  { icon: "⚙️", name: "Multi-Staff Access", desc: "Add treasurers, secretaries, and pastors with role-based access. Everyone sees exactly what they need." },
  { icon: "🔒", name: "Secure & Reliable", desc: "Your church data is encrypted and backed up continuously. Built on enterprise-grade infrastructure with 99.9% uptime." },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="lp-features">
      <div className="lp-section-label">Everything You Need</div>
      <div className="lp-section-title">A complete system for every corner of your church</div>
      <div className="lp-features-grid">
        {FEATURES.map((f) => (
          <div key={f.name} className="lp-feature-card">
            <div className="lp-feature-icon">{f.icon}</div>
            <div className="lp-feature-name">{f.name}</div>
            <div className="lp-feature-desc">{f.desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}