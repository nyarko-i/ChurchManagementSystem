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
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div />
          <div className="text-sm text-gray-600">
            Welcome, <span className="font-semibold">{session.user.name}</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>

      </div>
    </div>
  )
}