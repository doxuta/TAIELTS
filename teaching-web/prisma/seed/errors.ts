import { PrismaClient } from '@prisma/client'

interface ErrorSeed {
  skill: string
  category: string
  wrongVersion: string
  correctVersion: string
  explanation: string
  exampleSentence: string
  source: string
}

const COMMON_VIETNAMESE_ERRORS: ErrorSeed[] = [
  // GRAMMAR
  { skill: 'GRAMMAR', category: 'Article (a/an/the)', wrongVersion: 'I want to be lawyer.', correctVersion: 'I want to be a lawyer.', explanation: 'Tiếng Việt không có article. Khi dùng singular countable noun lần đầu, phải có "a/an".', exampleSentence: 'She is a teacher. He is an engineer.', source: 'Buổi #3' },
  { skill: 'GRAMMAR', category: 'Article (a/an/the)', wrongVersion: 'I went to library yesterday.', correctVersion: 'I went to the library yesterday.', explanation: '"The" khi nói về vật cụ thể mà cả người nói và người nghe đều biết.', exampleSentence: 'Open the door. Pass me the book.', source: 'Buổi #5' },
  { skill: 'GRAMMAR', category: 'Tense (present simple vs continuous)', wrongVersion: 'I am working at a bank.', correctVersion: 'I work at a bank.', explanation: 'Present Continuous cho hành động đang xảy ra TẠI THỜI ĐIỂM nói. Nghề nghiệp / thói quen → Present Simple.', exampleSentence: 'I work at a bank. (job) — I am working now. (right now)', source: 'Buổi #7' },
  { skill: 'GRAMMAR', category: 'Tense (past simple)', wrongVersion: 'I go to Hanoi last week.', correctVersion: 'I went to Hanoi last week.', explanation: 'Có time marker quá khứ (last week, yesterday, ago) → bắt buộc dùng Past Simple.', exampleSentence: 'I went there yesterday. She bought a new phone last month.', source: 'Buổi #9' },
  { skill: 'GRAMMAR', category: 'Subject-verb agreement', wrongVersion: 'She have many friends.', correctVersion: 'She has many friends.', explanation: 'Chủ ngữ ngôi 3 số ít (he/she/it) → động từ thêm "s" hoặc dùng "has".', exampleSentence: 'He has a car. She works hard. It rains often.', source: 'Buổi #4' },
  { skill: 'GRAMMAR', category: 'Plural noun', wrongVersion: 'I have many friend.', correctVersion: 'I have many friends.', explanation: '"many" + countable noun PLURAL. Quên "s" là lỗi rất phổ biến.', exampleSentence: 'many books, several students, three cats', source: 'Buổi #6' },
  { skill: 'GRAMMAR', category: 'Question formation', wrongVersion: 'You like coffee?', correctVersion: 'Do you like coffee?', explanation: 'Câu hỏi Yes/No với động từ thường cần "do/does/did" ở đầu.', exampleSentence: 'Do you have time? Does he speak English? Did they arrive?', source: 'Buổi #8' },
  { skill: 'GRAMMAR', category: 'Preposition', wrongVersion: 'I am interested about music.', correctVersion: 'I am interested in music.', explanation: '"interested" luôn đi với "in", không phải "about" hay "on".', exampleSentence: 'interested in, good at, afraid of, married to', source: 'Writing Task 2 Test 1' },
  { skill: 'GRAMMAR', category: 'Comparative', wrongVersion: 'He is more taller than me.', correctVersion: 'He is taller than me.', explanation: 'Tính từ ngắn (1-2 âm tiết) + "er". KHÔNG dùng "more" cùng lúc.', exampleSentence: 'taller, shorter, faster, cleaner — NOT "more tall".', source: 'Buổi #11' },
  { skill: 'GRAMMAR', category: 'Relative clause', wrongVersion: 'The man which lives next door is my uncle.', correctVersion: 'The man who lives next door is my uncle.', explanation: '"who" cho người, "which" cho vật, "that" cho cả hai.', exampleSentence: 'The book which I read. The friend who called me.', source: 'Buổi #15' },

  // VOCABULARY
  { skill: 'VOCABULARY', category: 'Word form', wrongVersion: 'The economic of Vietnam is growing.', correctVersion: 'The economy of Vietnam is growing.', explanation: '"economic" = adjective, "economy" = noun. Phân biệt rõ word class.', exampleSentence: 'The economy is strong. (noun) — Economic growth. (adj)', source: 'Writing Task 2' },
  { skill: 'VOCABULARY', category: 'Collocation', wrongVersion: 'I made a research on this topic.', correctVersion: 'I did research on this topic.', explanation: 'Đúng collocation: "do research", "make a decision", "take a break". Không hoán đổi.', exampleSentence: 'do research, make a mistake, take a photo, have a meal', source: 'Buổi #14' },
  { skill: 'VOCABULARY', category: 'False friend', wrongVersion: 'I have many homeworks.', correctVersion: 'I have a lot of homework.', explanation: '"Homework" là uncountable noun trong tiếng Anh, dù dịch tiếng Việt thấy có thể đếm được.', exampleSentence: 'a lot of homework, much information, some advice', source: 'Buổi #2' },
  { skill: 'VOCABULARY', category: 'Confusing pair', wrongVersion: 'I lent a book from the library.', correctVersion: 'I borrowed a book from the library.', explanation: '"borrow" = mượn từ ai. "lend" = cho ai mượn. Hướng ngược nhau.', exampleSentence: 'I borrow from you. You lend to me.', source: 'Buổi #10' },
  { skill: 'VOCABULARY', category: 'Word choice', wrongVersion: 'Nowadays in today\'s modern world...', correctVersion: 'Today, ...', explanation: 'Câu sáo rỗng (memorized phrase) bị examiner trừ điểm Lexical Resource. Dùng diễn đạt tự nhiên hơn.', exampleSentence: 'Today many people work remotely. (NOT "Nowadays in today\'s modern world")', source: 'Writing Task 2 Sample' },

  // PRONUNCIATION
  { skill: 'PRONUNCIATION', category: '/θ/ sound', wrongVersion: '"sink" instead of "think"', correctVersion: '/θɪŋk/ — tongue between teeth, blow air', explanation: 'Tiếng Việt không có /θ/. Đặt lưỡi giữa hai hàm răng và thổi hơi, không dùng /s/ hay /t/.', exampleSentence: 'think, three, thank, thirty, both, mouth', source: 'Buổi B #3 — phát âm' },
  { skill: 'PRONUNCIATION', category: 'Ending consonant', wrongVersion: '"wor" instead of "work"', correctVersion: '/wɜːk/ — release the /k/ clearly', explanation: 'Người Việt hay nuốt phụ âm cuối. Bài thi IELTS speaking và listening đều yêu cầu pronunciation rõ ràng.', exampleSentence: 'work, walked, played, ends, hopes', source: 'Buổi B #5' },
  { skill: 'PRONUNCIATION', category: 'Word stress', wrongVersion: 'pho-TO-graph (wrong stress)', correctVersion: 'PHO-to-graph (stress on first syllable)', explanation: '2-syllable noun thường stress ở âm đầu. 2-syllable verb thường stress ở âm sau.', exampleSentence: 'PHOto, REcord (noun) — reCORD, deCIDE (verb)', source: 'Buổi B #7' },

  // WRITING SPECIFIC
  { skill: 'WRITING', category: 'Task Achievement', wrongVersion: 'Skipping the overview paragraph in Task 1', correctVersion: 'Always include "Overall, ..." as paragraph 2', explanation: 'Không có overview → max Band 5 cho Task Achievement. Đây là tiêu chí KỲ THI BẮT BUỘC.', exampleSentence: 'Overall, all three categories increased, with smartphone ownership growing most dramatically.', source: 'Writing Task 1 Practice' },
  { skill: 'WRITING', category: 'Coherence', wrongVersion: 'Firstly... Secondly... Thirdly... Finally...', correctVersion: 'Use varied linkers: "Primarily...", "Equally important...", "A further point..."', explanation: 'Linker mechanical → Band 6 max. Examiner thấy formulaic structure là biết người viết memorized.', exampleSentence: 'The primary reason is... Equally significant is... A further consideration...', source: 'Writing Task 2 Test 2' },
]

export async function seedErrors(db: PrismaClient, studentId: string) {
  // Clear existing first
  await db.errorEntry.deleteMany({ where: { studentId } })

  const now = new Date()
  for (let i = 0; i < COMMON_VIETNAMESE_ERRORS.length; i++) {
    const e = COMMON_VIETNAMESE_ERRORS[i]
    // Spread creation dates over past 60 days
    const created = new Date(now.getTime() - (60 - i * 3) * 86_400_000)
    await db.errorEntry.create({
      data: {
        studentId,
        skill: e.skill,
        category: e.category,
        wrongVersion: e.wrongVersion,
        correctVersion: e.correctVersion,
        explanation: e.explanation,
        exampleSentence: e.exampleSentence,
        source: e.source,
        resolved: i < 5, // first 5 already resolved
        resolvedAt: i < 5 ? new Date(created.getTime() + 5 * 86_400_000) : null,
        createdAt: created,
      },
    })
  }

  console.log(`  ✓ ${COMMON_VIETNAMESE_ERRORS.length} common Vietnamese learner errors seeded`)
  return COMMON_VIETNAMESE_ERRORS.length
}
