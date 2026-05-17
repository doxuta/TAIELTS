'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { GraduationCap, Mail, ArrowRight, Loader2, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Lỗi không xác định')
      return
    }
    setDone(true)
  }

  return (
    <div className="min-h-screen bg-[#080B1A] flex items-center justify-center px-6">
      <div className="absolute inset-0 hero-grid opacity-30" />
      <div className="absolute inset-0 hero-glow opacity-50" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-glow">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-semibold text-xl text-white tracking-tight">
              TAIELTS
            </span>
          </Link>
          <h1 className="text-2xl font-display font-bold text-white mb-2">
            Quên mật khẩu
          </h1>
          <p className="text-sm text-white/40">
            Nhập email, chúng tôi gửi link đặt lại mật khẩu
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          {done ? (
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <Mail className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-sm text-white">
                Nếu email <strong>{email}</strong> tồn tại trong hệ thống,
                link đặt lại đã được gửi. Hết hạn sau 1 giờ.
              </p>
              <p className="text-xs text-white/40">
                (Dev mode: kiểm tra console log của server để lấy link.)
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-sm font-medium shadow-glow disabled:opacity-50"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Đang gửi...</>
                ) : (
                  <>Gửi link đặt lại <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-white/40 mt-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-brand-400 hover:text-brand-300 font-medium"
          >
            <ArrowLeft className="w-3 h-3" /> Quay lại đăng nhập
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
