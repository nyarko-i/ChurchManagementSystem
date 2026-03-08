/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import {
  getTitheReport,
  getWelfareReport,
  getOfferingsReport,
  getExpensesReport,
  getContributionsReport,
  getNewMembersReport,
  getFinanceSummaryReport,
} from "@/actions/reports"

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
]

const REPORT_TYPES = [
  { key: "tithe", label: "Tithe Report", icon: "📖" },
  { key: "welfare", label: "Welfare Report", icon: "🏥" },
  { key: "offerings", label: "Offerings Report", icon: "🙏" },
  { key: "expenses", label: "Expenses Report", icon: "💸" },
  { key: "contributions", label: "Contributions Report", icon: "💰" },
  { key: "members", label: "New Members Report", icon: "👥" },
  { key: "finance", label: "Full Finance Summary", icon: "📊" },
]

type Church = {
  name: string
  email: string
  phone: string
  address: string | null
}

export default function ReportsClient({ church }: { church: Church }) {
  const today = new Date()
  const [reportType, setReportType] = useState("tithe")
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [year, setYear] = useState(today.getFullYear())
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<any>(null)

  const years = Array.from({ length: 6 }, (_, i) => today.getFullYear() - i)

  async function generateReport() {
    setLoading(true)
    setReportData(null)
    try {
      let data
      if (reportType === "tithe") data = await getTitheReport(month, year)
      else if (reportType === "welfare") data = await getWelfareReport(month, year)
      else if (reportType === "offerings") data = await getOfferingsReport(month, year)
      else if (reportType === "expenses") data = await getExpensesReport(month, year)
      else if (reportType === "contributions") data = await getContributionsReport(month, year)
      else if (reportType === "members") data = await getNewMembersReport(month, year)
      else if (reportType === "finance") data = await getFinanceSummaryReport(month, year)
      setReportData(data)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  function handlePrint() {
    window.print()
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`
  }

  const selectedReport = REPORT_TYPES.find((rt) => rt.key === reportType)

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: fixed; top: 0; left: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="p-6 space-y-6">
        <div className="no-print">
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Generate and print monthly reports</p>
        </div>

        {/* Controls */}
        <div className="no-print bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {REPORT_TYPES.map((rt) => (
                  <option key={rt.key} value={rt.key}>{rt.icon} {rt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {MONTHS.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={generateReport}
                disabled={loading}
                className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate"}
              </button>
              {reportData && (
                <button
                  onClick={handlePrint}
                  className="flex-1 bg-gray-700 text-white py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition"
                >
                  🖨️ Print
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Report Output */}
        {reportData && (
          <div id="print-area" className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">

            {/* Header */}
            <div className="text-center border-b pb-6">
              <h2 className="text-2xl font-bold text-gray-900">{church.name}</h2>
              <p className="text-sm text-gray-500 mt-1">{church.address ?? ""} {church.phone}</p>
              <h3 className="text-lg font-semibold text-gray-700 mt-4">
                {selectedReport?.icon} {selectedReport?.label}
              </h3>
              <p className="text-sm text-gray-500">{MONTHS[month - 1]} {year}</p>
              <p className="text-xs text-gray-400 mt-1">Generated on {formatDate(new Date())}</p>
            </div>

            {/* TITHE REPORT */}
            {reportType === "tithe" && (
              <div className="space-y-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-gray-600">Member No.</th>
                      <th className="text-left py-2 text-gray-600">Name</th>
                      <th className="text-right py-2 text-gray-600">W1</th>
                      <th className="text-right py-2 text-gray-600">W2</th>
                      <th className="text-right py-2 text-gray-600">W3</th>
                      <th className="text-right py-2 text-gray-600">W4</th>
                      <th className="text-right py-2 text-gray-600">Monthly</th>
                      <th className="text-right py-2 font-semibold text-gray-800">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportData.records ?? []).map((r: any) => {
                      const rowTotal = (r.week1Amount ?? 0) + (r.week2Amount ?? 0) + (r.week3Amount ?? 0) + (r.week4Amount ?? 0) + (r.monthlyAmount ?? 0)
                      return (
                        <tr key={r.id} className="border-b">
                          <td className="py-2 text-gray-500">{r.member.memberNumber}</td>
                          <td className="py-2">{r.member.firstName} {r.member.lastName}</td>
                          <td className="py-2 text-right">{r.week1Amount?.toFixed(2) ?? "—"}</td>
                          <td className="py-2 text-right">{r.week2Amount?.toFixed(2) ?? "—"}</td>
                          <td className="py-2 text-right">{r.week3Amount?.toFixed(2) ?? "—"}</td>
                          <td className="py-2 text-right">{r.week4Amount?.toFixed(2) ?? "—"}</td>
                          <td className="py-2 text-right">{r.monthlyAmount?.toFixed(2) ?? "—"}</td>
                          <td className="py-2 text-right font-semibold">GHS {rowTotal.toFixed(2)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2">
                      <td colSpan={7} className="py-2 font-bold text-gray-800">TOTAL</td>
                      <td className="py-2 text-right font-bold text-blue-700">GHS {(reportData.total ?? 0).toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
                <p className="text-sm text-gray-500">Total Records: {(reportData.records ?? []).length}</p>
              </div>
            )}

            {/* WELFARE REPORT */}
            {reportType === "welfare" && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Contributions</h4>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 text-gray-600">Member No.</th>
                        <th className="text-left py-2 text-gray-600">Name</th>
                        <th className="text-right py-2 text-gray-600">Required</th>
                        <th className="text-right py-2 text-gray-600">Paid</th>
                        <th className="text-right py-2 text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(reportData.contributions ?? []).map((c: any) => (
                        <tr key={c.id} className="border-b">
                          <td className="py-2 text-gray-500">{c.member.memberNumber}</td>
                          <td className="py-2">{c.member.firstName} {c.member.lastName}</td>
                          <td className="py-2 text-right">GHS {c.requiredAmount.toFixed(2)}</td>
                          <td className="py-2 text-right font-semibold">GHS {c.totalPaid.toFixed(2)}</td>
                          <td className="py-2 text-right">{c.isSigned ? "✓ Signed" : c.totalPaid >= c.requiredAmount ? "Pending" : "Partial"}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2">
                        <td colSpan={3} className="py-2 font-bold">TOTAL COLLECTED</td>
                        <td className="py-2 text-right font-bold text-green-600">GHS {(reportData.totalIn ?? 0).toFixed(2)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                {(reportData.payouts ?? []).length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Payouts</h4>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 text-gray-600">Member</th>
                          <th className="text-left py-2 text-gray-600">Type</th>
                          <th className="text-right py-2 text-gray-600">Amount</th>
                          <th className="text-right py-2 text-gray-600">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(reportData.payouts ?? []).map((p: any) => (
                          <tr key={p.id} className="border-b">
                            <td className="py-2">{p.request.member.firstName} {p.request.member.lastName}</td>
                            <td className="py-2 capitalize">{p.request.type.replace(/_/g, " ")}</td>
                            <td className="py-2 text-right text-red-500">GHS {p.amount.toFixed(2)}</td>
                            <td className="py-2 text-right">{formatDate(p.paidAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2">
                          <td colSpan={2} className="py-2 font-bold">TOTAL PAID OUT</td>
                          <td className="py-2 text-right font-bold text-red-500">GHS {(reportData.totalOut ?? 0).toFixed(2)}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
                <div className="border-t pt-4 flex justify-between font-bold text-lg">
                  <span>NET WELFARE BALANCE</span>
                  <span className={(reportData.balance ?? 0) >= 0 ? "text-green-600" : "text-red-500"}>
                    GHS {(reportData.balance ?? 0).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* OFFERINGS REPORT */}
            {reportType === "offerings" && (
              <div className="space-y-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-gray-600">Date</th>
                      <th className="text-left py-2 text-gray-600">Service Type</th>
                      <th className="text-right py-2 text-gray-600">Cash</th>
                      <th className="text-right py-2 text-gray-600">MoMo</th>
                      <th className="text-right py-2 text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportData.records ?? []).map((r: any) => (
                      <tr key={r.id} className="border-b">
                        <td className="py-2">{formatDate(r.serviceDate)}</td>
                        <td className="py-2 capitalize">{r.serviceType}</td>
                        <td className="py-2 text-right">GHS {r.cashAmount.toFixed(2)}</td>
                        <td className="py-2 text-right">GHS {r.momoAmount.toFixed(2)}</td>
                        <td className="py-2 text-right font-semibold">GHS {r.totalAmount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2">
                      <td colSpan={2} className="py-2 font-bold">TOTAL</td>
                      <td className="py-2 text-right font-bold">GHS {(reportData.totalCash ?? 0).toFixed(2)}</td>
                      <td className="py-2 text-right font-bold">GHS {(reportData.totalMomo ?? 0).toFixed(2)}</td>
                      <td className="py-2 text-right font-bold text-blue-700">GHS {(reportData.total ?? 0).toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* EXPENSES REPORT */}
            {reportType === "expenses" && (
              <div className="space-y-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-gray-600">Date</th>
                      <th className="text-left py-2 text-gray-600">Title</th>
                      <th className="text-left py-2 text-gray-600">Category</th>
                      <th className="text-left py-2 text-gray-600">Description</th>
                      <th className="text-right py-2 text-gray-600">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportData.records ?? []).map((r: any) => (
                      <tr key={r.id} className="border-b">
                        <td className="py-2">{formatDate(r.createdAt)}</td>
                        <td className="py-2">{r.title}</td>
                        <td className="py-2">{r.category}</td>
                        <td className="py-2 text-gray-500">{r.description ?? "—"}</td>
                        <td className="py-2 text-right font-semibold text-red-500">GHS {r.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2">
                      <td colSpan={4} className="py-2 font-bold">TOTAL</td>
                      <td className="py-2 text-right font-bold text-red-500">GHS {(reportData.total ?? 0).toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-700 mb-2">By Category</h4>
                  <div className="space-y-1">
                    {Object.entries(reportData.byCategory ?? {}).map(([cat, amt]: any) => (
                      <div key={cat} className="flex justify-between text-sm">
                        <span className="text-gray-600">{cat}</span>
                        <span className="font-medium">GHS {amt.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* CONTRIBUTIONS REPORT */}
            {reportType === "contributions" && (
              <div className="space-y-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-gray-600">Date</th>
                      <th className="text-left py-2 text-gray-600">Member</th>
                      <th className="text-left py-2 text-gray-600">Type</th>
                      <th className="text-left py-2 text-gray-600">Method</th>
                      <th className="text-right py-2 text-gray-600">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportData.records ?? []).map((r: any) => (
                      <tr key={r.id} className="border-b">
                        <td className="py-2">{formatDate(r.createdAt)}</td>
                        <td className="py-2">{r.member.firstName} {r.member.lastName}</td>
                        <td className="py-2">{r.contributionType.name}</td>
                        <td className="py-2 capitalize">{r.paymentMethod}</td>
                        <td className="py-2 text-right font-semibold text-green-600">GHS {r.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2">
                      <td colSpan={4} className="py-2 font-bold">TOTAL</td>
                      <td className="py-2 text-right font-bold text-green-600">GHS {(reportData.total ?? 0).toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-700 mb-2">By Type</h4>
                  <div className="space-y-1">
                    {Object.entries(reportData.byType ?? {}).map(([type, amt]: any) => (
                      <div key={type} className="flex justify-between text-sm">
                        <span className="text-gray-600">{type}</span>
                        <span className="font-medium">GHS {amt.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* NEW MEMBERS REPORT */}
            {reportType === "members" && (
              <div className="space-y-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-gray-600">Member No.</th>
                      <th className="text-left py-2 text-gray-600">Name</th>
                      <th className="text-left py-2 text-gray-600">Phone</th>
                      <th className="text-left py-2 text-gray-600">Gender</th>
                      <th className="text-left py-2 text-gray-600">Join Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportData.records ?? []).map((m: any) => (
                      <tr key={m.id} className="border-b">
                        <td className="py-2 text-gray-500">{m.memberNumber}</td>
                        <td className="py-2 font-medium">{m.firstName} {m.lastName}</td>
                        <td className="py-2">{m.phone ?? "—"}</td>
                        <td className="py-2 capitalize">{m.gender ?? "—"}</td>
                        <td className="py-2">{formatDate(m.joinDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2">
                      <td colSpan={4} className="py-2 font-bold">TOTAL NEW MEMBERS</td>
                      <td className="py-2 font-bold text-blue-700">{reportData.total ?? 0}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* FINANCE SUMMARY */}
            {reportType === "finance" && reportData.tithe && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-500">Tithe</p>
                    <p className="text-xl font-bold text-purple-600">GHS {(reportData.tithe.total ?? 0).toFixed(2)}</p>
                  </div>
                  <div className="border rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-500">Offerings</p>
                    <p className="text-xl font-bold text-blue-600">GHS {(reportData.offerings.total ?? 0).toFixed(2)}</p>
                  </div>
                  <div className="border rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-500">Contributions</p>
                    <p className="text-xl font-bold text-green-600">GHS {(reportData.contributions.total ?? 0).toFixed(2)}</p>
                  </div>
                </div>
                <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Income</span>
                    <span className="font-semibold text-green-600">GHS {(reportData.totalIncome ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Expenses</span>
                    <span className="font-semibold text-red-500">GHS {(reportData.expenses.total ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Welfare Balance</span>
                    <span className="font-semibold text-blue-600">GHS {(reportData.welfare.balance ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-base font-bold">
                    <span>NET BALANCE</span>
                    <span className={(reportData.netBalance ?? 0) >= 0 ? "text-green-600" : "text-red-500"}>
                      GHS {(reportData.netBalance ?? 0).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Expenses by Category</h4>
                  <div className="space-y-1">
                    {Object.entries(reportData.expenses.byCategory ?? {}).map(([cat, amt]: any) => (
                      <div key={cat} className="flex justify-between text-sm">
                        <span className="text-gray-600">{cat}</span>
                        <span className="font-medium text-red-500">GHS {amt.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="border-t pt-4 text-center text-xs text-gray-400 space-y-1">
              <p>This report was generated by ChurchCore — {church.name}</p>
              <p>{church.email} | {church.phone}</p>
            </div>
          </div>
        )}

        {!reportData && !loading && (
          <div className="no-print bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-16 text-center text-gray-400">
            <p className="text-4xl mb-3">📄</p>
            <p className="font-medium">Select a report type and click Generate</p>
          </div>
        )}
      </div>
    </>
  )
}