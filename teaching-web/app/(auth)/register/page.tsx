'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  GraduationCap,
  User,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  Target,
} from 'lucide-react'
import Link from 'next/link'

const LEVELS = [
  { value: 'NONE', label: 'Mới bắt đầu, gần như không biết tiếng Anh' },
  { value: 'A1', label: 'A1 — Biết bảng chữ + chào hỏi cơ bản' },
  { value: 'A2', label: 'A2 — Hiểu câu đơn giản hàng ngày' },
  { value: 'B1', label: 'B1 — Giao tiếp được chủ đề quen thuộc' },
  { value: 'B2', label: 'B2 — Đọc/nghe trung cấp, viết đoạn văn' },
  { value: 'C1_PLUS', label: 'C1+ — Sử dụng linh hoạt, gần thi IELTS 6.5+' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selfLevel, setSelfLevel] = useState('NONE')
  const [year1Goal, setYear1Goal] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, selfLevel, year1Goal }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Đăng ký thất bại')
      setLoading(false)
      return
    }

    // Auto sign in
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    if (result?.error) {
      setError('Đăng ký thành công nhưng không đăng nhập được. Hãy thử /login.')
      setLoading(false)
      return
    }
    router.push('/onboarding/entry-test')
  }

  return (
    <div className="min-h-screen bg-[#080B1A] flex items-center justify-center px-6 py-10">
      <div className="absolute inset-0 hero-grid opacity-30" />
      <div className="absolute inset-0 hero-glow opacity-50" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
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
            Đăng ký học viên
          </h1>
          <p className="text-sm text-white/40">
            AI sẽ tạo bài test đầu vào dựa trên trình độ bạn chọn
          </p>
        </div>

        <div className="glass-card rounded-2xl p-7 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Họ tên đầy đủ" icon={User}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
            </Field>

            <Field label="Email" icon={Mail}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
            </Field>

            <Field label="Mật khẩu (ít nhất 6 ký tự)" icon={Lock}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </Field>

            <div>
              <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
                Trình độ hiện tại
              </label>
              <select
                value={selfLevel}
                onChange={(e) => setSelfLevel(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-3 text-sm text-white focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all"
              >
                {LEVELS.map((l) => (
                  <option key={l.value} value={l.value} className="bg-[#080B1A]">
                    {l.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-white/40 mt-2">
                AI sẽ tạo bài test 10-15 câu phù hợp trình độ này. Đừng lo nếu chọn sai —
                kết quả test mới là điểm xếp lộ trình.
              </p>
            </div>

            <Field label="Mục tiêu năm 1 (không bắt buộc)" icon={Target}>
              <input
                type="text"
                value={year1Goal}
                onChange={(e) => setYear1Goal(e.target.value)}
                placeholder="VD: Nắm chắc nền tảng, giao tiếp tự tin"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
            </Field>

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
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Đang tạo tài khoản...
                </>
              ) : (
                <>
                  Đăng ký + Làm bài test <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-white/40 mt-6">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium">
            Đăng nhập
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string
  icon: typeof User
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
        {children}
      </div>
    </div>
  )
}
