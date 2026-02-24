import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function MembersPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const members = await prisma.member.findMany({
    where: { churchId: session.user.churchId },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Members</h2>
          <p className="text-gray-500 mt-1">{members.length} total members</p>
        </div>
        <Link
          href="/dashboard/members/new"
          className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition"
        >
          + Add Member
        </Link>
      </div>

      {/* Members Table */}
      {members.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <p className="text-4xl mb-4">👥</p>
          <p className="text-gray-500">No members yet. Add your first member!</p>
          <Link
            href="/dashboard/members/new"
            className="inline-block mt-4 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition"
          >
            + Add Member
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Member No.</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Name</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Phone</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Status</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-500">{member.memberNumber}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">
                    <Link
                        href={`/dashboard/members/${member.id}`}
                        className="hover:text-blue-700 hover:underline"
                    >
                        {member.firstName} {member.lastName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{member.phone ?? "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      member.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(member.joinDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}