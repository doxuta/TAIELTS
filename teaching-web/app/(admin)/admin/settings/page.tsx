import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { Settings, Shield, Database, Sparkles, Lock } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const [userCount, sourceCount, moduleCount, citationCount, auditCount] = await Promise.all([
    db.user.count(),
    db.source.count(),
    db.learningModule.count(),
    db.citation.count(),
    db.auditLog.count(),
  ])

  const aiMock = process.env.AI_MOCK === '1'
  const aiModel = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash'
  const nodeEnv = process.env.NODE_ENV ?? 'development'
  const dbUrl = process.env.DATABASE_URL ?? 'file:./prisma/dev.db'
  const dbKind = dbUrl.startsWith('file:') ? 'SQLite (local)' : dbUrl.startsWith('postgres') ? 'PostgreSQL' : 'Unknown'

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" /> Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Read-only view of system configuration. Đổi config bằng cách edit .env và redeploy.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="w-4 h-4 text-muted-foreground" /> Database
            </CardTitle>
            <CardDescription>Provider hiện tại + footprint số liệu.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Provider" value={<Badge variant="outline">{dbKind}</Badge>} />
            <Row label="Node env" value={<Badge variant={nodeEnv === 'production' ? 'success' : 'secondary'}>{nodeEnv}</Badge>} />
            <Separator />
            <Row label="Users" value={<span className="tabular-nums font-medium">{userCount}</span>} />
            <Row label="Sources" value={<span className="tabular-nums font-medium">{sourceCount}</span>} />
            <Row label="Modules" value={<span className="tabular-nums font-medium">{moduleCount}</span>} />
            <Row label="Citations" value={<span className="tabular-nums font-medium">{citationCount}</span>} />
            <Row label="Audit events" value={<span className="tabular-nums font-medium">{auditCount}</span>} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-muted-foreground" /> AI
            </CardTitle>
            <CardDescription>Model + quota mode đang dùng cho scoring.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row
              label="Mock mode"
              value={
                <Badge variant={aiMock ? 'warning' : 'secondary'}>
                  {aiMock ? 'AI_MOCK=1 (quota-free)' : 'real API'}
                </Badge>
              }
            />
            <Row label="Model" value={<code className="rounded bg-muted px-1.5 py-0.5 text-xs">{aiModel}</code>} />
            <Separator />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Khi <code className="rounded bg-muted px-1 text-[11px]">AI_MOCK=1</code> set, mọi request chấm điểm sẽ trả về
              fixture, không tính quota Gemini. Dùng cho local + CI demos.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" /> Governance
            </CardTitle>
            <CardDescription>Các quy tắc nội dung không thể bypass qua UI.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Source BLOCKED / DEPRECATED</strong> tự ẩn khỏi mọi response gửi cho học viên.
            </p>
            <Separator />
            <p>
              <strong className="text-foreground">Module publish</strong> chỉ ADMIN làm được; mỗi lần publish bump version + ghi
              audit log.
            </p>
            <Separator />
            <p>
              <strong className="text-foreground">AI feedback</strong> mặc định là PENDING_REVIEW cho teacher duyệt trước khi
              expose cho học viên.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground" /> Session
            </CardTitle>
            <CardDescription>Người đang đăng nhập.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Email" value={<span>{session.user.email}</span>} />
            <Row label="Name" value={<span>{session.user.name ?? '—'}</span>} />
            <Row label="Role" value={<Badge variant="default">{session.user.role}</Badge>} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      {value}
    </div>
  )
}
