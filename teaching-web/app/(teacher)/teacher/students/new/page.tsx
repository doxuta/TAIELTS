'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, UserPlus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const NATIVE_SELECT =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring'

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
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-2xl mx-auto space-y-6">
      <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground -ml-2">
        <Link href="/teacher/students">
          <ArrowLeft className="w-3 h-3 mr-1" /> Quay lại
        </Link>
      </Button>

      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Thêm học viên mới</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tài khoản sẽ được tạo với mật khẩu mặc định{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono">ielts2026</code>
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-md border border-destructive/40 bg-destructive/10 text-sm text-destructive">
            {error}
          </div>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
              Thông tin cơ bản
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Họ tên đầy đủ *</Label>
              <Input id="fullName" value={form.fullName} onChange={set('fullName')} required placeholder="Nguyễn Thị Huyền Trang" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email đăng nhập *</Label>
                <Input id="email" type="email" value={form.email} onChange={set('email')} required placeholder="huyentrang@gmail.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input id="phone" type="tel" value={form.phone} onChange={set('phone')} placeholder="0912 345 678" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="dob">Ngày sinh</Label>
                <Input id="dob" type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="occupation">Nghề nghiệp / Tình trạng</Label>
                <select id="occupation" className={NATIVE_SELECT} value={form.occupation} onChange={set('occupation')}>
                  <option>Sinh viên</option>
                  <option>Sinh viên Luật</option>
                  <option>Đi làm</option>
                  <option>Học sinh THPT</option>
                  <option>Khác</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slack">Slack channel / username</Label>
              <Input id="slack" value={form.slackChannel} onChange={set('slackChannel')} placeholder="@huyentrang hoặc #ht-ielts" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
              Mục tiêu học
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="year1">Mục tiêu Năm 1</Label>
              <Input id="year1" value={form.year1Goal} onChange={set('year1Goal')} placeholder="Nắm chắc nền tảng, giao tiếp tự tin, đọc-hiểu trung cấp" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="targetBand">Band IELTS mục tiêu (Năm 2)</Label>
              <select id="targetBand" className={NATIVE_SELECT} value={form.targetBand} onChange={set('targetBand')}>
                <option value="">Chưa xác định</option>
                <option value="6.0">6.0</option>
                <option value="6.5">6.5</option>
                <option value="7.0">7.0</option>
                <option value="7.5">7.5</option>
                <option value="8.0">8.0+</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button asChild variant="ghost">
            <Link href="/teacher/students">Huỷ</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <UserPlus className="w-4 h-4 mr-1" />}
            Tạo tài khoản học viên
          </Button>
        </div>
      </form>
    </div>
  )
}
