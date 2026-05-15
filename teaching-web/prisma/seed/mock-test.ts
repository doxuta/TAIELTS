import { PrismaClient } from '@prisma/client'

// ============================================================
// TAIELTS Practice Test 1 — Academic
// Full Cambridge-format mock test
// ============================================================

const TEST_TITLE = 'TAIELTS Practice Test 1 — Academic'
const TEST_DESCRIPTION =
  'A complete IELTS Academic practice test in the official Cambridge format. Listening (40Q), Reading (13Q showcase), Writing (Task 1 + Task 2), Speaking (Part 1/2/3). AI-scored Writing & Speaking with full criterion feedback.'

// ============================================================
// LISTENING SECTION 1 — Form completion (10 questions)
// ============================================================
const LISTENING_S1_TRANSCRIPT = `[CONVERSATION between RECEPTIONIST (R) and TOM (T) booking a fitness class membership]

R: Good morning, City Sport Centre, how can I help you?
T: Hi, I'm calling about your new fitness membership. I'd like to register.
R: Of course. Let me take some details. What's your full name?
T: It's Tom — that's T-O-M — Harrison.
R: H-A-R-I-S-O-N?
T: Almost. It's H-A-R-R-I-S-O-N, with two Rs.
R: Got it. Thanks. And your date of birth, Tom?
T: It's the fifteenth of March, 1995.
R: 15-3-1995. And what's a good contact number?
T: My mobile is 07-double-three-four, 829-541.
R: 07334 829541. And could I have an email address?
T: Yes, it's tomh1995, all one word, lowercase, at gmail dot com.
R: Perfect. Now, which membership level are you interested in? We offer Bronze, Silver, and Gold.
T: I'd like the Silver one, please. Gold seems a bit too expensive for me at the moment.
R: Right, the Silver membership is forty-five pounds per month. That gives you access to the gym, swimming pool, and three group classes per week.
T: That works for me. Three classes is enough.
R: Do you have any preferred class times?
T: Mainly evenings. I work during the day, so anything after 6pm.
R: We have plenty of evening classes. The most popular is the boxing class on Thursdays. And our spin class is also good — that's on Tuesdays and Saturdays.
T: I'll think about those. Oh, also — do I need to bring my own towel?
R: For the pool, yes. For the gym, we provide them but you can bring your own if you prefer.
T: Okay, good.
R: One more thing — how did you hear about us?
T: A friend recommended you. She told me the place was clean and not too crowded.
R: That's lovely to hear. Was that during one of our promotions?
T: I think so — she mentioned the autumn discount.
R: Perfect. That gives you a 10 per cent discount on the first month. We'll start your membership on the first of October. Your first payment will be forty pounds and fifty pence.
T: Great, thank you.
R: I'll send the confirmation to your email. See you on the first!
T: Thanks, bye.`

const LISTENING_S1_QUESTIONS = [
  // Q1-5: Personal information form
  { questionNumber: 1, questionType: 'SHORT_ANSWER', prompt: 'Full name: Tom ______', correctAnswer: 'Harrison', points: 1 },
  { questionNumber: 2, questionType: 'SHORT_ANSWER', prompt: 'Date of birth: ______ March 1995', correctAnswer: '15|15th|fifteenth', points: 1 },
  { questionNumber: 3, questionType: 'SHORT_ANSWER', prompt: 'Mobile number: ______', correctAnswer: '07334 829541|07334829541', points: 1 },
  { questionNumber: 4, questionType: 'SHORT_ANSWER', prompt: 'Email: ______@gmail.com', correctAnswer: 'tomh1995', points: 1 },
  { questionNumber: 5, questionType: 'MCQ_SINGLE', prompt: 'Membership level chosen:', options: JSON.stringify(['Bronze', 'Silver', 'Gold']), correctAnswer: 'B', points: 1 },
  // Q6-10: Membership details
  { questionNumber: 6, questionType: 'SHORT_ANSWER', prompt: 'Monthly cost: £______', correctAnswer: '45|forty-five', points: 1 },
  { questionNumber: 7, questionType: 'SHORT_ANSWER', prompt: 'Number of group classes per week: ______', correctAnswer: '3|three', points: 1 },
  { questionNumber: 8, questionType: 'SHORT_ANSWER', prompt: 'Day of boxing class: ______', correctAnswer: 'Thursday|Thursdays', points: 1 },
  { questionNumber: 9, questionType: 'MCQ_SINGLE', prompt: 'For which facility does Tom need his own towel?', options: JSON.stringify(['Gym only', 'Pool only', 'Both gym and pool']), correctAnswer: 'B', points: 1 },
  { questionNumber: 10, questionType: 'SHORT_ANSWER', prompt: 'First payment amount: £______', correctAnswer: '40.50|forty pounds fifty', points: 1 },
]

// ============================================================
// LISTENING SECTION 2 — Map + MCQ (10 questions)
// ============================================================
const LISTENING_S2_TRANSCRIPT = `[TOUR GUIDE addressing visitors to the Riverside Park]

Welcome, everyone, to Riverside Park. I'll give you a quick tour of the layout before you explore on your own.

You're currently standing at the main entrance, which is on the south side of the park. From here, the main path goes straight ahead, dividing the park into east and west sides.

Right in front of you, just past the entrance, is the visitor centre. That's where you can pick up maps and book guided tours. The visitor centre also has clean toilets — the only ones on this side of the park.

If you continue along the main path, you'll see a large pond on your right after about a hundred metres. The pond is home to several duck species and is particularly popular with families. Just opposite the pond, on your left, is the children's playground. It was recently renovated and is suitable for ages two to ten.

Further north, the path splits into two. If you take the right fork, you'll reach the rose garden, which has over two hundred varieties of roses. Best time to see it is in May or June. If you take the left fork, you'll arrive at the picnic area — there are tables, a small barbecue spot, and a wide lawn for games.

Beyond the picnic area, in the north-west corner of the park, you'll find the lookout tower. From the top of the tower, you can see the entire park and the surrounding city. It's free to climb but please be aware that there is no lift — only stairs.

Now, some practical information. The park is open from 7am to 9pm every day except Mondays. There's a small café next to the visitor centre, open until 6pm, serving drinks and light snacks. If you need water, there are fountains near the playground and the rose garden — both have refillable bottle stations.

Photography is allowed everywhere except inside the visitor centre. Drones are not permitted at any time. Dogs are welcome but must be kept on a lead. Please don't feed the ducks bread — it's actually bad for them; the park sells special duck feed at the visitor centre.

Tonight we have a special event: a sunset jazz concert at the picnic area, starting at 7pm. Free entry, but please arrive early as it gets crowded. Enjoy your visit!`

const LISTENING_S2_QUESTIONS = [
  // Q11-15: Map labelling (locations A-G on map)
  { questionNumber: 11, questionType: 'MAP_LABEL', prompt: 'Visitor centre', correctAnswer: 'A', points: 1, explanation: 'Just past the south entrance.' },
  { questionNumber: 12, questionType: 'MAP_LABEL', prompt: 'Pond', correctAnswer: 'C', points: 1, explanation: '100m along the main path, on the right.' },
  { questionNumber: 13, questionType: 'MAP_LABEL', prompt: "Children's playground", correctAnswer: 'B', points: 1, explanation: 'Opposite the pond on the left.' },
  { questionNumber: 14, questionType: 'MAP_LABEL', prompt: 'Rose garden', correctAnswer: 'E', points: 1, explanation: 'Right fork after the path splits.' },
  { questionNumber: 15, questionType: 'MAP_LABEL', prompt: 'Lookout tower', correctAnswer: 'G', points: 1, explanation: 'North-west corner of the park.' },
  // Q16-20: MCQ and short answer
  { questionNumber: 16, questionType: 'MCQ_SINGLE', prompt: 'When is the park closed?', options: JSON.stringify(['Sundays', 'Mondays', 'Tuesdays']), correctAnswer: 'B', points: 1 },
  { questionNumber: 17, questionType: 'SHORT_ANSWER', prompt: 'The café closes at ______ pm.', correctAnswer: '6|six', points: 1 },
  { questionNumber: 18, questionType: 'MCQ_MULTIPLE', prompt: 'Which TWO are NOT allowed in the park? (choose two letters)', options: JSON.stringify(['Photography', 'Drones', 'Dogs without leads', 'Bicycles', 'Children']), correctAnswer: 'B,C', points: 2 },
  { questionNumber: 19, questionType: 'SHORT_ANSWER', prompt: 'Visitors should NOT feed ducks ______.', correctAnswer: 'bread', points: 1 },
  { questionNumber: 20, questionType: 'SHORT_ANSWER', prompt: 'Tonight\'s jazz concert starts at ______ pm.', correctAnswer: '7|seven', points: 1 },
]

// ============================================================
// READING PASSAGE 1 — Science/Society (13 questions)
// ============================================================
const READING_P1_PASSAGE = `THE RETURN OF THE WOLF

For centuries, wolves were systematically eliminated from much of Europe and North America. Hunted for their pelts, persecuted as livestock predators, and feared as threats to human safety, they had largely vanished from Western Europe by the early twentieth century. In Yellowstone National Park in the United States, the last wolves were killed in the 1920s, completing a near-total extinction across the continental US lower 48 states. For decades, ecosystems that had evolved with wolves as apex predators continued without them.

The consequences of this absence took time to become apparent. In Yellowstone, the elk population — no longer kept in check by predators — exploded. Hungry elk overgrazed the riverbanks, destroying young willow and aspen trees. Without these trees, songbird numbers fell, beavers (which require willow for both food and dam-building) declined, and erosion increased. Streams ran wider and shallower, water temperatures rose, and fish populations suffered. What appeared at first to be many separate ecological problems were, biologists eventually realised, downstream effects of a single missing species.

In 1995, after decades of debate, wildlife authorities reintroduced 14 wolves captured in Canada to Yellowstone. The decision was controversial. Ranchers feared losses to their cattle and sheep. Some hunters worried about reduced elk populations. Conservationists, however, argued that restoring the ecosystem required restoring its apex predator. The wolves were released, monitored carefully with radio collars, and given legal protection within the park.

The results have been dramatic and, in some ways, surprising. The elk population did decline, as expected, from around 19,000 in the mid-1990s to fewer than 5,000 today. But the more remarkable changes were behavioural. Elk learned to avoid riverbanks and other areas where they were vulnerable to ambush. In these abandoned areas, vegetation regenerated. Within five years, willow and aspen heights doubled. Songbirds returned. Beavers multiplied. The structure of streams themselves began to change as plants stabilised the banks. This phenomenon — where a predator changes the behaviour of its prey, which in turn changes the landscape — is now known as a "trophic cascade".

Some of the original predictions proved wrong, however. Coyote populations, which had thrived in the wolves' absence, fell sharply as wolves outcompeted and killed them. This benefited foxes and various small mammals that coyotes had been preying on. Bears, surprisingly, benefited too: they scavenged from wolf kills, gaining easy meals especially in spring when food was scarce. Even the local raven population grew, as ravens also fed on carcasses left by wolves.

Critics of the reintroduction have raised valid concerns. Wolves do occasionally kill livestock — about 200 head of cattle and sheep per year in the Greater Yellowstone area. While compensation programmes exist, ranchers point to the time and emotional cost of losses. There are also concerns that wolf populations have grown beyond the park's boundaries, potentially affecting human communities. As of 2024, wolf populations in the Northern Rockies have stabilised at around 1,700 individuals, leading some states to allow regulated hunting outside of national parks.

The Yellowstone wolf story has influenced conservation policy worldwide. In Europe, wolves have naturally recolonised areas of France, Germany, and Scandinavia after decades of protection — a trend supported, though not without controversy, by EU conservation laws. Some scientists now argue that "rewilding" — the deliberate restoration of natural ecosystems through reintroducing key species — could help reverse biodiversity loss elsewhere. Others caution that wolves are not a universal solution: each ecosystem is different, and reintroduction works best where suitable habitat and prey species still exist.

Whether you view the wolf's return as a conservation triumph or a complicated experiment, one thing is clear: the absence of a top predator has consequences that ripple through entire ecosystems for decades. As humans continue to reshape the natural world, the Yellowstone case offers both a warning and a hope — that some changes, given time and political will, can be reversed.`

const READING_P1_QUESTIONS = [
  // Q1-5: TFN
  { questionNumber: 1, questionType: 'TFN', prompt: 'Wolves had been completely eliminated from Western Europe by 1900.', correctAnswer: 'NOT GIVEN', points: 1, explanation: 'The text says "by the early twentieth century" which is around 1900-1920s, but the precise year 1900 is not given.' },
  { questionNumber: 2, questionType: 'TFN', prompt: 'The last wolves in Yellowstone were killed during the 1920s.', correctAnswer: 'TRUE', points: 1, explanation: 'Directly stated in paragraph 1.' },
  { questionNumber: 3, questionType: 'TFN', prompt: 'Elk populations grew because wolves were no longer present.', correctAnswer: 'TRUE', points: 1, explanation: '"The elk population — no longer kept in check by predators — exploded."' },
  { questionNumber: 4, questionType: 'TFN', prompt: 'All hunters supported the reintroduction of wolves.', correctAnswer: 'FALSE', points: 1, explanation: '"Some hunters worried about reduced elk populations" — directly contradicts.' },
  { questionNumber: 5, questionType: 'TFN', prompt: 'Bears suffered as a result of wolf reintroduction.', correctAnswer: 'FALSE', points: 1, explanation: '"Bears, surprisingly, benefited too" — opposite is stated.' },
  // Q6-9: Sentence completion
  { questionNumber: 6, questionType: 'SENTENCE_COMPLETION', prompt: 'The phenomenon where a predator indirectly changes the landscape through its prey is called a ______.', correctAnswer: 'trophic cascade', points: 1, explanation: 'Direct phrase from paragraph 4.' },
  { questionNumber: 7, questionType: 'SENTENCE_COMPLETION', prompt: 'Wolves outcompeted ______, which benefited foxes and small mammals.', correctAnswer: 'coyotes', points: 1 },
  { questionNumber: 8, questionType: 'SENTENCE_COMPLETION', prompt: 'Wolves kill approximately ______ livestock animals per year in the Greater Yellowstone area.', correctAnswer: '200|two hundred', points: 1 },
  { questionNumber: 9, questionType: 'SENTENCE_COMPLETION', prompt: 'As of 2024, the Northern Rockies wolf population is approximately ______.', correctAnswer: '1700|1,700', points: 1 },
  // Q10-13: MCQ on inference
  {
    questionNumber: 10, questionType: 'MCQ_SINGLE',
    prompt: 'According to the passage, what was the MAIN reason ranchers opposed the reintroduction?',
    options: JSON.stringify([
      'They believed wolves were not native to the area',
      'They feared their livestock would be attacked',
      'They wanted the elk population to remain high',
      'They believed wolves were dangerous to humans',
    ]),
    correctAnswer: 'B', points: 1,
    explanation: '"Ranchers feared losses to their cattle and sheep" — clear in paragraph 3.',
  },
  {
    questionNumber: 11, questionType: 'MCQ_SINGLE',
    prompt: 'Why did the songbird population fall before wolves were reintroduced?',
    options: JSON.stringify([
      'Wolves had been hunting them',
      'Elk had destroyed the trees that songbirds depended on',
      'Climate change affected their migration',
      'Their food sources were depleted by other species',
    ]),
    correctAnswer: 'B', points: 1,
    explanation: 'Paragraph 2: "Hungry elk overgrazed the riverbanks, destroying young willow and aspen trees. Without these trees, songbird numbers fell."',
  },
  {
    questionNumber: 12, questionType: 'MCQ_SINGLE',
    prompt: 'What does the writer suggest about the future of rewilding programmes?',
    options: JSON.stringify([
      'They are the only way to restore biodiversity',
      'They should be implemented in all damaged ecosystems',
      'Their success depends on the specific conditions of each ecosystem',
      'They are too controversial to be expanded',
    ]),
    correctAnswer: 'C', points: 1,
    explanation: 'Paragraph 7: "each ecosystem is different, and reintroduction works best where suitable habitat and prey species still exist."',
  },
  {
    questionNumber: 13, questionType: 'MCQ_SINGLE',
    prompt: 'What is the writer\'s overall view of the Yellowstone wolf reintroduction?',
    options: JSON.stringify([
      'It was an unambiguous success',
      'It was a complete failure',
      'It is a complex case with both benefits and challenges',
      'It should not have been attempted',
    ]),
    correctAnswer: 'C', points: 1,
    explanation: 'The final paragraph explicitly says "whether you view the wolf\'s return as a conservation triumph or a complicated experiment" — the writer presents both sides.',
  },
]

// ============================================================
// WRITING TASK 1 & TASK 2
// ============================================================
const WRITING_TASK_1 = {
  questionNumber: 1, questionType: 'ESSAY_TASK1',
  prompt: `The line graph below shows the percentage of households in three age groups (18-34, 35-54, 55+) that primarily shopped online in a major European country between 2010 and 2024.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.

[Data trend description for AI grading purposes:
- 18-34 group: rose from 35% in 2010 to 82% in 2024, with steady growth
- 35-54 group: rose from 20% in 2010 to 68% in 2024, accelerating after 2018
- 55+ group: rose from 5% in 2010 to 42% in 2024, with sharpest growth after the 2020 pandemic year
- All three groups converged in growth pattern after 2020]`,
  correctAnswer: '[Writing Task 1 — graded by AI on Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy]',
  points: 0,
}

const WRITING_TASK_2 = {
  questionNumber: 2, questionType: 'ESSAY_TASK2',
  prompt: `Some people believe that university students should pay the full cost of their education, while others believe that higher education should be free for all citizens.

Discuss both views and give your own opinion.

Write at least 250 words.`,
  correctAnswer: '[Writing Task 2 — graded by AI on Task Response, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy. Position should be clearly stated and consistent.]',
  points: 0,
}

// ============================================================
// SPEAKING PARTS
// ============================================================
const SPEAKING_PART_1 = [
  { questionNumber: 1, questionType: 'SPEAKING_PART1', prompt: 'Let\'s talk about your hometown. Where do you come from, and what is it like?', correctAnswer: '[3-4 sentences expected. AI grades on fluency, lexical resource, grammar, pronunciation.]', points: 0 },
  { questionNumber: 2, questionType: 'SPEAKING_PART1', prompt: 'Do you prefer staying in your hometown or living somewhere else? Why?', correctAnswer: '[3-4 sentences expected.]', points: 0 },
  { questionNumber: 3, questionType: 'SPEAKING_PART1', prompt: 'What do you usually do in your free time?', correctAnswer: '[3-4 sentences expected.]', points: 0 },
]

const SPEAKING_PART_2 = {
  questionNumber: 4, questionType: 'SPEAKING_PART2',
  prompt: `Describe a difficult decision you have made.
You should say:
- what the decision was
- when you had to make it
- what factors you considered
- and explain why it was difficult

You will have 1 minute to prepare, then speak for 1-2 minutes.`,
  correctAnswer: '[2-minute monologue. AI grades on fluency, lexical resource, grammar, pronunciation. Must address all 4 bullet points.]',
  points: 0,
}

const SPEAKING_PART_3 = [
  { questionNumber: 5, questionType: 'SPEAKING_PART3', prompt: 'Are some types of decisions easier than others? Why?', correctAnswer: '[Abstract discussion. 30-60 second responses with reasoning + example.]', points: 0 },
  { questionNumber: 6, questionType: 'SPEAKING_PART3', prompt: 'How do people typically make important life decisions?', correctAnswer: '[Abstract discussion.]', points: 0 },
  { questionNumber: 7, questionType: 'SPEAKING_PART3', prompt: 'Do you think people make better decisions individually or in groups? Why?', correctAnswer: '[Abstract discussion.]', points: 0 },
]

// ============================================================
// SEED FUNCTION
// ============================================================
export async function seedMockTest(db: PrismaClient) {
  // Clean existing mock test data
  await db.mockTestAnswer.deleteMany()
  await db.mockTestAttempt.deleteMany()
  await db.mockTestQuestion.deleteMany()
  await db.mockTestPart.deleteMany()
  await db.mockTest.deleteMany()

  const test = await db.mockTest.create({
    data: {
      title: TEST_TITLE,
      testType: 'ACADEMIC',
      source: 'TAIELTS Original',
      targetBand: 6.5,
      description: TEST_DESCRIPTION,
      isPublished: true,
    },
  })

  // Listening Section 1
  const l1 = await db.mockTestPart.create({
    data: {
      testId: test.id,
      skill: 'LISTENING',
      partNumber: 1,
      title: 'Section 1: Booking a fitness membership',
      passage: LISTENING_S1_TRANSCRIPT,
      timeMinutes: 8,
      instructions: 'Listen to the conversation and complete the form. Write NO MORE THAN THREE WORDS or A NUMBER for each answer.',
    },
  })
  for (const q of LISTENING_S1_QUESTIONS) {
    await db.mockTestQuestion.create({ data: { ...q, partId: l1.id } })
  }

  // Listening Section 2
  const l2 = await db.mockTestPart.create({
    data: {
      testId: test.id,
      skill: 'LISTENING',
      partNumber: 2,
      title: 'Section 2: Tour of Riverside Park',
      passage: LISTENING_S2_TRANSCRIPT,
      timeMinutes: 8,
      instructions: 'Listen to the tour guide. For questions 11-15, match each location to the correct position (A-G) on the map. For questions 16-20, follow the specific instructions for each question.',
    },
  })
  for (const q of LISTENING_S2_QUESTIONS) {
    await db.mockTestQuestion.create({ data: { ...q, partId: l2.id } })
  }

  // Reading Passage 1
  const r1 = await db.mockTestPart.create({
    data: {
      testId: test.id,
      skill: 'READING',
      partNumber: 1,
      title: 'The Return of the Wolf',
      passage: READING_P1_PASSAGE,
      timeMinutes: 20,
      instructions: 'You should spend about 20 minutes on Questions 1-13, which are based on the reading passage.',
    },
  })
  for (const q of READING_P1_QUESTIONS) {
    await db.mockTestQuestion.create({ data: { ...q, partId: r1.id } })
  }

  // Writing Task 1
  const w1 = await db.mockTestPart.create({
    data: {
      testId: test.id,
      skill: 'WRITING',
      partNumber: 1,
      title: 'Writing Task 1 — Online Shopping by Age Group',
      timeMinutes: 20,
      instructions: 'You should spend about 20 minutes on this task. Write at least 150 words. Describe the chart objectively — DO NOT include personal opinions.',
    },
  })
  await db.mockTestQuestion.create({ data: { ...WRITING_TASK_1, partId: w1.id } })

  // Writing Task 2
  const w2 = await db.mockTestPart.create({
    data: {
      testId: test.id,
      skill: 'WRITING',
      partNumber: 2,
      title: 'Writing Task 2 — University Tuition',
      timeMinutes: 40,
      instructions: 'You should spend about 40 minutes on this task. Write at least 250 words. Give reasons for your answer and include any relevant examples from your knowledge or experience.',
    },
  })
  await db.mockTestQuestion.create({ data: { ...WRITING_TASK_2, partId: w2.id } })

  // Speaking Part 1
  const sp1 = await db.mockTestPart.create({
    data: {
      testId: test.id,
      skill: 'SPEAKING',
      partNumber: 1,
      title: 'Speaking Part 1 — Introduction & Familiar Topics',
      timeMinutes: 5,
      instructions: 'Answer each question with 3-4 sentences. Paste a transcript of your spoken response.',
    },
  })
  for (const q of SPEAKING_PART_1) {
    await db.mockTestQuestion.create({ data: { ...q, partId: sp1.id } })
  }

  // Speaking Part 2
  const sp2 = await db.mockTestPart.create({
    data: {
      testId: test.id,
      skill: 'SPEAKING',
      partNumber: 2,
      title: 'Speaking Part 2 — Long Turn (Cue Card)',
      timeMinutes: 4,
      instructions: 'Prepare for 1 minute, then speak for 1-2 minutes. Paste a transcript of your monologue.',
    },
  })
  await db.mockTestQuestion.create({ data: { ...SPEAKING_PART_2, partId: sp2.id } })

  // Speaking Part 3
  const sp3 = await db.mockTestPart.create({
    data: {
      testId: test.id,
      skill: 'SPEAKING',
      partNumber: 3,
      title: 'Speaking Part 3 — Discussion',
      timeMinutes: 5,
      instructions: 'Each question requires 30-60 seconds of discussion. Paste transcripts for all 3 questions combined.',
    },
  })
  for (const q of SPEAKING_PART_3) {
    await db.mockTestQuestion.create({ data: { ...q, partId: sp3.id } })
  }

  const totalQuestions =
    LISTENING_S1_QUESTIONS.length +
    LISTENING_S2_QUESTIONS.length +
    READING_P1_QUESTIONS.length +
    2 + // Writing tasks
    SPEAKING_PART_1.length +
    1 + // Speaking Part 2
    SPEAKING_PART_3.length

  console.log(`  ✓ 1 mock test seeded — ${totalQuestions} questions across Listening/Reading/Writing/Speaking`)
  return 1
}
