"use client"

import { useState } from "react"
import { updateWelfareSettings } from "@/actions/settings"

type Props = {
  settings: {
    amount: number
    effectiveYear: number
  } | null
}

export default function WelfareSettingsForm({ settings }: Props) {
  const currentYear = new Date().getFullYear()
  const [form, setForm] = useState({
    amount: settings?.amount?.toString() ?? "",
    effectiveYear: settings?.effectiveYear?.toString() ?? currentYear.toString(),
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit() {
    if (!form.amount || isNaN(Number(form.amount))) {
      setMessage({ type: "error", text: "Please enter a valid amount" })
      return
    }
    setLoading(true)
    setMessage(null)
    const result = await updateWelfareSettings({
      amount: Number(form.amount),
      effectiveYear: Number(form.effectiveYear),
    })
    setLoading(false)
    if (result.success) {
      setMessage({ type: "success", text: "Welfare settings updated successfully" })
    } else {
      setMessage({ type: "error", text: result.error ?? "Failed to update" })
    }
  }

  return (
    <div className="space-y-4 max-w-lg">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Monthly Amount (GHS)
          </label>
          <input
            name="amount"
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={handleChange}
            placeholder="e.g. 20.00"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Effective Year
          </label>
          <input
            name="effectiveYear"
            type="number"
            min="2020"
            max="2100"
            value={form.effectiveYear}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {settings && (
        <p className="text-xs text-gray-400">
          Current: GHS {settings.amount.toFixed(2)} / month for {settings.effectiveYear}
        </p>
      )}

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
        {loading ? "Saving..." : "Save Settings"}
      </button>
    </div>
  )
}