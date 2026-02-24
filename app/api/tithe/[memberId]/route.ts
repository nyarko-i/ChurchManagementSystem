import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { hasPermission } from "@/lib/permissions"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const { memberId } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasPermission(session.user.role, "viewTithe"))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const month = parseInt(searchParams.get("month") ?? "1")
  const year = parseInt(searchParams.get("year") ?? "2025")

  const churchId = session.user.churchId

  const member = await prisma.member.findFirst({
    where: { id: memberId, churchId },
  })

  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const record = await prisma.titheRecord.findUnique({
    where: {
      churchId_memberId_month_year: {
        churchId,
        memberId,
        month,
        year,
      },
    },
  })

  return NextResponse.json({ member, record })
}
