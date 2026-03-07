"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { sendSms, sendBulkSms } from "@/lib/arkesel"
import { revalidatePath } from "next/cache"

// ── GET SMS LOGS ──────────────────────────────────────────
export async function getSmsLogs(type?: string) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")
  const churchId = session.user.churchId

  return prisma.smsLog.findMany({
    where: {
      churchId,
      ...(type ? { type } : {}),
    },
    orderBy: { sentAt: "desc" },
    take: 100,
  })
}

// ── SEND BULK SMS ─────────────────────────────────────────
export async function sendBulkSmsAction(message: string, memberIds?: string[]) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")
  const churchId = session.user.churchId

  const members = await prisma.member.findMany({
    where: {
      churchId,
      status: "active",
      phone: { not: null },
      ...(memberIds && memberIds.length > 0 ? { id: { in: memberIds } } : {}),
    },
    select: { id: true, firstName: true, lastName: true, phone: true },
  })

  if (members.length === 0) {
    return { success: false, message: "No members with phone numbers found" }
  }

  const recipients = members.map((m) => ({
    phone: m.phone!,
    name: `${m.firstName} ${m.lastName}`,
  }))

  const result = await sendBulkSms(recipients, message)

  await prisma.smsLog.createMany({
    data: members.map((m) => ({
      churchId,
      recipientPhone: m.phone!,
      recipientName: `${m.firstName} ${m.lastName}`,
      message,
      type: "bulk",
      status: result.sent > 0 ? "sent" : "failed",
      provider: "arkesel",
    })),
  })

  revalidatePath("/dashboard/sms")
  return {
    success: result.sent > 0,
    message: `Sent to ${result.sent} members. Failed: ${result.failed}`,
  }
}

// ── SEND BIRTHDAY SMS (called by cron) ───────────────────
export async function sendBirthdaySms(churchId: string) {
  const today = new Date()
  const todayMonth = today.getMonth() + 1
  const todayDay = today.getDate()

  const members = await prisma.member.findMany({
    where: {
      churchId,
      status: "active",
      phone: { not: null },
      dateOfBirth: { not: null },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      dateOfBirth: true,
    },
  })

  const birthdayMembers = members.filter((m) => {
    const dob = new Date(m.dateOfBirth!)
    return dob.getMonth() + 1 === todayMonth && dob.getDate() === todayDay
  })

  const church = await prisma.church.findUnique({
    where: { id: churchId },
    select: { name: true },
  })

  let sent = 0
  let failed = 0

  for (const member of birthdayMembers) {
    const message = `Happy Birthday ${member.firstName}! 🎂 Wishing you God's abundant blessings on your special day. — ${church?.name ?? "Your Church"}`

    const result = await sendSms(member.phone!, message)

    await prisma.smsLog.create({
      data: {
        churchId,
        recipientPhone: member.phone!,
        recipientName: `${member.firstName} ${member.lastName}`,
        message,
        type: "birthday",
        status: result.success ? "sent" : "failed",
        provider: "arkesel",
      },
    })

    if (result.success) sent++
    else failed++
  }

  return { sent, failed, total: birthdayMembers.length }
}

// ── SEND TITHE REMINDERS (called by cron) ────────────────
export async function sendTitheReminders(churchId: string) {
  const today = new Date()
  const month = today.getMonth() + 1
  const year = today.getFullYear()

  const members = await prisma.member.findMany({
    where: {
      churchId,
      status: "active",
      phone: { not: null },
    },
    select: { id: true, firstName: true, lastName: true, phone: true },
  })

  const paidTithe = await prisma.titheRecord.findMany({
    where: { churchId, month, year },
    select: { memberId: true },
  })

  const paidIds = new Set(paidTithe.map((t) => t.memberId))
  const unpaidMembers = members.filter((m) => !paidIds.has(m.id))

  const church = await prisma.church.findUnique({
    where: { id: churchId },
    select: { name: true },
  })

  let sent = 0
  let failed = 0

  for (const member of unpaidMembers) {
    const message = `Dear ${member.firstName}, this is a reminder to submit your tithe for ${today.toLocaleString("default", { month: "long" })} ${year}. God bless you. — ${church?.name ?? "Your Church"}`

    const result = await sendSms(member.phone!, message)

    await prisma.smsLog.create({
      data: {
        churchId,
        recipientPhone: member.phone!,
        recipientName: `${member.firstName} ${member.lastName}`,
        message,
        type: "tithe_reminder",
        status: result.success ? "sent" : "failed",
        provider: "arkesel",
      },
    })

    if (result.success) sent++
    else failed++
  }

  return { sent, failed, total: unpaidMembers.length }
}

// ── SEND WELFARE REMINDERS (called by cron) ──────────────
export async function sendWelfareReminders(churchId: string) {
  const today = new Date()
  const month = today.getMonth() + 1
  const year = today.getFullYear()

  const outstanding = await prisma.welfareContribution.findMany({
    where: {
      churchId,
      month,
      year,
      isSigned: false,
    },
    include: {
      member: {
        select: { id: true, firstName: true, lastName: true, phone: true },
      },
    },
  })

  const church = await prisma.church.findUnique({
    where: { id: churchId },
    select: { name: true },
  })

  let sent = 0
  let failed = 0

  for (const contrib of outstanding) {
    if (!contrib.member.phone) continue

    const remaining = contrib.requiredAmount - contrib.totalPaid
    if (remaining <= 0) continue

    const message = `Dear ${contrib.member.firstName}, your welfare contribution for ${today.toLocaleString("default", { month: "long" })} has an outstanding balance of GHS ${remaining.toFixed(2)}. Please settle at your earliest convenience. — ${church?.name ?? "Your Church"}`

    const result = await sendSms(contrib.member.phone, message)

    await prisma.smsLog.create({
      data: {
        churchId,
        recipientPhone: contrib.member.phone,
        recipientName: `${contrib.member.firstName} ${contrib.member.lastName}`,
        message,
        type: "welfare_reminder",
        status: result.success ? "sent" : "failed",
        provider: "arkesel",
      },
    })

    if (result.success) sent++
    else failed++
  }

  return { sent, failed, total: outstanding.length }
}