"use server"

// ADD THIS FUNCTION TO YOUR EXISTING actions/members.ts file

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function updateMember(
  memberId: string,
  data: {
    firstName: string
    lastName: string
    phone: string | null
    email: string | null
    gender: "male" | "female" | null
    dateOfBirth: Date | null
    address: string | null
    occupation: string | null
    status: "active" | "inactive" | "deceased"
  }
) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")
  const churchId = session.user.churchId

  // Make sure member belongs to this church
  const member = await prisma.member.findFirst({
    where: { id: memberId, churchId },
  })

  if (!member) {
    return { success: false, message: "Member not found" }
  }

  await prisma.member.update({
    where: { id: memberId },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email,
      gender: data.gender,
      dateOfBirth: data.dateOfBirth,
      address: data.address,
      occupation: data.occupation,
      status: data.status,
    },
  })

  revalidatePath(`/dashboard/members/${memberId}`)
  revalidatePath("/dashboard/members")

  return { success: true, message: "Member updated successfully" }
}