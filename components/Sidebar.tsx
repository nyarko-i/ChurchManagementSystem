"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"

const navItems = [
  { label: "Dashboard",     href: "/dashboard",                icon: "📊" },
  { label: "Members",       href: "/dashboard/members",        icon: "👥" },
  { label: "Tithe",         href: "/dashboard/tithe",          icon: "📖" },
  { label: "Welfare",       href: "/dashboard/welfare",        icon: "🏥" },
  { label: "Contributions", href: "/dashboard/contributions",  icon: "💰" },
  { label: "Offerings",     href: "/dashboard/offerings",      icon: "🙏" },
  { label: "Expenses",      href: "/dashboard/expenses",       icon: "📋" },
  { label: "Finance",       href: "/dashboard/finance",        icon: "📈" },
  { label: "SMS",           href: "/dashboard/sms",            icon: "📩" },
  { label: "Settings",      href: "/dashboard/settings",       icon: "⚙️" },
  { label: "Reports",       href: "/dashboard/reports",        icon: "📄" },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">

      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-700">ChurchCore</h1>
        <p className="text-xs text-gray-400 mt-0.5">Church Management</p>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Sign Out */}
      <div className="px-3 py-4 border-t border-gray-200">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition w-full"
        >
          <span className="text-base">🚪</span>
          Sign Out
        </button>
      </div>

    </aside>
  )
}