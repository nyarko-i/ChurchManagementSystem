"use client"

import { useState } from "react"
import { registerChurch } from "@/actions/register"

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState({
    churchName: "",
    churchEmail: "",
    churchPhone: "",
    adminName: "",
    adminEmail: "",
    password: "",
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit() {
    setLoading(true)
    setError("")

    const result = await registerChurch(form)
    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Thank you! Your church registration request has been received. Our team will review it and send your login credentials to <strong>{form.adminEmail}</strong> within 24 hours.
          </p>
          <a
            href="/login"
            className="text-blue-600 text-sm font-medium hover:underline"
          >
            ← Back to login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700">ChurchCore</h1>
          <p className="text-gray-500 mt-1">Register your church</p>
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-xs text-blue-700">
            📋 Your request will be reviewed and you&apos;ll receive login credentials by email within 24 hours.
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-widest">
          Church Details
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Church Name *</label>
          <input
            name="churchName"
            value={form.churchName}
            onChange={handleChange}
            placeholder="Grace Assembly"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Church Email *</label>
          <input
            name="churchEmail"
            value={form.churchEmail}
            onChange={handleChange}
            placeholder="info@graceassembly.com"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Church Phone</label>
          <input
            name="churchPhone"
            value={form.churchPhone}
            onChange={handleChange}
            placeholder="0241234567"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>

        <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-widest">
          Your Details
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
          <input
            name="adminName"
            value={form.adminName}
            onChange={handleChange}
            placeholder="Pastor John Mensah"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Email *</label>
          <input
            name="adminEmail"
            value={form.adminEmail}
            onChange={handleChange}
            placeholder="pastor@graceassembly.com"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-700 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 transition disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Registration Request"}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already registered?{" "}
          <a href="/login" className="text-blue-600 hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  )
}