'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, UserPlus } from 'lucide-react'

export default function NewStudentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    occupation: 'Sinh viên',
    slackChannel: '',
    year1Goal: '',
    targetBand: '',
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Có lỗi xảy ra')
      return
    }

    router.push('/teacher/students')
    router.refresh()
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="animate-fade-up mb-8">
        <Link href="/teacher/students" className="inline-flex items-center gap-2 text-sm text-ink-secondary hover:text-ink mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </Link>
        <h1 className="page-title">Thêm học viên mới</h1>
        <p className="page-subtitle">Tài khoản sẽ được tạo với mật khẩu mặc định <code className="text-xs bg-surface-tertiary px-1.5 py-0.5 rounded font-mono">ielts2026</code></p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 animate-fade-up stagger-1">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
        )}

        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-ink-secondary uppercase tracking-wider">Thông tin cơ bản</h2>

          <div>
            <label className="label">Họ tên đầy đủ *</label>
            <input className="input" value={form.fullName} onChange={set('fullName')} required placeholder="Nguyễn Thị Huyền Trang" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Email đăng nhập *</label>
              <input className="input" type="email" value={form.email} onChange={set('email')} required placeholder="huyentrang@gmail.com" />
            </div>
            <div>
              <label className="label">Số điện thoại</label>
              <input className="input" type="tel" value={form.phone} onChange={set('phone')} placeholder="0912 345 678" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Ngày sinh</label>
              <input className="input" type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} />
            </div>
            <div>
              <label className="label">Nghề nghiệp / Tình trạng</label>
              <select className="input" value={form.occupation} onChange={set('occupation')}>
                <option>Sinh viên</option>
                <option>Sinh viên Luật</option>
                <option>Đi làm</option>
                <option>Học sinh THPT</option>
                <option>Khác</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Slack channel / username</label>
            <input className="input" value={form.slackChannel} onChange={set('slackChannel')} placeholder="@huyentrang hoặc #ht-ielts" />
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-ink-secondary uppercase tracking-wider">Mục tiêu học</h2>

          <div>
            <label className="label">Mục tiêu Năm 1</label>
            <input className="input" value={form.year1Goal} onChange={set('year1Goal')} placeholder="Nắm chắc nền tảng, giao tiếp tự tin, đọc-hiểu trung cấp" />
          </div>

          <div>
            <label className="label">Band IELTS mục tiêu (Năm 2)</label>
            <select className="input" value={form.targetBand} onChange={set('targetBand')}>
              <option value="">Chưa xác định</option>
              <option value="6.0">6.0</option>
              <option value="6.5">6.5</option>
              <option value="7.0">7.0</option>
              <option value="7.5">7.5</option>
              <option value="8.0">8.0+</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end pt-2">
          <Link href="/teacher/students" className="btn-secondary">Huỷ</Link>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Tạo tài khoản học viên
          </button>
        </div>
      </form>
    </div>
  )
}
