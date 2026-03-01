import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const member = await prisma.member.findFirst({
    where: {
      id,
      churchId: session.user.churchId,
    },
  })

  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json(member)
}