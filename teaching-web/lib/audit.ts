import { db } from '@/lib/db'

type AuditInput = {
  actorId: string
  action: string
  entityType: string
  entityId: string
  before?: unknown
  after?: unknown
}

export async function writeAudit({
  actorId,
  action,
  entityType,
  entityId,
  before,
  after,
}: AuditInput) {
  return db.auditLog.create({
    data: {
      actorId,
      action,
      entityType,
      entityId,
      beforeJson: before === undefined ? null : JSON.stringify(before),
      afterJson: after === undefined ? null : JSON.stringify(after),
    },
  })
}
