import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const members = await prisma.member.findMany({
    where: {
      churchId: session.user.churchId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      memberNumber: true,
      status: true,
    },
    orderBy: { firstName: "asc" },
  })

  return NextResponse.json(members)
}