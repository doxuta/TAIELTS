import { PrismaClient } from '@prisma/client'

interface Cue {
  part: number
  topic: string
  prompt: string
  bulletPoints?: string[]
  followUps?: string[]
  band?: number
  sampleAnswer?: string
}

// ============================================================
// PART 1 — Personal questions (3-4 sentence answers expected)
// ============================================================
const PART_1_CUES: Cue[] = [
  {
    part: 1, topic: 'Hometown',
    prompt: 'Can you tell me about your hometown?',
    sampleAnswer: 'I come from Hanoi, the capital of Vietnam. It is a city with over a thousand years of history, so you can find ancient temples next to modern skyscrapers. What I love most is the food culture — especially pho and bun cha. The traffic can be chaotic, but it makes the city feel alive.',
    band: 7,
  },
  {
    part: 1, topic: 'Studies',
    prompt: 'What subject are you studying, and why did you choose it?',
    sampleAnswer: 'I am currently studying law at university. I chose it because I have always been interested in how rules shape society. My family also encouraged me — my uncle is a lawyer, and his stories made the profession sound fascinating. So far, I am enjoying it, especially constitutional law.',
    band: 7,
  },
  {
    part: 1, topic: 'Hobbies',
    prompt: 'What do you like to do in your free time?',
    sampleAnswer: 'In my free time, I usually read or watch films. I particularly enjoy historical fiction because it helps me learn while being entertained. On weekends I also try to go hiking with friends — it is a great way to clear my head after a busy week.',
    band: 7,
  },
  {
    part: 1, topic: 'Food',
    prompt: 'Do you prefer eating at home or in restaurants?',
    sampleAnswer: 'I generally prefer eating at home because the food is healthier and cheaper. Plus, my mother is a wonderful cook. However, on special occasions, I love going out to try different cuisines, especially Japanese or Italian.',
    band: 7,
  },
  {
    part: 1, topic: 'Technology',
    prompt: 'How often do you use your smartphone?',
    sampleAnswer: 'Probably too often, to be honest. I check it first thing in the morning and use it throughout the day for messaging, news, and study apps. I have been trying to reduce my screen time recently because I noticed it was affecting my sleep.',
    band: 7,
  },
  {
    part: 1, topic: 'Music',
    prompt: 'What kind of music do you like?',
    sampleAnswer: 'I enjoy a wide range of music, but my favourite is acoustic indie. The simplicity of guitar and voice really resonates with me. I also like Vietnamese pop, especially older songs from the 90s — they remind me of my childhood.',
    band: 6,
  },
  {
    part: 1, topic: 'Travel',
    prompt: 'Do you enjoy travelling?',
    sampleAnswer: 'Yes, I love travelling, although I have not had many opportunities yet. So far I have only visited a few cities within Vietnam, but I dream of going to Japan and Europe. I think travel broadens your perspective in ways nothing else can.',
    band: 7,
  },
  {
    part: 1, topic: 'Weather',
    prompt: 'What kind of weather do you prefer?',
    sampleAnswer: 'I prefer cool, dry weather — autumn in Hanoi is my favourite season. The temperature is comfortable, the sky is clear, and you can spend hours walking outdoors. I find hot, humid summers exhausting, especially during exams.',
    band: 6,
  },
  {
    part: 1, topic: 'Sleep',
    prompt: 'How important is sleep to you?',
    sampleAnswer: 'Sleep is essential for me. Without at least seven hours, I struggle to focus and feel irritable. I try to keep a consistent bedtime, although it is not always possible during exam periods. I also avoid using my phone right before bed.',
    band: 7,
  },
  {
    part: 1, topic: 'Family',
    prompt: 'How would you describe your family?',
    sampleAnswer: 'My family is quite close-knit. We have dinner together almost every evening, which I really value. My parents are both teachers and quite strict about education, but they are also very supportive. I am the youngest of two — my older brother lives in Ho Chi Minh City.',
    band: 7,
  },
]

// ============================================================
// PART 2 — Cue cards (2-minute monologue)
// ============================================================
const PART_2_CUES: Cue[] = [
  {
    part: 2, topic: 'A book you recently read',
    prompt: 'Describe a book you recently read.',
    bulletPoints: [
      'what the book was about',
      'when and where you read it',
      'why you decided to read it',
      'and explain how it affected you',
    ],
    band: 7,
    sampleAnswer: `I would like to talk about "Atomic Habits" by James Clear, which I read about three months ago.

The book is essentially a guide to building good habits and breaking bad ones. It introduces this idea that small, one-percent improvements compound over time into massive changes. The author breaks habit formation into four laws: make it obvious, attractive, easy, and satisfying.

I read it mostly on weekends in my favourite café near my house. I would order a coffee, find a quiet corner, and read for two or three hours at a time. It took me about a month to finish.

I decided to read it because a friend who is studying psychology recommended it. He told me it had genuinely changed his daily routine. Around that time, I was struggling to study consistently, so I thought I might find some practical advice.

As for how it affected me — quite significantly, actually. I started waking up at five in the morning to study English, and I built a habit of reviewing vocabulary for ten minutes after lunch every day. The book taught me that motivation is unreliable, but systems are not. Instead of trying to feel motivated, I just design my environment so that the right action becomes the easiest one. Looking back, that single shift in thinking has probably had the biggest impact on my productivity this year.`,
  },
  {
    part: 2, topic: 'A place you would like to visit',
    prompt: 'Describe a place you would like to visit in the future.',
    bulletPoints: [
      'where it is',
      'how you found out about it',
      'what you would do there',
      'and explain why you want to visit it',
    ],
    band: 7,
    sampleAnswer: `I would love to visit Kyoto in Japan. It is the cultural heart of the country, located in the central part of the main island.

I first heard about Kyoto when I was about fifteen, watching a documentary about cherry blossom season. The way the historic temples and shrines were surrounded by pink petals just looked magical to me. Since then, I have read several books and articles about the city, and it has stayed at the top of my travel list.

If I went there, I would prioritise visiting Fushimi Inari shrine with its famous orange gates, and Kinkaku-ji, the golden temple. I would also try to do a traditional tea ceremony and visit the bamboo forest in Arashiyama. Food-wise, I would love to try authentic kaiseki cuisine, which apparently is a multi-course meal that is almost like art.

There are a few reasons I want to visit. Firstly, I am genuinely fascinated by Japanese culture — the balance between extreme modernity and ancient tradition. Secondly, I have been studying a bit of Japanese on my own, so it would be exciting to use what I have learned. And finally, I think travelling to a country so culturally different from Vietnam would push me out of my comfort zone in a healthy way. I am planning to save up after I graduate, and hopefully visit within the next two or three years.`,
  },
  {
    part: 2, topic: 'A skill you would like to learn',
    prompt: 'Describe a skill you would like to learn.',
    bulletPoints: [
      'what the skill is',
      'how you would learn it',
      'how long it might take',
      'and explain why you want to learn it',
    ],
    band: 7,
    sampleAnswer: `The skill I would most like to learn is public speaking. I have always admired people who can stand in front of an audience and communicate with confidence and clarity.

To learn this, I would probably do a few things in parallel. I would join a public speaking club like Toastmasters, which has chapters in Hanoi. I would also watch TED talks and try to analyse what the best speakers do — their pacing, gestures, how they handle pauses. And I would force myself to volunteer for presentations at university, even small ones.

I think it would take at least a year of consistent practice to become genuinely comfortable, and probably three to five years to reach a high level. But the early improvements happen quickly — even after a few sessions, you usually notice progress.

The reason I want to learn this skill is mostly practical. As a law student, I will eventually have to argue in court or speak in meetings, and being good at public speaking will give me a real professional advantage. But there is a personal reason too: I am quite an introverted person, and I find speaking in groups quite stressful. I think mastering this skill would build my confidence in many other areas of life. Plus, if I can articulate my ideas clearly, I think I will be able to influence people for the better — which is what attracted me to law in the first place.`,
  },
  {
    part: 2, topic: 'A memorable teacher',
    prompt: 'Describe a teacher who has influenced you.',
    bulletPoints: [
      'who the teacher was',
      'when they taught you',
      'what subject they taught',
      'and explain why they influenced you',
    ],
    band: 8,
    sampleAnswer: `I would like to talk about my English teacher in upper secondary school, Mrs Hoa. She taught me from when I was sixteen until I graduated at eighteen, so for about two years.

Her subject was English, but in retrospect she taught us far more than language. She had a way of weaving in critical thinking — for instance, after we read a poem, she would ask us not just what it meant, but what assumptions the poet was making, and whether we agreed. That habit of questioning has stayed with me ever since.

What made her so influential was a combination of things. Firstly, she had impossibly high standards. She would never accept lazy answers; if you said something was "good", she would ask "good how, exactly?" until you found a more precise word. At first this was frustrating, but it taught me to think before I speak. Secondly, she genuinely believed in her students. She told me once that I had a "writer's mind" — that single comment gave me the confidence to pursue subjects that involved writing and argument, which eventually led me to law.

But perhaps the most lasting influence was something quieter. She never raised her voice, even when the class was chaotic. She would simply pause and wait. And the room would fall silent. I learned from her that authority does not come from volume — it comes from preparation and presence. Whenever I am nervous about speaking in front of people now, I think of how she carried herself, and try to channel that same calm focus.`,
  },
  {
    part: 2, topic: 'A piece of advice you received',
    prompt: 'Describe a piece of advice you received that changed your life.',
    bulletPoints: [
      'what the advice was',
      'who gave it to you',
      'when you received it',
      'and explain how it changed your life',
    ],
    band: 7,
    sampleAnswer: `The piece of advice I want to share came from my grandfather, and it was simply: "Comparison is the thief of joy."

He told me this when I was about sixteen, during a difficult period at school. I had just received my exam results and they were lower than several friends, and I was visibly upset. We were sitting in his garden one evening, and he turned to me and said it quite casually, as if it were obvious. He explained that whenever I compare my chapter one to someone else's chapter ten, I will always feel inadequate, but the comparison is unfair.

At first I did not really understand it. But over the years, especially when I started university, the advice has come back to me again and again. Whenever I see classmates getting internships at big firms or speaking more confident English, the old anxiety creeps in. And then I hear my grandfather's voice and remind myself that those people had different starting points and different journeys.

It has changed my life in a few concrete ways. I deleted Instagram during exam season because I noticed it triggered constant comparison. I also started keeping a journal where I track my own progress over time, instead of measuring myself against others. And in conversations, I have become quicker to celebrate friends' successes rather than feel threatened by them. Looking back, that one sentence from my grandfather has saved me from a lot of unnecessary unhappiness, and I think I will carry it with me for the rest of my life.`,
  },
  {
    part: 2, topic: 'A piece of technology you cannot live without',
    prompt: 'Describe a piece of technology that you find useful.',
    bulletPoints: [
      'what it is',
      'how often you use it',
      'how it has changed your life',
      'and explain why you find it so useful',
    ],
    band: 7,
    sampleAnswer: `The piece of technology I want to talk about is my noise-cancelling headphones, specifically the Sony WH-1000XM4 model.

I use them every single day, for several hours. Usually I wear them when I am studying at home, commuting on the bus, or working in noisy cafés. They are particularly essential during exam preparation when I need deep focus.

They have changed my life in ways I did not expect when I first bought them. Hanoi is a loud city — there is constant traffic noise, horns, construction. Before the headphones, I would lose my concentration every few minutes. With them on, I can enter what psychologists call "deep work" mode, where I might study for two or three hours without breaking focus. My grades have noticeably improved since I started using them.

The reason I find them so useful is not just the noise cancellation, although that is the main feature. The sound quality means I can also use them for relaxation — listening to music, podcasts in English, or audiobooks. So they serve both my work and my downtime. Beyond the practical aspects, they also feel like a small physical signal — when I put them on, my brain knows it is time to focus. It is almost like a ritual.

Of course, there is a downside: they are expensive, and I had to save for months. But honestly, considering how often I use them and how much they have improved my productivity, I think they are one of the best purchases I have ever made.`,
  },
  {
    part: 2, topic: 'A difficult decision you made',
    prompt: 'Describe a difficult decision you had to make.',
    bulletPoints: [
      'what the decision was',
      'when you had to make it',
      'what factors you considered',
      'and explain why it was difficult',
    ],
    band: 8,
    sampleAnswer: `One of the most difficult decisions I have made was choosing to study law instead of computer science, which I made in the last year of secondary school.

This was around two years ago, just before I had to submit my university applications. The deadline gave me about three weeks to decide, and I remember the conversations with my parents going late into the night for most of those weeks.

The factors were complex. On the practical side, computer science had clearer job prospects — Vietnam's tech industry was growing rapidly, salaries were higher, and my older brother was already a successful software engineer who could mentor me. On the other side, I had always been more drawn to language, argument, and history. Law felt like a better fit for how my mind worked, even if the financial return seemed less certain. There was also the question of my parents' expectations — they had subtly hoped I would follow my brother's path.

What made it so difficult was that there was no clearly wrong answer. Both choices had genuine merits, and I worried that whichever I chose, I would always wonder about the other path. I spent hours making pros-and-cons lists, talking to friends, even shadowing professionals in both fields. In the end, I made the decision by asking myself a single question: in ten years, which version of myself would I be more proud of? The answer was clear — the lawyer who fought for things she cared about, even if she earned less.

Looking back, I do not regret the choice, but I respect how genuinely hard it was. I think it taught me that big life decisions rarely come with certainty — you choose your values, and then commit to them fully.`,
  },
  {
    part: 2, topic: 'A goal you achieved',
    prompt: 'Describe a personal goal you have achieved.',
    bulletPoints: [
      'what the goal was',
      'how long it took',
      'what challenges you faced',
      'and explain how you felt after achieving it',
    ],
    band: 7,
    sampleAnswer: `The personal goal I want to talk about is improving my English from a beginner level to being able to hold a conversation, which I achieved over roughly two years.

When I started seriously studying English in tenth grade, I was honestly quite bad. I could read slowly and write short sentences, but speaking was almost impossible — I would freeze up after a few words. My goal was simple: to be able to have a thirty-minute conversation with a foreigner without panicking.

It took about two years of consistent effort. I made a study plan and stuck to it: thirty minutes of vocabulary practice every morning, an hour of listening to podcasts during my commute, and weekly conversation sessions with a language exchange partner I found online.

The biggest challenge was the fear of speaking. Even when I had the vocabulary, my brain would lock up. I overcame this slowly by forcing myself into uncomfortable situations — joining English-speaking clubs, talking to tourists in the Old Quarter, recording myself speaking and listening back even though I hated my voice. There was also the challenge of plateaus — periods of weeks where I felt I was not improving at all, which were really discouraging.

When I finally had a fluent thirty-minute conversation with a tourist from Australia in a coffee shop, I almost could not believe it. The feeling was a mixture of pride, relief, and quiet confidence. More importantly, it changed how I saw myself. If I could go from being terrified to confident in two years, what else could I learn? That goal essentially became a foundation for everything I have done since.`,
  },
  {
    part: 2, topic: 'A childhood memory',
    prompt: 'Describe a happy memory from your childhood.',
    bulletPoints: [
      'what the memory is',
      'when it happened',
      'who was with you',
      'and explain why it is special',
    ],
    band: 7,
    sampleAnswer: `One of my happiest childhood memories is the summer trip to Sapa with my grandparents, when I was about eight years old.

It happened in the summer of 2012, during the school holidays. My parents were both working, so they sent my older brother and me to stay with our grandparents in Lao Cai. Then one weekend, our grandfather suggested we drive up to Sapa to escape the heat.

It was just the four of us — my grandparents, my brother, and me. My grandfather drove the old Toyota up the mountain roads, which were terrifying and beautiful at the same time. I remember pressing my face against the window watching rice terraces fall away below us. We stayed in a small homestay run by an H'Mong family, ate sticky rice cooked in bamboo, and walked through villages I had only seen on TV.

What made it special is hard to put into words. Partly it was the natural beauty — the mountains, the mist, the cool air after Hanoi's heat. But more than that, it was a feeling of being completely cared for. My grandparents told stories about their own childhood, my brother was kinder than usual, and there was no school, no homework, nothing to worry about. It was one of those rare moments in childhood where everything felt safe and right at the same time.

My grandfather passed away two years ago, so this memory has become even more precious. Whenever I feel anxious about the future, I sometimes close my eyes and put myself back in that Toyota winding up the mountain — and I feel calm.`,
  },
  {
    part: 2, topic: 'A change you would like to make',
    prompt: 'Describe a change you would like to make in your life.',
    bulletPoints: [
      'what the change is',
      'when you would like to make it',
      'how you plan to do it',
      'and explain why this change is important',
    ],
    band: 7,
    sampleAnswer: `The change I would most like to make is establishing a consistent exercise routine. I have been thinking about this for a long time but have never quite committed to it.

Ideally, I would like to start within the next month — there is no point in waiting any longer. I have been telling myself "I will start next week" for over a year, and at some point you just have to begin.

My plan is to start small to avoid burning out. Specifically, I would do thirty minutes of activity, four times a week — a mix of running in the park near my house and home workouts using YouTube videos. I have also signed up for a yoga class on Saturdays as a way of making one session social and therefore harder to skip. I plan to track my sessions on a calendar so I can see my consistency over time.

This change is important to me for several reasons. Firstly, my studies have made me very sedentary — I sit at a desk for ten hours a day and my back has started to ache, which is concerning at my age. Secondly, I have noticed my energy levels dropping in the afternoons, and I think regular exercise would help with that. But beyond the physical, I want to prove to myself that I can build a habit and stick to it. I have struggled with consistency in many areas of my life, and exercise feels like a manageable place to start. If I can master this one habit, I think it will give me the confidence to tackle bigger goals.`,
  },
]

// ============================================================
// PART 3 — Abstract discussion questions
// ============================================================
const PART_3_CUES: Cue[] = [
  { part: 3, topic: 'Books and reading', prompt: 'Do you think people read fewer books today than in the past? Why or why not?' },
  { part: 3, topic: 'Books and reading', prompt: 'How important is reading for children\'s development?' },
  { part: 3, topic: 'Travel', prompt: 'What are the benefits of travelling abroad compared to travelling within your own country?' },
  { part: 3, topic: 'Travel', prompt: 'Do you think mass tourism is harmful to local cultures?' },
  { part: 3, topic: 'Technology', prompt: 'In what ways has technology changed the way we learn?' },
  { part: 3, topic: 'Technology', prompt: 'Do you think people rely too much on technology nowadays?' },
  { part: 3, topic: 'Education', prompt: 'Should universities focus on preparing students for jobs or on developing critical thinking?' },
  { part: 3, topic: 'Education', prompt: 'How will education change in the next 30 years?' },
  { part: 3, topic: 'Family', prompt: 'How has the role of grandparents changed in modern society?' },
  { part: 3, topic: 'Family', prompt: 'Do you think family is still as important as it used to be?' },
  { part: 3, topic: 'Environment', prompt: 'What can individuals do to help the environment?' },
  { part: 3, topic: 'Environment', prompt: 'Should governments do more to combat climate change, or is it the responsibility of individuals?' },
  { part: 3, topic: 'Work', prompt: 'Do you think people work too much these days?' },
  { part: 3, topic: 'Work', prompt: 'How has the workplace changed since the rise of remote work?' },
  { part: 3, topic: 'Society', prompt: 'Why do you think there is increasing inequality in many countries?' },
  { part: 3, topic: 'Society', prompt: 'What role should the government play in reducing inequality?' },
  { part: 3, topic: 'Decisions', prompt: 'Are some types of decisions easier than others? Why?' },
  { part: 3, topic: 'Decisions', prompt: 'How do people make important life decisions?' },
  { part: 3, topic: 'Goals', prompt: 'Why do you think some people achieve their goals while others do not?' },
  { part: 3, topic: 'Goals', prompt: 'Is it better to set long-term or short-term goals?' },
]

export async function seedSpeakingCues(db: PrismaClient) {
  await db.speakingCueCard.deleteMany()

  // Part 1
  for (const c of PART_1_CUES) {
    await db.speakingCueCard.create({
      data: { part: c.part, topic: c.topic, prompt: c.prompt, sampleAnswer: c.sampleAnswer, band: c.band },
    })
  }

  // Part 2 (with bullet points + follow-ups)
  for (let i = 0; i < PART_2_CUES.length; i++) {
    const c = PART_2_CUES[i]
    // Pair each Part 2 with the corresponding Part 3 follow-ups by index
    const p3Pair = PART_3_CUES.slice(i * 2, i * 2 + 2).map(p => p.prompt)
    await db.speakingCueCard.create({
      data: {
        part: c.part,
        topic: c.topic,
        prompt: c.prompt,
        bulletPoints: JSON.stringify(c.bulletPoints),
        followUps: JSON.stringify(p3Pair),
        sampleAnswer: c.sampleAnswer,
        band: c.band,
      },
    })
  }

  // Part 3 (standalone)
  for (const c of PART_3_CUES) {
    await db.speakingCueCard.create({
      data: { part: c.part, topic: c.topic, prompt: c.prompt },
    })
  }

  const total = PART_1_CUES.length + PART_2_CUES.length + PART_3_CUES.length
  console.log(`  ✓ ${total} speaking cue cards seeded (${PART_1_CUES.length} P1 + ${PART_2_CUES.length} P2 + ${PART_3_CUES.length} P3)`)
  return total
}
