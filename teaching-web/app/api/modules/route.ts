import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeAudit } from '@/lib/audit'
import { MODULE_SKILLS, MODULE_STATUSES, isModuleVisibleToStudents } from '@/lib/modules'

function canBuild(role?: string) {
  return role === 'ADMIN' || role === 'TEACHER'
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const status = searchParams.get('status')
  const where: Record<string, unknown> = {}
  if (status && (MODULE_STATUSES as readonly string[]).includes(status)) {
    where.status = status
  }

  const role = session.user.role
  const modules = await db.learningModule.findMany({
    where,
    orderBy: [{ updatedAt: 'desc' }],
    include: { _count: { select: { blocks: true } } },
  })

  const visible = canBuild(role) ? modules : modules.filter((m) => isModuleVisibleToStudents(m.status))
  return NextResponse.json(
    visible.map((m) => ({
      ...m,
      blockCount: m._count.blocks,
    }))
  )
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !canBuild(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body || typeof body.title !== 'string' || !body.title.trim()) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 })
  }

  const skill = body.skill && (MODULE_SKILLS as readonly string[]).includes(body.skill)
    ? body.skill
    : null

  // Ensure unique slug.
  const base = body.slug ? slugify(String(body.slug)) : slugify(body.title)
  let slug = base || `module-${Date.now()}`
  let i = 1
  while (await db.learningModule.findUnique({ where: { slug } })) {
    i += 1
    slug = `${base}-${i}`
  }

  const module = await db.learningModule.create({
    data: {
      title: body.title.trim(),
      slug,
      summary: body.summary || null,
      skill,
      cefrLevel: body.cefrLevel || null,
      targetBand: typeof body.targetBand === 'number' ? body.targetBand : null,
      week: typeof body.week === 'number' ? body.week : null,
      estimatedMinutes:
        typeof body.estimatedMinutes === 'number' ? body.estimatedMinutes : null,
      createdById: session.user.id,
      status: 'DRAFT',
    },
  })

  await writeAudit({
    actorId: session.user.id,
    action: 'MODULE_CREATE',
    entityType: 'MODULE',
    entityId: module.id,
    after: module,
  })

  return NextResponse.json(module, { status: 201 })
}
