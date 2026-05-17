import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const studentId = searchParams.get('studentId')

  const reports = await db.monthlyReport.findMany({
    where: {
      student: { teacherId: session.user.id },
      ...(studentId && { studentId }),
    },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  })

  return NextResponse.json(reports)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { studentId, month, year = 2026 } = body

  const student = await db.student.findFirst({
    where: { id: studentId, teacherId: session.user.id },
    include: {
      monthlyRubrics: { where: { month, year } },
      weeklyProgress: { where: { month, year } },
      lessonSessions: { where: { month } },
    },
  })
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

  const rubric = student.monthlyRubrics[0]
  const weeks = student.weeklyProgress
  const sessions = student.lessonSessions

  const attended = sessions.filter(s => s.attended).length

  // Generate report content
  const content = generateReportContent({ student, rubric, weeks, sessions, month, year, attended })

  const report = await db.monthlyReport.upsert({
    where: { studentId_month_year: { studentId, month, year } },
    create: {
      studentId,
      month,
      year,
      title: `Báo cáo Tháng ${month}/${year} — ${student.fullName}`,
      content,
      highlights: rubric?.strongPoints || null,
      improvements: rubric?.improvements || null,
      nextMonthGoals: rubric?.nextMonthFocus || null,
      createdById: session.user.id,
    },
    update: {
      content,
      highlights: rubric?.strongPoints || null,
      improvements: rubric?.improvements || null,
      nextMonthGoals: rubric?.nextMonthFocus || null,
    },
  })

  return NextResponse.json(report, { status: 201 })
}

function generateReportContent({ student, rubric, weeks, sessions, month, year, attended }: any) {
  const skills = rubric ? [
    { label: 'Ngữ pháp', score: rubric.grammarScore },
    { label: 'Từ vựng', score: rubric.vocabularyScore },
    { label: 'Nghe', score: rubric.listeningScore },
    { label: 'Nói', score: rubric.speakingScore },
    { label: 'Đọc', score: rubric.readingScore },
    { label: 'Viết', score: rubric.writingScore },
  ] : []

  const skillRows = skills
    .filter(s => s.score != null)
    .map(s => `  - ${s.label}: ${s.score}/5`)
    .join('\n')

  const weekRows = weeks
    .map((w: any) => `  Tuần ${w.week}: ${w.sessionsCompleted} buổi · +${w.newWords} từ${w.highlights ? ` · ${w.highlights}` : ''}`)
    .join('\n')

  return `BÁO CÁO THÁNG ${month}/${year}
Học viên: ${student.fullName}
Giáo viên: Xuan Tai

═══════════════════════════════
TỔNG QUAN
═══════════════════════════════
Số buổi tham gia: ${attended}/${sessions.length}
Tháng trong lộ trình: ${student.currentMonth}/12

═══════════════════════════════
ĐÁNH GIÁ 6 KỸ NĂNG (thang 1–5)
═══════════════════════════════
${skillRows || '  (Chưa có đánh giá)'}

═══════════════════════════════
TIẾN ĐỘ TỪNG TUẦN
═══════════════════════════════
${weekRows || '  (Chưa ghi nhận)'}

═══════════════════════════════
ĐIỂM MẠNH
═══════════════════════════════
${rubric?.strongPoints || '(Chưa cập nhật)'}

═══════════════════════════════
CẦN CẢI THIỆN
═══════════════════════════════
${rubric?.improvements || '(Chưa cập nhật)'}

═══════════════════════════════
MỤC TIÊU THÁNG SAU
═══════════════════════════════
${rubric?.nextMonthFocus || '(Chưa cập nhật)'}

─────────────────────────────────
Báo cáo được tạo tự động · Xuan Tai IELTS`
}
