"use client"

import { useState } from "react"
import { changeAdminPassword } from "@/actions/admin-account"

export default function AdminChangePassword() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Password strength checker
  const checks = [
    { label: "At least 12 characters", pass: form.newPassword.length >= 12 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(form.newPassword) },
    { label: "Lowercase letter", pass: /[a-z]/.test(form.newPassword) },
    { label: "Number", pass: /[0-9]/.test(form.newPassword) },
    { label: "Special character", pass: /[^A-Za-z0-9]/.test(form.newPassword) },
  ]
  const strength = checks.filter(c => c.pass).length

  async function handleSubmit() {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setMessage({ type: "error", text: "All fields are required" })
      return
    }
    setLoading(true)
    setMessage(null)
    const result = await changeAdminPassword(form)
    setLoading(false)
    if (result.success) {
      setMessage({ type: "success", text: "Password changed successfully" })
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } else {
      setMessage({ type: "error", text: result.error ?? "Failed to change password" })
    }
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 max-w-md">
      <h3 className="font-bold text-white mb-1">Change Password</h3>
      <p className="text-xs text-gray-500 mb-6">Use a strong, unique password for your admin account.</p>

      <div className="space-y-4">
        {[
          { key: "currentPassword", label: "Current Password" },
          { key: "newPassword", label: "New Password" },
          { key: "confirmPassword", label: "Confirm New Password" },
        ].map((f) => (
          <div key={f.key}>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">{f.label}</label>
            <input
              type="password"
              value={form[f.key as keyof typeof form]}
              onChange={(e) => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
        ))}

        {/* Strength indicator */}
        {form.newPassword && (
          <div className="space-y-2">
            <div className="flex gap-1">
              {[1,2,3,4,5].map(i => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= strength
                    ? strength <= 2 ? "bg-red-500"
                    : strength <= 3 ? "bg-yellow-500"
                    : "bg-green-500"
                    : "bg-gray-700"
                }`} />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1">
              {checks.map(c => (
                <div key={c.label} className="flex items-center gap-1.5">
                  <span className={`text-xs ${c.pass ? "text-green-400" : "text-gray-600"}`}>
                    {c.pass ? "✓" : "○"}
                  </span>
                  <span className={`text-xs ${c.pass ? "text-gray-300" : "text-gray-600"}`}>
                    {c.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {message && (
          <div className={`px-4 py-2.5 rounded-lg text-sm border ${
            message.type === "success"
              ? "bg-green-950 text-green-400 border-green-800"
              : "bg-red-950 text-red-400 border-red-800"
          }`}>
            {message.type === "success" ? "✓ " : "✗ "}{message.text}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || strength < 5}
          className="w-full bg-yellow-400 text-gray-900 py-2.5 rounded-lg text-sm font-bold hover:bg-yellow-300 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Changing..." : "Change Password"}
        </button>
      </div>
    </div>
  )
}