import { getAdminProfile } from "@/actions/admin-account"
import AdminChangePassword from "@/components/admin/AdminChangePassword"

export default async function AdminAccountPage() {
  const profile = await getAdminProfile()

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">My Account</h1>
        <p className="text-gray-400 mt-1 text-sm">Manage your super admin credentials</p>
      </div>

      {/* Profile Info */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="font-bold text-white mb-4">Profile</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Name", value: profile?.name },
            { label: "Email", value: profile?.email },
            { label: "Account Created", value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-GB") : "—" },
            { label: "Last Login", value: profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString("en-GB") : "—" },
          ].map((f) => (
            <div key={f.label} className="bg-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">{f.label}</p>
              <p className="text-sm font-medium text-white">{f.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-yellow-950 border border-yellow-800 rounded-lg">
          <p className="text-xs text-yellow-400">
            🔒 This account has full access to all ChurchCore churches and data. Keep your credentials secure and never share them.
          </p>
        </div>
      </div>

      {/* Change Password */}
      <AdminChangePassword />
    </div>
  )
}