import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { scoreSpeakingTranscript } from '@/lib/ai-examiner'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { part, transcript } = await req.json() as { part: 1 | 2 | 3; transcript: string }

  if (!transcript || ![1, 2, 3].includes(part)) {
    return NextResponse.json({ error: 'part (1-3) and transcript required' }, { status: 400 })
  }
  if (transcript.trim().split(/\s+/).length < 15) {
    return NextResponse.json({ error: 'Transcript too short (min 15 words)' }, { status: 400 })
  }

  try {
    const result = await scoreSpeakingTranscript(part, transcript)
    return NextResponse.json(result)
  } catch (err) {
    console.error('AI speaking score failed:', err)
    return NextResponse.json({ error: 'AI scoring temporarily unavailable.' }, { status: 503 })
  }
}
