import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function seedSources(db: PrismaClient) {
  const adminPwd = await bcrypt.hash('admin123', 12)
  const admin = await db.user.upsert({
    where: { email: 'admin@taielts.local' },
    update: { role: 'ADMIN' },
    create: {
      email: 'admin@taielts.local',
      name: 'TA Admin',
      password: adminPwd,
      role: 'ADMIN',
    },
  })

  const samples = [
    {
      key: 'cambridge-dictionary',
      data: {
        type: 'DICTIONARY',
        title: 'Cambridge Dictionary',
        provider: 'Cambridge University Press',
        url: 'https://dictionary.cambridge.org/',
        description: 'Từ điển Anh-Anh có IPA, ví dụ và collocations theo CEFR.',
        trustLevel: 'A_OFFICIAL',
        licenseStatus: 'LINK_ONLY',
        reviewStatus: 'APPROVED',
        cefrLevel: 'A1',
        skills: 'VOCABULARY,PRONUNCIATION',
        topics: 'dictionary',
      },
      routes: [
        {
          routeType: 'URL',
          displayLabel: 'Tra từ trên Cambridge',
          learnerInstruction: 'Đọc định nghĩa Anh-Anh + nghe IPA trước khi học.',
        },
      ],
    },
    {
      key: 'bbc-6-minute-english',
      data: {
        type: 'PODCAST',
        title: 'BBC 6 Minute English',
        provider: 'BBC Learning English',
        url: 'https://www.bbc.co.uk/learningenglish/english/features/6-minute-english',
        description: 'Podcast 6 phút có transcript miễn phí cho luyện nghe B1-B2.',
        trustLevel: 'A_OFFICIAL',
        licenseStatus: 'LINK_ONLY',
        reviewStatus: 'APPROVED',
        cefrLevel: 'B1',
        targetBand: 6.0,
        skills: 'LISTENING,VOCABULARY',
        topics: 'listening,podcast',
      },
      routes: [
        {
          routeType: 'URL',
          displayLabel: 'Mở danh sách tập mới nhất',
          learnerInstruction: 'Nghe 1 lần không transcript, lần 2 có transcript, viết 3 collocations mới.',
        },
      ],
    },
    {
      key: 'oxford-3000',
      data: {
        type: 'WEB',
        title: 'Oxford 3000 Word List',
        provider: 'Oxford Learner’s Dictionaries',
        url: 'https://www.oxfordlearnersdictionaries.com/wordlists/oxford3000-5000',
        description: 'Danh sách 3000 từ vựng nền tảng A1-B2 do Oxford biên soạn.',
        trustLevel: 'A_OFFICIAL',
        licenseStatus: 'LINK_ONLY',
        reviewStatus: 'APPROVED',
        cefrLevel: 'A1',
        skills: 'VOCABULARY',
        topics: 'wordlist,foundation',
      },
      routes: [
        {
          routeType: 'URL',
          displayLabel: 'Mở Oxford 3000',
          learnerInstruction: 'Lọc theo CEFR đang học, lấy 10 từ mới mỗi tuần.',
        },
      ],
    },
  ] as const

  for (const sample of samples) {
    const existing = await db.source.findFirst({
      where: { title: sample.data.title, provider: sample.data.provider ?? undefined },
    })
    const source = existing
      ? await db.source.update({
          where: { id: existing.id },
          data: { ...sample.data, createdById: admin.id, reviewedById: admin.id, lastVerifiedAt: new Date() },
        })
      : await db.source.create({
          data: {
            ...sample.data,
            createdById: admin.id,
            reviewedById: admin.id,
            lastVerifiedAt: new Date(),
          },
        })

    for (const route of sample.routes) {
      const existingRoute = await db.sourceRoute.findFirst({
        where: { sourceId: source.id, displayLabel: route.displayLabel },
      })
      if (!existingRoute) {
        await db.sourceRoute.create({
          data: { sourceId: source.id, ...route },
        })
      }
    }
  }

  return { admin }
}
