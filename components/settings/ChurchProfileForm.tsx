"use client"

import { useState } from "react"
import { updateChurchProfile } from "@/actions/settings"

export default function ChurchProfileForm({
  church,
}: {
  church: {
    name: string
    email: string
    phone: string
    address: string | null
    slug: string
    subscriptionPlan: string
  }
}) {
  const [form, setForm] = useState({
    name: church.name,
    email: church.email,
    phone: church.phone,
    address: church.address ?? "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit() {
    setLoading(true)
    setMessage(null)
    const result = await updateChurchProfile(form)
    setLoading(false)
    if (result.success) {
      setMessage({ type: "success", text: "Church profile updated successfully" })
    } else {
      setMessage({ type: "error", text: result.error ?? "Failed to update" })
    }
  }

  return (
    <div className="space-y-4 max-w-lg">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Church Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Slug</label>
          <input
            value={church.slug}
            disabled
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
        <input
          name="address"
          value={form.address}
          onChange={handleChange}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">Plan:</span>
        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold capitalize">
          {church.subscriptionPlan}
        </span>
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
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </div>
  )
}