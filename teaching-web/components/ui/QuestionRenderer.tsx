'use client'

import { useMemo } from 'react'

export interface Question {
  id: string
  questionNumber: number
  questionType: string
  prompt: string
  options?: string | null    // JSON array
  correctAnswer?: string     // present for teacher review
  explanation?: string | null
  points?: number
}

interface QuestionRendererProps {
  question: Question
  answer: string
  onChange: (value: string) => void
  /** Show correct answer + explanation (for review mode) */
  showCorrect?: boolean
  /** Disable input (review mode) */
  readOnly?: boolean
}

const RADIO_TYPES = new Set(['MCQ_SINGLE'])
const CHECKBOX_TYPES = new Set(['MCQ_MULTIPLE'])
const TFN_TYPES = new Set(['TFN'])
const YNN_TYPES = new Set(['YNNG'])
const DROPDOWN_TYPES = new Set(['MATCHING_HEADING', 'MATCHING_INFO', 'MATCHING_FEATURE', 'CLASSIFICATION'])
const TEXT_INPUT_TYPES = new Set([
  'SENTENCE_COMPLETION', 'SUMMARY_COMPLETION', 'NOTE_COMPLETION',
  'TABLE_COMPLETION', 'FLOW_CHART_COMPLETION', 'DIAGRAM_LABEL',
  'SHORT_ANSWER', 'MAP_LABEL',
])
const TEXTAREA_TYPES = new Set([
  'ESSAY_TASK1', 'ESSAY_TASK2',
  'SPEAKING_PART1', 'SPEAKING_PART2', 'SPEAKING_PART3',
])

const TFN_OPTIONS = ['TRUE', 'FALSE', 'NOT GIVEN']
const YNN_OPTIONS = ['YES', 'NO', 'NOT GIVEN']

export function QuestionRenderer({ question, answer, onChange, showCorrect = false, readOnly = false }: QuestionRendererProps) {
  const options = useMemo<string[]>(() => {
    if (!question.options) return []
    try {
      const parsed = JSON.parse(question.options)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }, [question.options])

  const correct = question.correctAnswer ?? ''
  const isCorrect = showCorrect && answer.trim().toLowerCase() === correct.trim().toLowerCase()

  const baseInput = `input ${readOnly ? 'opacity-70 pointer-events-none' : ''}`

  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-2">
        <span className="text-xs font-bold text-brand-600 tabular-nums shrink-0">{question.questionNumber}.</span>
        <p className="text-sm text-ink leading-relaxed flex-1 whitespace-pre-wrap">{question.prompt}</p>
      </div>

      {/* Radio for MCQ_SINGLE */}
      {RADIO_TYPES.has(question.questionType) && (
        <div className="ml-6 space-y-1.5">
          {options.map((opt, i) => {
            const letter = String.fromCharCode(65 + i)
            const selected = answer === letter
            return (
              <label key={i} className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-all ${selected ? 'bg-brand-50 border border-brand-200' : 'hover:bg-surface-tertiary border border-transparent'}`}>
                <input type="radio" name={question.id} value={letter} checked={selected} onChange={() => onChange(letter)} disabled={readOnly} className="mt-0.5" />
                <span className="text-xs font-semibold text-ink-secondary">{letter}.</span>
                <span className="text-sm text-ink flex-1">{opt}</span>
              </label>
            )
          })}
        </div>
      )}

      {/* Checkboxes for MCQ_MULTIPLE */}
      {CHECKBOX_TYPES.has(question.questionType) && (
        <div className="ml-6 space-y-1.5">
          {options.map((opt, i) => {
            const letter = String.fromCharCode(65 + i)
            const current = answer.split(',').map(s => s.trim()).filter(Boolean)
            const checked = current.includes(letter)
            return (
              <label key={i} className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-all ${checked ? 'bg-brand-50 border border-brand-200' : 'hover:bg-surface-tertiary border border-transparent'}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const next = checked ? current.filter(c => c !== letter) : [...current, letter]
                    onChange(next.sort().join(','))
                  }}
                  disabled={readOnly}
                  className="mt-0.5"
                />
                <span className="text-xs font-semibold text-ink-secondary">{letter}.</span>
                <span className="text-sm text-ink flex-1">{opt}</span>
              </label>
            )
          })}
        </div>
      )}

      {/* TFN / YNN buttons */}
      {(TFN_TYPES.has(question.questionType) || YNN_TYPES.has(question.questionType)) && (
        <div className="ml-6 flex gap-2">
          {(TFN_TYPES.has(question.questionType) ? TFN_OPTIONS : YNN_OPTIONS).map(opt => (
            <button
              key={opt}
              type="button"
              disabled={readOnly}
              onClick={() => onChange(opt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${answer === opt ? 'bg-brand-600 border-brand-600 text-white' : 'bg-surface-tertiary border-surface-border text-ink-secondary hover:border-brand-300'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* Dropdown for matching/classification */}
      {DROPDOWN_TYPES.has(question.questionType) && (
        <div className="ml-6">
          <select className={`${baseInput} w-full max-w-md text-sm`} value={answer} onChange={e => onChange(e.target.value)} disabled={readOnly}>
            <option value="">— Chọn —</option>
            {options.map((opt, i) => {
              const letter = String.fromCharCode(65 + i)
              return <option key={i} value={letter}>{letter}. {opt}</option>
            })}
          </select>
        </div>
      )}

      {/* Short text inputs */}
      {TEXT_INPUT_TYPES.has(question.questionType) && (
        <div className="ml-6">
          <input
            type="text"
            className={`${baseInput} max-w-sm text-sm font-mono`}
            value={answer}
            onChange={e => onChange(e.target.value)}
            placeholder="Đáp án..."
            disabled={readOnly}
          />
        </div>
      )}

      {/* Long textarea — essays / speaking transcripts */}
      {TEXTAREA_TYPES.has(question.questionType) && (
        <div className="ml-6 space-y-1">
          <textarea
            className={`${baseInput} text-sm font-mono resize-y min-h-[180px]`}
            value={answer}
            onChange={e => onChange(e.target.value)}
            placeholder={question.questionType.startsWith('SPEAKING') ? 'Paste hoặc gõ bản transcript của bài speaking ở đây...' : 'Bắt đầu viết essay...'}
            rows={question.questionType === 'ESSAY_TASK2' ? 14 : 8}
            disabled={readOnly}
          />
          <p className="text-[10px] text-ink-tertiary text-right tabular-nums">
            {answer.trim().split(/\s+/).filter(Boolean).length} từ
          </p>
        </div>
      )}

      {/* Review mode: show correct + explanation */}
      {showCorrect && (
        <div className={`ml-6 p-2.5 rounded-lg text-xs ${isCorrect ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          <p className="font-semibold">
            {isCorrect ? '✓ Đúng' : '✗ Sai'} {!isCorrect && <>— Đáp án: <span className="font-mono">{correct}</span></>}
          </p>
          {question.explanation && <p className="mt-1 text-ink-secondary">{question.explanation}</p>}
        </div>
      )}
    </div>
  )
}
