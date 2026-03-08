import Link from "next/link"

export default function CtaSection() {
  return (
    <section className="lp-cta">
      <h2 className="lp-cta-title">
        Your church deserves<br />a <em>better</em> system
      </h2>
      <p className="lp-cta-sub">
        Join hundreds of churches already running smarter with ChurchCore.
      </p>
      <div className="lp-cta-actions">
        <Link href="/login" className="lp-btn-primary">Start for Free Today</Link>
        <a href="#features" className="lp-btn-secondary">Learn More</a>
      </div>
    </section>
  )
}