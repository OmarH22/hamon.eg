// src/app/api/admin/leads/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb, WaitlistEntry } from '@/lib/db'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getDb()
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const from = searchParams.get('from') || ''
  const to = searchParams.get('to') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = (page - 1) * limit

  let query = 'SELECT * FROM waitlist WHERE 1=1'
  const params: (string | number)[] = []

  if (search) {
    query += ' AND (full_name LIKE ? OR email LIKE ? OR phone_number LIKE ?)'
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }
  if (from) {
    query += ' AND date(created_at) >= date(?)'
    params.push(from)
  }
  if (to) {
    query += ' AND date(created_at) <= date(?)'
    params.push(to)
  }

  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count')
  const { count } = db.prepare(countQuery).get(...params) as { count: number }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  params.push(limit, offset)

  const leads = db.prepare(query).all(...params) as WaitlistEntry[]

  // Stats
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const todayCount = (db.prepare(`SELECT COUNT(*) as count FROM waitlist WHERE date(created_at) = date(?)`).get(todayStr) as { count: number }).count
  const weekCount = (db.prepare(`SELECT COUNT(*) as count FROM waitlist WHERE date(created_at) >= date(?)`).get(weekAgo) as { count: number }).count
  const monthCount = (db.prepare(`SELECT COUNT(*) as count FROM waitlist WHERE date(created_at) >= date(?)`).get(monthAgo) as { count: number }).count
  const totalCount = (db.prepare(`SELECT COUNT(*) as count FROM waitlist`).get() as { count: number }).count

  // Daily chart data (last 30 days)
  const dailyData = db.prepare(`
    SELECT date(created_at) as date, COUNT(*) as count
    FROM waitlist
    WHERE date(created_at) >= date(?)
    GROUP BY date(created_at)
    ORDER BY date ASC
  `).all(monthAgo) as { date: string; count: number }[]

  return NextResponse.json({
    leads,
    pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
    stats: {
      total: totalCount,
      today: todayCount,
      week: weekCount,
      month: monthCount,
    },
    chart: dailyData,
  })
}
