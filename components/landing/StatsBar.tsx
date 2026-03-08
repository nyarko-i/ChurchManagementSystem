const STATS = [
  { number: "500+",    label: "Churches Onboarded" },
  { number: "50,000+", label: "Members Managed" },
  { number: "GHS 2M+", label: "Tithes Tracked" },
  { number: "99.9%",   label: "Uptime Guaranteed" },
]

export default function StatsBar() {
  return (
    <div className="lp-stats">
      {STATS.map((s) => (
        <div key={s.label} className="lp-stat">
          <div className="lp-stat-number">{s.number}</div>
          <div className="lp-stat-label">{s.label}</div>
        </div>
      ))}
    </div>
  )
}