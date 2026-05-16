import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { GEMINI_MODEL, scoreSpeakingTranscript } from '@/lib/ai-examiner'
import { loadApprovedCitationContext } from '@/lib/aiFeedback'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const { part, transcript, blockId, citationIds, attachedToType, attachedToId } = body as {
    part?: 1 | 2 | 3
    transcript?: string
    blockId?: string | null
    citationIds?: string[] | null
    attachedToType?: string | null
    attachedToId?: string | null
  }

  if (!transcript || ![1, 2, 3].includes(part as number)) {
    return NextResponse.json({ error: 'part (1-3) and transcript required' }, { status: 400 })
  }
  if (transcript.trim().split(/\s+/).length < 15) {
    return NextResponse.json({ error: 'Transcript too short (min 15 words)' }, { status: 400 })
  }

  const context = await loadApprovedCitationContext({ blockId, citationIds })

  try {
    const result = await scoreSpeakingTranscript(part as 1 | 2 | 3, transcript, context)

    const feedback = await db.aIFeedback.create({
      data: {
        kind: `SPEAKING_PART${part}`,
        model: GEMINI_MODEL,
        inputJson: JSON.stringify({ part, transcript, blockId, citationIds }),
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
    console.error('AI speaking score failed:', err)
    return NextResponse.json({ error: 'AI scoring temporarily unavailable.' }, { status: 503 })
  }
}
