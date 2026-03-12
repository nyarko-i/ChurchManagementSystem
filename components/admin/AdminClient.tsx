/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  addChurch,
  toggleChurchStatus,
  changeSubscriptionPlan,
  getChurchStats,
} from "@/actions/admin"

type Church = {
  id: string
  name: string
  email: string
  phone: string
  address: string | null
  slug: string
  subscriptionPlan: string
  subscriptionStatus: string
  createdAt: Date
  _count: { members: number; users: number; titheRecords: number; offerings: number }
}

const PLAN_COLORS: Record<string, string> = {
  starter: "bg-gray-700 text-gray-200",
  growth: "bg-blue-900 text-blue-300",
  pro: "bg-yellow-900 text-yellow-300",
}

export default function AdminClient({ churches }: { churches: Church[] }) {
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [search, setSearch] = useState("")

  const [form, setForm] = useState({
    churchName: "", churchEmail: "", churchPhone: "", churchAddress: "",
    plan: "starter", adminName: "", adminEmail: "", adminPassword: "",
  })

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleAddChurch() {
    if (!form.churchName || !form.adminEmail || !form.adminPassword || !form.adminName) {
      setMessage({ type: "error", text: "Please fill in all required fields" })
      return
    }
    setLoadingId("add")
    try {
      await addChurch(form)
      setMessage({ type: "success", text: "Church created successfully!" })
      setShowAdd(false)
      setForm({ churchName: "", churchEmail: "", churchPhone: "", churchAddress: "", plan: "starter", adminName: "", adminEmail: "", adminPassword: "" })
      router.refresh()
    } catch {
      setMessage({ type: "error", text: "Failed to create church" })
    }
    setLoadingId(null)
  }

  async function handleToggleStatus(church: Church) {
    const newStatus = church.subscriptionStatus !== "active"
    setLoadingId(church.id + "-status")
    await toggleChurchStatus(church.id, newStatus)
    setLoadingId(null)
    router.refresh()
  }

  async function handlePlanChange(churchId: string, plan: string) {
    setLoadingId(churchId + "-plan")
    await changeSubscriptionPlan(churchId, plan)
    setLoadingId(null)
    router.refresh()
  }

  async function handleViewStats(church: Church) {
    setSelectedChurch(church)
    setStats(null)
    const data = await getChurchStats(church.id)
    setStats(data)
  }

  const filtered = churches.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  const formatDate = (date: Date) => new Date(date).toLocaleDateString("en-GB")

  return (
    <div className="space-y-6">

      {/* Message */}
      {message && (
        <div className={`px-5 py-3 rounded-lg text-sm font-medium border ${
          message.type === "success"
            ? "bg-green-950 text-green-400 border-green-800"
            : "bg-red-950 text-red-400 border-red-800"
        }`}>
          {message.type === "success" ? "✓ " : "✗ "}{message.text}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search churches..."
          className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 w-72"
        />
        <button
          onClick={() => setShowAdd(true)}
          className="bg-yellow-400 text-gray-900 px-5 py-2 rounded-lg text-sm font-bold hover:bg-yellow-300 transition"
        >
          + Add Church
        </button>
      </div>

      {/* Churches Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-800">
            <tr>
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Church</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Contact</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Members</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Plan</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Status</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Joined</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((church) => (
              <tr key={church.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                <td className="px-6 py-4">
                  <p className="font-semibold text-white">{church.name}</p>
                  <p className="text-xs text-gray-500">{church.slug}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-gray-300">{church.email}</p>
                  <p className="text-xs text-gray-500">{church.phone}</p>
                </td>
                <td className="px-6 py-4 text-gray-300">{church._count.members}</td>
                <td className="px-6 py-4">
                  <select
                    value={church.subscriptionPlan}
                    onChange={(e) => handlePlanChange(church.id, e.target.value)}
                    disabled={loadingId === church.id + "-plan"}
                    className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer ${PLAN_COLORS[church.subscriptionPlan] ?? "bg-gray-700 text-gray-200"}`}
                  >
                    <option value="starter">Starter</option>
                    <option value="growth">Growth</option>
                    <option value="pro">Pro</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    church.subscriptionStatus === "active"
                      ? "bg-green-900 text-green-400"
                      : "bg-red-900 text-red-400"
                  }`}>
                    {church.subscriptionStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400 text-xs">{formatDate(church.createdAt)}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewStats(church)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition"
                    >
                      📊 Stats
                    </button>
                    <button
                      onClick={() => handleToggleStatus(church)}
                      disabled={loadingId === church.id + "-status"}
                      className={`text-xs px-3 py-1.5 rounded-lg transition disabled:opacity-50 ${
                        church.subscriptionStatus === "active"
                          ? "bg-red-900/50 text-red-400 hover:bg-red-900"
                          : "bg-green-900/50 text-green-400 hover:bg-green-900"
                      }`}
                    >
                      {loadingId === church.id + "-status" ? "..." :
                        church.subscriptionStatus === "active" ? "Suspend" : "Activate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No churches found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Stats Modal */}
      {selectedChurch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 border border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-white">{selectedChurch.name}</h3>
                <p className="text-xs text-gray-400">This Month&apos;s Stats</p>
              </div>
              <button onClick={() => setSelectedChurch(null)} className="text-gray-400 hover:text-white text-xl">×</button>
            </div>
            <div className="px-6 py-6">
              {!stats ? (
                <p className="text-center text-gray-400 py-8">Loading stats...</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Total Members", value: stats.memberCount, color: "text-white" },
                    { label: "Tithe This Month", value: `GHS ${(stats.tithe ?? 0).toFixed(2)}`, color: "text-yellow-400" },
                    { label: "Offerings", value: `GHS ${(stats.offerings ?? 0).toFixed(2)}`, color: "text-blue-400" },
                    { label: "Expenses", value: `GHS ${(stats.expenses ?? 0).toFixed(2)}`, color: "text-red-400" },
                    { label: "Net Balance", value: `GHS ${((stats.offerings ?? 0) + (stats.tithe ?? 0) - (stats.expenses ?? 0)).toFixed(2)}`, color: "text-green-400" },
                  ].map((s) => (
                    <div key={s.label} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                      <p className="text-xs text-gray-500">{s.label}</p>
                      <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-6 pb-5 flex gap-2">
              <div className="flex-1 bg-gray-800 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Staff Users</p>
                <p className="text-lg font-bold text-white">{selectedChurch._count.users}</p>
              </div>
              <div className="flex-1 bg-gray-800 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Tithe Records</p>
                <p className="text-lg font-bold text-white">{selectedChurch._count.titheRecords}</p>
              </div>
              <div className="flex-1 bg-gray-800 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Offering Records</p>
                <p className="text-lg font-bold text-white">{selectedChurch._count.offerings}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Church Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-xl mx-4 border border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="font-bold text-white">Add New Church</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-white text-xl">×</button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <p className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Church Info</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Church Name *</label>
                  <input name="churchName" value={form.churchName} onChange={handleFormChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Plan</label>
                  <select name="plan" value={form.plan} onChange={handleFormChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-400">
                    <option value="starter">Starter</option>
                    <option value="growth">Growth</option>
                    <option value="pro">Pro</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Church Email</label>
                <input name="churchEmail" type="email" value={form.churchEmail} onChange={handleFormChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Phone</label>
                  <input name="churchPhone" value={form.churchPhone} onChange={handleFormChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Address</label>
                  <input name="churchAddress" value={form.churchAddress} onChange={handleFormChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                </div>
              </div>

              <p className="text-xs font-bold text-yellow-400 uppercase tracking-widest pt-2">Admin Account</p>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Admin Full Name *</label>
                <input name="adminName" value={form.adminName} onChange={handleFormChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Admin Email *</label>
                <input name="adminEmail" type="email" value={form.adminEmail} onChange={handleFormChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Admin Password *</label>
                <input name="adminPassword" type="password" value={form.adminPassword} onChange={handleFormChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>

              {message && (
                <p className={`text-sm rounded-lg px-4 py-2 ${
                  message.type === "error" ? "bg-red-950 text-red-400" : "bg-green-950 text-green-400"
                }`}>
                  {message.text}
                </p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-800 flex gap-3 justify-end">
              <button onClick={() => setShowAdd(false)}
                className="px-4 py-2 text-sm text-gray-400 border border-gray-700 rounded-lg hover:bg-gray-800 transition">
                Cancel
              </button>
              <button onClick={handleAddChurch} disabled={loadingId === "add"}
                className="px-5 py-2 text-sm font-bold bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-300 transition disabled:opacity-50">
                {loadingId === "add" ? "Creating..." : "Create Church"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}