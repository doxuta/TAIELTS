/**
 * TAIELTS Mega Seed — Entry Point
 *
 * Runs all seeders in order:
 *   1. Users (teacher + student)
 *   2. Vocab (~165 cards: AWL Sublist 1-2 + topic banks)
 *   3. Strategies (17 articles, all 4 skills + pronunciation)
 *   4. Sample essays (8 essays, Task 1/2, bands 6-8)
 *   5. Speaking cue cards (40 cards: P1/P2/P3)
 *   6. Mock test (1 full Cambridge-format Academic test)
 *   7. Lessons + sessions + weekly progress + journal + rubrics
 *   8. Common Vietnamese learner errors (20)
 *
 * Run: npm run db:seed
 */
import { PrismaClient } from '@prisma/client'
import { seedUsers } from './users'
import { seedVocab } from './vocab'
import { seedStrategies } from './strategies'
import { seedSampleEssays } from './sample-essays'
import { seedSpeakingCues } from './speaking-cues'
import { seedMockTest } from './mock-test'
import { seedErrors } from './errors'
import { seedLessonsProgress } from './lessons-progress'
import { seedSources } from './sources'
import { seedDemoModules } from './modules'

const db = new PrismaClient()

async function main() {
  console.log('🌱 TAIELTS Mega Seed starting...\n')

  console.log('1️⃣  Users')
  const { teacher, student } = await seedUsers(db)
  console.log(`   ✓ Teacher: ${teacher.email}`)
  console.log(`   ✓ Student: ${student.fullName} (id ${student.id})\n`)

  console.log('2️⃣  Vocabulary bank')
  await seedVocab(db, student.id)
  console.log('')

  console.log('3️⃣  Strategy articles')
  await seedStrategies(db)
  console.log('')

  console.log('4️⃣  Sample essays')
  await seedSampleEssays(db)
  console.log('')

  console.log('5️⃣  Speaking cue cards')
  await seedSpeakingCues(db)
  console.log('')

  console.log('6️⃣  Mock test (Cambridge-format Academic)')
  await seedMockTest(db)
  console.log('')

  console.log('7️⃣  Lessons + progress + journal + rubrics')
  await seedLessonsProgress(db, teacher.id, student.id)
  console.log('')

  console.log('8️⃣  Vietnamese learner errors')
  await seedErrors(db, student.id)
  console.log('')

  console.log('9️⃣  Sources (admin + sample trusted sources)')
  const { admin } = await seedSources(db)
  console.log(`   ✓ Admin: ${admin.email}\n`)

  console.log('🔟  Demo modules (published) + assignment to seeded student')
  const modulesResult = await seedDemoModules(db, admin.id, student.id)
  console.log(
    `   ✓ ${modulesResult.created} created, ${modulesResult.updated} updated of ${modulesResult.total} total\n`
  )

  console.log('🎉 Mega seed complete!\n')
  console.log('📋 Login credentials:')
  console.log('  👨‍🏫 Teacher: xuantai.net@gmail.com / teacher123')
  console.log('  🎓 Student: huyentrang@taielts.local / huyentrang123')
  console.log('  🛡  Admin:   admin@taielts.local / admin123')
  console.log('')
  console.log('🚀 Run: npm run dev → http://localhost:3001/login')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
