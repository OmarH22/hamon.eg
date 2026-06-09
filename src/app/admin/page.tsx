'use client'
// src/app/admin/page.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()

      if (res.ok) {
        router.push('/admin/dashboard')
      } else {
        setError(data.error || 'Invalid credentials.')
      }
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 40px, #fff 40px, #fff 41px),
            repeating-linear-gradient(90deg, transparent, transparent 40px, #fff 40px, #fff 41px)
          `,
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-light tracking-[0.3em] text-[#F7F7F5] mb-2">HAMON</h1>
          <p className="font-body text-[9px] tracking-[0.3em] uppercase text-[#888]">Admin Portal</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="border border-[#2B2B2B]">
          <div className="border-b border-[#2B2B2B]">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              disabled={loading}
              className="w-full bg-transparent px-6 py-4 font-body text-sm text-[#F7F7F5] placeholder-[#444] focus:outline-none focus:bg-[#111] transition-colors"
            />
          </div>
          <div className="border-b border-[#2B2B2B]">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full bg-transparent px-6 py-4 font-body text-sm text-[#F7F7F5] placeholder-[#444] focus:outline-none focus:bg-[#111] transition-colors"
            />
          </div>

          {error && (
            <div className="px-6 py-3 border-b border-[#2B2B2B] bg-red-950/20">
              <p className="font-body text-xs text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F7F7F5] text-[#0A0A0A] py-4 font-body text-xs tracking-[0.25em] uppercase hover:bg-white transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Access Dashboard'}
          </button>
        </form>

        <p className="text-center mt-6 font-body text-[9px] text-[#444] tracking-[0.1em]">
          Default: admin / hamon_admin_2024 — Change in .env
        </p>
      </div>
    </div>
  )
}
