import { PrismaClient } from '@prisma/client'

interface Strategy {
  slug: string
  skill: string
  band: number
  title: string
  summary: string
  content: string
  tags?: string
  readingTimeMin: number
}

const STRATEGIES: Strategy[] = [
  // ============ LISTENING ============
  {
    slug: 'listening-section-1-strategies',
    skill: 'LISTENING',
    band: 5,
    title: 'Listening Section 1 — Mastering Form Completion',
    summary: 'Section 1 is a conversation in a social context (e.g., booking a hotel). 10 questions, mostly form-filling. The easiest section — aim for 9-10/10.',
    content: `Section 1 of the IELTS Listening test is your chance to bank easy marks. It's a phone conversation in everyday situations like booking accommodation, ordering a service, or making travel arrangements. The answers are usually concrete details: numbers, names, dates, addresses, prices.

## 5 Rules for Section 1

1. **Read the form FIRST.** You have 30 seconds before each section. Use it to predict what TYPE of answer fits each gap: noun? number? date? name?

2. **Watch for common traps in numbers**
   - "Fifteen" vs "fifty" — the speaker will often correct themselves: "It's fifty — sorry, fifteen pounds."
   - Always wait until the speaker FINISHES before writing.

3. **Spelling matters**
   - Names will be spelled out: "K-A-T-H-E-R-Y-N, Katheryn with a Y."
   - Listen for letter pairs that sound similar: M/N, B/P/D, S/F.

4. **Watch the word limit**
   - "NO MORE THAN TWO WORDS" means 1 or 2 words.
   - "ONE WORD AND/OR A NUMBER" means a single word, OR a number, OR both (e.g., "Room 12B").

5. **The answer is rarely the FIRST thing you hear**
   - Speakers often state a wrong option first, then correct: "Tuesday — actually, no, Thursday."
   - Wait for confirmation words like "right", "okay", "yes that's correct."

## Most Common Section 1 Topics

- Booking forms (hotel, gym, course)
- Insurance / banking inquiries
- Lost property reports
- Tour or transport bookings

## Practice Drill (Daily)

Listen to a 2-minute Cambridge Section 1 audio, pause every 20 seconds and write what you heard verbatim. This trains your phonological memory and spelling.`,
    tags: 'listening,form-completion,section-1',
    readingTimeMin: 4,
  },
  {
    slug: 'listening-map-labelling',
    skill: 'LISTENING',
    band: 6,
    title: 'Mastering Map & Plan Labelling',
    summary: 'Map questions appear in Section 2 of Listening. Common in 2025-2026 tests. Learn the direction vocab and follow the speaker\'s perspective.',
    content: `Map/plan labelling is one of the trickier listening question types because you need to track a SPATIAL description in real time. Top students get 8-10/10; weaker students may miss all 4-5 questions.

## Essential Direction Vocabulary

| English | Vietnamese |
|---|---|
| next to / beside / adjacent to | bên cạnh |
| opposite / facing | đối diện |
| across from | đối diện qua đường |
| in front of / before | trước mặt |
| behind | đằng sau |
| between A and B | giữa A và B |
| on the corner of X and Y | góc đường X và Y |
| at the end of | cuối |
| at the far end | cuối xa |
| to the left/right of | bên trái/phải của |
| straight ahead | thẳng phía trước |
| go past / pass | đi qua |
| turn left/right | rẽ trái/phải |

## 4-Step Method

1. **Orient yourself.** Find the starting point on the map (usually marked "Entrance" or "You are here"). Note North.

2. **Read all labels FIRST.** Numbered locations are marked but unlabelled. Your job is to match labels (A-H or 1-10) to locations.

3. **Track in real time with your finger.** As the speaker describes "go past the cafeteria, turn left at the library...", physically trace the route. Don't try to remember.

4. **Use process of elimination.** If you missed one answer, narrow down from remaining options by location.

## Common Trap: Speakers change their mind

"The gift shop is just behind the entrance — actually no, sorry, I'm thinking of last year's layout. It's now next to the cafe."

ALWAYS wait for the final position before writing.`,
    tags: 'listening,map,labelling,direction',
    readingTimeMin: 5,
  },
  {
    slug: 'listening-mcq-distractor-traps',
    skill: 'LISTENING',
    band: 7,
    title: 'Beating MCQ Distractors in Listening',
    summary: 'Multiple choice in Listening (especially Section 3) uses sophisticated distractors. Learn the 3 main trap types and how to avoid them.',
    content: `Listening MCQ is harder than Reading MCQ because you can't re-read. The test designers craft 2 wrong options that SOUND right. Here are the 3 most common distractor strategies.

## Trap 1 — The "Mentioned but wrong" Distractor

The speaker MENTIONS option A's keywords, but answers something different.

Example:
- Q: "What does the student want to study?"
- (A) Economics  (B) Marketing  (C) Statistics
- Audio: "I was thinking of doing **economics**, but my real passion is **marketing** — so that's what I'll go for."
- ❌ Test-takers hear "economics" first and panic-pick A.
- ✅ The answer is B.

**Fix**: Listen for FINAL position. Words like "actually", "in the end", "but I decided" signal a change.

## Trap 2 — The "Paraphrased Right" Distractor

The correct answer NEVER uses the exact wording of the options.

Example:
- (A) The course is too expensive
- (B) The schedule conflicts with work
- (C) The location is inconvenient
- Audio: "I work full-time, so I can't fit this into my week."
- ✅ Answer: B. (Note "schedule conflicts with work" was paraphrased as "I work full-time, can't fit into my week.")

**Fix**: Don't wait for option vocabulary. Listen for MEANING.

## Trap 3 — The "Partial Match" Distractor

Two options share half the wording. One says "increased significantly", the other says "increased moderately".

**Fix**: Listen for QUANTIFIERS. Words like "slightly", "dramatically", "barely", "more than" determine the answer.

## Pre-Section Routine (20 sec)

1. Underline KEY WORDS in each question.
2. Note the QUESTION VERB (recommend, suggest, decide, prefer).
3. Predict the structure: "She's about to recommend something — listen for advice language."

## Drill

When practicing, after each MCQ ask yourself: which option was the DISTRACTOR, and why? Build your trap recognition.`,
    tags: 'listening,mcq,distractor,section-3',
    readingTimeMin: 6,
  },
  {
    slug: 'listening-paraphrase-recognition',
    skill: 'LISTENING',
    band: 7,
    title: 'Paraphrase Recognition — The #1 Listening Skill',
    summary: 'Cambridge never gives you the exact question wording in the audio. Train your brain to recognize synonyms in real time.',
    content: `If you can't recognize paraphrases, you'll always score below Band 6.5 in Listening. The Cambridge test writers DELIBERATELY rephrase to test comprehension, not memorization.

## How Paraphrasing Works

Question (written): "What problem does the student face?"
Audio: "I'm really struggling with the workload — there's just too much."

Both say the same thing. Different words.

## 5 Paraphrase Categories

### 1. Synonym swap
- "expensive" → "pricey" / "costly" / "not cheap"
- "important" → "vital" / "crucial" / "key"
- "problem" → "issue" / "challenge" / "difficulty"

### 2. Negation flip
- "doesn't allow smoking" → "smoke-free"
- "isn't open weekends" → "only open weekdays"

### 3. Active ↔ Passive
- "The professor recommended the book" → "The book was recommended (by the professor)"

### 4. Word-class change
- "She decided to leave" → "Her decision was to leave"
- "He failed the test" → "His failure on the test..."

### 5. Specific → General
- "He bought a Toyota Corolla" → "He bought a new car"

## Training Drill: The Cambridge 1-2-3

Take any Cambridge Listening transcript:
1. Cover the question stems.
2. Read 1 sentence of the audio. Try to predict what question it answers.
3. Compare with the actual question wording. Note the paraphrase pattern.

Do this 10 minutes daily for 2 weeks → 1+ band improvement in Listening.`,
    tags: 'listening,paraphrase,synonyms',
    readingTimeMin: 4,
  },

  // ============ READING ============
  {
    slug: 'reading-skim-scan-method',
    skill: 'READING',
    band: 5,
    title: 'Skimming and Scanning — The 60-Minute Lifesaver',
    summary: 'You have 60 min for 3 long passages + 40 questions. Reading every word is impossible. Skim for overview, scan for details.',
    content: `IELTS Reading punishes slow readers. The trick is reading TWO ways depending on the question.

## Skimming — for OVERVIEW

When to use:
- Matching headings questions (P-level/H questions)
- Finding the writer's main argument
- True/False/Not Given when you need general sense

How to skim (30-45 seconds per paragraph):
1. Read the FIRST sentence (topic sentence).
2. Read the LAST sentence (often the conclusion).
3. Glance for capitalized names, dates, numbers, bold/italic words.
4. Skip examples (often after "for example", "such as").

What you should know after skimming:
- The main topic of each paragraph in 5 words
- The writer's overall position (positive, negative, neutral, balanced)

## Scanning — for DETAILS

When to use:
- Sentence completion / Summary completion
- Short answer questions
- Matching information to paragraphs

How to scan (15-30 seconds):
1. Identify the KEY WORD in the question (usually a proper noun, number, or distinctive word).
2. Move your eyes ONLY for that word.
3. When found, read SLOWLY the surrounding 2-3 lines.

## The 60-Minute Plan

| Time | Action |
|---|---|
| 0:00-0:01 | Read instructions, note word limits |
| 0:01-0:04 | SKIM Passage 1 (3 min) |
| 0:04-0:20 | Answer Passage 1 questions, transferring as you go |
| 0:20-0:23 | SKIM Passage 2 |
| 0:23-0:40 | Answer Passage 2 questions |
| 0:40-0:43 | SKIM Passage 3 |
| 0:43-0:58 | Answer Passage 3 (Passage 3 is hardest — extra time) |
| 0:58-1:00 | Final check / guess remaining |

## Critical Rule

**Don't transfer answers at the end.** Unlike Listening, there's NO extra transfer time. Write directly on the answer sheet as you go.`,
    tags: 'reading,skimming,scanning,time-management',
    readingTimeMin: 6,
  },
  {
    slug: 'reading-tfng-method',
    skill: 'READING',
    band: 6,
    title: 'True / False / Not Given — Killer Strategy',
    summary: 'T/F/NG is the most feared question type. The key is understanding that "False" ≠ "Not Given". Get this distinction and 5/5 is yours.',
    content: `T/F/NG breaks down most candidates. The reason: people confuse "False" (the text says the OPPOSITE) with "Not Given" (the text doesn't mention it).

## The Three Definitions

| | Definition | Test for it |
|---|---|---|
| **TRUE** | The statement matches what the passage says (often paraphrased) | The passage actively confirms it |
| **FALSE** | The statement CONTRADICTS the passage | The passage actively denies/contradicts it |
| **NOT GIVEN** | Can't be determined from the passage | The passage is silent on this point |

## The Decision Tree

For each statement, ask:
1. Does the passage talk about this topic AT ALL? → If no: **NOT GIVEN**
2. Does it say the EXACT opposite? → **FALSE**
3. Does it confirm (even paraphrased)? → **TRUE**

## Worked Example

Passage extract: "The team examined 200 patients aged 50-65. Half were given the new drug, half a placebo. After 12 weeks, those on the drug showed a 30% improvement."

Statement 1: "The trial included 200 participants." → **TRUE** (paraphrased: "200 patients")

Statement 2: "All participants were under 50." → **FALSE** (the passage says aged 50-65)

Statement 3: "The drug was tested on children." → **NOT GIVEN** (no mention of children — possible in theory but no evidence)

## Common Traps

### Trap 1: Adding extra info that wasn't tested
Statement: "The drug is safe for diabetic patients."
Passage: only mentions general improvement.
→ **NOT GIVEN** (no info on diabetes specifically — don't assume safe OR unsafe)

### Trap 2: Quantifier mismatch
Statement: "All scientists agreed with the findings."
Passage: "Most scientists agreed..."
→ **FALSE** (all ≠ most)

### Trap 3: Definite vs general statements
Statement: "Smoking causes cancer."
Passage: "Smoking has been linked to cancer."
→ Be careful — "linked to" ≠ "causes" → **NOT GIVEN** (causation not proven in text)

## Practice Drill

For each Cambridge T/F/NG question you get wrong, write WHY in 1 sentence. After 30 questions, patterns emerge.`,
    tags: 'reading,tfng,true-false-not-given',
    readingTimeMin: 6,
  },
  {
    slug: 'reading-matching-headings',
    skill: 'READING',
    band: 7,
    title: 'Matching Headings — The Decoy List Trick',
    summary: 'Matching paragraph headings is time-consuming but high-reward. Save them for LAST and use the elimination method.',
    content: `Matching headings tests your ability to identify the MAIN IDEA of each paragraph. There are always 2-3 MORE headings than paragraphs (decoys).

## The Reverse Order Method

Most students go heading → paragraph. WRONG. Do it the other way:

1. **Read paragraph first**, identify the main idea in your own words (5-7 words).
2. **Then look at heading list** and find the closest match.

This avoids being primed by decoy wording.

## What is a "Main Idea"?

The main idea is usually in:
- The TOPIC sentence (first sentence)
- OR the CONCLUSION (last sentence)
- NOT in the examples in the middle

If paragraph starts with "Researchers have made surprising findings about bird migration..." and ends "...this changes our understanding of climate adaptation", the main idea is "surprising bird migration findings related to climate adaptation".

## Decoy Heading Patterns

The wrong headings usually fall into 3 types:

1. **Too specific** — focuses on one example from the paragraph but misses the main point.
2. **Too general** — true but applies to the whole passage, not THIS paragraph.
3. **Off-topic but plausible** — uses keywords from the paragraph in a misleading way.

## Time Strategy

Matching headings often goes LAST in your test order. Why?
- You'll have already absorbed paragraph meaning answering other questions.
- It's the most time-consuming.

If you have <5 minutes left and 6 headings unmatched: guess strategically. Each unique heading = 1 point. Random guessing on 6 = ~1 point expected. Better than 0.

## Drill

Take a Cambridge passage. Cover the heading list. Read each paragraph, write the main idea in 5 words. Then uncover headings and match. Aim for 8/10 before exam.`,
    tags: 'reading,matching-headings,paragraph',
    readingTimeMin: 5,
  },
  {
    slug: 'reading-summary-completion',
    skill: 'READING',
    band: 6,
    title: 'Summary Completion — Word Limit Discipline',
    summary: 'Summary completion needs you to fill gaps with exact words from the passage. Most lost marks come from over-writing or wrong word forms.',
    content: `Summary completion gives you a paragraph summary with gaps. You complete gaps with words from the passage.

## 4 Rules to Remember

### Rule 1: Use EXACT words from the passage
You cannot paraphrase. If the text says "increased", you write "increased" not "rose".

### Rule 2: Respect the word limit
"NO MORE THAN THREE WORDS" — you can use 1, 2, or 3 words but NOT 4. Hyphenated words count as 1 (e.g., "well-being" = 1 word).

### Rule 3: Grammar must fit
The summary is one paragraph. Your answer must grammatically fit the sentence.

- Gap: "The system can _____ problems" → must be a noun OR verb in base form (after "can")
- Gap: "The discovery is _____ in modern medicine" → must be an adjective

### Rule 4: Read context, not just the gap
Look at the FULL sentence in the summary AND the corresponding sentence in the passage. The passage often paraphrases the surrounding context.

## The Workflow

1. Skim the summary first to understand the OVERALL topic.
2. Locate the relevant section of the passage (usually it's one continuous section, in order).
3. Read summary sentence 1 → find corresponding info in passage → identify the missing word.
4. Move to sentence 2, etc.

## Common Errors

- ❌ Writing 4 words when limit is 3.
- ❌ Wrong tense or form (passage has "successfully", you write "succeed").
- ❌ Including articles unnecessarily (when "company" suffices, don't write "the company").
- ❌ Using a synonym instead of the passage word.

## Self-Test

Take a Cambridge summary completion. After answering, check every word against the passage. Did you copy EXACTLY?`,
    tags: 'reading,summary-completion,word-limit',
    readingTimeMin: 5,
  },

  // ============ WRITING ============
  {
    slug: 'writing-task1-line-graph',
    skill: 'WRITING',
    band: 6,
    title: 'Task 1: Describing Line Graphs — The 4-Paragraph Structure',
    summary: 'Line graphs show trends over time. Use this proven 4-paragraph structure to hit Band 7 every time.',
    content: `Line graphs are Task 1's most common chart type. You have 20 minutes to write 150+ words. The exam tests your ability to describe and compare trends.

## The 4-Paragraph Structure

### Paragraph 1: Paraphrased Introduction (1 sentence)
Paraphrase the prompt. DON'T copy the question.

"The line graph illustrates [what] in [where] between [start year] and [end year]."

### Paragraph 2: Overview (2 sentences) — CRITICAL FOR BAND 7+
State the 2 most important features. Examiners look for this — without an overview, your max is Band 5.

"Overall, [trend A]. In addition, [trend B / biggest difference / endpoint comparison]."

Examples:
- "Overall, sales of all three products rose, with smartphones showing the most dramatic growth."
- "Overall, the percentage of households owning cars steadily increased, whereas bicycle ownership fluctuated."

### Paragraph 3: Detail 1 (3-4 sentences)
Pick 2-3 lines / data series. Describe with SPECIFIC NUMBERS.

"In 2010, smartphone sales stood at 200 million units. They grew steadily until 2015, reaching 800 million, before climbing more sharply to 1.5 billion by 2020."

### Paragraph 4: Detail 2 (3-4 sentences)
Describe remaining data. Use comparison language.

"In contrast, sales of feature phones declined throughout the period, falling from 1 billion in 2010 to just 200 million in 2020. Tablet sales remained relatively stable, hovering around 300 million."

## Essential Trend Vocabulary

| Direction | Verbs | Adverbs |
|---|---|---|
| ↑ Increase | rise, climb, grow, soar, rocket | sharply, dramatically, steadily, gradually |
| ↓ Decrease | fall, decline, drop, plummet, dip | slightly, marginally, significantly |
| → Steady | remain stable, hold steady, level off | roughly, approximately |
| ⇡⇣ Fluctuate | fluctuate, vary, oscillate | erratically, wildly |
| 🔝 Peak | peak at, reach a high of, hit a maximum | |
| 🔻 Trough | hit a low, bottom out, reach a minimum | |

## Word Count Discipline

- Minimum 150 words (Band penalty if under).
- Target 160-180 — don't waste time writing 250 in Task 1.
- Task 1 is worth 1/3 of your writing score; Task 2 is 2/3.

## Common Mistakes

1. ❌ Forgetting the overview paragraph (kills Task Achievement).
2. ❌ Copying from the prompt verbatim (counted against word count).
3. ❌ Vague description ("It went up") instead of specific ("rose by 30% to 450 thousand").
4. ❌ Personal opinions ("This is concerning") — DO NOT add opinions in Task 1.`,
    tags: 'writing,task-1,line-graph,trends',
    readingTimeMin: 6,
  },
  {
    slug: 'writing-task1-process',
    skill: 'WRITING',
    band: 6,
    title: 'Task 1: Describing Processes — Passive Voice Mastery',
    summary: 'Process diagrams show how something is made or works. Use passive voice throughout and sequencing language.',
    content: `Process diagrams (e.g., how chocolate is made, how solar panels work) appear in roughly 1 in 6 Task 1 tests. They look intimidating but follow a strict pattern.

## The Structure

### Paragraph 1: Introduction (1 sentence)
"The diagram illustrates the process by which [X is produced/made/manufactured]."

### Paragraph 2: Overview (1-2 sentences)
State the number of stages and where the process starts/ends.

"Overall, the process consists of [N] main stages, beginning with [stage 1] and ending with [final stage]."

### Paragraph 3: First Half of Process
Describe stages 1 through ~half, in chronological order.

### Paragraph 4: Second Half of Process
Describe remaining stages to completion.

## Why Passive Voice?

In a process, the AGENT (who does the action) is usually unimportant or unknown. We focus on WHAT happens, not WHO does it.

- ❌ Active: "The factory workers melt the cocoa beans."
- ✅ Passive: "The cocoa beans are melted."

## Passive Voice Recipe

[Subject] + is/are + past participle (+ by [agent — usually omitted])

- "The mixture **is heated** to 100°C."
- "The product **is then packed** in sealed bags."
- "Raw materials **are imported** from various sources."

## Sequencing Language

| Position | Words |
|---|---|
| Start | First, Initially, To begin with, The process commences with |
| Middle | Next, Then, Subsequently, Following this, After that |
| Almost end | Finally, Lastly, In the final stage |
| Simultaneous | At the same time, Meanwhile, While |

## Sample Paragraph

"Initially, the bauxite is mined from open pits and crushed into smaller pieces. The crushed bauxite is then mixed with sodium hydroxide and heated under high pressure. This produces an alumina solution, which is filtered to remove impurities."

## Common Mistakes

1. ❌ Using active voice ("People do X") — sounds informal.
2. ❌ Listing stages with numbers ("Stage 1: X. Stage 2: Y.") — examiners want flowing prose.
3. ❌ Skipping the overview — Band 5 maximum without it.`,
    tags: 'writing,task-1,process,passive-voice',
    readingTimeMin: 5,
  },
  {
    slug: 'writing-task2-opinion-essay',
    skill: 'WRITING',
    band: 7,
    title: 'Task 2 Opinion Essay — The "Agree/Disagree" Master Structure',
    summary: 'Opinion essays ("To what extent do you agree?") are the most common Task 2 type. Use this 4-paragraph structure to hit Band 7.',
    content: `Opinion essays ask you to state and defend a position. You're allowed to fully agree, fully disagree, or partially agree.

## The 4-Paragraph Structure (250-280 words)

### Paragraph 1: Introduction (40-50 words)
- Sentence 1: Paraphrase the topic ("It is often argued that...")
- Sentence 2: State YOUR position clearly ("I strongly agree/disagree with this view because...")
- Sentence 3 (optional): Preview your two main reasons.

### Paragraph 2: First Reason (80-100 words)
- Topic sentence: introduce reason 1.
- Explanation: develop the idea logically.
- EXAMPLE: a real-world or hypothetical illustration.
- Mini-conclusion: restate the reason linking back to your position.

### Paragraph 3: Second Reason (80-100 words)
Same structure as P2 with reason 2.

### Paragraph 4: Conclusion (30-40 words)
- "In conclusion, [restate position]. [Summarize 2 reasons]."

## Position Language

| Position | Phrases |
|---|---|
| Strongly agree | "I wholeheartedly agree...", "There is no doubt that..." |
| Mostly agree | "I largely agree with this view, although there are some exceptions" |
| Mostly disagree | "While the argument has some merit, I largely disagree because..." |
| Balanced | "Both sides have valid points, but on balance I lean towards..." |

## Critical: Stating YOUR position

Many candidates write neutral essays presenting both sides. This is WRONG for an opinion essay. You MUST take a side.

❌ "Some people think X. Others think Y. Both have merits."
✅ "While some argue X, I strongly believe Y because..."

## Topic Sentence Templates

- "The primary reason for my view is that..."
- "Firstly, [reason] has a profound impact on..."
- "A second important point is that..."

## Linking Within Paragraphs

- For example, / For instance,
- This is because / This is due to
- Consequently, / As a result,
- However, / Nevertheless,
- In particular, / Specifically,

## Common Pitfalls

1. ❌ Not stating position in the introduction (Band 5 max).
2. ❌ Switching position mid-essay.
3. ❌ Writing under 250 words (auto-penalty in Task Response).
4. ❌ Two paragraphs only (loses Coherence and Cohesion).
5. ❌ Memorized phrases ("Nowadays in today's modern world...") — examiners deduct.`,
    tags: 'writing,task-2,opinion,agree-disagree',
    readingTimeMin: 7,
  },
  {
    slug: 'writing-task2-discussion-essay',
    skill: 'WRITING',
    band: 7,
    title: 'Task 2 Discussion Essay — "Discuss both views and give your own"',
    summary: 'Discussion essays test balance + opinion. Discuss BOTH sides equally, then give YOUR view. Often confused with opinion essays — read carefully.',
    content: `Discussion essays are signaled by phrases like "Discuss both views and give your own opinion" or "Some say X, others say Y. Discuss both sides."

## The Critical Difference vs. Opinion Essay

Opinion essay: state your view, defend with 2 reasons.
Discussion essay: explain VIEW 1 (one paragraph), explain VIEW 2 (one paragraph), then state YOUR opinion (in conclusion or its own paragraph).

## The 4-Paragraph Structure

### P1: Introduction (40 words)
- Paraphrase the topic
- Mention that there are two opposing views
- Briefly state YOUR position

"It is often debated whether [X] or [Y] is more important. While both perspectives have merit, this essay will argue that [your position]."

### P2: First View (80-100 words)
- Topic sentence: introduce the FIRST view neutrally.
- Develop with reasons and an example.
- DO NOT state agreement yet.

"Those who support [view 1] argue that... For example, ..."

### P3: Second View (80-100 words)
- Topic sentence: introduce the SECOND view neutrally.
- Develop with reasons and an example.
- DO NOT state agreement yet.

"On the other hand, advocates of [view 2] point out that..."

### P4: Your Opinion + Conclusion (40-50 words)
- "In my opinion, [position] is more persuasive because..."
- Summarize.

## Tone Control

In P2 and P3, you're a REPORTER, not a debater. Use:
- "Proponents of X argue..."
- "It is often said that..."
- "Supporters of this view believe..."
- "Some people maintain that..."

Save your voice for P1 (preview) and P4 (full opinion).

## Common Pitfall: Imbalance

If P2 is 120 words but P3 is only 60, you've shown bias. The examiner expects EQUAL treatment of both views, regardless of your own preference.

## Sample Topic & Outline

**Prompt:** "Some believe technology has made our lives more stressful. Others say it has improved our quality of life. Discuss both views and give your own opinion."

- P1: Both views have validity; I believe technology has, on balance, improved our lives.
- P2: View 1 — technology causes stress (always-on culture, social media addiction, information overload). Example: studies on smartphone-related anxiety.
- P3: View 2 — technology improves life (healthcare advances, remote work flexibility, instant communication). Example: telemedicine in rural areas.
- P4: My view: technology improvements (P3) outweigh costs (P2), but we must learn to manage usage.`,
    tags: 'writing,task-2,discussion,both-views',
    readingTimeMin: 6,
  },
  {
    slug: 'writing-cohesion-devices',
    skill: 'WRITING',
    band: 7,
    title: 'Cohesion Devices for Band 7+ Writing',
    summary: 'Cohesion and Cohesion (CC) is 25% of your Writing score. Top-tier writing uses cohesion devices INVISIBLY — no overuse of "Firstly, Secondly, Finally".',
    content: `Cohesion = how ideas connect within and between sentences. Band 7+ writers use cohesion seamlessly. Band 5 writers stuff in "Firstly", "Secondly", "In addition" mechanically.

## Cohesion Has 5 Levels

### Level 1: Reference (pronouns, this/that/these)
"Solar power is renewable. **It** also produces no emissions."

### Level 2: Substitution (one, do)
"Some people prefer fast food. Others avoid **it** because of health concerns."

### Level 3: Ellipsis (omitting repeated info)
"Some people exercise daily; others rarely (exercise)."

### Level 4: Connectives (linkers)
- Adding: in addition, furthermore, moreover
- Contrasting: however, nevertheless, on the other hand
- Cause: therefore, consequently, as a result
- Example: for instance, for example, such as

### Level 5: Repetition with variation
Don't repeat the same noun. Vary:
- "**Pollution** is a serious problem. **This issue** affects millions. **The phenomenon** is worsening."

## What Band 7 Looks Like

❌ Band 5: "Firstly, technology is good. Secondly, it helps us. Thirdly, we need it. In conclusion, technology is important."

✅ Band 7: "Modern technology offers significant benefits. It enables instant global communication, streamlines work processes, and provides access to vast knowledge. As a result, it has become indispensable in daily life."

Notice: Band 7 has FEWER explicit connectives, but ideas flow logically via reference ("it"), variation ("modern technology" → "it"), and natural sequence.

## Linker Overuse — The #1 Cohesion Killer

Examiners explicitly say: "The cohesive devices may be over-used or mechanical." This is what drops your score from 7 to 6 in Coherence.

Don't START every paragraph with "Firstly", "Secondly", "Thirdly", "Finally". This is BAND 6 at best.

Better paragraph starters:
- "The primary reason..."
- "Another important consideration..."
- "Equally significant..."
- "A further point worth noting..."

## The "Cohesion Self-Check"

After writing your essay, count:
- # of "however" → max 1-2 per essay
- # of "furthermore" → max 1
- # of "in addition" → max 1
- # of "firstly/secondly/thirdly" → max 1 set

If you exceed → revise with variety.`,
    tags: 'writing,cohesion,linkers,band-7',
    readingTimeMin: 6,
  },
  {
    slug: 'writing-lexical-resource',
    skill: 'WRITING',
    band: 7,
    title: 'Lexical Resource — Beyond "Good, Important, Many"',
    summary: 'Lexical Resource is 25% of Writing score. Top writers use precise, varied vocabulary. Stop using "good, bad, many, important, things".',
    content: `Lexical Resource = the range and precision of your vocabulary. Band 7 needs "less common lexical items with awareness of style and collocation".

## The Forbidden 6 (and replacements)

### 1. "Good" — too generic
- ✅ beneficial, advantageous, valuable, fruitful, productive, constructive
- "Exercise has **beneficial** effects on mental health." (not "good effects")

### 2. "Bad" — too generic
- ✅ detrimental, harmful, adverse, damaging, unfavourable
- "Pollution has **detrimental** effects on health." (not "bad effects")

### 3. "Many" / "A lot of" — informal/imprecise
- ✅ numerous, a significant number of, a vast majority of, countless
- "**Numerous** studies have shown..."

### 4. "Important" — overused
- ✅ crucial, vital, essential, paramount, pivotal, fundamental
- "Sleep is **crucial** for cognitive function."

### 5. "Things" — too vague
- ✅ aspects, factors, elements, issues, matters, phenomena
- "Several **factors** contribute to climate change."

### 6. "People" — overused
- ✅ individuals, citizens, the public, residents, society, the population
- "**Citizens** play a key role in democracy."

## Topic-Specific Sophistication

For each common Task 2 topic, learn 5 less common words:

| Topic | Band 7 vocabulary |
|---|---|
| Environment | sustainable, deforestation, biodiversity, ecological, emissions |
| Technology | unprecedented, innovation, automation, algorithm, digital divide |
| Education | curriculum, pedagogy, literacy, scholarship, vocational |
| Health | sedentary lifestyle, preventive, obesity, mental wellbeing, holistic |
| Society | inequality, demographic, urbanization, integration, marginalized |

## Collocations Save Your Score

Collocations = words that NATURALLY go together. Examiners hate "do a decision" (it should be "make a decision").

Memorize these high-frequency collocations:
- make a decision (NOT do)
- pay attention to (NOT give)
- raise concerns (NOT push)
- take measures (NOT do/make)
- adopt an approach (NOT take)
- play a vital role (NOT do)
- broaden one's horizons
- pose a threat to
- bridge the gap
- shed light on

## The Lexical Self-Check

After writing, scan for:
- Any "good/bad/many/important/things/people" → replace with band 7 alternative.
- Are you using AT LEAST 3 less common words per paragraph?
- Are collocations natural?

## Warning: Don't Force It

❌ "I commute to school via the indispensable conveyance of locomotion."
✅ "I get to school by train."

If a less common word feels unnatural in context, USE THE SIMPLE WORD. Forced vocab kills your Lexical Resource score.`,
    tags: 'writing,lexical-resource,vocabulary,band-7',
    readingTimeMin: 7,
  },

  // ============ SPEAKING ============
  {
    slug: 'speaking-part-1-fluency',
    skill: 'SPEAKING',
    band: 6,
    title: 'Speaking Part 1 — The 4-Sentence Answer',
    summary: 'Part 1 lasts 4-5 minutes with familiar questions. Avoid 1-word answers AND avoid Part-2-length monologues. Aim for 3-4 sentences.',
    content: `Part 1 questions are short and familiar: "Do you like reading?", "What's your hometown like?". The examiner asks 8-12 questions to warm you up and assess basic fluency.

## The 3-4 Sentence Formula

For each question:

1. **Direct answer** (1 sentence)
2. **Reason or detail** (1 sentence)
3. **Example or contrast** (1-2 sentences)

### Example Q: "Do you enjoy cooking?"

❌ Band 4: "Yes."
❌ Band 5: "Yes, I like it."
✅ Band 7: "Yes, I really enjoy cooking, especially on weekends when I have more time. I find it relaxing because I can experiment with new recipes. My speciality is Vietnamese pho — it takes hours but the result is worth it."

(3 sentences, ~45 words, ~15-20 seconds)

## The Right Length

- 1 sentence = Band 4-5 (under-extension)
- 5+ sentences = also penalized (over-extension, examiner cuts you off)
- 3-4 sentences = sweet spot

## Common Part 1 Topics (2025-2026)

You will get one of these "themes" in Part 1:
- Hometown / accommodation
- Work or study
- Hobbies / free time
- Family
- Technology / phones
- Food
- Weather / seasons
- Travel / holidays
- Music / movies / books

Prepare 1 personal anecdote for each.

## Fillers Cost You Points

❌ "Yes, I, uh, I think, you know, yeah, cooking is, like, kind of, you know, fun for me."

These hesitations hurt Fluency. Replace with cleaner thinking phrases:
- "Well, to be honest..."
- "I'd say..."
- "Actually..."
- "That's an interesting question. I think..."

## Don't Memorize Answers

Examiners are trained to spot memorized responses. They sound:
- Too perfect, no hesitation at all
- Use unnaturally complex vocabulary
- Don't match the EXACT question

If detected → instant Band 5 cap.

Instead, prepare TOPIC FAMILIARITY (vocab + opinions on common topics) and let your answer emerge naturally.

## Practice Drill

Record yourself answering 10 Part 1 questions. Listen back:
- Are you giving 3-4 sentences each?
- Are you naturally adding "because" / "for example" / "actually"?
- Are you avoiding "yes" / "no" as standalone answers?`,
    tags: 'speaking,part-1,fluency,answers',
    readingTimeMin: 5,
  },
  {
    slug: 'speaking-part-2-cue-card',
    skill: 'SPEAKING',
    band: 7,
    title: 'Speaking Part 2 — Mastering the Cue Card (2 Minutes)',
    summary: 'Part 2 = 1 min prep, 2 min speaking. The cue card has 4 prompts. Cover ALL of them in order. Time discipline is the difference between Band 6 and Band 7.',
    content: `Part 2 is where you make or break your speaking score. The examiner gives you a cue card and 1 minute to prepare. Then you speak ALONE for 1-2 minutes.

## The Cue Card Structure

Every cue card has the same format:

"Describe a [thing/person/event] that...
You should say:
- bullet 1
- bullet 2
- bullet 3
- and explain bullet 4"

You MUST cover all 4 points to score Band 7+.

## The 1-Minute Prep Strategy

You have 60 seconds. Don't waste them.

| Time | Action |
|---|---|
| 0-10s | Choose your topic (be specific, not generic). |
| 10-50s | Jot 1-2 keywords per bullet. NOT sentences. |
| 50-60s | Plan your opening line. |

### Sample Cue Card

"Describe a book you recently read.
You should say:
- what the book was about
- when and where you read it
- why you decided to read it
- and explain how you felt about it"

### Sample Notes (DO write keywords, don't write sentences)

- Atomic Habits / James Clear / habits / 4 laws
- last summer / on weekends / café
- friend's recommendation / wanted to be more productive
- changed my routine / 5am wake-up / love practical advice

## The 2-Minute Speaking Structure

| Time | Content |
|---|---|
| 0:00-0:15 | Intro + which thing you chose (Bullet 1) |
| 0:15-0:45 | Bullet 2 detail with example |
| 0:45-1:15 | Bullet 3 detail with reason |
| 1:15-1:55 | Bullet 4 — the deepest, longest part (your feelings/reflection) |
| 1:55-2:00 | Brief closing sentence |

The LAST bullet ("explain how/why...") deserves the most time. This is where you show language range.

## Filler Phrases for Smooth Flow

When you need a moment to think:
- "I'd like to talk about..."
- "Now, when it comes to..."
- "What was particularly memorable was..."
- "Looking back, I think..."
- "If I had to describe it..."

## Time Discipline

If examiner stops you at 2:00, that's PERFECT. If you stop at 1:00, your fluency score takes a hit.

Practice with a stopwatch. Most candidates run out of ideas at 1:15 — you must build TOPIC EXPANSION skill.

## Topic Expansion: The 5-W Method

If you're running short, ask yourself:
- Why? (motivation)
- How? (process)
- Who? (other people involved)
- What if? (counterfactual: what if you hadn't done this?)
- Compared to? (other similar experiences)

## Examiner Follow-Up

After Part 2, the examiner asks a Part 3-style follow-up: "Do you think people read fewer books these days?"

Answer briefly (15-20 seconds) — it's a bridge to Part 3.`,
    tags: 'speaking,part-2,cue-card,monologue',
    readingTimeMin: 7,
  },
  {
    slug: 'speaking-part-3-abstract',
    skill: 'SPEAKING',
    band: 7,
    title: 'Speaking Part 3 — Handling Abstract Questions',
    summary: 'Part 3 is the band-distinguisher. Questions become abstract ("Do you think...?", "How will... change in the future?"). Use the PREP framework.',
    content: `Part 3 lasts 4-5 minutes. The examiner asks abstract, discussion-style questions related to your Part 2 topic. This is where Band 6 → Band 7 → Band 8 separation happens.

## What "Abstract" Means

Part 1: "Do you like books?" (personal, concrete)
Part 3: "Do you think reading habits will change in the future?" (general, abstract)

You can't just talk about yourself. You need to discuss SOCIETY, the FUTURE, COMPARISONS.

## The PREP Framework

**P** - Point: state your view directly.
**R** - Reason: why you think so.
**E** - Example: real-world or hypothetical.
**P** - Point restated: link back to question.

### Example Q: "Do you think children today read fewer books than in the past?"

✅ Band 7 answer:

[P] "I'd argue that children today **do** read fewer physical books, but they consume more text overall through digital media.

[R] This is mainly because smartphones and tablets have replaced traditional reading time — kids are scrolling rather than turning pages.

[E] For instance, in many Vietnamese cities I've visited, you'll see children on long bus journeys glued to their phones playing games, whereas a decade ago they might have been reading manga or comics.

[P] So while the FORM of reading has changed, I'm not sure overall literacy has decreased — just the medium has shifted."

## Question Types in Part 3

### Type 1: Opinion ("Do you think...?")
Use PREP. Be confident in your view.

### Type 2: Future Prediction ("How will... change in 50 years?")
Use future modals: "will likely", "is bound to", "may well", "could potentially"

### Type 3: Comparison ("How does X differ between countries?")
Use comparatives: "compared to", "unlike in...", "whereas in...", "while X tends to..."

### Type 4: Cause-Effect ("Why do you think people...?")
"This stems from...", "A key driver is...", "Largely because..."

### Type 5: Two-Sided ("What are the advantages and disadvantages of...?")
Cover BOTH sides briefly. "On one hand..." then "On the other hand..."

## High-Band Discourse Markers

- "It's worth noting that..."
- "From my perspective..."
- "What people often overlook is..."
- "That's a great point — let me think..."
- "If I had to take a position..."
- "I see where that argument comes from, but..."

## Don't Just Agree With the Examiner

If examiner asks "Don't you think technology is harmful?", you don't have to agree. Disagreeing politely shows critical thinking:

"That's an interesting point, but I'd actually push back a little. While technology has downsides, the benefits — especially in healthcare and education — outweigh them, in my view."

## Hesitation Strategy

For tough abstract questions:
- "That's a really interesting question. Let me think..."
- "I haven't considered this before, but my initial thought is..."
- "I'd have to think about this carefully, but..."

These buy you 3-5 seconds and sound natural. Just don't use them on every question.

## Top Band Discriminator: Idiomatic Language

Band 7+ uses 1-2 idiomatic phrases naturally:
- "It's a double-edged sword"
- "A blessing in disguise"
- "Hits the nail on the head"
- "Food for thought"
- "Open a can of worms"

Use ONE per Part 3 answer. Overuse sounds artificial.`,
    tags: 'speaking,part-3,abstract,prep',
    readingTimeMin: 7,
  },
  {
    slug: 'speaking-pronunciation-vietnamese',
    skill: 'PRONUNCIATION',
    band: 6,
    title: 'Pronunciation Fixes for Vietnamese Learners',
    summary: 'The 5 most common pronunciation issues for Vietnamese speakers. Fix these and your Pronunciation score jumps from Band 5 to Band 7.',
    content: `Vietnamese phonology lacks several English sounds, leading to predictable errors. Examiners notice and your Pronunciation score (25% of Speaking) suffers.

## Issue 1: Ending consonant sounds

Vietnamese rarely pronounces ending consonants. So learners drop them in English.

❌ "I wo-(rk) ha-(rd) ever-(y) day."
✅ "I work hard every day." (clear /k/, /d/, /y/)

### Fix
Practice consonant clusters:
- works /wɜːks/ — release the /s/
- worked /wɜːkt/ — release the /t/
- worked hard /wɜːkt hɑːd/ — chain the /t/ to the next word.

## Issue 2: /θ/ and /ð/ (the "th" sounds)

Vietnamese has no /θ/. Learners substitute /t/, /s/, or /f/.

❌ "I sink so" (instead of "I think so")
❌ "I sank you" (instead of "I thank you")

### Fix
Place your tongue BETWEEN your top and bottom teeth, then blow air. Practice minimal pairs:
- think / sink
- three / tree / free
- both / boat / both
- mouth / mouse

5 minutes daily for 2 weeks → permanent fix.

## Issue 3: /v/ vs /w/

Vietnamese /v/ is similar to English, but /w/ is often confused.

❌ "I wery vant to go" (instead of "I very want to go")

### Fix
- /v/: top teeth touch bottom lip (like /f/ but voiced)
- /w/: lips round, no teeth contact (like blowing a candle)

Practice: "Very wide", "wait and weigh", "vote was very vague".

## Issue 4: Word stress

Vietnamese is syllable-timed; English is stress-timed. Multi-syllable English words have ONE strong syllable.

❌ "pho-TO-graph" (wrong stress)
✅ "PHO-to-graph" (stress on first)

❌ "e-co-NO-mic" (wrong stress)
✅ "e-co-NO-mic" (actually this IS correct — stress on third)

### Common Stress Patterns

- 2-syllable nouns: usually FIRST syllable. (DOC-tor, MO-ther, CI-ty)
- 2-syllable verbs: usually SECOND syllable. (re-PEAT, de-CIDE, ex-PLAIN)
- -tion / -sion / -ic / -ical: stress on syllable BEFORE.
  - infor-MA-tion, deci-SION, eco-NO-mic, mu-SI-cal
- -ate / -ize verbs: stress 2 syllables back. (e-DU-cate, OR-ga-nize)

## Issue 5: Sentence stress (the music of English)

In English, content words (nouns, verbs, adjectives) are STRESSED; function words (articles, prepositions, pronouns) are unstressed and REDUCED.

❌ Robotic: "I am go-ing to the shop." (every word equal)
✅ Natural: "I'm GOING to the SHOP." ("I'm" and "to the" are weak/fast)

This pattern is called "the schwa rhythm". The schwa /ə/ replaces vowels in unstressed syllables.

### Drill
Read aloud, marking STRESSED words in CAPS:
"I'm GOING to the MARKET to BUY some BREAD and CHEESE for DINNER."

Notice how function words ("to the", "some", "and", "for") get squashed.

## Daily Practice Routine (10 minutes)

1. 2 min: shadow a native speaker (BBC News, TED Talks). Repeat their exact rhythm.
2. 3 min: read aloud, recording yourself, with focus on ending consonants.
3. 2 min: minimal pair drills (the / they; sink / think).
4. 3 min: read a paragraph, marking word + sentence stress, then read aloud.

After 4 weeks, your Pronunciation can jump from Band 5 to Band 6.5+.`,
    tags: 'speaking,pronunciation,vietnamese,band-6',
    readingTimeMin: 7,
  },
]

export async function seedStrategies(db: PrismaClient) {
  for (const s of STRATEGIES) {
    await db.strategyArticle.upsert({
      where: { slug: s.slug },
      update: { ...s },
      create: { ...s },
    })
  }
  console.log(`  ✓ ${STRATEGIES.length} strategy articles seeded`)
  return STRATEGIES.length
}
