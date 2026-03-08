"use client"

import { useState } from "react"
import { addStaffUser, toggleStaffStatus, removeStaffUser } from "@/actions/settings"
import { useRouter } from "next/navigation"

type User = {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  createdAt: Date
}

type Props = {
  users: User[]
  currentUserId: string
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  pastor: "Pastor",
  treasurer: "Treasurer",
  secretary: "Secretary",
}

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-red-100 text-red-700",
  pastor: "bg-purple-100 text-purple-700",
  treasurer: "bg-blue-100 text-blue-700",
  secretary: "bg-gray-100 text-gray-600",
}

export default function StaffManager({ users, currentUserId }: Props) {
  const router = useRouter()
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "secretary",
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleAdd() {
    if (!form.name || !form.email || !form.password) {
      setMessage({ type: "error", text: "Please fill in all fields" })
      return
    }
    setLoading("add")
    setMessage(null)
    const result = await addStaffUser(form)
    setLoading(null)
    if (result.success) {
      setMessage({ type: "success", text: "Staff member added successfully" })
      setForm({ name: "", email: "", password: "", role: "secretary" })
      setShowAddForm(false)
      router.refresh()
    } else {
      setMessage({ type: "error", text: result.error ?? "Failed to add staff" })
    }
  }

  async function handleToggle(userId: string, isActive: boolean) {
    setLoading(userId)
    const result = await toggleStaffStatus(userId, !isActive)
    setLoading(null)
    if (result.success) router.refresh()
    else setMessage({ type: "error", text: result.error ?? "Failed to update" })
  }

  async function handleRemove(userId: string, name: string) {
    if (!confirm(`Are you sure you want to remove ${name}? This cannot be undone.`)) return
    setLoading(userId + "-remove")
    const result = await removeStaffUser(userId)
    setLoading(null)
    if (result.success) router.refresh()
    else setMessage({ type: "error", text: result.error ?? "Failed to remove" })
  }

  return (
    <div className="space-y-5">

      {/* Staff Table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Name</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Email</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Role</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Status</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-700">
                  {user.name}
                  {user.id === currentUserId && (
                    <span className="ml-2 text-xs text-gray-400">(you)</span>
                  )}
                </td>
                <td className="px-5 py-3 text-gray-500">{user.email}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ROLE_COLORS[user.role] ?? "bg-gray-100 text-gray-600"}`}>
                    {ROLE_LABELS[user.role] ?? user.role}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    user.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {user.id !== currentUserId && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggle(user.id, user.isActive)}
                        disabled={loading === user.id}
                        className="text-xs px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
                      >
                        {loading === user.id ? "..." : user.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleRemove(user.id, user.name)}
                        disabled={loading === user.id + "-remove"}
                        className="text-xs px-3 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition disabled:opacity-50"
                      >
                        {loading === user.id + "-remove" ? "..." : "Remove"}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Message */}
      {message && (
        <p className={`text-sm rounded-lg px-4 py-2 border ${
          message.type === "success"
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-red-50 text-red-600 border-red-200"
        }`}>
          {message.type === "success" ? "✓ " : "✗ "}{message.text}
        </p>
      )}

      {/* Add Staff Button */}
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition"
        >
          + Add Staff Member
        </button>
      ) : (
        <div className="border border-gray-200 rounded-xl p-5 space-y-4 bg-gray-50">
          <h4 className="font-semibold text-gray-700 text-sm">New Staff Member</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
              <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="secretary">Secretary</option>
                <option value="treasurer">Treasurer</option>
                <option value="pastor">Pastor</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              disabled={loading === "add"}
              className="bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition disabled:opacity-50"
            >
              {loading === "add" ? "Adding..." : "Add Staff"}
            </button>
            <button
              onClick={() => { setShowAddForm(false); setMessage(null) }}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}