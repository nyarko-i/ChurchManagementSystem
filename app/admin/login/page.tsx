"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email || !password) {
      setError("Please enter your email and password")
      return
    }
    setLoading(true)
    setError("")

    const result = await signIn("super-admin-credentials", {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError("Invalid credentials")
    } else {
      router.push("/admin")
      router.refresh()
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#0B1B35",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "system-ui, sans-serif",
    }}>
      <div style={{
        background: "#132340", border: "1px solid rgba(201,168,76,0.2)",
        borderRadius: "16px", padding: "48px", width: "100%", maxWidth: "420px",
        boxShadow: "0 40px 80px rgba(0,0,0,0.4)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
            Church<span style={{ color: "#C9A84C" }}>Core</span>
          </h1>
          <div style={{
            display: "inline-block", marginTop: "8px",
            background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)",
            color: "#C9A84C", fontSize: "0.7rem", fontWeight: 700,
            letterSpacing: "2px", padding: "4px 12px", borderRadius: "100px",
            textTransform: "uppercase",
          }}>Super Admin</div>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", marginTop: "12px" }}>
            This portal is for ChurchCore administrators only.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: "6px", fontWeight: 600 }}>
              Email Address
            </label>
            <input
              type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="admin@churchcore.app"
              style={{
                width: "100%", background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px",
                padding: "12px 14px", color: "#fff", fontSize: "0.9rem",
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: "6px", fontWeight: 600 }}>
              Password
            </label>
            <input
              type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="••••••••"
              style={{
                width: "100%", background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px",
                padding: "12px 14px", color: "#fff", fontSize: "0.9rem",
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              color: "#F87171", padding: "10px 14px", borderRadius: "8px", fontSize: "0.85rem",
            }}>{error}</div>
          )}

          <button onClick={handleLogin} disabled={loading} style={{
            background: loading ? "rgba(201,168,76,0.5)" : "#C9A84C",
            color: "#0B1B35", border: "none", borderRadius: "8px",
            padding: "13px", fontSize: "0.95rem", fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            marginTop: "4px", transition: "background 0.2s",
          }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        <p style={{ textAlign: "center", marginTop: "28px", fontSize: "0.78rem", color: "rgba(255,255,255,0.2)" }}>
          Not a ChurchCore admin?{" "}
          <a href="/login" style={{ color: "rgba(201,168,76,0.6)", textDecoration: "none" }}>
            Go to church login →
          </a>
        </p>
      </div>
    </div>
  )
}