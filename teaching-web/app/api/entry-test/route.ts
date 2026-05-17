import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  generateEntryTest,
  scoreObjective,
  combineScores,
  type GeneratedEntryTest,
  type EntryAnswers,
  type SelfLevel,
} from '@/lib/entry-test'
import { scoreWritingTask2, scoreSpeakingTranscript } from '@/lib/ai-examiner'

const VALID_LEVELS: SelfLevel[] = ['NONE', 'A1', 'A2', 'B1', 'B2', 'C1_PLUS']

async function loadStudent(userId: string) {
  return db.student.findFirst({
    where: { userId },
    include: { entryAssessment: true },
  })
}

// GET /api/entry-test — return existing test (generate one if missing).
export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const student = await loadStudent(session.user.id)
  if (!student) return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })

  if (student.entryAssessment?.submittedAt) {
    return NextResponse.json(
      { error: 'Đã hoàn thành bài test đầu vào.', alreadyDone: true },
      { status: 409 }
    )
  }

  // Reuse existing generated test if present (so refresh doesn't regenerate)
  if (student.entryAssessment) {
    return NextResponse.json({
      assessmentId: student.entryAssessment.id,
      level: student.entryAssessment.selfLevel,
      test: JSON.parse(student.entryAssessment.generatedJson) as GeneratedEntryTest,
    })
  }

  // Generate new test
  const level = (student.selfLevel as SelfLevel | null) ?? 'A1'
  if (!VALID_LEVELS.includes(level)) {
    return NextResponse.json({ error: 'Trình độ tự khai không hợp lệ' }, { status: 400 })
  }

  const test = await generateEntryTest(level)

  const created = await db.entryAssessment.create({
    data: {
      studentId: student.id,
      selfLevel: level,
      generatedJson: JSON.stringify(test),
    },
  })

  return NextResponse.json({
    assessmentId: created.id,
    level,
    test,
  })
}

// POST /api/entry-test — submit answers, score, update student.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { answers?: EntryAnswers }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const answers = body.answers
  if (!answers) {
    return NextResponse.json({ error: 'Thiếu answers' }, { status: 400 })
  }

  const student = await loadStudent(session.user.id)
  if (!student) return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
  if (!student.entryAssessment) {
    return NextResponse.json(
      { error: 'Chưa có bài test. Hãy GET /api/entry-test trước.' },
      { status: 400 }
    )
  }
  if (student.entryAssessment.submittedAt) {
    return NextResponse.json(
      { error: 'Đã submit rồi.', alreadyDone: true },
      { status: 409 }
    )
  }

  const test: GeneratedEntryTest = JSON.parse(student.entryAssessment.generatedJson)

  // Auto-score MCQ
  const { grammarScore, readingScore } = scoreObjective(test, answers)

  // AI-score writing + speaking (skip if too short — penalty)
  let writingBand = 0
  let speakingBand = 0
  let aiFeedbackJson: Record<string, unknown> = {}

  try {
    if (answers.writingText && answers.writingText.trim().split(/\s+/).length >= 20) {
      const writingScore = await scoreWritingTask2(test.writing.prompt, answers.writingText)
      writingBand = writingScore.overallBand
      aiFeedbackJson.writing = writingScore
    }
  } catch (e) {
    aiFeedbackJson.writingError = (e as Error).message
  }

  try {
    if (answers.speakingTranscript && answers.speakingTranscript.trim().split(/\s+/).length >= 10) {
      const speakingScore = await scoreSpeakingTranscript(2, answers.speakingTranscript)
      speakingBand = speakingScore.overallBand
      aiFeedbackJson.speaking = speakingScore
    }
  } catch (e) {
    aiFeedbackJson.speakingError = (e as Error).message
  }

  const score = combineScores({ grammarScore, readingScore, writingBand, speakingBand })

  // Persist
  await db.$transaction([
    db.entryAssessment.update({
      where: { id: student.entryAssessment.id },
      data: {
        answersJson: JSON.stringify(answers),
        aiFeedbackJson: JSON.stringify(aiFeedbackJson),
        grammarScore: score.grammarScore,
        readingScore: score.readingScore,
        writingScore: score.writingScore,
        speakingScore: score.speakingScore,
        overallScore: score.overallScore,
        recommendedMonth: score.recommendedMonth,
        submittedAt: new Date(),
      },
    }),
    db.student.update({
      where: { id: student.id },
      data: {
        testDate: new Date(),
        grammarScore: score.grammarScore,
        readingScore: score.readingScore,
        writingScore: score.writingScore,
        speakingScore: score.speakingScore,
        currentMonth: score.recommendedMonth,
        currentWeek: 1,
        currentPhase: 'YEAR1_FOUNDATION',
        entryNotes: `Auto-scored from AI entry test. Self-level: ${student.entryAssessment.selfLevel}. Overall: ${score.overallScore.toFixed(1)}/20.`,
      },
    }),
  ])

  return NextResponse.json({
    score,
    aiFeedback: aiFeedbackJson,
  })
}
