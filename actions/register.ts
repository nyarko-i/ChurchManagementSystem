"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function registerChurch(formData: {
  churchName: string
  churchEmail: string
  churchPhone: string
  adminName: string
  adminEmail: string
  password: string
}) {
  try {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: formData.adminEmail },
    })

    if (existingUser) {
      return { error: "An account with this email already exists" }
    }

    // Create slug from church name
    const slug = formData.churchName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")

    // Hash password
    const passwordHash = await bcrypt.hash(formData.password, 12)

    // Create church and admin user together
    const church = await prisma.church.create({
      data: {
        name: formData.churchName,
        slug: slug,
        email: formData.churchEmail,
        phone: formData.churchPhone,
        users: {
          create: {
            name: formData.adminName,
            email: formData.adminEmail,
            passwordHash: passwordHash,
            role: "super_admin",
          },
        },
      },
    })

    return { success: true, churchId: church.id }
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "Something went wrong. Please try again." }
  }
}
