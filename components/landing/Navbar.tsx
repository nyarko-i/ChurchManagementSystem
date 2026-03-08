import Link from "next/link"

export default function Navbar() {
  return (
    <nav className="lp-nav">
      <Link href="/" className="lp-nav-logo">
        Church<span>Core</span>
      </Link>
      <div className="lp-nav-links">
        <a href="#features">Features</a>
        <a href="#how-it-works">How it Works</a>
        <a href="#pricing">Pricing</a>
        <Link href="/login" className="lp-nav-cta">Sign In</Link>
      </div>
    </nav>
  )
}