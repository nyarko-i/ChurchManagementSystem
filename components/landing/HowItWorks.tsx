const STEPS = [
  { n: "01", title: "Create your church account", desc: "Sign up and set up your church profile in under 5 minutes. No technical knowledge required." },
  { n: "02", title: "Import or add your members", desc: "Add members one by one or import from a spreadsheet. Every member gets a unique ID automatically." },
  { n: "03", title: "Start recording finances", desc: "Record tithes, offerings, expenses, and contributions. Everything is timestamped and traceable." },
  { n: "04", title: "Generate reports instantly", desc: "Click Generate on any report. Print or share with your leadership board in seconds." },
]

const MODULES = [
  { icon: "👥", name: "Members",      sub: "Full registry" },
  { icon: "📖", name: "Tithes",       sub: "Weekly & monthly" },
  { icon: "🏥", name: "Welfare",      sub: "Fund management" },
  { icon: "🙏", name: "Offerings",    sub: "Service records" },
  { icon: "💰", name: "Contributions",sub: "Special types" },
  { icon: "💸", name: "Expenses",     sub: "Category tracking" },
  { icon: "📊", name: "Finance",      sub: "3-account view" },
  { icon: "📱", name: "SMS",          sub: "Auto & bulk" },
  { icon: "📄", name: "Reports",      sub: "Print-ready" },
  { icon: "⚙️", name: "Settings",     sub: "Multi-staff" },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="lp-hiw">
      <div className="lp-hiw-grid">
        <div>
          <div className="lp-section-label">How It Works</div>
          <div className="lp-section-title">Up and running in minutes</div>
          <div>
            {STEPS.map((s) => (
              <div key={s.n} className="lp-hiw-step">
                <div className="lp-step-num">{s.n}</div>
                <div>
                  <div className="lp-step-title">{s.title}</div>
                  <div className="lp-step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lp-hiw-panel">
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "2px", color: "rgba(201,168,76,0.8)", textTransform: "uppercase", marginBottom: "12px" }}>
              All Modules
            </div>
          </div>
          <div className="lp-hiw-modules">
            {MODULES.map((m) => (
              <div key={m.name} className="lp-hiw-module">
                <span className="lp-module-icon">{m.icon}</span>
                <div>
                  <div className="lp-module-name">{m.name}</div>
                  <div className="lp-module-sub">{m.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}