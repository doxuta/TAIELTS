import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { rawToBand } from '@/lib/descriptors'
import { scoreWritingTask1, scoreWritingTask2, scoreSpeakingTranscript } from '@/lib/ai-examiner'
import { awardXP, XP_RULES } from '@/lib/gamification'

const OBJECTIVE_TYPES = new Set([
  'MCQ_SINGLE', 'MCQ_MULTIPLE', 'TFN', 'YNNG',
  'MATCHING_HEADING', 'MATCHING_INFO', 'MATCHING_FEATURE',
  'SENTENCE_COMPLETION', 'SUMMARY_COMPLETION', 'NOTE_COMPLETION',
  'TABLE_COMPLETION', 'FLOW_CHART_COMPLETION', 'DIAGRAM_LABEL',
  'SHORT_ANSWER', 'MAP_LABEL', 'CLASSIFICATION',
])

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/[.,!?;:'"]/g, '').replace(/\s+/g, ' ')
}

function isAnswerCorrect(student: string, correct: string): boolean {
  if (!student) return false
  const studentN = normalize(student)
  // correct may be comma-separated alternatives
  const alts = correct.split(/[|]/).map(normalize)
  return alts.some(a => a === studentN)
}

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const attempt = await db.mockTestAttempt.findUnique({
    where: { id: params.id },
    include: {
      answers: { include: { question: { include: { part: true } } } },
    },
  })
  if (!attempt) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Ownership for students
  if (session.user.role === 'STUDENT') {
    const student = await db.student.findFirst({ where: { userId: session.user.id } })
    if (!student || attempt.studentId !== student.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  // Per-skill raw scores
  const skillRaw: Record<string, { correct: number; total: number }> = {
    LISTENING: { correct: 0, total: 0 },
    READING: { correct: 0, total: 0 },
  }

  // Subjective answers (Writing/Speaking) — collect for AI scoring
  const writingAnswers: typeof attempt.answers = []
  const speakingAnswers: typeof attempt.answers = []

  for (const ans of attempt.answers) {
    const qType = ans.question.questionType
    const skill = ans.question.part.skill

    if (OBJECTIVE_TYPES.has(qType)) {
      const correct = isAnswerCorrect(ans.answer, ans.question.correctAnswer)
      await db.mockTestAnswer.update({
        where: { id: ans.id },
        data: { isCorrect: correct },
      })
      if (skill === 'LISTENING' || skill === 'READING') {
        skillRaw[skill].total += 1
        if (correct) skillRaw[skill].correct += 1
      }
    } else if (qType === 'ESSAY_TASK1' || qType === 'ESSAY_TASK2') {
      writingAnswers.push(ans)
    } else if (qType.startsWith('SPEAKING_')) {
      speakingAnswers.push(ans)
    }
  }

  // Count totals to convert to band (40-question equivalent)
  const listeningScore = skillRaw.LISTENING.total > 0
    ? rawToBand(Math.round((skillRaw.LISTENING.correct / skillRaw.LISTENING.total) * 40))
    : null
  const readingScore = skillRaw.READING.total > 0
    ? rawToBand(Math.round((skillRaw.READING.correct / skillRaw.READING.total) * 40))
    : null

  // AI score writing
  let writingScore: number | null = null
  if (writingAnswers.length > 0) {
    const writingScores: number[] = []
    for (const ans of writingAnswers) {
      try {
        const fn = ans.question.questionType === 'ESSAY_TASK1' ? scoreWritingTask1 : scoreWritingTask2
        const result = await fn(ans.question.prompt, ans.answer)
        await db.mockTestAnswer.update({
          where: { id: ans.id },
          data: { aiScore: result.overallBand, aiFeedback: JSON.stringify(result) },
        })
        writingScores.push(result.overallBand)
      } catch (err) {
        console.error('AI writing score error:', err)
      }
    }
    if (writingScores.length > 0) {
      writingScore = writingScores.reduce((a, b) => a + b, 0) / writingScores.length
      writingScore = Math.round(writingScore * 2) / 2
    }
  }

  // AI score speaking
  let speakingScore: number | null = null
  if (speakingAnswers.length > 0) {
    const speakingScores: number[] = []
    for (const ans of speakingAnswers) {
      try {
        const partNum = parseInt(ans.question.questionType.replace('SPEAKING_PART', '')) as 1 | 2 | 3
        const result = await scoreSpeakingTranscript(partNum, ans.answer)
        await db.mockTestAnswer.update({
          where: { id: ans.id },
          data: { aiScore: result.overallBand, aiFeedback: JSON.stringify(result) },
        })
        speakingScores.push(result.overallBand)
      } catch (err) {
        console.error('AI speaking score error:', err)
      }
    }
    if (speakingScores.length > 0) {
      speakingScore = speakingScores.reduce((a, b) => a + b, 0) / speakingScores.length
      speakingScore = Math.round(speakingScore * 2) / 2
    }
  }

  // Overall band = average of available skills
  const scores = [listeningScore, readingScore, writingScore, speakingScore].filter(s => s !== null) as number[]
  const overallBand = scores.length > 0
    ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 2) / 2
    : null

  const updated = await db.mockTestAttempt.update({
    where: { id: params.id },
    data: {
      listeningScore, readingScore, writingScore, speakingScore, overallBand,
      completedAt: new Date(),
    },
  })

  // Award XP
  let xp = null
  if (session.user.role === 'STUDENT') {
    const student = await db.student.findFirst({ where: { userId: session.user.id } })
    if (student) {
      xp = await awardXP(student.id, XP_RULES.MOCK_TEST_COMPLETE, { minutesStudied: 60 })
    }
  }

  return NextResponse.json({ attempt: updated, xp })
}
