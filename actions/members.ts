/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function addMember(formData: {
  firstName: string
  lastName: string
  phone: string
  email: string
  gender: string
  address: string
  occupation: string
}) {
  const session = await auth()
  if (!session) return { error: "Unauthorized" }

  const churchId = session.user.churchId

  // Generate member number
  const count = await prisma.member.count({ where: { churchId } })
  const memberNumber = `MEM${String(count + 1).padStart(4, "0")}`

  try {
    await prisma.member.create({
      data: {
        churchId,
        memberNumber,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || null,
        email: formData.email || null,
        gender: (formData.gender as any) || null,
        address: formData.address || null,
        occupation: formData.occupation || null,
      },
    })

    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to add member" }
  }
}

export async function updateMember(
  id: string,
  formData: {
    firstName: string
    lastName: string
    phone: string
    email: string
    gender: string
    address: string
    occupation: string
    status: string
  }
) {
  const session = await auth()
  if (!session) return { error: "Unauthorized" }

  try {
    await prisma.member.update({
      where: {
        id,
        churchId: session.user.churchId,
      },
      data: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || null,
        email: formData.email || null,
        gender: (formData.gender as any) || null,
        address: formData.address || null,
        occupation: formData.occupation || null,
        status: formData.status as any,
      },
    })

    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to update member" }
  }
}