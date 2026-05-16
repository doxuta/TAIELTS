export type ModuleAssignmentStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'

export interface ModuleAssignmentSummary {
  id: string
  studentId: string
  moduleId: string
  assignedById: string
  status: ModuleAssignmentStatus
  startDate: string
  dueDate: string | null
  teacherNote: string | null
  createdAt: string
  updatedAt: string
}

export interface ModuleBlockProgressSummary {
  id: string
  assignmentId: string
  blockId: string
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED'
  completedAt: string | null
  minutesSpent: number | null
}
