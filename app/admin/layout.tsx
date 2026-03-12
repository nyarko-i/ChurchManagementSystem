import Link from "next/link"
import { auth } from "@/auth"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user?.isSuperAdmin) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-xl font-bold text-white">
            Church<span className="text-yellow-400">Core</span>
            <span className="ml-2 text-xs bg-yellow-400 text-gray-900 px-2 py-0.5 rounded font-bold">ADMIN</span>
          </Link>
          <nav className="flex items-center gap-4 ml-6">
            <Link href="/admin" className="text-sm text-gray-300 hover:text-white transition">
              Churches
            </Link>
            <Link href="/admin/account" className="text-sm text-gray-300 hover:text-white transition">
              My Account
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center text-gray-900 text-xs font-bold">
              {session.user.name?.[0]?.toUpperCase() ?? "A"}
            </div>
            <span className="text-sm text-gray-400">{session.user.name}</span>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="text-xs bg-gray-800 px-3 py-1.5 rounded text-gray-300 hover:text-white hover:bg-gray-700 transition">
              Sign Out
            </button>
          </form>
        </div>
      </header>
      <main className="p-8">{children}</main>
    </div>
  )
}