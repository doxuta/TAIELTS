import { PrismaClient } from '@prisma/client'

interface Essay {
  taskType: string
  band: number
  prompt: string
  essay: string
  wordCount: number
  examinerNotes: string
  topics: string
}

const ESSAYS: Essay[] = [
  // ==================================================
  // TASK 2 — OPINION (Agree/Disagree) — bands 6, 7, 8
  // ==================================================
  {
    taskType: 'TASK_2',
    band: 8,
    prompt: 'Some people believe that universities should focus on practical subjects which help students find jobs, while others argue that the main aim of higher education is to develop critical thinking. Discuss both views and give your own opinion.',
    essay: `Universities have always faced the dilemma between vocational training and intellectual development. While both have merit, I believe a balanced approach that prioritises critical thinking ultimately serves graduates and society better.

Proponents of practical, job-oriented education argue that universities exist to prepare students for the workforce. In an era of rising tuition fees and youth unemployment, this view has clear appeal. Programmes in engineering, computer science, and business equip graduates with marketable skills, leading to faster employment and higher starting salaries. For instance, vocational degrees in software engineering routinely command salaries 40 per cent above the national average in many developed economies. From this perspective, universities that fail to deliver employable graduates are failing their core purpose.

On the other hand, advocates of critical thinking argue that higher education should cultivate analytical, ethical, and creative capacities that endure beyond any specific job. Practical skills age rapidly — the programming languages taught a decade ago are largely obsolete today — but the ability to learn, question assumptions, and synthesise information remains valuable throughout one's career. A philosophy graduate trained in rigorous argument may, paradoxically, adapt to technological change more readily than someone trained narrowly in last year's software.

In my view, the false dichotomy obscures the real solution: universities should integrate both. Practical programmes can include reflective and analytical components, while liberal arts degrees can offer applied internships and industry collaboration. Without critical thinking, vocational graduates become technicians vulnerable to automation. Without practical exposure, intellectuals risk irrelevance. The most resilient graduates are those who think deeply AND can apply that thinking to real problems.

In conclusion, while both views capture half the truth, the future demands graduates capable of independent thought who can also translate ideas into action. Universities should resist the pressure to choose between these aims and instead design curricula that develop both simultaneously.`,
    wordCount: 309,
    examinerNotes: `Band 8 essay — strengths:
• Task Response: Fully addresses both views with equal weight. Position is clear from the introduction and consistently maintained. Each view is developed with specific reasoning and examples.
• Coherence and Cohesion: Each paragraph has a distinct purpose with smooth transitions. Cohesive devices ("On the other hand", "In my view", "paradoxically", "while", "without") are varied and used naturally — none feel mechanical.
• Lexical Resource: Sophisticated vocabulary used with precision: "false dichotomy", "obscures", "synthesise", "cultivates", "rigorous argument", "resilient graduates", "translate ideas into action". Strong topic-specific vocabulary (curricula, vocational, liberal arts).
• Grammatical Range: A wide variety of structures including conditionals ("graduates that fail are failing"), participial phrases ("trained in rigorous argument"), and complex sentences with multiple clauses. Almost entirely error-free.

Slight improvements possible: a few sentences are quite long; trimming would improve readability. But this would not affect the band.`,
    topics: 'education, employment, critical thinking',
  },
  {
    taskType: 'TASK_2',
    band: 7,
    prompt: 'Some people believe that universities should focus on practical subjects which help students find jobs, while others argue that the main aim of higher education is to develop critical thinking. Discuss both views and give your own opinion.',
    essay: `In recent years, there has been increasing debate about the purpose of universities. While some argue they should prepare students for specific careers, others believe their main role is to develop thinking skills. In my view, a combination of both is needed, with critical thinking being more important in the long term.

On one hand, supporters of practical education argue that universities should provide skills that lead directly to employment. With rising tuition fees, students and parents expect a clear return on investment. For example, graduates from engineering or computer science programmes often find well-paid jobs quickly because their skills match what companies need. This is especially important in countries with high youth unemployment, where vocational degrees can offer a faster path to financial independence.

On the other hand, others believe that universities should focus on developing critical thinking rather than narrow job skills. Job-specific knowledge can become outdated quickly — the technology used today may not be relevant in ten years. However, the ability to analyse problems, evaluate evidence, and adapt to new situations is useful throughout a person's career. For instance, a student who studies philosophy or history may seem less employable at first, but they often develop strong reasoning skills that benefit them in many fields.

In my opinion, both approaches have value, but critical thinking should be the priority. Practical skills can be learned through training programmes or on the job, but the ability to think clearly is much harder to develop later. Universities should therefore design courses that combine practical knowledge with deeper thinking — for example, by including research projects in vocational programmes.

In conclusion, while practical education has clear short-term benefits, critical thinking offers more lasting value. Universities should aim to develop both, but with thinking skills as the foundation.`,
    wordCount: 296,
    examinerNotes: `Band 7 essay — strengths:
• Task Response: Both views are addressed, with a clear position stated in intro and maintained. Each view has development with examples.
• Coherence and Cohesion: Clear 5-paragraph structure with appropriate linkers ("On one hand", "On the other hand", "For instance", "In my opinion"). Slight over-use of linkers but not mechanical.
• Lexical Resource: Range is adequate with some less common items ("vocational degrees", "narrow job skills", "return on investment", "financial independence"). Some collocations are natural.
• Grammatical Range: Mix of complex and simple sentences. A few sentences are formulaic but mostly error-free.

What would move this to Band 8: more sophisticated vocabulary (the essay uses "important" 3 times — could vary), more nuanced argumentation (the Band 8 version brings in the "false dichotomy" idea), and more varied sentence openings.`,
    topics: 'education, employment, critical thinking',
  },
  {
    taskType: 'TASK_2',
    band: 6,
    prompt: 'Some people believe that universities should focus on practical subjects which help students find jobs, while others argue that the main aim of higher education is to develop critical thinking. Discuss both views and give your own opinion.',
    essay: `Nowadays, many people debate about what universities should teach. Some think universities should teach practical things to help students find jobs. Others think they should teach critical thinking. I will discuss both views and give my opinion.

On one hand, some people think practical subjects are important because students need to find jobs after they graduate. If they study practical subjects like engineering, computer science or business, they can get a job easily and earn good money. Also, university is expensive, so students want to make sure they will get a good job. For example, my cousin studied IT and now he works at a big company.

On the other hand, other people think critical thinking is more important. They say students should learn how to think and not just how to do a job. Because jobs change over time, critical thinking can help students in their whole life. For example, if students learn how to solve problems, they can use this skill in many different situations.

In my opinion, both views are good. But I think critical thinking is more important because it helps students in many ways. Universities should teach both practical subjects and critical thinking. This way, students can find jobs and also think well.

In conclusion, universities should teach practical subjects and critical thinking. Both are important for students.`,
    wordCount: 217,
    examinerNotes: `Band 6 essay — strengths:
• Task Response: Addresses all parts of the task. Position is stated but somewhat unclear. Both views are presented but somewhat superficially.
• Coherence and Cohesion: Clear structure with paragraphing. Cohesive devices used ("On one hand", "On the other hand", "For example", "In conclusion") but a bit formulaic.
• Lexical Resource: Adequate range. Some repetition ("important" appears 6 times) and limited less common vocabulary. Word choices are simple: "good", "easily".
• Grammatical Range: Mainly simple sentences. Some complex structures attempted but with errors.

Specific issues:
- Under word count (under 250 — automatic penalty in Task Response).
- Vocabulary is too basic ("good money", "many ways", "good").
- Conclusion is too brief.

To move to Band 7: write 280-310 words, replace simple words with band-7 alternatives, develop each view more deeply with specific examples.`,
    topics: 'education, employment, critical thinking',
  },

  // ==================================================
  // TASK 2 — Problem-Solution
  // ==================================================
  {
    taskType: 'TASK_2',
    band: 8,
    prompt: 'In many countries, the proportion of older people is steadily increasing. Does this trend have more positive or negative effects on society?',
    essay: `Many developed nations are witnessing unprecedented demographic shifts as their populations age. While ageing societies bring significant challenges, particularly in healthcare and economic productivity, I believe the positive contributions of older citizens — when properly supported — outweigh the negatives.

The most frequently cited downside of population ageing concerns the strain on public resources. Pension systems designed in the mid-twentieth century assumed shorter retirement and a younger workforce; today, fewer workers support more retirees, creating fiscal pressure. Healthcare costs also escalate, as conditions like dementia and cardiovascular disease disproportionately affect older adults. In Japan, where over 28 per cent of the population is now aged 65 or above, public spending on aged care has nearly doubled in two decades. These pressures are real and demand serious policy responses.

However, focusing only on these costs ignores the substantial value older people contribute. They are often more financially stable, supporting younger family members and serving as economic anchors during downturns. Many continue working productively well past traditional retirement ages — particularly in advisory, mentorship, and entrepreneurial roles where accumulated experience is invaluable. Beyond economics, older citizens transmit cultural knowledge, support childcare for working parents, and provide volunteer labour that sustains community organisations. Studies in Singapore have shown that grandparents providing weekly childcare add billions in implicit economic value.

The decisive factor is policy design. Countries that view ageing only as a burden tend to see those negatives materialise — through forced retirement, age discrimination, and underinvestment in age-friendly infrastructure. Those that adapt — by extending working lives, redesigning urban spaces, and integrating older citizens into civic life — unlock significant benefits. Sweden's success in maintaining high senior labour participation while keeping pension systems sustainable illustrates this approach.

In conclusion, while ageing populations create real challenges, the trend brings considerable benefits if societies actively design for inclusion. Treating ageing as a crisis becomes a self-fulfilling prophecy; treating it as an opportunity, conversely, allows nations to harness the productivity and wisdom of an experienced cohort.`,
    wordCount: 333,
    examinerNotes: `Band 8 — exemplary essay.
• Task Response: Question fully addressed. Position is clear and nuanced ("benefits outweigh if properly supported"). Both sides considered with depth and specific examples.
• Coherence and Cohesion: Strong paragraph development with internal coherence. Linkers are sophisticated and used sparingly ("However", "Beyond economics", "The decisive factor", "conversely").
• Lexical Resource: Wide vocabulary used precisely: "demographic shifts", "fiscal pressure", "economic anchors", "implicit economic value", "self-fulfilling prophecy". Strong collocations throughout.
• Grammatical Range: Complex sentences with embedded clauses, participial phrases ("when properly supported"), and varied sentence openings. Almost error-free.

Standout features: specific data (Japan 28%, Singapore studies, Sweden), nuanced position avoiding simple agree/disagree, real-world policy insight.`,
    topics: 'demographic, ageing, society',
  },
  {
    taskType: 'TASK_2',
    band: 7,
    prompt: 'In many countries, the proportion of older people is steadily increasing. Does this trend have more positive or negative effects on society?',
    essay: `In recent decades, the proportion of elderly people in many countries has been rising rapidly. While this demographic shift brings several challenges, I believe it also offers significant benefits, especially when governments respond well.

On the negative side, an ageing population places pressure on public services. Pensions and healthcare costs increase because there are more retired people and fewer workers paying taxes to support them. For example, in Japan, where over 28% of citizens are over 65, healthcare spending has risen sharply over the past 20 years. In addition, older people may need long-term care, which is expensive and requires trained workers. Many countries are struggling to fund these services.

On the positive side, older people contribute significantly to society. Many continue working into their 70s, especially in advisory roles where their experience is valuable. They also help families by taking care of grandchildren, which allows parents to return to work. Furthermore, older citizens often volunteer in community organisations and pass on cultural knowledge to younger generations. These contributions are sometimes overlooked but they support the social and economic system.

In my opinion, whether ageing is positive or negative depends largely on how governments respond. Countries that increase the retirement age, invest in age-friendly infrastructure, and encourage older people to remain active can turn ageing into an opportunity. On the other hand, countries that ignore the issue or force early retirement will suffer the most.

In conclusion, while population ageing has some negative effects on the economy and healthcare, I believe the positives can outweigh them with good planning. Governments should view older citizens as a resource rather than a burden.`,
    wordCount: 279,
    examinerNotes: `Band 7 — strengths:
• Task Response: Position is clear and consistent. Both positive and negative effects covered. Specific example (Japan) included.
• Coherence and Cohesion: Logical 5-paragraph structure. Cohesive devices appropriate ("On the negative side", "On the positive side", "Furthermore", "In addition") — mostly natural, slight tendency toward formulaic.
• Lexical Resource: Good range. Some less common items ("demographic shift", "age-friendly infrastructure", "cultural knowledge"). Some collocations natural.
• Grammatical Range: Mix of complex and simple sentences. Most error-free. A few minor errors don't impede meaning.

Path to Band 8: develop arguments with more nuance, introduce a more sophisticated position (Band 8 example brings in the "self-fulfilling prophecy" angle), use more sophisticated vocabulary (the Band 8 version uses "implicit economic value", "fiscal pressure", "decisive factor").`,
    topics: 'demographic, ageing, society',
  },

  // ==================================================
  // TASK 1 ACADEMIC — Line graph + Bar chart
  // ==================================================
  {
    taskType: 'TASK_1_ACADEMIC',
    band: 8,
    prompt: 'The line graph shows the number of international students enrolled at universities in three countries (Australia, the UK, and Canada) between 2000 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    essay: `The line graph illustrates international student enrolment at universities in Australia, the UK, and Canada over a two-decade period from 2000 to 2020.

Overall, all three countries experienced substantial growth in international student numbers, with the UK consistently hosting the most students throughout the period. Australia and Canada, however, narrowed the gap significantly by 2020, particularly Canada, which saw the most dramatic relative increase.

In 2000, the UK led with approximately 250,000 international students, followed by Australia at around 150,000 and Canada lagging at just 80,000. Over the next decade, the UK expanded its lead, reaching a peak of around 480,000 by 2010, while Australia rose steadily to roughly 300,000 in the same year. Canada grew more modestly during this period, climbing to approximately 200,000.

From 2010 onwards, the trends diverged. UK enrolment plateaued and slightly declined to about 460,000 by 2020, possibly reflecting visa restrictions and Brexit-related concerns. In contrast, Australia continued its upward trajectory, surpassing 420,000 by 2020. Most strikingly, Canada experienced rapid growth in the second decade, more than doubling its numbers to reach 530,000 by 2020 — overtaking both Australia and the UK to become the leading destination among the three.`,
    wordCount: 200,
    examinerNotes: `Band 8 — strengths:
• Task Achievement: All key features identified and highlighted. Specific data used throughout. Clear, well-developed overview presents the most significant points.
• Coherence and Cohesion: Strong paragraphing (intro / overview / first half / second half). Cohesive devices ("Overall", "however", "In contrast", "Most strikingly") are sophisticated and varied.
• Lexical Resource: Good range of trend vocabulary used precisely ("expanded its lead", "plateaued and slightly declined", "upward trajectory", "narrowed the gap significantly"). Less common items: "more than doubled", "lagging", "most dramatic relative increase".
• Grammatical Range: Wide variety of structures: relative clauses ("which saw the most dramatic..."), participial phrases ("possibly reflecting..."), comparative structures throughout. Error-free.

Particularly strong: the use of cause inference ("possibly reflecting visa restrictions") — but note this should remain hedged in Task 1, not become opinion.`,
    topics: 'education, line graph, comparison',
  },
  {
    taskType: 'TASK_1_ACADEMIC',
    band: 7,
    prompt: 'The line graph shows the number of international students enrolled at universities in three countries (Australia, the UK, and Canada) between 2000 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    essay: `The line graph illustrates the number of international students who enrolled at universities in three countries — Australia, the UK, and Canada — from 2000 to 2020.

Overall, all three countries saw an increase in international student numbers during this period. The UK had the highest enrolment for most of the period, but Canada overtook it by the end. Australia also grew but at a slower pace than Canada.

In 2000, the UK had about 250,000 international students, which was higher than Australia (around 150,000) and Canada (about 80,000). The UK then increased steadily and reached around 480,000 in 2010. Australia also grew during this time, climbing from 150,000 to 300,000. Canada grew more slowly, reaching approximately 200,000 by 2010.

After 2010, the trends became different. UK numbers stayed roughly the same and then slightly decreased to about 460,000 by 2020. Australia continued to grow and reached around 420,000 in 2020. However, Canada had the most significant increase, jumping from 200,000 in 2010 to 530,000 in 2020. By the end of the period, Canada had the most international students of the three countries.`,
    wordCount: 192,
    examinerNotes: `Band 7 — strengths:
• Task Achievement: All countries described with specific data. Overview is present and identifies the main trends. Could be more selective with details.
• Coherence and Cohesion: Clear 4-paragraph structure. Linkers used ("Overall", "After 2010", "However", "By the end") but a slight tendency toward over-explicit listing.
• Lexical Resource: Adequate trend vocabulary ("increased steadily", "grew", "climbing", "jumping"). Could use more variety — "grew" appears 3 times.
• Grammatical Range: Mix of simple and complex sentences. Some minor errors in word choice ("had the most international students").

To reach Band 8: more sophisticated trend vocabulary (the Band 8 version uses "plateaued", "narrowed the gap", "upward trajectory"), tighter overview (Band 8 has a sharper version), more compact sentences.`,
    topics: 'education, line graph, comparison',
  },

  // ==================================================
  // TASK 1 ACADEMIC — Pie/Bar Combo
  // ==================================================
  {
    taskType: 'TASK_1_ACADEMIC',
    band: 7,
    prompt: 'The bar chart below shows the percentage of households in different income groups that owned a smartphone, laptop, and tablet in 2015 and 2025. Summarise the information by selecting and reporting the main features.',
    essay: `The bar chart compares the percentage of low-income, middle-income, and high-income households that owned smartphones, laptops, and tablets in 2015 and 2025.

Overall, ownership of all three devices increased across every income group over the decade. Smartphones became nearly universal regardless of income, while the gap in tablet ownership between income groups widened, suggesting that tablets remain more of a luxury item.

In 2015, smartphone ownership varied considerably: 95% of high-income households owned one, compared to 80% in middle-income and only 55% in low-income groups. By 2025, this gap had largely closed, with all three groups exceeding 92% ownership. Smartphones effectively became universal.

Laptop ownership also rose across all groups but with a persistent gap. High-income households went from 85% to 95%, while low-income households increased from 40% to 65%. The gap narrowed but remained significant. Tablet ownership showed the most uneven pattern: high-income households jumped from 50% to 80%, but low-income households grew only modestly from 15% to 30%, indicating that tablets are still seen as discretionary technology.`,
    wordCount: 183,
    examinerNotes: `Band 7 essay.
• Task Achievement: All key features covered. Specific percentages used. Overview present and identifies meaningful patterns (universality of smartphones vs widening tablet gap).
• Coherence and Cohesion: Clear structure. Effective linkers ("Overall", "By 2025", "while", "but").
• Lexical Resource: Good trend vocabulary ("widened", "became universal", "discretionary technology", "narrowed but remained"). Slight repetition of "group".
• Grammatical Range: Mix of simple and complex with good comparative structures.

To reach Band 8: more sophisticated framing (e.g., "the democratisation of smartphone access"), tighter prose, more nuanced overview.`,
    topics: 'technology, income, bar chart',
  },
]

export async function seedSampleEssays(db: PrismaClient) {
  // Clear existing to avoid duplicates (no unique constraint on essay)
  await db.sampleEssay.deleteMany()
  for (const e of ESSAYS) {
    await db.sampleEssay.create({ data: e })
  }
  console.log(`  ✓ ${ESSAYS.length} sample essays seeded (Task 1 + Task 2, bands 6/7/8)`)
  return ESSAYS.length
}
