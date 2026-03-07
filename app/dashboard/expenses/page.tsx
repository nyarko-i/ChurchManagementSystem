import { requirePermission } from "@/lib/permissions"
import { getExpenses } from "@/actions/expenses"
import MonthYearSelector from "@/components/MonthYearSelector"
import RecordExpenseForm from "@/components/RecordExpenseForm"
import ExpensesTable from "@/components/ExpensesTable"
import Link from "next/link"

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
]

export default async function ExpensesPage(props: {
  searchParams: Promise<{ tab?: string; month?: string; year?: string }>
}) {
  await requirePermission("viewExpenses")

  const searchParams = await props.searchParams
  const tab = searchParams.tab ?? "list"
  const now = new Date()
  const month = parseInt(searchParams.month ?? String(now.getMonth() + 1))
  const year = parseInt(searchParams.year ?? String(now.getFullYear()))

  const result = await getExpenses(month, year)
  const expenses = result.success ? result.expenses ?? [] : []
  const totalAmount = result.success ? result.totalAmount ?? 0 : 0
  const byCategory = result.success ? result.byCategory ?? {} : {}

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Expenses</h2>
          <p className="text-gray-500 mt-1">
            Church main account expenses — {MONTHS[month - 1]} {year}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "list", label: "Expense Records" },
          { key: "record", label: "Record Expense" },
        ].map((t) => (
          <Link
            key={t.key}
            href={`/dashboard/expenses?tab=${t.key}&month=${month}&year=${year}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.key
                ? "bg-blue-700 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tab === "list" && (
        <div>
          <MonthYearSelector
            month={month}
            year={year}
            basePath="/dashboard/expenses"
          />

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-3xl font-bold text-red-500 mt-1">
                GHS {totalAmount.toFixed(2)}
              </p>
            </div>

            {/* By Category */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <p className="text-sm text-gray-500 mb-3">By Category</p>
              {Object.keys(byCategory).length === 0 ? (
                <p className="text-gray-400 text-sm">No expenses yet</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(byCategory).map(([cat, amount]) => (
                    <div key={cat} className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">{cat}</span>
                      <span className="font-semibold text-gray-800">
                        GHS {amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <ExpensesTable expenses={expenses} />
        </div>
      )}

      {tab === "record" && <RecordExpenseForm />}
    </div>
  )
}