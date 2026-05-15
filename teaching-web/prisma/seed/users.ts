import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function seedUsers(db: PrismaClient) {
  const teacherPwd = await bcrypt.hash('teacher123', 12)
  const studentPwd = await bcrypt.hash('huyentrang123', 12)

  const teacher = await db.user.upsert({
    where: { email: 'xuantai.net@gmail.com' },
    update: {},
    create: {
      email: 'xuantai.net@gmail.com',
      name: 'Matthew',
      password: teacherPwd,
      role: 'TEACHER',
    },
  })

  const studentUser = await db.user.upsert({
    where: { email: 'huyentrang@taielts.local' },
    update: {},
    create: {
      email: 'huyentrang@taielts.local',
      name: 'Huyền Trang',
      password: studentPwd,
      role: 'STUDENT',
    },
  })

  const student = await db.student.upsert({
    where: { userId: studentUser.id },
    update: { teacherId: teacher.id },
    create: {
      userId: studentUser.id,
      teacherId: teacher.id,
      fullName: 'Huyền Trang',
      occupation: 'Sinh viên Luật',
      slackChannel: '#huyen-trang-ielts',
      year1Goal:
        'Nền tảng tiếng Anh: ngữ pháp dùng đúng, nghe hiểu đoạn ngắn, nói 1-2 phút, đọc 200-350 từ, viết câu-đoạn có kiểm soát.',
      year2Direction: 'IELTS_ACADEMIC',
      targetBand: 6.5,
      currentMonth: 1,
      currentWeek: 1,
      currentPhase: 'YEAR1_FOUNDATION',
    },
  })

  // Initialize streak record
  await db.streakRecord.upsert({
    where: { studentId: student.id },
    update: {},
    create: { studentId: student.id, currentStreak: 0, longestStreak: 0, totalXP: 0, freezeCount: 2 },
  })

  return { teacher, studentUser, student }
}
