import { PrismaClient } from '@prisma/client'

type DemoBlock = {
  type: 'GRAMMAR_NOTE' | 'READING' | 'WRITING_PROMPT' | 'SPEAKING_PROMPT'
  title: string
  body: string
  writingTaskType?: 'TASK_1' | 'TASK_2'
  speakingPart?: 1 | 2 | 3
  /** Source slug to attach as citation (matched by title in this seed). */
  citeSourceTitle?: string
  estimatedMinutes?: number
}

type DemoModule = {
  slug: string
  title: string
  summary: string
  skill: string
  cefrLevel: string
  targetBand?: number
  week?: number
  estimatedMinutes: number
  blocks: DemoBlock[]
}

const DEMO_MODULES: DemoModule[] = [
  {
    slug: 'present-perfect-foundation',
    title: 'Present Perfect Foundation',
    summary: 'Hiểu form, dùng đúng, viết & nói tự nhiên về kinh nghiệm cá nhân.',
    skill: 'GRAMMAR',
    cefrLevel: 'B1',
    targetBand: 6.0,
    week: 4,
    estimatedMinutes: 45,
    blocks: [
      {
        type: 'GRAMMAR_NOTE',
        title: 'Form & meaning of Present Perfect',
        body: `## Form
S + have/has + V3

## Meaning
1. Experience up to now: *I have been to Japan.*
2. Recent action with current effect: *She has just finished her essay.*
3. Unfinished period: *We have lived here for 3 years.*

## Watch for
- Time markers: ever, never, just, already, yet, for, since
- NEVER use Present Perfect with a specific past time (use Past Simple instead).`,
        citeSourceTitle: 'Cambridge Dictionary',
        estimatedMinutes: 10,
      },
      {
        type: 'READING',
        title: 'Short reading: "A small change"',
        body: `Lately I have started waking up at 6 a.m. It has been hard for the first week, but I have noticed that I feel more energetic. I have also read more in the morning — about 30 pages a day. My friends have asked how I do it; honestly, I have just decided that it matters.`,
        estimatedMinutes: 5,
      },
      {
        type: 'WRITING_PROMPT',
        title: 'Writing: A habit you have changed recently',
        body: 'In 120-150 words, describe one habit you have changed in the past 6 months. Explain WHAT you used to do, WHAT you do now, and the EFFECT you have noticed.',
        writingTaskType: 'TASK_2',
        estimatedMinutes: 15,
        citeSourceTitle: 'BBC 6 Minute English',
      },
      {
        type: 'SPEAKING_PROMPT',
        title: 'Speaking Part 1: Daily routines',
        body: 'Describe a positive change in your daily routine recently. How long have you done it? What have you noticed? (Speak ~45 seconds → transcribe and submit for AI scoring.)',
        speakingPart: 1,
        estimatedMinutes: 8,
      },
    ],
  },
  {
    slug: 'ielts-listening-strategy-warmup',
    title: 'IELTS Listening — Section 1 strategy warm-up',
    summary: 'Spot prediction, paraphrase, distractor traps in Section 1.',
    skill: 'LISTENING',
    cefrLevel: 'B1',
    targetBand: 6.5,
    week: 1,
    estimatedMinutes: 30,
    blocks: [
      {
        type: 'GRAMMAR_NOTE',
        title: 'Numbers, dates, spellings — common traps',
        body: `IELTS Section 1 often tests:
- Spelling of names and addresses
- Phone numbers (read in pairs: "double-five seven nine")
- Dates: "May 3rd", "the 3rd of May" — write 3 May or May 3
- Money: write **only the digits + currency mark** in the answer line

Tip: predict the WORD TYPE for each gap before audio starts.`,
        estimatedMinutes: 8,
        citeSourceTitle: 'BBC 6 Minute English',
      },
      {
        type: 'READING',
        title: 'Strategy: paraphrase the question first',
        body: `Look at the question card. Underline content words. Predict 2-3 synonyms.

Example: "She wants to RENT an apartment." → audio may say *lease, let, find a place, accommodation*. Train the ear, not the eye.`,
        estimatedMinutes: 5,
      },
      {
        type: 'WRITING_PROMPT',
        title: 'Writing follow-up: explain your strategy',
        body: 'In 80-100 words, explain what you do BEFORE the audio starts in Section 1. Be specific and use steps.',
        writingTaskType: 'TASK_2',
        estimatedMinutes: 12,
      },
    ],
  },
  {
    slug: 'foundation-vocab-sprint',
    title: 'Foundation Vocab Sprint — Oxford 3000 Week 1',
    summary: '10 từ A2 cốt lõi, dùng trong văn nói và viết hàng ngày.',
    skill: 'VOCABULARY',
    cefrLevel: 'A2',
    targetBand: 5.0,
    week: 2,
    estimatedMinutes: 25,
    blocks: [
      {
        type: 'GRAMMAR_NOTE',
        title: 'Word focus: 10 high-frequency verbs',
        body: `1. **manage** — to do something successfully despite difficulty
2. **enjoy** — to take pleasure in
3. **avoid** — to keep away from
4. **suggest** — to put forward an idea
5. **prefer** — to like one option more
6. **expect** — to think something will happen
7. **decide** — to choose after thinking
8. **mention** — to refer briefly
9. **realise** — to become aware
10. **continue** — to keep going

Pick 3 you struggle with. Make a sentence about your week using each.`,
        citeSourceTitle: 'Oxford 3000 Word List',
        estimatedMinutes: 10,
      },
      {
        type: 'SPEAKING_PROMPT',
        title: 'Speaking warm-up: use 3 new words',
        body: 'Talk for 30 seconds about your last weekend. Use AT LEAST 3 of the 10 verbs above (manage, enjoy, avoid, suggest, prefer, expect, decide, mention, realise, continue). Transcribe and submit.',
        speakingPart: 1,
        estimatedMinutes: 8,
      },
    ],
  },
]

export async function seedDemoModules(db: PrismaClient, adminUserId: string, studentId: string) {
  // Look up seeded sources once for citation attachment.
  const sources = await db.source.findMany({
    where: { reviewStatus: 'APPROVED' },
    include: { routes: { orderBy: { createdAt: 'asc' }, take: 1 } },
  })
  const sourceByTitle = new Map(sources.map((s) => [s.title, s]))

  let created = 0
  let updated = 0

  for (const dm of DEMO_MODULES) {
    let module = await db.learningModule.findUnique({ where: { slug: dm.slug } })
    if (module) {
      module = await db.learningModule.update({
        where: { id: module.id },
        data: {
          title: dm.title,
          summary: dm.summary,
          skill: dm.skill,
          cefrLevel: dm.cefrLevel,
          targetBand: dm.targetBand ?? null,
          week: dm.week ?? null,
          estimatedMinutes: dm.estimatedMinutes,
          status: 'PUBLISHED',
          publishedAt: new Date(),
          publishedById: adminUserId,
        },
      })
      // Wipe existing blocks so reseed is idempotent.
      await db.lessonBlock.deleteMany({ where: { moduleId: module.id } })
      updated += 1
    } else {
      module = await db.learningModule.create({
        data: {
          slug: dm.slug,
          title: dm.title,
          summary: dm.summary,
          skill: dm.skill,
          cefrLevel: dm.cefrLevel,
          targetBand: dm.targetBand ?? null,
          week: dm.week ?? null,
          estimatedMinutes: dm.estimatedMinutes,
          createdById: adminUserId,
          publishedById: adminUserId,
          publishedAt: new Date(),
          status: 'PUBLISHED',
        },
      })
      created += 1
    }

    for (let order = 0; order < dm.blocks.length; order += 1) {
      const db2 = dm.blocks[order]
      const content: Record<string, unknown> = { body: db2.body }
      if (db2.writingTaskType) content.writingTaskType = db2.writingTaskType
      if (db2.speakingPart) content.speakingPart = db2.speakingPart

      const block = await db.lessonBlock.create({
        data: {
          moduleId: module.id,
          type: db2.type,
          title: db2.title,
          order,
          estimatedMinutes: db2.estimatedMinutes ?? null,
          contentJson: JSON.stringify(content),
        },
      })

      if (db2.citeSourceTitle) {
        const src = sourceByTitle.get(db2.citeSourceTitle)
        const route = src?.routes[0]
        if (route) {
          await db.citation.create({
            data: {
              sourceRouteId: route.id,
              attachedToType: 'LESSON_BLOCK',
              attachedToId: block.id,
              displayMode: 'SOURCE_CARD',
            },
          })
        }
      }
    }
  }

  // Assign the first module to the seeded student (idempotent).
  const headlineModule = await db.learningModule.findUnique({
    where: { slug: DEMO_MODULES[0].slug },
  })
  if (headlineModule) {
    await db.moduleAssignment.upsert({
      where: {
        studentId_moduleId: { studentId, moduleId: headlineModule.id },
      },
      create: {
        studentId,
        moduleId: headlineModule.id,
        assignedById: adminUserId,
      },
      update: {},
    })
  }

  return { created, updated, total: DEMO_MODULES.length }
}
