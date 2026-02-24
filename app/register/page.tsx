"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { registerChurch } from "@/actions/register"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

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
      router.push("/login")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700">ChurchCore</h1>
          <p className="text-gray-500 mt-1">Register your church</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Church Details */}
        <p className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Church Details
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Church Name</label>
          <input
            name="churchName"
            value={form.churchName}
            onChange={handleChange}
            placeholder="Grace Assembly"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Church Email</label>
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

        {/* Admin Details */}
        <p className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Admin Account
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
          <input
            name="adminName"
            value={form.adminName}
            onChange={handleChange}
            placeholder="Pastor John Mensah"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Email</label>
          <input
            name="adminEmail"
            value={form.adminEmail}
            onChange={handleChange}
            placeholder="pastor@graceassembly.com"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-700 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 transition disabled:opacity-50"
        >
          {loading ? "Creating your church..." : "Register Church"}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already registered?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Sign in
          </a>
        </p>

      </div>
    </div>
  )
}