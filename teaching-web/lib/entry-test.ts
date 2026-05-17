/**
 * AI-generated entry test. Tailored to self-declared CEFR level.
 *
 * Output is a structured JSON test bank:
 * - 6 grammar MCQ (auto-score by index match)
 * - 4 reading comprehension MCQ tied to a short passage (auto-score)
 * - 1 writing prompt (AI-scored via existing examiner)
 * - 1 speaking prompt (AI-scored via existing examiner)
 *
 * Total time: ~20-30 minutes.
 */
import { GEMINI_MODEL } from '@/lib/ai-examiner'

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

export type SelfLevel = 'NONE' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1_PLUS'

export interface MCQ {
  id: string
  prompt: string
  options: string[]
  correct: number // index 0-3
  explanation?: string
}

export interface ReadingSection {
  passage: string
  questions: MCQ[]
}

export interface GeneratedEntryTest {
  level: SelfLevel
  grammar: MCQ[]
  reading: ReadingSection
  writing: { prompt: string; minWords: number }
  speaking: { prompt: string; minSeconds: number }
}

export interface EntryAnswers {
  grammar: number[] // index per question, length = grammar.length, -1 if unanswered
  reading: number[]
  writingText: string
  speakingTranscript: string
}

export interface EntryScore {
  grammarScore: number // /20
  readingScore: number // /20
  writingScore: number // 0-9 IELTS band
  speakingScore: number // 0-9 IELTS band
  overallScore: number // /20
  recommendedMonth: number // 1-12
}

/**
 * Map IELTS-like overall (0-20) to a starting month in Year-1 roadmap (1-12).
 */
export function overallToMonth(overall: number): number {
  if (overall < 4) return 1
  if (overall < 6) return 2
  if (overall < 8) return 3
  if (overall < 10) return 4
  if (overall < 12) return 6
  if (overall < 14) return 8
  if (overall < 16) return 10
  return 11
}

const LEVEL_HINT: Record<SelfLevel, string> = {
  NONE: 'absolute beginner — basic alphabet, single words, present-simple only',
  A1: 'A1 — common greetings, family vocabulary, very short sentences',
  A2: 'A2 — everyday topics, past simple, simple connectors',
  B1: 'B1 — present perfect, conditionals 1-2, opinion paragraphs',
  B2: 'B2 — advanced tenses, passive, complex sentence structures',
  C1_PLUS: 'C1+ — academic writing register, IELTS Band 6.5+ prep',
}

function buildPrompt(level: SelfLevel): string {
  return `You are creating an English placement test for a Vietnamese learner who self-reports level "${level}" (${LEVEL_HINT[level]}).

Your output is STRICT JSON matching this TypeScript type exactly:
{
  grammar: { id: string; prompt: string; options: string[4]; correct: 0|1|2|3; explanation?: string }[] // exactly 6 items
  reading: {
    passage: string // 120-180 words, level-appropriate, neutral topic
    questions: { id: string; prompt: string; options: string[4]; correct: 0|1|2|3; explanation?: string }[] // exactly 4 items
  }
  writing: { prompt: string; minWords: number }
  speaking: { prompt: string; minSeconds: number }
}

Rules:
- Grammar items test discrete points appropriate for level "${level}". Avoid tricks. Each prompt has a single clearly correct answer.
- Reading passage and questions match the same level. Passage must be self-contained, no external knowledge.
- Writing prompt: for NONE/A1/A2, ask for a short personal paragraph (60-80 words). For B1+, an opinion paragraph (100-150 words). For C1_PLUS, an IELTS Task 2 mini-essay (180-220 words).
- Speaking prompt: for NONE/A1/A2, ask one short personal question (30s). For B1/B2, a topic with 2 bullet points (60s). For C1_PLUS, IELTS Speaking Part 2 cue card (90s).
- ALL prompts and passages in English; explanations and option text in English. The student is Vietnamese but the test is in English to measure actual ability.
- Do NOT include any markdown. Do NOT include trailing commas. Return ONLY the JSON object.`
}

/**
 * Generate a deterministic mock test when AI_MOCK=1, otherwise call Gemini.
 */
export async function generateEntryTest(level: SelfLevel): Promise<GeneratedEntryTest> {
  if (process.env.AI_MOCK === '1') {
    return buildMockTest(level)
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey === '') {
    throw new Error('GEMINI_API_KEY not configured')
  }

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(level) }] }],
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`Gemini API error ${res.status}: ${errBody}`)
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Empty Gemini response')
  const parsed = JSON.parse(text)
  return { level, ...parsed }
}

/**
 * Compute auto-scored grammar + reading. Returns raw counts.
 * Writing + speaking are scored separately by the AI examiner.
 */
export function scoreObjective(test: GeneratedEntryTest, answers: EntryAnswers) {
  const grammarCorrect = test.grammar.reduce(
    (n, q, i) => n + (answers.grammar[i] === q.correct ? 1 : 0),
    0
  )
  const readingCorrect = test.reading.questions.reduce(
    (n, q, i) => n + (answers.reading[i] === q.correct ? 1 : 0),
    0
  )
  // Normalize to /20
  const grammarScore = (grammarCorrect / test.grammar.length) * 20
  const readingScore = (readingCorrect / test.reading.questions.length) * 20
  return { grammarCorrect, readingCorrect, grammarScore, readingScore }
}

/**
 * Combine objective + writing + speaking into a single /20 score.
 * Weights: grammar 25%, reading 25%, writing 25%, speaking 25%.
 * Writing/speaking come in IELTS band 0-9 — normalize to /20.
 */
export function combineScores({
  grammarScore,
  readingScore,
  writingBand,
  speakingBand,
}: {
  grammarScore: number // /20
  readingScore: number // /20
  writingBand: number // 0-9
  speakingBand: number // 0-9
}): EntryScore {
  const writingScore = (writingBand / 9) * 20
  const speakingScore = (speakingBand / 9) * 20
  const overallScore = (grammarScore + readingScore + writingScore + speakingScore) / 4
  return {
    grammarScore,
    readingScore,
    writingScore: writingBand,
    speakingScore: speakingBand,
    overallScore,
    recommendedMonth: overallToMonth(overallScore),
  }
}

// ---------------- Mock fixtures (AI_MOCK=1) ----------------

function buildMockTest(level: SelfLevel): GeneratedEntryTest {
  const mcq = (id: string, prompt: string, options: string[], correct: number, explanation?: string): MCQ => ({
    id,
    prompt,
    options,
    correct,
    explanation,
  })

  return {
    level,
    grammar: [
      mcq('g1', 'She ___ to school every day.', ['go', 'goes', 'going', 'went'], 1, 'Third-person singular present simple.'),
      mcq('g2', 'I ___ a book yesterday.', ['buy', 'buys', 'bought', 'buying'], 2, 'Past simple of "buy".'),
      mcq('g3', 'There ___ many people at the party.', ['was', 'were', 'is', 'be'], 1, '"many people" is plural.'),
      mcq('g4', 'If it rains, we ___ at home.', ['stay', 'stays', 'will stay', 'stayed'], 2, 'First conditional.'),
      mcq('g5', 'He has been working here ___ five years.', ['since', 'for', 'in', 'during'], 1, '"for" + duration.'),
      mcq('g6', 'The book ___ by millions of readers.', ['read', 'has read', 'has been read', 'reads'], 2, 'Present perfect passive.'),
    ],
    reading: {
      passage:
        'Maria moved to Hanoi three years ago. At first, she found everything difficult — the language, the food, even the weather. But after a few months, she began to enjoy the city. She made friends at her office and learned a few Vietnamese phrases. Today, Maria says she cannot imagine living anywhere else. She still misses her family back in Spain, but she visits them every summer.',
      questions: [
        mcq('r1', 'How long ago did Maria move to Hanoi?', ['One year', 'Three years', 'Five years', 'Last summer'], 1),
        mcq('r2', 'What did Maria find difficult at first?', ['Only the food', 'Only the language', 'Many things', 'Her job'], 2),
        mcq('r3', 'Maria visits her family ___', ['every weekend', 'every month', 'every summer', 'every two years'], 2),
        mcq('r4', 'Which best describes Maria now?', ['She wants to leave Hanoi', 'She is settled in Hanoi', 'She has no friends', 'She speaks Vietnamese fluently'], 1),
      ],
    },
    writing: {
      prompt:
        level === 'NONE' || level === 'A1' || level === 'A2'
          ? 'Write about your daily routine. What time do you wake up? What do you eat? Where do you work or study? (60-80 words)'
          : level === 'C1_PLUS'
          ? 'Some people think that universities should focus on practical skills, while others believe they should emphasize academic knowledge. Discuss both views and give your opinion. (180-220 words)'
          : 'Do you prefer reading paper books or e-books? Explain your reasons. (100-150 words)',
      minWords: level === 'C1_PLUS' ? 180 : level === 'NONE' || level === 'A1' ? 50 : 100,
    },
    speaking: {
      prompt:
        level === 'NONE' || level === 'A1' || level === 'A2'
          ? 'Talk about your family for 30 seconds.'
          : level === 'C1_PLUS'
          ? 'Describe a place where you learned something important. You should say: where it was, what you learned, who taught you, and why it was important. (Speak 60-90 seconds.)'
          : 'Describe a hobby you enjoy. You should say what it is, when you started, and why you like it. (Speak about 60 seconds.)',
      minSeconds: level === 'C1_PLUS' ? 60 : 30,
    },
  }
}
