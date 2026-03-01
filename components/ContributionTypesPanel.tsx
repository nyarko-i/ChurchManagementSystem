"use client"

import { useState } from "react"
import { createContributionType, toggleContributionType } from "@/actions/contributions"

type ContributionType = {
  id: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: Date
}

export default function ContributionTypesPanel({
  types,
}: {
  types: ContributionType[]
}) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [form, setForm] = useState({ name: "", description: "" })
  const [localTypes, setLocalTypes] = useState(types)

  async function handleCreate() {
    if (!form.name.trim()) {
      setMessage("Name is required")
      return
    }

    setLoading(true)
    setMessage("")

    const result = await createContributionType(form)
    setLoading(false)

    if (result.error) {
      setMessage(`Error: ${result.error}`)
    } else {
      setMessage("Contribution type created!")
      setForm({ name: "", description: "" })
      if (result.type) {
        setLocalTypes([result.type, ...localTypes])
      }
    }
  }

  async function handleToggle(id: string) {
    const result = await toggleContributionType(id)
    if (result.success && result.type) {
      setLocalTypes(
        localTypes.map((t) => (t.id === id ? { ...t, isActive: result.type!.isActive } : t))
      )
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* Create New Type */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Create New Type
        </h3>

        {message && (
          <div className={`p-3 rounded-lg mb-4 text-sm ${
            message.startsWith("Error")
              ? "bg-red-50 text-red-600"
              : "bg-green-50 text-green-600"
          }`}>
            {message}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Building Fund 2025"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Optional description"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-blue-700 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 transition disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Type"}
        </button>
      </div>

      {/* Existing Types */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Existing Types
        </h3>

        {localTypes.length === 0 ? (
          <p className="text-gray-400 text-sm">No types created yet.</p>
        ) : (
          <div className="space-y-3">
            {localTypes.map((type) => (
              <div
                key={type.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{type.name}</p>
                  {type.description && (
                    <p className="text-xs text-gray-400 mt-0.5">{type.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleToggle(type.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                    type.isActive
                      ? "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-600"
                      : "bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700"
                  }`}
                >
                  {type.isActive ? "Active" : "Inactive"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
