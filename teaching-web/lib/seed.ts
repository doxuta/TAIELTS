import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create teacher account
  const hashedPassword = await bcrypt.hash('teacher123', 12)

  const teacher = await prisma.user.upsert({
    where: { email: 'xuantai.net@gmail.com' },
    update: {},
    create: {
      email: 'xuantai.net@gmail.com',
      name: 'Matthew',
      password: hashedPassword,
      role: 'TEACHER',
    },
  })
  console.log('✅ Teacher created:', teacher.email)

  // Create student account for Huyen Trang
  const studentPassword = await bcrypt.hash('huyentrang123', 12)

  const studentUser = await prisma.user.upsert({
    where: { email: 'huyentrang@student.meridian' },
    update: {},
    create: {
      email: 'huyentrang@student.meridian',
      name: 'Huyền Trang',
      password: studentPassword,
      role: 'STUDENT',
    },
  })
  console.log('✅ Student user created:', studentUser.email)

  // Create student profile
  const student = await prisma.student.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId: studentUser.id,
      teacherId: teacher.id,
      fullName: 'Huyền Trang',
      occupation: 'Sinh viên Luật',
      slackChannel: '#huyen-trang-ielts',
      year1Goal: 'Nền tảng tiếng Anh: ngữ pháp dùng đúng, nghe hiểu đoạn ngắn, nói 1-2 phút, đọc 200-350 từ, viết câu-đoạn có kiểm soát.',
      year2Direction: 'IELTS_ACADEMIC',
      targetBand: 6.5,
      currentMonth: 1,
      currentWeek: 1,
      currentPhase: 'YEAR1_FOUNDATION',
    },
  })
  console.log('✅ Student profile created:', student.fullName)

  // Seed a sample lesson plan
  const lessonPlan = await prisma.lessonPlan.create({
    data: {
      title: 'Giáo Án Buổi 1 — Tuần 1 Tháng 1 (Buổi A)',
      sessionNumber: 1,
      sessionType: 'A',
      week: 1,
      month: 1,
      grammarTopic: 'Thì hiện tại đơn & tiếp diễn — Nhận diện & phân biệt',
      vocabularyFocus: 'Hành động hàng ngày, thói quen, gia đình',
      warmupMin: 15,
      grammarMin: 60,
      speakingMin: 20,
      vocabMin: 25,
      reviewMin: 0,
      warmupContent: 'Chào hỏi học viên. Hỏi về kế hoạch tuần này. Ôn lại từ vựng buổi trước (nếu có).',
      mainContent: JSON.stringify({
        grammar: 'Giải thích Present Simple (S + V/Vs/es) vs Present Continuous (S + am/is/are + V-ing). Nhấn mạnh signal words: always, usually, now, at the moment. 30 câu bài tập: fill-in-the-blank + error correction.',
        speaking: 'Học viên mô tả thói quen hàng ngày bằng 5-7 câu. GV hỏi follow-up questions.',
        vocabulary: 'Ôn 20 từ chủ đề: daily routines + family relationships. Flashcard + đặt câu.',
      }),
      homework: 'Bài tập 1: Viết 10 câu về thói quen hàng ngày dùng thì hiện tại đơn.\nBài tập 2: Anki - ôn 20 từ vừa học.\nDeadline: Trước buổi B.',
      status: 'READY',
      createdById: teacher.id,
    },
  })
  console.log('✅ Sample lesson plan created')

  // Seed sample monthly rubric
  await prisma.monthlyRubric.create({
    data: {
      studentId: student.id,
      month: 1,
      year: 2026,
      grammarScore: 2.5,
      vocabularyScore: 3.0,
      listeningScore: 2.0,
      speakingScore: 2.5,
      readingScore: 2.5,
      writingScore: 2.0,
      sessionsAttended: 8,
      strongPoints: 'Có động lực học tốt. Từ vựng chủ đề gia đình khá. Phát âm các âm cơ bản ổn.',
      improvements: 'Cần ôn thêm phân biệt thì HT đơn vs HT tiếp diễn. Writing còn sơ sài.',
      nextMonthFocus: 'Thì quá khứ đơn & tiếp diễn. Kể chuyện đơn giản.',
    },
  })
  console.log('✅ Sample rubric seeded')

  console.log('\n🎉 Database seeded successfully!')
  console.log('\n📋 Tài khoản để đăng nhập:')
  console.log('  👨‍🏫 Giáo viên: xuantai.net@gmail.com / teacher123')
  console.log('  🎓 Học viên:   huyentrang@student.meridian / huyentrang123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
