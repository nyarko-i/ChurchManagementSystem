import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const member = await prisma.member.findFirst({
    where: {
      id: params.id,
      churchId: session.user.churchId,
    },
  })

  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json(member)
}