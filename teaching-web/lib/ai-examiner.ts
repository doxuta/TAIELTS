/**
 * Gemini-powered IELTS examiner.
 * Scores Writing Task 1/2 and Speaking transcripts against official band descriptors.
 *
 * Returns structured JSON via Gemini's responseMimeType="application/json".
 */
import { WRITING_TASK1_DESCRIPTORS, WRITING_TASK2_DESCRIPTORS, SPEAKING_DESCRIPTORS } from '@/lib/descriptors'

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

interface CriterionScore {
  band: number
  justification: string
}

export interface WritingScore {
  taskResponse: CriterionScore // TR for Task 2, TA for Task 1
  coherence: CriterionScore
  lexical: CriterionScore
  grammar: CriterionScore
  overallBand: number
  summaryFeedback: string
  improvementSuggestions: string[]
}

export interface SpeakingScore {
  fluency: CriterionScore
  lexical: CriterionScore
  grammar: CriterionScore
  pronunciation: CriterionScore
  overallBand: number
  summaryFeedback: string
  improvementSuggestions: string[]
}

async function callGemini(prompt: string): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey === '') {
    throw new Error('GEMINI_API_KEY not configured')
  }

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3, // low temp for consistent scoring
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

  return JSON.parse(text)
}

function roundToHalf(n: number): number {
  return Math.round(n * 2) / 2
}

function buildWritingTask1Prompt(prompt: string, essay: string): string {
  return `You are an experienced IELTS examiner. Score the following Writing Task 1 (Academic) response using the official 4 criteria.

OFFICIAL BAND DESCRIPTORS (key bands):
${JSON.stringify({ 9: WRITING_TASK1_DESCRIPTORS[9], 7: WRITING_TASK1_DESCRIPTORS[7], 6: WRITING_TASK1_DESCRIPTORS[6], 5: WRITING_TASK1_DESCRIPTORS[5] }, null, 2)}

Criteria:
1. Task Achievement (TA)
2. Coherence and Cohesion (CC)
3. Lexical Resource (LR)
4. Grammatical Range and Accuracy (GRA)

For each criterion: assign a band 0-9 (use .5 increments), then justify in 2-3 sentences citing specific examples from the essay.
Overall band = average of the four criteria, rounded to nearest 0.5.

PROMPT:
${prompt}

ESSAY (${essay.split(/\s+/).length} words):
${essay}

Return JSON with this exact shape:
{
  "taskResponse": { "band": 7.0, "justification": "..." },
  "coherence":    { "band": 7.0, "justification": "..." },
  "lexical":      { "band": 6.5, "justification": "..." },
  "grammar":      { "band": 6.5, "justification": "..." },
  "overallBand": 7.0,
  "summaryFeedback": "Concise 2-3 sentence overall assessment in English.",
  "improvementSuggestions": ["3 specific actionable bullet points to improve next time"]
}`
}

function buildWritingTask2Prompt(prompt: string, essay: string): string {
  return `You are an experienced IELTS examiner. Score the following Writing Task 2 essay using the official 4 criteria.

OFFICIAL BAND DESCRIPTORS (key bands):
${JSON.stringify({ 9: WRITING_TASK2_DESCRIPTORS[9], 7: WRITING_TASK2_DESCRIPTORS[7], 6: WRITING_TASK2_DESCRIPTORS[6], 5: WRITING_TASK2_DESCRIPTORS[5] }, null, 2)}

Criteria:
1. Task Response (TR) — does the essay fully address the prompt with a clear position?
2. Coherence and Cohesion (CC)
3. Lexical Resource (LR)
4. Grammatical Range and Accuracy (GRA)

For each criterion: assign a band 0-9 (use .5 increments), then justify in 2-3 sentences citing specific examples.
Overall band = average of the four criteria, rounded to nearest 0.5.

PROMPT:
${prompt}

ESSAY (${essay.split(/\s+/).length} words):
${essay}

Return JSON with this exact shape:
{
  "taskResponse": { "band": 7.0, "justification": "..." },
  "coherence":    { "band": 7.0, "justification": "..." },
  "lexical":      { "band": 6.5, "justification": "..." },
  "grammar":      { "band": 6.5, "justification": "..." },
  "overallBand": 7.0,
  "summaryFeedback": "Concise 2-3 sentence overall assessment in English.",
  "improvementSuggestions": ["3 specific actionable bullet points to improve next time"]
}`
}

function buildSpeakingPrompt(part: number, transcript: string): string {
  return `You are an experienced IELTS Speaking examiner. Score this Speaking Part ${part} transcript using the official 4 criteria.

OFFICIAL BAND DESCRIPTORS (key bands):
${JSON.stringify({ 9: SPEAKING_DESCRIPTORS[9], 7: SPEAKING_DESCRIPTORS[7], 6: SPEAKING_DESCRIPTORS[6], 5: SPEAKING_DESCRIPTORS[5] }, null, 2)}

Criteria:
1. Fluency and Coherence (FC)
2. Lexical Resource (LR)
3. Grammatical Range and Accuracy (GRA)
4. Pronunciation (P) — assess from the transcript; if no audio info, comment on word choice patterns instead

Note: Transcript only (no audio). For pronunciation, judge based on word choices that suggest comfort with English phonology — if unclear, default to a band consistent with the other 3 criteria.

For each criterion: band 0-9 (.5 increments), 2-3 sentence justification.
Overall band = average rounded to nearest 0.5.

TRANSCRIPT (${transcript.split(/\s+/).length} words):
${transcript}

Return JSON with this exact shape:
{
  "fluency":       { "band": 7.0, "justification": "..." },
  "lexical":       { "band": 7.0, "justification": "..." },
  "grammar":       { "band": 6.5, "justification": "..." },
  "pronunciation": { "band": 6.5, "justification": "..." },
  "overallBand": 7.0,
  "summaryFeedback": "Concise 2-3 sentence overall assessment in English.",
  "improvementSuggestions": ["3 specific actionable bullet points"]
}`
}

export async function scoreWritingTask1(prompt: string, essay: string): Promise<WritingScore> {
  const parsed = await callGemini(buildWritingTask1Prompt(prompt, essay))
  parsed.overallBand = roundToHalf(parsed.overallBand)
  return parsed
}

export async function scoreWritingTask2(prompt: string, essay: string): Promise<WritingScore> {
  const parsed = await callGemini(buildWritingTask2Prompt(prompt, essay))
  parsed.overallBand = roundToHalf(parsed.overallBand)
  return parsed
}

export async function scoreSpeakingTranscript(part: 1 | 2 | 3, transcript: string): Promise<SpeakingScore> {
  const parsed = await callGemini(buildSpeakingPrompt(part, transcript))
  parsed.overallBand = roundToHalf(parsed.overallBand)
  return parsed
}
