import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session) redirect("/login")

  const member = await prisma.member.findFirst({
    where: {
      id: id,
      churchId: session.user.churchId,
    },
  })

  if (!member) redirect("/dashboard/members")

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link
            href="/dashboard/members"
            className="text-sm text-blue-600 hover:underline mb-2 inline-block"
          >
            ← Back to Members
          </Link>
          <h2 className="text-2xl font-bold text-gray-800">
            {member.firstName} {member.lastName}
          </h2>
          <p className="text-gray-500 mt-1">Member #{member.memberNumber}</p>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/dashboard/members/${member.id}/edit`}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition"
          >
            Edit Member
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Personal Details */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Details</h3>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Full Name</p>
              <p className="text-sm font-medium text-gray-800">
                {member.firstName} {member.lastName}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Gender</p>
              <p className="text-sm font-medium text-gray-800 capitalize">
                {member.gender ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Phone</p>
              <p className="text-sm font-medium text-gray-800">
                {member.phone ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Email</p>
              <p className="text-sm font-medium text-gray-800">
                {member.email ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Address</p>
              <p className="text-sm font-medium text-gray-800">
                {member.address ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Occupation</p>
              <p className="text-sm font-medium text-gray-800">
                {member.occupation ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Date of Birth</p>
              <p className="text-sm font-medium text-gray-800">
                {member.dateOfBirth
                  ? new Date(member.dateOfBirth).toLocaleDateString()
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Join Date</p>
              <p className="text-sm font-medium text-gray-800">
                {new Date(member.joinDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Status</h3>
            <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
              member.status === "active"
                ? "bg-green-100 text-green-700"
                : member.status === "inactive"
                ? "bg-gray-100 text-gray-500"
                : "bg-red-100 text-red-500"
            }`}>
              {member.status}
            </span>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                  Total Giving
                </p>
                <p className="text-2xl font-bold text-green-600">GHS 0</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                  Attendance Rate
                </p>
                <p className="text-2xl font-bold text-blue-600">0%</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}