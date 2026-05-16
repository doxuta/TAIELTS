import { cn } from '@/lib/utils'
import { CitationList, type CitationWithSource } from '@/components/sources/CitationList'

type CriterionScore = { band: number; justification: string }

export type FeedbackOutput = {
  taskResponse?: CriterionScore
  coherence?: CriterionScore
  lexical?: CriterionScore
  grammar?: CriterionScore
  fluency?: CriterionScore
  pronunciation?: CriterionScore
  overallBand?: number
  summaryFeedback?: string
  improvementSuggestions?: string[]
}

interface Props {
  kind: string
  output: FeedbackOutput
  citations: CitationWithSource[]
  viewerRole: string
  teacherStatus: string
  teacherNotes?: string | null
  className?: string
}

const TEACHER_TONE: Record<string, string> = {
  PENDING_REVIEW: 'bg-amber-50 border-amber-200 text-amber-800',
  APPROVED: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  NEEDS_REWORK: 'bg-red-50 border-red-200 text-red-700',
  OVERRIDDEN: 'bg-violet-50 border-violet-200 text-violet-800',
}

export function AIFeedbackCard({
  kind,
  output,
  citations,
  viewerRole,
  teacherStatus,
  teacherNotes,
  className,
}: Props) {
  const criteria: Array<{ key: keyof FeedbackOutput; label: string }> = [
    { key: 'taskResponse', label: 'Task Response / Achievement' },
    { key: 'fluency', label: 'Fluency & Coherence' },
    { key: 'coherence', label: 'Coherence & Cohesion' },
    { key: 'lexical', label: 'Lexical Resource' },
    { key: 'grammar', label: 'Grammatical Range & Accuracy' },
    { key: 'pronunciation', label: 'Pronunciation' },
  ]

  const present = criteria.filter((c) => output[c.key])
  return (
    <article
      className={cn('rounded-xl border border-surface-border bg-surface-primary p-5 space-y-4', className)}
    >
      <header className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary">{kind}</p>
          {output.overallBand != null && (
            <p className="text-3xl font-bold text-ink-primary">
              Band {output.overallBand.toFixed(1)}
            </p>
          )}
        </div>
        <span
          className={cn(
            'rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
            TEACHER_TONE[teacherStatus] ?? TEACHER_TONE.PENDING_REVIEW
          )}
        >
          {teacherStatus.replaceAll('_', ' ')}
        </span>
      </header>

      {output.summaryFeedback && (
        <p className="text-sm text-ink-secondary leading-relaxed">{output.summaryFeedback}</p>
      )}

      {present.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {present.map(({ key, label }) => {
            const c = output[key] as CriterionScore
            return (
              <div
                key={key}
                className="rounded-lg border border-surface-border bg-surface-secondary p-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-semibold text-ink-secondary">{label}</h4>
                  <span className="font-mono text-sm font-bold text-ink-primary tabular-nums">
                    {c.band.toFixed(1)}
                  </span>
                </div>
                <p className="text-xs text-ink-secondary leading-relaxed">{c.justification}</p>
              </div>
            )
          })}
        </div>
      )}

      {output.improvementSuggestions && output.improvementSuggestions.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary mb-1">
            Cải thiện
          </h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-ink-primary">
            {output.improvementSuggestions.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary mb-1">
          Nguồn được trích dẫn (đã verify)
        </h4>
        <CitationList
          citations={citations}
          viewerRole={viewerRole}
          emptyMessage="AI không trích nguồn nào — feedback dựa thuần rubric."
        />
      </div>

      {teacherNotes && (
        <div className="rounded-lg bg-violet-50 border border-violet-200 p-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-violet-700 mb-1">
            Ghi chú của giáo viên
          </h4>
          <p className="text-sm text-violet-900 whitespace-pre-wrap">{teacherNotes}</p>
        </div>
      )}
    </article>
  )
}
