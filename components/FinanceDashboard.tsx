/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts"
import type { PieLabelRenderProps } from "recharts"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
]

const COLORS = ["#1d4ed8", "#16a34a", "#dc2626", "#9333ea", "#ea580c"]

const ghsFormatter = (value: unknown): string =>
  `GHS ${(Number(value) || 0).toFixed(2)}`

const pieLabel = (props: PieLabelRenderProps): string => {
  const name = props.name ?? ""
  const percent = typeof props.percent === "number" ? props.percent : 0
  return `${name} ${(percent * 100).toFixed(0)}%`
}

const formatDate = (date: string | Date): string => {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

type Props = {
  month: number
  year: number
  main: {
    totalOfferings: number
    totalContributions: number
    totalExpenses: number
    balance: number
    offerings: any[]
    contributions: any[]
    expenses: any[]
  }
  tithe: {
    total: number
    records: any[]
  }
  welfare: {
    totalIn: number
    totalOut: number
    balance: number
    contributions: any[]
    payouts: any[]
  }
  trend: {
    month: string
    offerings: number
    contributions: number
    expenses: number
    tithe: number
    welfareIn: number
    welfareOut: number
  }[]
}

export default function FinanceDashboard({ month, year, main, tithe, welfare, trend }: Props) {
  const [activeTab, setActiveTab] = useState<"main" | "tithe" | "welfare">("main")
  const [downloading, setDownloading] = useState(false)

  const incomePieData = [
    { name: "Offerings", value: main.totalOfferings },
    { name: "Contributions", value: main.totalContributions },
  ].filter((d) => d.value > 0)

  const expenseByCategory = main.expenses.reduce((acc: Record<string, number>, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount
    return acc
  }, {})

  const expensePieData = Object.entries(expenseByCategory).map(([name, value]) => ({
    name,
    value,
  }))

  async function handleDownloadPDF() {
  const element = document.getElementById("finance-report")
  if (!element) return
  setDownloading(true)
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#f9fafb",
      logging: false,
      ignoreElements: (el) => {
        // ignore SVG elements that might have lab colors (recharts)
        return el.tagName === "svg" && !el.closest("#finance-report")
      },
      onclone: (_clonedDoc, clonedElement) => {
        // Force all text and background colors to safe hex values
        const all = clonedElement.querySelectorAll("*")
        all.forEach((el) => {
          const htmlEl = el as HTMLElement
          const style = htmlEl.style
          // Reset any CSS variable-based or oklch/lab colors
          style.setProperty("color", "#111827", "important")
          style.setProperty("border-color", "#e5e7eb", "important")
        })
        // Restore specific color overrides manually
        clonedElement.querySelectorAll("[data-pdf-color]").forEach((el) => {
          const htmlEl = el as HTMLElement
          htmlEl.style.setProperty("color", htmlEl.dataset.pdfColor ?? "#111827", "important")
        })
      },
    })
    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pageWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }
    pdf.save(`ChurchCore-Finance-${MONTHS[month - 1]}-${year}.pdf`)
  } catch (error) {
    console.error("PDF generation failed:", error)
  }
  setDownloading(false)
}

  return (
    <div className="space-y-8">

      {/* Download Button */}
      <div className="flex justify-end">
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="flex items-center gap-2 bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition disabled:opacity-50"
        >
          {downloading ? "⏳ Generating..." : "⬇️ Download PDF Report"}
        </button>
      </div>

      <div id="finance-report" className="space-y-8">

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div
            onClick={() => setActiveTab("main")}
            className={`rounded-xl shadow-sm p-6 border-2 cursor-pointer transition ${
              activeTab === "main" ? "border-blue-700 bg-blue-50" : "border-gray-100 bg-white"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 font-medium">Main Account</p>
                <p className={`text-3xl font-bold mt-1 ${main.balance >= 0 ? "text-green-600" : "text-red-500"}`}>
                  GHS {main.balance.toFixed(2)}
                </p>
              </div>
              <span className="text-2xl">🏦</span>
            </div>
            <div className="mt-3 flex gap-4 text-xs text-gray-500">
              <span>In: GHS {(main.totalOfferings + main.totalContributions).toFixed(2)}</span>
              <span>Out: GHS {main.totalExpenses.toFixed(2)}</span>
            </div>
          </div>

          <div
            onClick={() => setActiveTab("tithe")}
            className={`rounded-xl shadow-sm p-6 border-2 cursor-pointer transition ${
              activeTab === "tithe" ? "border-purple-600 bg-purple-50" : "border-gray-100 bg-white"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 font-medium">Tithe Account</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  GHS {tithe.total.toFixed(2)}
                </p>
              </div>
              <span className="text-2xl">📖</span>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              <span>{tithe.records.length} tithe records this month</span>
            </div>
          </div>

          <div
            onClick={() => setActiveTab("welfare")}
            className={`rounded-xl shadow-sm p-6 border-2 cursor-pointer transition ${
              activeTab === "welfare" ? "border-green-600 bg-green-50" : "border-gray-100 bg-white"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 font-medium">Welfare Account</p>
                <p className={`text-3xl font-bold mt-1 ${welfare.balance >= 0 ? "text-green-600" : "text-red-500"}`}>
                  GHS {welfare.balance.toFixed(2)}
                </p>
              </div>
              <span className="text-2xl">🏥</span>
            </div>
            <div className="mt-3 flex gap-4 text-xs text-gray-500">
              <span>In: GHS {welfare.totalIn.toFixed(2)}</span>
              <span>Out: GHS {welfare.totalOut.toFixed(2)}</span>
            </div>
          </div>

        </div>

        {/* 6 MONTH BAR CHART */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">6-Month Financial Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={ghsFormatter as any} />
              <Legend />
              <Bar dataKey="offerings" name="Offerings" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="contributions" name="Contributions" fill="#16a34a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#dc2626" radius={[4, 4, 0, 0]} />
              <Bar dataKey="tithe" name="Tithe" fill="#9333ea" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* LINE CHART */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Income vs Expenses Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={ghsFormatter as any} />
              <Legend />
              <Line type="monotone" dataKey="offerings" name="Offerings" stroke="#1d4ed8" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="tithe" name="Tithe" stroke="#9333ea" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="welfareIn" name="Welfare In" stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#dc2626" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* MAIN ACCOUNT */}
        {activeTab === "main" && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800">
              🏦 Main Account — {MONTHS[month - 1]} {year}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <p className="text-sm text-gray-500">Total Offerings</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">GHS {main.totalOfferings.toFixed(2)}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                <p className="text-sm text-gray-500">Total Contributions</p>
                <p className="text-2xl font-bold text-green-600 mt-1">GHS {main.totalContributions.toFixed(2)}</p>
              </div>
              <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                <p className="text-sm text-gray-500">Total Expenses</p>
                <p className="text-2xl font-bold text-red-500 mt-1">GHS {main.totalExpenses.toFixed(2)}</p>
              </div>
            </div>

            {(incomePieData.length > 0 || expensePieData.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {incomePieData.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">Income Breakdown</h4>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={incomePieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={pieLabel}>
                          {incomePieData.map((_, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={ghsFormatter as any} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {expensePieData.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">Expense Breakdown</h4>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={expensePieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={pieLabel}>
                          {expensePieData.map((_, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={ghsFormatter as any} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            {/* Offerings Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h4 className="font-semibold text-gray-700">Offering Records</h4>
              </div>
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Date</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Service</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Cash</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">MoMo</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {main.offerings.map((o) => (
                    <tr key={o.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-700">{formatDate(o.serviceDate)}</td>
                      <td className="px-6 py-3 text-gray-600 capitalize">{o.serviceType}</td>
                      <td className="px-6 py-3 text-gray-600">GHS {o.cashAmount.toFixed(2)}</td>
                      <td className="px-6 py-3 text-gray-600">GHS {o.momoAmount.toFixed(2)}</td>
                      <td className="px-6 py-3 font-semibold text-blue-700">GHS {o.totalAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                  {main.offerings.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No offerings this month</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Contributions Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h4 className="font-semibold text-gray-700">Contribution Records</h4>
              </div>
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Member</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Type</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Amount</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Method</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {main.contributions.map((c) => (
                    <tr key={c.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium text-gray-700">{c.member.firstName} {c.member.lastName}</td>
                      <td className="px-6 py-3 text-gray-600">{c.contributionType.name}</td>
                      <td className="px-6 py-3 font-semibold text-green-600">GHS {c.amount.toFixed(2)}</td>
                      <td className="px-6 py-3 text-gray-500 capitalize">{c.paymentMethod}</td>
                      <td className="px-6 py-3 text-gray-500">{formatDate(c.createdAt)}</td>
                    </tr>
                  ))}
                  {main.contributions.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No contributions this month</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Expenses Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h4 className="font-semibold text-gray-700">Expense Records</h4>
              </div>
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Title</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Category</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Amount</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {main.expenses.map((e) => (
                    <tr key={e.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-700">{e.title}</td>
                      <td className="px-6 py-3">
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">{e.category}</span>
                      </td>
                      <td className="px-6 py-3 font-semibold text-red-500">GHS {e.amount.toFixed(2)}</td>
                      <td className="px-6 py-3 text-gray-500">{formatDate(e.createdAt)}</td>
                    </tr>
                  ))}
                  {main.expenses.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No expenses this month</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TITHE ACCOUNT */}
        {activeTab === "tithe" && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800">
              📖 Tithe Account — {MONTHS[month - 1]} {year}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
                <p className="text-sm text-gray-500">Total Tithe Collected</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">GHS {tithe.total.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-100">
                <p className="text-sm text-gray-500">Members with Tithe Records</p>
                <p className="text-3xl font-bold text-gray-700 mt-1">{tithe.records.length}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">6-Month Tithe Trend</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={ghsFormatter as any} />
                  <Bar dataKey="tithe" name="Tithe" fill="#9333ea" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h4 className="font-semibold text-gray-700">Tithe Records</h4>
              </div>
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Member</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Week 1</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Week 2</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Week 3</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Week 4</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Monthly</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Total</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tithe.records.map((r) => {
                    const total =
                      (r.week1Amount ?? 0) + (r.week2Amount ?? 0) +
                      (r.week3Amount ?? 0) + (r.week4Amount ?? 0) +
                      (r.monthlyAmount ?? 0)
                    return (
                      <tr key={r.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-3 text-gray-700 font-medium">{r.member.firstName} {r.member.lastName}</td>
                        <td className="px-6 py-3 text-gray-600">{r.week1Amount ? `GHS ${r.week1Amount}` : "—"}</td>
                        <td className="px-6 py-3 text-gray-600">{r.week2Amount ? `GHS ${r.week2Amount}` : "—"}</td>
                        <td className="px-6 py-3 text-gray-600">{r.week3Amount ? `GHS ${r.week3Amount}` : "—"}</td>
                        <td className="px-6 py-3 text-gray-600">{r.week4Amount ? `GHS ${r.week4Amount}` : "—"}</td>
                        <td className="px-6 py-3 text-gray-600">{r.monthlyAmount ? `GHS ${r.monthlyAmount}` : "—"}</td>
                        <td className="px-6 py-3 font-semibold text-purple-600">GHS {total.toFixed(2)}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            r.isSigned ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {r.isSigned ? "✓ Signed" : "Pending"}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                  {tithe.records.length === 0 && (
                    <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-400">No tithe records this month</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* WELFARE ACCOUNT */}
        {activeTab === "welfare" && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800">
              🏥 Welfare Account — {MONTHS[month - 1]} {year}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                <p className="text-sm text-gray-500">Total Contributions</p>
                <p className="text-2xl font-bold text-green-600 mt-1">GHS {welfare.totalIn.toFixed(2)}</p>
              </div>
              <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                <p className="text-sm text-gray-500">Total Payouts</p>
                <p className="text-2xl font-bold text-red-500 mt-1">GHS {welfare.totalOut.toFixed(2)}</p>
              </div>
              <div className={`rounded-xl p-5 border ${welfare.balance >= 0 ? "bg-blue-50 border-blue-100" : "bg-red-50 border-red-100"}`}>
                <p className="text-sm text-gray-500">Balance</p>
                <p className={`text-2xl font-bold mt-1 ${welfare.balance >= 0 ? "text-blue-700" : "text-red-500"}`}>
                  GHS {welfare.balance.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">6-Month Welfare Trend</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={ghsFormatter as any} />
                  <Legend />
                  <Bar dataKey="welfareIn" name="Contributions" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="welfareOut" name="Payouts" fill="#dc2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h4 className="font-semibold text-gray-700">Welfare Contributions</h4>
              </div>
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Member</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Amount Paid</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Required</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {welfare.contributions.map((c) => (
                    <tr key={c.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium text-gray-700">{c.member.firstName} {c.member.lastName}</td>
                      <td className="px-6 py-3 text-green-600 font-semibold">GHS {c.totalPaid.toFixed(2)}</td>
                      <td className="px-6 py-3 text-gray-500">GHS {c.requiredAmount.toFixed(2)}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          c.isSigned
                            ? "bg-green-100 text-green-700"
                            : c.totalPaid >= c.requiredAmount
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-500"
                        }`}>
                          {c.isSigned ? "✓ Signed" : c.totalPaid >= c.requiredAmount ? "Pending Sign Off" : "Partial"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {welfare.contributions.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No welfare contributions this month</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {welfare.payouts.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="px-6 py-4 border-b bg-gray-50">
                  <h4 className="font-semibold text-gray-700">Welfare Payouts</h4>
                </div>
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left px-6 py-3 text-gray-500 font-medium">Member</th>
                      <th className="text-left px-6 py-3 text-gray-500 font-medium">Type</th>
                      <th className="text-left px-6 py-3 text-gray-500 font-medium">Amount</th>
                      <th className="text-left px-6 py-3 text-gray-500 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {welfare.payouts.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-3 font-medium text-gray-700">
                          {p.request.member.firstName} {p.request.member.lastName}
                        </td>
                        <td className="px-6 py-3 text-gray-600 capitalize">
                          {p.request.type.replace("_", " ")}
                        </td>
                        <td className="px-6 py-3 font-semibold text-red-500">GHS {p.amount.toFixed(2)}</td>
                        <td className="px-6 py-3 text-gray-500">{formatDate(p.paidAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}