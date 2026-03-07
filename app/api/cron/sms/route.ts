/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  sendBirthdaySms,
  sendTitheReminders,
  sendWelfareReminders,
} from "@/actions/sms"

// This route is called daily by Vercel Cron
// Protected by CRON_SECRET environment variable
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = Sunday
  const dayOfMonth = today.getDate()

  // Get all active churches
  const churches = await prisma.church.findMany({
    where: { subscriptionStatus: "active" },
    select: { id: true, name: true },
  })

  const results: Record<string, any> = {}

  for (const church of churches) {
    results[church.id] = { name: church.name }

    // Birthday SMS — runs every day
    const birthday = await sendBirthdaySms(church.id)
    results[church.id].birthday = birthday

    // Tithe reminder — runs every Sunday (dayOfWeek === 0)
    if (dayOfWeek === 0) {
      const tithe = await sendTitheReminders(church.id)
      results[church.id].tithe = tithe
    }

    // Welfare reminder — runs on the 1st of every month
    if (dayOfMonth === 1) {
      const welfare = await sendWelfareReminders(church.id)
      results[church.id].welfare = welfare
    }
  }

  return NextResponse.json({
    success: true,
    date: today.toISOString(),
    results,
  })
}