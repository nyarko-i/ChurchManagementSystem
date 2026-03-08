import Link from "next/link"

export default function Footer() {
  return (
    <>
      <footer className="lp-footer">
        <div className="lp-footer-brand">
          <Link href="/" className="lp-footer-logo">Church<span>Core</span></Link>
          <p>The complete church management platform built for African congregations.</p>
        </div>
        <div className="lp-footer-col">
          <h4>Product</h4>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#how-it-works">How it Works</a>
        </div>
        <div className="lp-footer-col">
          <h4>Modules</h4>
          <a href="#features">Members</a>
          <a href="#features">Tithes &amp; Offerings</a>
          <a href="#features">Welfare Fund</a>
          <a href="#features">SMS Centre</a>
        </div>
        <div className="lp-footer-col">
          <h4>Company</h4>
          <a href="#">About</a>
          <a href="#">Contact</a>
          <Link href="/login">Sign In</Link>
        </div>
      </footer>
      <div className="lp-footer-bottom">
        <p>© {new Date().getFullYear()} ChurchCore. All rights reserved.</p>
      </div>
    </>
  )
}