/* eslint-disable react/no-unescaped-entities */
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getStaffUsers } from "@/actions/settings"
import ChurchProfileForm from "@/components/settings/ChurchProfileForm"
import WelfareSettingsForm from "@/components/settings/WelfareSettingsForm"
import ChangePasswordForm from "@/components/settings/ChangePasswordForm"
import StaffManager from "@/components/settings/StaffManager"

export default async function SettingsPage() {
  const session = await auth()
  if (!session) return null
  const churchId = session.user.churchId

  const [church, welfareSettings, staffUsers] = await Promise.all([
    prisma.church.findUnique({
      where: { id: churchId },
      select: { name: true, email: true, phone: true, address: true, slug: true, subscriptionPlan: true },
    }),
    prisma.welfareSettings.findUnique({
      where: { churchId },
    }),
    getStaffUsers(),
  ])

  const isAdmin = ["super_admin", "pastor"].includes(session.user.role)

  return (
    <div className="p-6 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your church profile and system preferences</p>
      </div>

      {/* Church Profile */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-700">⛪ Church Profile</h2>
          <p className="text-xs text-gray-400 mt-0.5">Your church's basic information</p>
        </div>
        <div className="px-6 py-5">
          {church && <ChurchProfileForm church={church} />}
        </div>
      </section>

      {/* Welfare Settings */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-700">🏥 Welfare Settings</h2>
          <p className="text-xs text-gray-400 mt-0.5">Set the monthly welfare contribution amount</p>
        </div>
        <div className="px-6 py-5">
          <WelfareSettingsForm settings={welfareSettings} />
        </div>
      </section>

      {/* Staff Management */}
      {isAdmin && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-700">👥 Staff Management</h2>
            <p className="text-xs text-gray-400 mt-0.5">Add or manage staff accounts</p>
          </div>
          <div className="px-6 py-5">
            <StaffManager users={staffUsers} currentUserId={session.user.id} />
          </div>
        </section>
      )}

      {/* Change Password */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-700">🔒 Change Password</h2>
          <p className="text-xs text-gray-400 mt-0.5">Update your login password</p>
        </div>
        <div className="px-6 py-5">
          <ChangePasswordForm />
        </div>
      </section>
    </div>
  )
}