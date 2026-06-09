// src/app/api/waitlist/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { sendEmail, welcomeEmailHtml, adminNotificationHtml } from '@/lib/email'
import { waitlistLimiter, getClientIP } from '@/lib/rateLimit'

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request)

  // Rate limiting
  try {
    await waitlistLimiter.consume(ip)
  } catch {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  let body: { full_name?: string; email?: string; phone_number?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { full_name, email, phone_number } = body

  // Validation
  if (!full_name || typeof full_name !== 'string' || full_name.trim().length < 2) {
    return NextResponse.json({ error: 'Full name is required (min 2 characters).' }, { status: 400 })
  }

  if (!email || typeof email !== 'string' || !validateEmail(email.trim())) {
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
  }

  if (phone_number && typeof phone_number === 'string' && phone_number.trim().length > 0) {
    const cleaned = phone_number.trim().replace(/[\s\-\(\)]/g, '')
    if (!/^\+?[\d]{7,15}$/.test(cleaned)) {
      return NextResponse.json({ error: 'Invalid phone number format.' }, { status: 400 })
    }
  }

  const db = getDb()

  // Check duplicate
  const existing = db
    .prepare('SELECT id FROM waitlist WHERE email = ?')
    .get(email.trim().toLowerCase())

  if (existing) {
    return NextResponse.json(
      { error: 'This email is already on the waitlist.' },
      { status: 409 }
    )
  }

  // Insert
  const stmt = db.prepare(
    'INSERT INTO waitlist (full_name, email, phone_number, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)'
  )

  const result = stmt.run(
    full_name.trim(),
    email.trim().toLowerCase(),
    phone_number?.trim() || null,
    ip,
    request.headers.get('user-agent') || null
  )

  const entry = {
    full_name: full_name.trim(),
    email: email.trim().toLowerCase(),
    phone_number: phone_number?.trim() || undefined,
    created_at: new Date().toISOString(),
  }

  // Send emails (non-blocking)
  Promise.all([
    sendEmail({
      to: entry.email,
      subject: 'Welcome to HAMON',
      html: welcomeEmailHtml(entry.full_name),
    }),
    process.env.ADMIN_EMAIL
      ? sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: `New HAMON Signup: ${entry.full_name}`,
          html: adminNotificationHtml(entry),
        })
      : Promise.resolve(),
  ]).catch(console.error)

  return NextResponse.json(
    { success: true, id: result.lastInsertRowid },
    { status: 201 }
  )
}

export async function GET(request: NextRequest) {
  // Simple stats endpoint (no auth required — aggregate only)
  const db = getDb()
  const total = (db.prepare('SELECT COUNT(*) as count FROM waitlist').get() as { count: number }).count
  return NextResponse.json({ total })
}
