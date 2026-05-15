import { PrismaClient } from '@prisma/client'

export async function seedLessonsProgress(db: PrismaClient, teacherId: string, studentId: string) {
  // ============== LESSON PLANS — 6 plans (2 weeks × 3 sessions A/B/C) ==============
  // Clean existing teacher lesson plans
  await db.lessonPlan.deleteMany({ where: { createdById: teacherId } })

  const lessons = [
    {
      title: 'Buổi 1 — Tuần 1 Tháng 1 (Buổi A)',
      sessionNumber: 1, sessionType: 'A', week: 1, month: 1,
      grammarTopic: 'Present Simple & Present Continuous — Nhận diện & phân biệt',
      vocabularyFocus: 'Daily routines, family relationships',
      warmupMin: 15, grammarMin: 60, speakingMin: 20, vocabMin: 25, reviewMin: 0,
      warmupContent: 'Chào hỏi học viên, giới thiệu lộ trình 12 tháng, hỏi về kế hoạch tuần.',
      mainContent: JSON.stringify({
        grammar: 'Giải thích Present Simple (S + V/Vs/es) cho thói quen, sự thật chung. Present Continuous (S + am/is/are + V-ing) cho hành động ĐANG xảy ra. Signal words: always, usually, every day vs now, at the moment. 25 câu fill-in-the-blank.',
        speaking: 'Học viên mô tả routine một ngày bằng 5-7 câu, dùng Present Simple. GV hỏi follow-up: "What are you doing now?"',
        vocabulary: '15 từ chủ đề daily routines (wake up, commute, attend...), 5 từ về family (sibling, in-law). Flashcard + đặt câu.',
      }),
      homework: '1) Viết 10 câu Present Simple về thói quen + 5 câu Present Continuous về việc đang làm. 2) Anki 20 từ. Deadline: Trước Buổi B.',
      status: 'COMPLETED',
    },
    {
      title: 'Buổi 2 — Tuần 1 Tháng 1 (Buổi B)',
      sessionNumber: 2, sessionType: 'B', week: 1, month: 1,
      listeningFocus: 'Hiểu thông tin cá nhân, số điện thoại, địa chỉ', speakingFocus: 'Tự giới thiệu', vocabularyFocus: 'Family, jobs',
      warmupMin: 10, listeningMin: 45, speakingMin: 50, pronunciationMin: 15, reviewMin: 10,
      warmupContent: 'Ôn 5 từ tuần này, kiểm tra bài tập.',
      mainContent: JSON.stringify({
        listening: 'Nghe 3 đoạn ngắn (1-2 phút mỗi) về tự giới thiệu. Lần 1: ý chính. Lần 2: gap-fill (10 câu). Lần 3: đọc transcript, hỏi vocab.',
        speaking: 'Học viên tự giới thiệu 1 phút, ghi âm. Sau đó nghe lại + GV chỉ ra 3 điểm cần sửa. Lặp lại.',
        pronunciation: 'Ending consonants /s/, /z/, /d/, /t/. Practice: "works", "needs", "asked", "wanted". 10 phút drill minimal pairs.',
      }),
      homework: '1) Ghi âm 1 phút tự giới thiệu, gửi vào Slack. 2) Nghe lại transcript Section 1 Test Cambridge 18. 3) Phát âm 20 từ ending /s/-/z/.',
      status: 'COMPLETED',
    },
    {
      title: 'Buổi 3 — Tuần 1 Tháng 1 (Buổi C)',
      sessionNumber: 3, sessionType: 'C', week: 1, month: 1,
      readingFocus: 'Tìm thông tin chính trong đoạn 200 từ', writingFocus: 'Câu đơn / câu ghép cơ bản', vocabularyFocus: 'Daily life topic',
      warmupMin: 10, readingMin: 50, writingMin: 50, vocabMin: 10,
      warmupContent: 'Ôn từ vựng, kiểm tra bài tập Buổi B.',
      mainContent: JSON.stringify({
        reading: 'Đoạn 200 từ về "A typical day in Hanoi". Lần 1: đọc lướt → ý chính. Lần 2: 5 câu T/F. 3) Câu hỏi vocab in context.',
        writing: 'Học viên viết đoạn 80-100 từ về "My daily routine". Khung: Topic sentence → 2 supporting → concluding. GV sửa từng câu.',
        vocabulary: '5 collocations từ bài đọc (e.g., "go to work", "have lunch", "spend time").',
      }),
      homework: '1) Đọc 1 đoạn ngắn về chủ đề tương tự (BBC Learning English). 2) Viết lại đoạn vừa viết sau khi GV sửa. 3) Add 10 từ mới vào Anki.',
      status: 'COMPLETED',
    },
    {
      title: 'Buổi 4 — Tuần 2 Tháng 1 (Buổi A)',
      sessionNumber: 4, sessionType: 'A', week: 2, month: 1,
      grammarTopic: 'Past Simple — Verbs to be & regular/irregular verbs',
      vocabularyFocus: 'Past activities, travel verbs',
      warmupMin: 15, grammarMin: 60, speakingMin: 20, vocabMin: 25, reviewMin: 0,
      warmupContent: 'Kiểm tra homework, ôn 5 từ Buổi C.',
      mainContent: JSON.stringify({
        grammar: 'Past Simple: was/were + V-ed (regular) hoặc V2 (irregular). Common irregular verbs: go-went, see-saw, eat-ate, take-took. 30 câu drill.',
        speaking: 'Học viên kể về kỳ nghỉ gần nhất bằng 7-10 câu Past Simple. GV sửa lỗi tense.',
        vocabulary: '15 verb irregular phổ biến + 5 từ về travel (destination, journey, accommodation).',
      }),
      homework: '1) Viết 10 câu Past Simple về tuần trước. 2) Học thuộc 30 irregular verbs (gửi danh sách). 3) Anki ôn từ.',
      status: 'READY',
    },
    {
      title: 'Buổi 5 — Tuần 2 Tháng 1 (Buổi B)',
      sessionNumber: 5, sessionType: 'B', week: 2, month: 1,
      listeningFocus: 'Section 1 IELTS Listening — form completion', speakingFocus: 'Past experiences', vocabularyFocus: 'Travel & places',
      warmupMin: 10, listeningMin: 45, speakingMin: 50, pronunciationMin: 15, reviewMin: 10,
      warmupContent: 'Ôn từ vựng tuần, kiểm tra bài tập.',
      mainContent: JSON.stringify({
        listening: 'Cambridge IELTS 18 Test 1 Listening Section 1 (10 câu). Lần 1 không nhìn transcript. Lần 2 + sửa. Lần 3 + đọc transcript.',
        speaking: 'Kể về 1 chuyến đi đáng nhớ — 2 phút. Format Part 2 cue card. Ghi âm, nghe lại, sửa.',
        pronunciation: 'Word stress — 2-syllable nouns vs verbs (PREsent vs preSENT). 10 phút drill.',
      }),
      homework: '1) Nghe lại Section 1 + viết tóm tắt 5 câu. 2) Ghi âm Part 2 cue card "A holiday you enjoyed". 3) Phát âm 15 word-pair có stress khác nhau.',
      status: 'READY',
    },
    {
      title: 'Buổi 6 — Tuần 2 Tháng 1 (Buổi C)',
      sessionNumber: 6, sessionType: 'C', week: 2, month: 1,
      readingFocus: 'T/F/NG questions — đoạn 300 từ', writingFocus: 'Đoạn văn 100-150 từ kể chuyện', vocabularyFocus: 'Past events & feelings',
      warmupMin: 10, readingMin: 50, writingMin: 50, vocabMin: 10,
      warmupContent: 'Ôn từ + kiểm tra bài tập.',
      mainContent: JSON.stringify({
        reading: 'Đoạn 300 từ về "My most memorable trip". 8 câu T/F/NG. Giảng kỹ phân biệt False vs Not Given.',
        writing: 'Viết đoạn 100-150 từ kể về một sự kiện đáng nhớ. Past Simple + connectors (first, then, after that, finally).',
        vocabulary: '5 collocations cho narration: "an unforgettable experience", "out of the blue", "make memories".',
      }),
      homework: '1) Tìm 1 đoạn 200-300 từ trên BBC, tự đặt 5 câu T/F/NG. 2) Viết lại đoạn vừa viết sau khi GV sửa. 3) Anki 10 từ mới.',
      status: 'DRAFT',
    },
  ]

  for (const l of lessons) {
    await db.lessonPlan.create({ data: { ...l, createdById: teacherId } })
  }

  // ============== LESSON SESSIONS — 4 attended sessions ==============
  await db.lessonSession.deleteMany({ where: { studentId } })
  const today = new Date()
  const sessionData = [
    { week: 1, month: 1, sessionType: 'A', daysAgo: 21, attended: true, quality: 4, attitude: 5, comprehension: 3 },
    { week: 1, month: 1, sessionType: 'B', daysAgo: 19, attended: true, quality: 3, attitude: 4, comprehension: 3 },
    { week: 1, month: 1, sessionType: 'C', daysAgo: 17, attended: true, quality: 4, attitude: 4, comprehension: 4 },
    { week: 2, month: 1, sessionType: 'A', daysAgo: 14, attended: true, quality: 4, attitude: 5, comprehension: 4 },
    { week: 2, month: 1, sessionType: 'B', daysAgo: 12, attended: false, quality: null as any, attitude: null as any, comprehension: null as any },
    { week: 2, month: 1, sessionType: 'C', daysAgo: 10, attended: true, quality: 4, attitude: 5, comprehension: 4 },
  ]
  for (const s of sessionData) {
    await db.lessonSession.create({
      data: {
        studentId,
        week: s.week,
        month: s.month,
        sessionType: s.sessionType,
        date: new Date(today.getTime() - s.daysAgo * 86_400_000),
        attended: s.attended,
        quality: s.quality,
        attitude: s.attitude,
        comprehension: s.comprehension,
        grammarDone: s.sessionType === 'A',
        vocabDone: s.sessionType === 'A' || s.sessionType === 'C',
        listeningDone: s.sessionType === 'B',
        speakingDone: s.sessionType === 'B',
        readingDone: s.sessionType === 'C',
        writingDone: s.sessionType === 'C',
        homeworkDone: s.attended,
      },
    })
  }

  // ============== WEEKLY PROGRESS — 3 weeks ==============
  await db.weeklyProgress.deleteMany({ where: { studentId } })
  const weeklyData = [
    { week: 1, month: 1, sessionsCompleted: 3, newWords: 35, highlights: 'Phân biệt được Present Simple vs Continuous. Phát âm cải thiện.', challenges: 'Nghe Section 1 còn miss số điện thoại.', teacherNote: 'Tiến bộ tốt tuần đầu. Tiếp tục focus listening.' },
    { week: 2, month: 1, sessionsCompleted: 2, newWords: 28, highlights: 'Viết được đoạn 120 từ về chuyến đi. Past Simple ổn.', challenges: 'Vắng Buổi B do ốm. Cần catch up listening practice.', teacherNote: 'Catch up nhanh trong Buổi C.' },
    { week: 3, month: 1, sessionsCompleted: 0, newWords: 15, highlights: 'Đang trong giai đoạn nghỉ giữa kỳ.', challenges: 'Cần duy trì Anki hàng ngày.', teacherNote: 'Tuần này tự học. Mong sẽ hoàn thành 50 cards.' },
  ]
  for (const w of weeklyData) {
    await db.weeklyProgress.upsert({
      where: { studentId_week_year: { studentId, week: w.week, year: 2026 } },
      update: { ...w },
      create: { studentId, year: 2026, ...w },
    })
  }

  // ============== JOURNAL ENTRIES ==============
  await db.journalEntry.deleteMany({ where: { studentId } })
  const journalData = [
    { week: 1, month: 1, quarter: 1, entryType: 'WEEKLY', content: 'Tuần đầu khá vui. Học được nhiều từ mới. Hơi run khi speaking nhưng GV động viên rất nhiều.', teacherNote: 'Động lực cao, tiếp tục giữ năng lượng này.' },
    { week: 1, month: 1, quarter: 1, entryType: 'MILESTONE', content: 'Hoàn thành buổi học đầu tiên!', milestone: 'Buổi học #1', teacherNote: null },
    { week: 2, month: 1, quarter: 1, entryType: 'WEEKLY', content: 'Past Simple làm tôi đau đầu với irregular verbs. Phải học thuộc 30 từ trong 1 tuần.', teacherNote: 'Hãy chia nhỏ 30 từ thành 5 từ/ngày qua Anki. Dễ thở hơn.' },
    { week: 2, month: 1, quarter: 1, entryType: 'TEACHER_NOTE', content: 'Note từ GV: Phát âm /θ/ đã cải thiện rõ rệt sau 2 tuần luyện. Tiếp tục drill 5 phút/ngày.', teacherNote: 'Pronunciation progress note' },
    { week: 3, month: 1, quarter: 1, entryType: 'WEEKLY', content: 'Tuần nghỉ. Tự học Anki + nghe podcast 10 phút/ngày. Cảm thấy giữ được nhịp.', teacherNote: null },
    { week: 4, month: 1, quarter: 1, entryType: 'MILESTONE', content: 'Đọc được đoạn 300 từ và trả lời đúng 7/8 câu T/F/NG!', milestone: 'Reading 7/8', teacherNote: 'Tuyệt vời! T/F/NG là một trong những loại câu khó nhất.' },
  ]
  for (const j of journalData) {
    await db.journalEntry.create({ data: { studentId, ...j } })
  }

  // ============== MONTHLY RUBRIC ==============
  await db.monthlyRubric.upsert({
    where: { studentId_month_year: { studentId, month: 1, year: 2026 } },
    update: {},
    create: {
      studentId, month: 1, year: 2026,
      grammarScore: 2.5, vocabularyScore: 3.0, listeningScore: 2.0,
      speakingScore: 2.5, readingScore: 3.0, writingScore: 2.0,
      sessionsAttended: 5,
      strongPoints: 'Động lực học cao. Từ vựng chủ đề gia đình, daily routine ổn. Phát âm /θ/, /s/, /z/ đã cải thiện. Đọc hiểu ở mức B1.',
      improvements: 'Listening Section 1 còn miss số/spelling. Writing còn câu đơn nhiều, ít câu phức. Past Simple irregular verbs chưa thuộc hết.',
      nextMonthFocus: 'Listening Section 1-2, Past Continuous, viết câu phức + connectors, build vocab travel/places.',
    },
  })

  console.log(`  ✓ 6 lessons + 6 sessions + 3 weekly progress + 6 journal + 1 rubric seeded`)
}
