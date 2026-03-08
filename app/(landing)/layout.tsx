import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ChurchCore — Church Management Platform",
  description: "The complete church management platform built for African congregations. Manage members, tithes, welfare, offerings, expenses, and SMS in one place.",
}

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}