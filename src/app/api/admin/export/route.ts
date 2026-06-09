// src/app/api/admin/export/route.ts
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
  const format = searchParams.get('format') || 'csv'

  const leads = db.prepare('SELECT id, full_name, email, phone_number, created_at FROM waitlist ORDER BY created_at DESC').all() as WaitlistEntry[]

  if (format === 'csv') {
    const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Date Joined']
    const rows = leads.map(l => [
      l.id,
      `"${l.full_name.replace(/"/g, '""')}"`,
      l.email,
      l.phone_number || '',
      l.created_at,
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="hamon-waitlist-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  }

  if (format === 'xlsx') {
    const XLSX = await import('xlsx')
    const ws = XLSX.utils.json_to_sheet(
      leads.map(l => ({
        ID: l.id,
        'Full Name': l.full_name,
        Email: l.email,
        Phone: l.phone_number || '',
        'Date Joined': l.created_at,
      }))
    )
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Waitlist')
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="hamon-waitlist-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    })
  }

  return NextResponse.json({ error: 'Invalid format. Use csv or xlsx.' }, { status: 400 })
}
