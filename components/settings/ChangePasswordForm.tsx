"use client"

import { useState } from "react"
import { changePassword } from "@/actions/settings"

export default function ChangePasswordForm() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit() {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setMessage({ type: "error", text: "Please fill in all fields" })
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" })
      return
    }
    setLoading(true)
    setMessage(null)
    const result = await changePassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    })
    setLoading(false)
    if (result.success) {
      setMessage({ type: "success", text: "Password changed successfully" })
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } else {
      setMessage({ type: "error", text: result.error ?? "Failed to change password" })
    }
  }

  return (
    <div className="space-y-4 max-w-lg">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Current Password</label>
        <input
          name="currentPassword"
          type="password"
          value={form.currentPassword}
          onChange={handleChange}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">New Password</label>
        <input
          name="newPassword"
          type="password"
          value={form.newPassword}
          onChange={handleChange}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Confirm New Password</label>
        <input
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {message && (
        <p className={`text-sm rounded-lg px-4 py-2 border ${
          message.type === "success"
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-red-50 text-red-600 border-red-200"
        }`}>
          {message.type === "success" ? "✓ " : "✗ "}{message.text}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition disabled:opacity-50"
      >
        {loading ? "Updating..." : "Change Password"}
      </button>
    </div>
  )
}