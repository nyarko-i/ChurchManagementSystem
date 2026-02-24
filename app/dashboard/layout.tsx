import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Sidebar from "@/components/Sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* Sidebar — fixed, never scrolls */}
      <Sidebar />

      {/* Right Side */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top Bar — fixed, never scrolls */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shrink-0">
          <div />
          <div className="text-sm text-gray-600">
            Welcome, <span className="font-semibold">{session.user.name}</span>
          </div>
        </header>

        {/* Page Content — ONLY this scrolls */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

      </div>
    </div>
  )
}