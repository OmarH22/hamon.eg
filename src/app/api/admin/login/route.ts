// src/app/api/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDb } from '@/lib/db'
import { signToken, COOKIE_NAME } from '@/lib/auth'
import { loginLimiter, getClientIP } from '@/lib/rateLimit'
import type { AdminUser } from '@/lib/db'

export async function POST(request: NextRequest) {
  const ip = getClientIP(request)

  try {
    await loginLimiter.consume(ip)
  } catch {
    return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 })
  }

  const { username, password } = await request.json()

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password required.' }, { status: 400 })
  }

  const db = getDb()

  // Ensure default admin exists
  const adminUsername = process.env.ADMIN_USERNAME || 'admin'
  const adminPassword = process.env.ADMIN_PASSWORD || 'hamon_admin_2024'
  const existing = db.prepare('SELECT id FROM admin_users WHERE username = ?').get(adminUsername)
  if (!existing) {
    const hash = bcrypt.hashSync(adminPassword, 12)
    db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run(adminUsername, hash)
  }

  const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username) as AdminUser | undefined

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 })
  }

  const token = await signToken({ username: user.username, id: user.id })

  const response = NextResponse.json({ success: true })
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return response
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete(COOKIE_NAME)
  return response
}
