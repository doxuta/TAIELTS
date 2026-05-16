import { getServerSession, type Session } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const ROLES = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export function isRole(value: unknown): value is Role {
  return value === ROLES.ADMIN || value === ROLES.TEACHER || value === ROLES.STUDENT
}

export function hasRole(session: Session | null, ...allowed: Role[]): boolean {
  const role = session?.user && (session.user as { role?: string }).role
  return typeof role === 'string' && (allowed as string[]).includes(role)
}

export function isAdmin(session: Session | null): boolean {
  return hasRole(session, ROLES.ADMIN)
}

export async function getSessionOrNull(): Promise<Session | null> {
  return getServerSession(authOptions)
}

export async function requireAdmin(): Promise<Session> {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session)) {
    throw new UnauthorizedError('Admin role required')
  }
  return session as Session
}

export async function requireRole(...allowed: Role[]): Promise<Session> {
  const session = await getServerSession(authOptions)
  if (!hasRole(session, ...allowed)) {
    throw new UnauthorizedError(`Role required: ${allowed.join(', ')}`)
  }
  return session as Session
}

export class UnauthorizedError extends Error {
  status = 401
  constructor(message = 'Unauthorized') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}
