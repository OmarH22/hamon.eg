'use client'
// src/app/admin/dashboard/page.tsx
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'

interface Lead {
  id: number
  full_name: string
  email: string
  phone_number: string | null
  created_at: string
}

interface Stats {
  total: number
  today: number
  week: number
  month: number
}

interface ChartPoint {
  date: string
  count: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [chart, setChart] = useState<ChartPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalLeads, setTotalLeads] = useState(0)
  const [activeTab, setActiveTab] = useState<'overview' | 'leads' | 'analytics'>('overview')
  const [chartView, setChartView] = useState<'area' | 'bar'>('area')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search,
        from: dateFrom,
        to: dateTo,
        page: String(currentPage),
        limit: '20',
      })
      const res = await fetch(`/api/admin/leads?${params}`)
      if (res.status === 401) {
        router.push('/admin')
        return
      }
      const data = await res.json()
      setLeads(data.leads || [])
      setStats(data.stats)
      setChart(data.chart || [])
      setTotalPages(data.pagination?.pages || 1)
      setTotalLeads(data.pagination?.total || 0)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [search, dateFrom, dateTo, currentPage, router])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' })
    router.push('/admin')
  }

  const handleExport = (format: 'csv' | 'xlsx') => {
    window.open(`/api/admin/export?format=${format}`, '_blank')
  }

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const conversionRate = stats ? ((stats.total / Math.max(stats.total * 12, 1)) * 100).toFixed(1) : '—'

  const statCards = stats
    ? [
        { label: 'Total Signups', value: stats.total, sub: 'All time' },
        { label: "Today's Signups", value: stats.today, sub: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }) },
        { label: 'This Week', value: stats.week, sub: 'Last 7 days' },
        { label: 'This Month', value: stats.month, sub: 'Last 30 days' },
      ]
    : []

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F7F7F5] flex">
      {/* Sidebar */}
      <aside className="w-56 border-r border-[#1f1f1f] flex flex-col flex-shrink-0">
        <div className="h-16 border-b border-[#1f1f1f] flex items-center px-6">
          <h1 className="font-display text-xl font-light tracking-[0.2em]">HAMON</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {(['overview', 'leads', 'analytics'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-4 py-3 font-body text-[10px] tracking-[0.2em] uppercase transition-colors rounded-sm ${
                activeTab === tab
                  ? 'bg-[#F7F7F5] text-[#0A0A0A]'
                  : 'text-[#888] hover:text-[#F7F7F5] hover:bg-[#1a1a1a]'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-[#1f1f1f]">
          <a
            href="/"
            target="_blank"
            className="block w-full text-center px-4 py-2.5 font-body text-[9px] tracking-[0.2em] uppercase text-[#888] border border-[#2B2B2B] hover:border-[#888] hover:text-[#F7F7F5] transition-colors mb-2"
          >
            View Site
          </a>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 font-body text-[9px] tracking-[0.2em] uppercase text-[#666] hover:text-red-400 transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Top bar */}
        <header className="h-16 border-b border-[#1f1f1f] flex items-center justify-between px-8 flex-shrink-0">
          <div>
            <h2 className="font-body text-sm font-light capitalize tracking-[0.05em]">{activeTab}</h2>
            <p className="font-body text-[9px] text-[#888]">
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleExport('csv')}
              className="px-4 py-2 font-body text-[9px] tracking-[0.2em] uppercase border border-[#2B2B2B] text-[#888] hover:border-[#888] hover:text-[#F7F7F5] transition-colors"
            >
              Export CSV
            </button>
            <button
              onClick={() => handleExport('xlsx')}
              className="px-4 py-2 font-body text-[9px] tracking-[0.2em] uppercase border border-[#2B2B2B] text-[#888] hover:border-[#888] hover:text-[#F7F7F5] transition-colors"
            >
              Export Excel
            </button>
            <button
              onClick={fetchData}
              className="px-4 py-2 font-body text-[9px] tracking-[0.2em] uppercase bg-[#F7F7F5] text-[#0A0A0A] hover:bg-white transition-colors"
            >
              Refresh
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto admin-scroll p-8">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="border border-[#1f1f1f] p-6 shimmer h-28 rounded-sm" />
                    ))
                  : statCards.map((s, i) => (
                      <div key={s.label} className="border border-[#1f1f1f] p-6 hover:border-[#333] transition-colors">
                        <p className="font-body text-[9px] tracking-[0.2em] uppercase text-[#888] mb-3">{s.label}</p>
                        <p className="font-display text-4xl font-light text-[#F7F7F5]">{s.value}</p>
                        <p className="font-body text-[9px] text-[#555] mt-1">{s.sub}</p>
                      </div>
                    ))}
              </div>

              {/* Conversion rate card */}
              <div className="border border-[#1f1f1f] p-6">
                <p className="font-body text-[9px] tracking-[0.2em] uppercase text-[#888] mb-2">Market Validation</p>
                <div className="flex items-end gap-6">
                  <div>
                    <p className="font-display text-5xl font-light text-[#C0C0C0]">{stats?.total || 0}</p>
                    <p className="font-body text-xs text-[#888] mt-1">Total waitlist members — proof of demand</p>
                  </div>
                  <div className="flex-1 h-1 bg-[#1f1f1f] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#C0C0C0] to-[#888] transition-all duration-1000"
                      style={{ width: `${Math.min((stats?.total || 0) / 5, 100)}%` }}
                    />
                  </div>
                  <div className="text-right">
                    <p className="font-display text-2xl font-light text-[#888]">500</p>
                    <p className="font-body text-[9px] text-[#555]">Goal</p>
                  </div>
                </div>
              </div>

              {/* Mini chart */}
              <div className="border border-[#1f1f1f] p-6">
                <p className="font-body text-[9px] tracking-[0.2em] uppercase text-[#888] mb-6">Recent Activity</p>
                {chart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={chart}>
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C0C0C0" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#C0C0C0" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#555', fontFamily: 'var(--font-outfit)' }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: '#555', fontFamily: 'var(--font-outfit)' }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 0, fontFamily: 'var(--font-outfit)', fontSize: 11 }}
                        labelStyle={{ color: '#888' }}
                        itemStyle={{ color: '#F7F7F5' }}
                      />
                      <Area type="monotone" dataKey="count" stroke="#C0C0C0" strokeWidth={1.5} fill="url(#chartGrad)" name="Signups" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-40 flex items-center justify-center">
                    <p className="font-body text-xs text-[#555]">No chart data yet — signups will appear here</p>
                  </div>
                )}
              </div>

              {/* Recent signups */}
              <div className="border border-[#1f1f1f]">
                <div className="p-6 border-b border-[#1f1f1f]">
                  <p className="font-body text-[9px] tracking-[0.2em] uppercase text-[#888]">Recent Signups</p>
                </div>
                {leads.slice(0, 5).map((lead, i) => (
                  <div key={lead.id} className={`flex items-center gap-6 px-6 py-4 ${i < 4 ? 'border-b border-[#1f1f1f]' : ''} hover:bg-[#111] transition-colors`}>
                    <div className="w-8 h-8 bg-[#1f1f1f] flex items-center justify-center flex-shrink-0">
                      <span className="font-display text-sm font-light text-[#888]">{lead.full_name[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm text-[#F7F7F5] truncate">{lead.full_name}</p>
                      <p className="font-body text-xs text-[#555] truncate">{lead.email}</p>
                    </div>
                    <p className="font-body text-[10px] text-[#555] flex-shrink-0">{formatDate(lead.created_at)}</p>
                  </div>
                ))}
                {leads.length === 0 && !loading && (
                  <div className="p-12 text-center">
                    <p className="font-body text-xs text-[#555]">No signups yet. Share your landing page to start collecting leads.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* LEADS TAB */}
          {activeTab === 'leads' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-wrap gap-3 border border-[#1f1f1f] p-4">
                <input
                  type="text"
                  placeholder="Search name, email, phone..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
                  className="flex-1 min-w-[200px] bg-transparent border border-[#2B2B2B] px-4 py-2.5 font-body text-xs text-[#F7F7F5] placeholder-[#555] focus:outline-none focus:border-[#888]"
                />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => { setDateFrom(e.target.value); setCurrentPage(1) }}
                  className="bg-transparent border border-[#2B2B2B] px-4 py-2.5 font-body text-xs text-[#888] focus:outline-none focus:border-[#888] [color-scheme:dark]"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={e => { setDateTo(e.target.value); setCurrentPage(1) }}
                  className="bg-transparent border border-[#2B2B2B] px-4 py-2.5 font-body text-xs text-[#888] focus:outline-none focus:border-[#888] [color-scheme:dark]"
                />
                <button
                  onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); setCurrentPage(1) }}
                  className="px-4 py-2.5 font-body text-[9px] tracking-[0.2em] uppercase text-[#888] border border-[#2B2B2B] hover:text-[#F7F7F5] transition-colors"
                >
                  Clear
                </button>
              </div>

              {/* Table */}
              <div className="border border-[#1f1f1f] overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1f1f1f]">
                      {['#', 'Name', 'Email', 'Phone', 'Date Joined'].map(h => (
                        <th key={h} className="text-left px-6 py-4 font-body text-[9px] tracking-[0.2em] uppercase text-[#555]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading
                      ? Array.from({ length: 8 }).map((_, i) => (
                          <tr key={i} className="border-b border-[#1f1f1f]">
                            {Array.from({ length: 5 }).map((_, j) => (
                              <td key={j} className="px-6 py-4">
                                <div className="h-3 shimmer rounded" style={{ width: `${[30, 80, 120, 60, 90][j]}px` }} />
                              </td>
                            ))}
                          </tr>
                        ))
                      : leads.map((lead, i) => (
                          <tr key={lead.id} className="border-b border-[#1f1f1f] hover:bg-[#111] transition-colors">
                            <td className="px-6 py-4 font-body text-xs text-[#555] tabular-nums">{(currentPage - 1) * 20 + i + 1}</td>
                            <td className="px-6 py-4 font-body text-sm text-[#F7F7F5]">{lead.full_name}</td>
                            <td className="px-6 py-4 font-body text-xs text-[#888]">{lead.email}</td>
                            <td className="px-6 py-4 font-body text-xs text-[#888]">{lead.phone_number || '—'}</td>
                            <td className="px-6 py-4 font-body text-[10px] text-[#555]">{formatDate(lead.created_at)}</td>
                          </tr>
                        ))}
                  </tbody>
                </table>
                {leads.length === 0 && !loading && (
                  <div className="p-16 text-center">
                    <p className="font-body text-xs text-[#555]">No leads found matching your filters.</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="font-body text-[9px] text-[#555]">
                    Showing {(currentPage - 1) * 20 + 1}–{Math.min(currentPage * 20, totalLeads)} of {totalLeads}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 font-body text-[9px] uppercase tracking-[0.2em] border border-[#2B2B2B] text-[#888] disabled:opacity-30 hover:text-[#F7F7F5] transition-colors"
                    >
                      Prev
                    </button>
                    <span className="px-4 py-2 font-body text-[9px] text-[#888] border border-[#2B2B2B]">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 font-body text-[9px] uppercase tracking-[0.2em] border border-[#2B2B2B] text-[#888] disabled:opacity-30 hover:text-[#F7F7F5] transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setChartView('area')}
                  className={`px-4 py-2 font-body text-[9px] uppercase tracking-[0.2em] border transition-colors ${chartView === 'area' ? 'border-[#F7F7F5] text-[#F7F7F5]' : 'border-[#2B2B2B] text-[#888] hover:text-[#F7F7F5]'}`}
                >
                  Area
                </button>
                <button
                  onClick={() => setChartView('bar')}
                  className={`px-4 py-2 font-body text-[9px] uppercase tracking-[0.2em] border transition-colors ${chartView === 'bar' ? 'border-[#F7F7F5] text-[#F7F7F5]' : 'border-[#2B2B2B] text-[#888] hover:text-[#F7F7F5]'}`}
                >
                  Bar
                </button>
              </div>

              {/* Daily chart */}
              <div className="border border-[#1f1f1f] p-6">
                <p className="font-body text-[9px] tracking-[0.2em] uppercase text-[#888] mb-6">Daily Signups — Last 30 Days</p>
                {chart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    {chartView === 'area' ? (
                      <AreaChart data={chart}>
                        <defs>
                          <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#C0C0C0" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#C0C0C0" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#555', fontFamily: 'var(--font-outfit)' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: '#555', fontFamily: 'var(--font-outfit)' }} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 0, fontFamily: 'var(--font-outfit)', fontSize: 11 }}
                          labelStyle={{ color: '#888' }}
                          itemStyle={{ color: '#F7F7F5' }}
                        />
                        <Area type="monotone" dataKey="count" stroke="#C0C0C0" strokeWidth={1.5} fill="url(#aGrad)" name="Signups" />
                      </AreaChart>
                    ) : (
                      <BarChart data={chart}>
                        <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#555', fontFamily: 'var(--font-outfit)' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: '#555', fontFamily: 'var(--font-outfit)' }} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 0, fontFamily: 'var(--font-outfit)', fontSize: 11 }}
                          labelStyle={{ color: '#888' }}
                          itemStyle={{ color: '#F7F7F5' }}
                        />
                        <Bar dataKey="count" fill="#3a3a3a" stroke="#C0C0C0" strokeWidth={1} name="Signups" />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                ) : (
                  <div className="h-60 flex items-center justify-center">
                    <p className="font-body text-xs text-[#555]">No data yet. Chart will populate as leads come in.</p>
                  </div>
                )}
              </div>

              {/* Summary stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(s => (
                  <div key={s.label} className="border border-[#1f1f1f] p-6">
                    <p className="font-body text-[9px] tracking-[0.2em] uppercase text-[#888] mb-2">{s.label}</p>
                    <p className="font-display text-3xl font-light">{s.value}</p>
                    <p className="font-body text-[9px] text-[#555] mt-1">{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Growth indicators */}
              {stats && chart.length >= 2 && (
                <div className="border border-[#1f1f1f] p-6">
                  <p className="font-body text-[9px] tracking-[0.2em] uppercase text-[#888] mb-6">Trend</p>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="font-body text-xs text-[#888] mb-1">Peak Day</p>
                      <p className="font-display text-2xl font-light">
                        {Math.max(...chart.map(d => d.count))}
                      </p>
                      <p className="font-body text-[9px] text-[#555]">signups in a single day</p>
                    </div>
                    <div className="w-px h-12 bg-[#2B2B2B]" />
                    <div>
                      <p className="font-body text-xs text-[#888] mb-1">Avg / Day</p>
                      <p className="font-display text-2xl font-light">
                        {(chart.reduce((a, b) => a + b.count, 0) / chart.length).toFixed(1)}
                      </p>
                      <p className="font-body text-[9px] text-[#555]">average daily signups</p>
                    </div>
                    <div className="w-px h-12 bg-[#2B2B2B]" />
                    <div>
                      <p className="font-body text-xs text-[#888] mb-1">Active Days</p>
                      <p className="font-display text-2xl font-light">
                        {chart.filter(d => d.count > 0).length}
                      </p>
                      <p className="font-body text-[9px] text-[#555]">days with signups</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
