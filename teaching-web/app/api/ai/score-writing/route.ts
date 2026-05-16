import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { GEMINI_MODEL, scoreWritingTask1, scoreWritingTask2 } from '@/lib/ai-examiner'
import { loadApprovedCitationContext } from '@/lib/aiFeedback'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const { prompt, essay, taskType, blockId, citationIds, attachedToType, attachedToId } = body as {
    prompt?: string
    essay?: string
    taskType?: 'TASK_1' | 'TASK_2'
    blockId?: string | null
    citationIds?: string[] | null
    attachedToType?: string | null
    attachedToId?: string | null
  }

  if (!prompt || !essay || !taskType) {
    return NextResponse.json({ error: 'prompt, essay, taskType required' }, { status: 400 })
  }
  if (essay.trim().split(/\s+/).length < 20) {
    return NextResponse.json({ error: 'Essay too short (min 20 words)' }, { status: 400 })
  }

  const context = await loadApprovedCitationContext({ blockId, citationIds })

  try {
    const result = taskType === 'TASK_1'
      ? await scoreWritingTask1(prompt, essay, context)
      : await scoreWritingTask2(prompt, essay, context)

    const feedback = await db.aIFeedback.create({
      data: {
        kind: taskType === 'TASK_1' ? 'WRITING_TASK1' : 'WRITING_TASK2',
        model: GEMINI_MODEL,
        inputJson: JSON.stringify({ prompt, essay, blockId, citationIds }),
        outputJson: JSON.stringify(result),
        overallBand: typeof result.overallBand === 'number' ? result.overallBand : null,
        summaryFeedback: result.summaryFeedback ?? null,
        attachedToType: attachedToType ?? (blockId ? 'LESSON_BLOCK' : 'FREEFORM'),
        attachedToId: attachedToId ?? blockId ?? null,
        citationContextJson: JSON.stringify(context.map((c) => c.id)),
        userId: session.user.id,
      },
    })

    return NextResponse.json({ ...result, aiFeedbackId: feedback.id })
  } catch (err) {
    console.error('AI writing score failed:', err)
    return NextResponse.json(
      { error: 'AI scoring temporarily unavailable. Try again in a moment.' },
      { status: 503 }
    )
  }
}
