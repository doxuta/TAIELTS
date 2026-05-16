import { db } from '@/lib/db'
import { isVisibleToStudents } from '@/lib/sources'

export type CitationContext = {
  id: string
  routeLabel: string
  routeType: string
  sourceTitle: string
  provider: string | null
  url: string | null
  trustLevel: string
  licenseStatus: string
}

/**
 * Load an approved citation context to feed into an AI prompt.
 *
 * Resolution order:
 *   1. Explicit `citationIds` (if any), filtered to APPROVED + non-blocked.
 *   2. If `blockId` is provided, every citation attached to that LESSON_BLOCK
 *      (filtered to APPROVED + non-blocked).
 *
 * The returned list is what the AI is allowed to reference. The AI MUST NOT
 * invent sources outside this list; the route validates IDs before display.
 */
export async function loadApprovedCitationContext({
  blockId,
  citationIds,
}: {
  blockId?: string | null
  citationIds?: string[] | null
}): Promise<CitationContext[]> {
  const ors: Array<Record<string, unknown>> = []
  if (citationIds && citationIds.length) {
    ors.push({ id: { in: citationIds } })
  }
  if (blockId) {
    ors.push({ attachedToType: 'LESSON_BLOCK', attachedToId: blockId })
  }
  if (ors.length === 0) return []

  const citations = await db.citation.findMany({
    where: { OR: ors },
    include: { sourceRoute: { include: { source: true } } },
  })

  return citations
    .filter((c) => isVisibleToStudents(c.sourceRoute.source.reviewStatus, c.sourceRoute.source.trustLevel))
    .map((c) => ({
      id: c.id,
      routeLabel: c.sourceRoute.displayLabel,
      routeType: c.sourceRoute.routeType,
      sourceTitle: c.sourceRoute.source.title,
      provider: c.sourceRoute.source.provider,
      url: c.sourceRoute.source.url,
      trustLevel: c.sourceRoute.source.trustLevel,
      licenseStatus: c.sourceRoute.source.licenseStatus,
    }))
}

/**
 * Render the citation context block injected at the top of an AI prompt.
 */
export function renderCitationContextForPrompt(context: CitationContext[]): string {
  if (context.length === 0) {
    return [
      'AVAILABLE APPROVED SOURCES: none.',
      'You MUST NOT invent or cite any external source.',
      'Base feedback purely on the official rubric and the learner\'s text.',
    ].join('\n')
  }
  const lines = context.map((c, i) => {
    return `[${i + 1}] id=${c.id} | ${c.sourceTitle}${c.provider ? ' — ' + c.provider : ''} | ${c.routeType}: ${c.routeLabel}${c.url ? ' (' + c.url + ')' : ''} | trust=${c.trustLevel} license=${c.licenseStatus}`
  })
  return [
    'AVAILABLE APPROVED SOURCES (you MAY reference these by their numeric label, e.g. [1], or by `id`):',
    ...lines,
    'STRICT RULES:',
    '- You MUST NOT invent or cite any source not in this list.',
    '- If a relevant source exists in the list, prefer citing it.',
    '- If none of these sources apply, say so explicitly and base feedback on the rubric only.',
  ].join('\n')
}
