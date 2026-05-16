import { db } from '@/lib/db'

/** Max blocks the Today Plan surfaces in one shot. Caps overwhelm for the learner. */
export const TODAY_PLAN_MAX_ITEMS = 6

export type TodayPlanItem = {
  blockId: string
  blockTitle: string
  blockType: string
  estimatedMinutes: number | null
  moduleId: string
  moduleTitle: string
  assignmentId: string
  order: number
  progressId: string | null
  status: string
  contentJson: string | null
}

/**
 * Build the Today Plan for a student.
 *
 * V1 rule: surface the first N blocks (across active assignments, ordered by
 * assignment creation then block order) that are not yet COMPLETED.
 */
export async function buildTodayPlan(studentId: string): Promise<TodayPlanItem[]> {
  const assignments = await db.moduleAssignment.findMany({
    where: { studentId, status: 'ACTIVE' },
    orderBy: { createdAt: 'asc' },
    include: {
      module: {
        include: {
          blocks: { orderBy: { order: 'asc' } },
        },
      },
      blockProgress: true,
    },
  })

  const items: TodayPlanItem[] = []
  for (const a of assignments) {
    if (a.module.status !== 'PUBLISHED') continue
    const progressByBlock = new Map(a.blockProgress.map((p) => [p.blockId, p]))
    for (const b of a.module.blocks) {
      const p = progressByBlock.get(b.id)
      if (p?.status === 'COMPLETED' || p?.status === 'SKIPPED') continue
      items.push({
        blockId: b.id,
        blockTitle: b.title,
        blockType: b.type,
        estimatedMinutes: b.estimatedMinutes,
        moduleId: a.moduleId,
        moduleTitle: a.module.title,
        assignmentId: a.id,
        order: b.order,
        progressId: p?.id ?? null,
        status: p?.status ?? 'PLANNED',
        contentJson: b.contentJson,
      })
      if (items.length >= TODAY_PLAN_MAX_ITEMS) return items
    }
  }
  return items
}
