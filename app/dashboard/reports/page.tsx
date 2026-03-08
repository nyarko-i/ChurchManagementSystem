import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import ReportsClient from "@/components/reports/ReportsClient"

export default async function ReportsPage() {
  const session = await auth()
  if (!session) return null
  const churchId = session.user.churchId

  const church = await prisma.church.findUnique({
    where: { id: churchId },
    select: { name: true, email: true, phone: true, address: true },
  })

  return <ReportsClient church={church!} />
}