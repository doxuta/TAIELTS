'use client'

import { useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { parseBlockContent, blockTypeLabel } from '@/lib/modules'
import { AIFeedbackCard, type FeedbackOutput } from '@/components/ai/AIFeedbackCard'
import type { CitationWithSource } from '@/components/sources/CitationList'

interface Props {
  blockId: string
  blockType: 'WRITING_PROMPT' | 'SPEAKING_PROMPT'
  blockTitle: string
  contentJson: string | null
}

export function PromptBlockForm({ blockId, blockType, blockTitle, contentJson }: Props) {
  const content = parseBlockContent(contentJson)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<FeedbackOutput | null>(null)
  const [feedbackKind, setFeedbackKind] = useState<string | null>(null)
  const [citations, setCitations] = useState<CitationWithSource[]>([])

  const minWords = blockType === 'WRITING_PROMPT' ? 20 : 15
  const words = text.trim() ? text.trim().split(/\s+/).length : 0

  async function submit() {
    setError(null)
    if (words < minWords) {
      setError(`Cần ít nhất ${minWords} từ.`)
      return
    }
    setSubmitting(true)
    try {
      const endpoint =
        blockType === 'WRITING_PROMPT' ? '/api/ai/score-writing' : '/api/ai/score-speaking'
      const body =
        blockType === 'WRITING_PROMPT'
          ? {
              prompt: content.body ?? blockTitle,
              essay: text,
              taskType: content.writingTaskType ?? 'TASK_2',
              blockId,
            }
          : {
              part: content.speakingPart ?? 2,
              transcript: text,
              blockId,
            }
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error ?? 'Scoring failed')
      }
      const data = await res.json()
      setFeedback(data)
      setFeedbackKind(
        blockType === 'WRITING_PROMPT' ? `WRITING_${body.taskType ?? 'TASK_2'}` : `SPEAKING_PART${(body as { part?: number }).part ?? 2}`
      )

      // Best-effort: also fetch the persisted feedback with citations.
      if (data?.aiFeedbackId) {
        const fb = await fetch(`/api/ai-feedback/${data.aiFeedbackId}`).then((r) =>
          r.ok ? r.json() : null
        )
        if (fb?.citations) setCitations(fb.citations)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Scoring failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-md bg-surface-secondary p-3 text-sm text-ink-primary">
        <div className="text-[10px] uppercase tracking-wide text-ink-tertiary font-semibold mb-1">
          {blockTypeLabel(blockType)}
          {content.writingTaskType ? ` · ${content.writingTaskType}` : ''}
          {content.speakingPart ? ` · Part ${content.speakingPart}` : ''}
        </div>
        <div className="whitespace-pre-wrap">{content.body ?? '—'}</div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={blockType === 'WRITING_PROMPT' ? 8 : 5}
        placeholder={
          blockType === 'WRITING_PROMPT'
            ? 'Viết bài luận của bạn tại đây...'
            : 'Paste transcript / viết câu trả lời nói của bạn...'
        }
        className="w-full rounded-lg border border-surface-border bg-surface-primary px-3 py-2 text-sm text-ink-primary focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-ink-tertiary">
          {words} từ · cần ≥ {minWords}
        </span>
        <button
          type="button"
          onClick={submit}
          disabled={submitting || words < minWords}
          className="inline-flex items-center gap-1 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" /> Scoring...
            </>
          ) : (
            <>
              <Sparkles className="h-3 w-3" /> Get AI feedback
            </>
          )}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}

      {feedback && (
        <AIFeedbackCard
          kind={feedbackKind ?? blockType}
          output={feedback}
          citations={citations}
          viewerRole="STUDENT"
          teacherStatus="PENDING_REVIEW"
        />
      )}
    </div>
  )
}
