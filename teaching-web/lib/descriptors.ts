/**
 * Official IELTS Band Descriptors (public version) — Writing Task 2 & Speaking.
 * Source: takeielts.britishcouncil.org/teach-ielts/test-information/assessment
 * Rewritten in our own words for the AI examiner prompt; full official PDFs are public.
 *
 * Used by lib/ai-examiner.ts to ground Gemini with criteria.
 */

export const WRITING_TASK1_DESCRIPTORS = {
  9: {
    TA: 'Fully satisfies all requirements. Clearly presents fully developed response.',
    CC: 'Uses cohesion in such a way that it attracts no attention. Skilfully manages paragraphing.',
    LR: 'Uses a wide range of vocabulary with very natural and sophisticated control of lexical features. Rare minor errors as slips.',
    GRA: 'Uses a wide range of structures with full flexibility and accuracy. Rare minor errors as slips.',
  },
  8: {
    TA: 'Covers all requirements sufficiently. Presents and highlights key features/bullet points clearly and appropriately.',
    CC: 'Sequences information and ideas logically. Manages all aspects of cohesion well. Uses paragraphing sufficiently and appropriately.',
    LR: 'Uses a wide range of vocabulary fluently and flexibly. Uses uncommon lexical items with skill. Occasional inaccuracies in word choice or collocation.',
    GRA: 'Uses a wide range of structures. Majority of sentences error-free. Occasional non-systematic errors.',
  },
  7: {
    TA: 'Covers the requirements of the task. Clearly presents and highlights key features but could be more fully extended.',
    CC: 'Logically organises information; clear progression throughout. Uses a range of cohesive devices appropriately. Presents a clear central topic within each paragraph.',
    LR: 'Uses a sufficient range of vocabulary to allow some flexibility and precision. Uses less common lexical items with some awareness of style/collocation. May produce occasional errors.',
    GRA: 'Uses a variety of complex structures. Frequent error-free sentences. Good control of grammar and punctuation but may make a few errors.',
  },
  6: {
    TA: 'Addresses the requirements of the task. Presents an overview with information appropriately selected. Presents and adequately highlights key features but details may be irrelevant, inappropriate or inaccurate.',
    CC: 'Arranges information and ideas coherently and there is a clear overall progression. Uses cohesive devices effectively but cohesion within and/or between sentences may be faulty or mechanical.',
    LR: 'Uses an adequate range of vocabulary for the task. Attempts to use less common vocabulary but with some inaccuracy. Makes some errors in spelling and/or word formation, but they do not impede communication.',
    GRA: 'Uses a mix of simple and complex sentence forms. Makes some errors in grammar and punctuation but they rarely reduce communication.',
  },
  5: {
    TA: 'Generally addresses the task; the format may be inappropriate in places. Recounts detail mechanically with no clear overview; there may be no data to support the description. Presents, but inadequately covers, key features; there may be a tendency to focus on details.',
    CC: 'Presents information with some organisation but there may be a lack of overall progression. Makes inadequate, inaccurate or over-use of cohesive devices. May be repetitive because of lack of referencing and substitution.',
    LR: 'Uses a limited range of vocabulary, but this is minimally adequate for the task. May make noticeable errors in spelling and/or word formation that may cause some difficulty for the reader.',
    GRA: 'Uses only a limited range of structures. Attempts complex sentences but these tend to be less accurate than simple sentences. May make frequent grammatical errors and punctuation may be faulty; errors can cause some difficulty for the reader.',
  },
  4: {
    TA: 'Attempts to address the task but does not cover all key features. The format may be inappropriate.',
    CC: 'Presents information and ideas but these are not arranged coherently and there is no clear progression in the response.',
    LR: 'Uses only basic vocabulary which may be used repetitively. Has limited control of word formation/spelling; errors may cause strain for the reader.',
    GRA: 'Uses only a very limited range of structures with only rare use of subordinate clauses. Some structures are accurate but errors predominate, and punctuation is often faulty.',
  },
}

export const WRITING_TASK2_DESCRIPTORS = {
  9: {
    TR: 'Fully addresses all parts of the task. Presents a fully developed position in answer with relevant, fully extended and well-supported ideas.',
    CC: 'Uses cohesion in such a way that it attracts no attention. Skilfully manages paragraphing.',
    LR: 'Uses a wide range of vocabulary with very natural and sophisticated control of lexical features.',
    GRA: 'Uses a wide range of structures with full flexibility and accuracy.',
  },
  8: {
    TR: 'Sufficiently addresses all parts of the task. Presents a well-developed response to the question with relevant, extended and supported ideas.',
    CC: 'Sequences information and ideas logically. Manages all aspects of cohesion well. Uses paragraphing sufficiently and appropriately.',
    LR: 'Uses a wide range of vocabulary fluently and flexibly to convey precise meanings. Uses uncommon lexical items with skill.',
    GRA: 'Uses a wide range of structures. The majority of sentences are error-free.',
  },
  7: {
    TR: 'Addresses all parts of the task. Presents a clear position throughout. Presents, extends and supports main ideas, but there may be a tendency to over-generalise and/or supporting ideas may lack focus.',
    CC: 'Logically organises information and ideas; there is clear progression throughout. Uses a range of cohesive devices appropriately although there may be some under-/over-use. Presents a clear central topic within each paragraph.',
    LR: 'Uses a sufficient range of vocabulary to allow some flexibility and precision. Uses less common lexical items with some awareness of style and collocation.',
    GRA: 'Uses a variety of complex structures. Produces frequent error-free sentences. Has good control of grammar and punctuation.',
  },
  6: {
    TR: 'Addresses all parts of the task although some parts may be more fully covered than others. Presents a relevant position although the conclusions may become unclear or repetitive. Presents relevant main ideas but some may be inadequately developed/unclear.',
    CC: 'Arranges information and ideas coherently and there is a clear overall progression. Uses cohesive devices effectively but cohesion within and/or between sentences may be faulty or mechanical. May not always use referencing clearly or appropriately.',
    LR: 'Uses an adequate range of vocabulary for the task. Attempts to use less common vocabulary but with some inaccuracy. Makes some errors in spelling and/or word formation, but they do not impede communication.',
    GRA: 'Uses a mix of simple and complex sentence forms. Makes some errors in grammar and punctuation but they rarely reduce communication.',
  },
  5: {
    TR: 'Addresses the task only partially; the format may be inappropriate in places. Expresses a position but the development is not always clear and there may be no conclusions drawn. Presents some main ideas but these are limited and not sufficiently developed.',
    CC: 'Presents information with some organisation but there may be a lack of overall progression. Makes inadequate, inaccurate or over-use of cohesive devices.',
    LR: 'Uses a limited range of vocabulary, but this is minimally adequate for the task. May make noticeable errors in spelling and/or word formation that may cause some difficulty for the reader.',
    GRA: 'Uses only a limited range of structures. Attempts complex sentences but these tend to be less accurate than simple sentences. May make frequent grammatical errors and punctuation may be faulty.',
  },
  4: {
    TR: 'Responds to the task only in a minimal way or the answer is tangential. Presents a position but this is unclear. Presents some main ideas but these are difficult to identify and may be repetitive, irrelevant or not well supported.',
    CC: 'Presents information and ideas but these are not arranged coherently. Uses some basic cohesive devices but these may be inaccurate or repetitive.',
    LR: 'Uses only basic vocabulary which may be used repetitively. Has limited control of word formation and/or spelling; errors may cause strain for the reader.',
    GRA: 'Uses only a very limited range of structures with only rare use of subordinate clauses. Some structures are accurate but errors predominate.',
  },
}

export const SPEAKING_DESCRIPTORS = {
  9: {
    FC: 'Speaks fluently with only rare repetition or self-correction. Hesitation is content-related rather than to find words or grammar. Speaks coherently with fully appropriate cohesive features. Develops topics fully and appropriately.',
    LR: 'Uses vocabulary with full flexibility and precision in all topics. Uses idiomatic language naturally and accurately.',
    GRA: 'Uses a full range of structures naturally and appropriately. Produces consistently accurate structures apart from "slips" characteristic of native speaker speech.',
    P: 'Uses a full range of pronunciation features with precision and subtlety. Sustains flexible use of features throughout. Is effortless to understand.',
  },
  8: {
    FC: 'Speaks fluently with only occasional repetition or self-correction; hesitation is usually content-related and only rarely to search for language. Develops topics coherently and appropriately.',
    LR: 'Uses a wide vocabulary resource readily and flexibly to convey precise meaning. Uses less common and idiomatic vocabulary skillfully, with occasional inaccuracies.',
    GRA: 'Uses a wide range of structures flexibly. Produces a majority of error-free sentences with only very occasional inappropriacies or basic/non-systematic errors.',
    P: 'Uses a wide range of pronunciation features. Sustains flexible use of features, with only occasional lapses. Is easy to understand throughout; L1 accent has minimal effect on intelligibility.',
  },
  7: {
    FC: 'Speaks at length without noticeable effort or loss of coherence. May demonstrate language-related hesitation at times, or some repetition and/or self-correction. Uses a range of connectives and discourse markers with some flexibility.',
    LR: 'Uses vocabulary resource flexibly to discuss a variety of topics. Uses some less common and idiomatic vocabulary and shows some awareness of style and collocation, with some inappropriate choices. Uses paraphrase effectively.',
    GRA: 'Uses a range of complex structures with some flexibility. Frequently produces error-free sentences, though some grammatical mistakes persist.',
    P: 'Shows all the positive features of Band 6 and some, but not all, of the positive features of Band 8.',
  },
  6: {
    FC: 'Is willing to speak at length, though may lose coherence at times due to occasional repetition, self-correction or hesitation. Uses a range of connectives and discourse markers but not always appropriately.',
    LR: 'Has a wide enough vocabulary to discuss topics at length and make meaning clear in spite of inappropriacies. Generally paraphrases successfully.',
    GRA: 'Uses a mix of simple and complex structures, but with limited flexibility. May make frequent mistakes with complex structures, though these rarely cause comprehension problems.',
    P: 'Uses a range of pronunciation features with mixed control. Shows some effective use of features but this is not sustained. Can generally be understood throughout, though mispronunciation of individual words or sounds reduces clarity at times.',
  },
  5: {
    FC: 'Usually maintains flow of speech but uses repetition, self-correction and/or slow speech to keep going. May over-use certain connectives and discourse markers. Produces simple speech fluently, but more complex communication causes fluency problems.',
    LR: 'Manages to talk about familiar and unfamiliar topics but uses vocabulary with limited flexibility. Attempts to use paraphrase but with mixed success.',
    GRA: 'Produces basic sentence forms with reasonable accuracy. Uses a limited range of more complex structures, but these usually contain errors and may cause some comprehension problems.',
    P: 'Shows all the positive features of Band 4 and some, but not all, of the positive features of Band 6.',
  },
  4: {
    FC: 'Cannot respond without noticeable pauses and may speak slowly, with frequent repetition and self-correction. Links basic sentences but with repetitious use of simple connectives and some breakdowns in coherence.',
    LR: 'Is able to talk about familiar topics but can only convey basic meaning on unfamiliar topics and makes frequent errors in word choice. Rarely attempts paraphrase.',
    GRA: 'Produces basic sentence forms and some correct simple sentences but subordinate structures are rare. Errors are frequent and may lead to misunderstanding.',
    P: 'Uses a limited range of pronunciation features. Attempts to control features but lapses are frequent. Mispronunciations are frequent and cause some difficulty for the listener.',
  },
}

export const READING_LISTENING_BAND_TABLE: Record<number, [number, number]> = {
  // band: [minScore, maxScore] out of 40
  9: [39, 40],
  8.5: [37, 38],
  8: [35, 36],
  7.5: [33, 34],
  7: [30, 32],
  6.5: [27, 29],
  6: [23, 26],
  5.5: [19, 22],
  5: [15, 18],
  4.5: [13, 14],
  4: [10, 12],
  3.5: [8, 9],
  3: [6, 7],
  2.5: [4, 5],
  2: [3, 3],
  1: [1, 2],
  0: [0, 0],
}

/**
 * Convert raw score out of 40 to IELTS band (Academic Reading/Listening).
 * Uses the standard Cambridge conversion table.
 */
export function rawToBand(raw: number): number {
  for (const band of Object.keys(READING_LISTENING_BAND_TABLE).map(Number).sort((a, b) => b - a)) {
    const [min] = READING_LISTENING_BAND_TABLE[band]
    if (raw >= min) return band
  }
  return 0
}
