import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { scoreWritingTask1, scoreWritingTask2 } from '@/lib/ai-examiner'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { prompt, essay, taskType } = await req.json() as {
    prompt: string; essay: string; taskType: 'TASK_1' | 'TASK_2'
  }

  if (!prompt || !essay) {
    return NextResponse.json({ error: 'prompt and essay required' }, { status: 400 })
  }
  if (essay.trim().split(/\s+/).length < 20) {
    return NextResponse.json({ error: 'Essay too short (min 20 words)' }, { status: 400 })
  }

  try {
    const result = taskType === 'TASK_1'
      ? await scoreWritingTask1(prompt, essay)
      : await scoreWritingTask2(prompt, essay)
    return NextResponse.json(result)
  } catch (err) {
    console.error('AI writing score failed:', err)
    return NextResponse.json({ error: 'AI scoring temporarily unavailable. Try again in a moment.' }, { status: 503 })
  }
}
