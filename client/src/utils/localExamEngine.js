/**
 * Offline & Static Fallback Engine for Vercel Deployments
 * Allows the simulator to function 100% client-side without any backend failure risk.
 */

let cachedBank = null;

export async function fetchQuestionBank() {
  if (cachedBank) return cachedBank;
  const res = await fetch('/questions_bank.json');
  if (!res.ok) throw new Error('Could not load questions bank');
  cachedBank = await res.json();
  return cachedBank;
}

export async function generateLocalExam({ 
  mode = 'full_mock', 
  subject = 'english', 
  count = 40, 
  year = null,
  includePassages = true,
  includeNovel = true
}) {
  const bank = await fetchQuestionBank();
  const allQs = bank.questions;
  const passages = bank.passages;

  let selected = [];
  let durationSeconds = 7200;

  const isPassageQuestion = (q) => Boolean(q.passage_id || (q.section && (q.section.includes('Passage') || q.section.includes('Comprehension'))));
  const isNovelQuestion = (q) => Boolean((q.topic && q.topic.includes('Life Changer')) || (q.section && q.section.includes('Prescribed Text')));

  const shuffle = (arr) => [...arr].sort(() => 0.5 - Math.random());

  const getEnglishPool = (targetCount = 60) => {
    let pool = allQs.filter(q => q.subject_id === 'english');

    if (!includePassages) {
      pool = pool.filter(q => !isPassageQuestion(q));
    }
    if (!includeNovel) {
      pool = pool.filter(q => !isNovelQuestion(q));
    }

    // If options are default (both included), balance across sections
    if (includePassages && includeNovel) {
      const comp = shuffle(pool.filter(q => q.topic === 'Comprehension' && q.passage_id)).slice(0, 10);
      const cloze = shuffle(pool.filter(q => q.topic === 'Cloze Passage' && q.passage_id)).slice(0, 10);
      const novel = shuffle(pool.filter(q => isNovelQuestion(q))).slice(0, 10);
      const lexis = shuffle(pool.filter(q => q.section && q.section.includes('Lexis'))).slice(0, 20);
      const oral = shuffle(pool.filter(q => q.section && q.section.includes('Oral'))).slice(0, 10);
      
      let structured = [...comp, ...cloze, ...novel, ...lexis, ...oral];
      if (structured.length < targetCount) {
        const existingIds = new Set(structured.map(q => q.id));
        const remaining = shuffle(pool.filter(q => !existingIds.has(q.id))).slice(0, targetCount - structured.length);
        structured = [...structured, ...remaining];
      }
      return structured.slice(0, targetCount);
    } else {
      // Structured without passages / novel
      const lexis = shuffle(pool.filter(q => q.section && q.section.includes('Lexis')));
      const oral = shuffle(pool.filter(q => q.section && q.section.includes('Oral')));
      const novel = includeNovel ? shuffle(pool.filter(q => isNovelQuestion(q))).slice(0, 10) : [];
      const pass = includePassages ? shuffle(pool.filter(q => isPassageQuestion(q))).slice(0, 20) : [];

      let combined = [...novel, ...pass, ...lexis, ...oral];
      if (combined.length < targetCount) {
        const existingIds = new Set(combined.map(q => q.id));
        const filler = shuffle(pool.filter(q => !existingIds.has(q.id)));
        combined = [...combined, ...filler];
      }
      return shuffle(combined).slice(0, targetCount);
    }
  };

  if (mode === 'full_mock') {
    durationSeconds = 120 * 60;

    const engSelected = getEnglishPool(60);
    const bioSelected = shuffle(allQs.filter(q => q.subject_id === 'biology')).slice(0, 40);
    const phySelected = shuffle(allQs.filter(q => q.subject_id === 'physics')).slice(0, 40);
    const chemSelected = shuffle(allQs.filter(q => q.subject_id === 'chemistry')).slice(0, 40);

    selected = [...engSelected, ...bioSelected, ...phySelected, ...chemSelected];
  } else {
    durationSeconds = Math.round(count * 40);

    if (subject === 'english') {
      selected = getEnglishPool(count);
    } else {
      let pool = allQs.filter(q => q.subject_id === subject);
      if (year) pool = pool.filter(q => q.year === parseInt(year));
      selected = shuffle(pool).slice(0, count);
    }
  }

  // Sanitize
  const sanitized = selected.map((q, idx) => ({
    number: idx + 1,
    id: q.id,
    subject_id: q.subject_id,
    section: q.section,
    topic: q.topic,
    question: q.question,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
    year: q.year,
    difficulty: q.difficulty,
    has_image: q.has_image,
    image_url: q.image_url,
    passage_id: q.passage_id,
    passage: q.passage_id ? passages[q.passage_id] : null
  }));

  return {
    exam_id: 'jamb_' + Math.random().toString(36).substring(2, 11),
    mode,
    created_at: new Date().toISOString(),
    duration_seconds: durationSeconds,
    total_questions: sanitized.length,
    subjects: mode === 'full_mock'
      ? [
          { id: 'english', name: 'Use of English', count: 60, scale_to: 100 },
          { id: 'biology', name: 'Biology', count: 40, scale_to: 100 },
          { id: 'physics', name: 'Physics', count: 40, scale_to: 100 },
          { id: 'chemistry', name: 'Chemistry', count: 40, scale_to: 100 }
        ]
      : [
          { id: subject, count: sanitized.length, scale_to: 100 }
        ],
    questions: sanitized
  };
}

export async function submitLocalExam({ exam_id, mode, time_spent_seconds, answers, question_ids }) {
  const bank = await fetchQuestionBank();
  const qMap = {};
  for (const q of bank.questions) {
    qMap[q.id] = q;
  }
  const passages = bank.passages;

  const subjectStats = {
    english: { correct: 0, total: 0, answered: 0 },
    biology: { correct: 0, total: 0, answered: 0 },
    physics: { correct: 0, total: 0, answered: 0 },
    chemistry: { correct: 0, total: 0, answered: 0 }
  };

  const topicStats = {};
  const reviewItems = [];

  question_ids.forEach((qid, idx) => {
    const q = qMap[qid];
    if (!q) return;

    const userChoice = (answers && answers[qid]) ? String(answers[qid]).toLowerCase().trim() : null;
    const isCorrect = userChoice === q.correct_answer.toLowerCase();
    const isAnswered = userChoice !== null && userChoice !== '';

    const sId = q.subject_id;
    if (!subjectStats[sId]) {
      subjectStats[sId] = { correct: 0, total: 0, answered: 0 };
    }
    subjectStats[sId].total += 1;
    if (isAnswered) subjectStats[sId].answered += 1;
    if (isCorrect) subjectStats[sId].correct += 1;

    const topic = q.topic || 'General';
    if (!topicStats[topic]) {
      topicStats[topic] = { subject: sId, correct: 0, total: 0 };
    }
    topicStats[topic].total += 1;
    if (isCorrect) topicStats[topic].correct += 1;

    reviewItems.push({
      number: idx + 1,
      id: q.id,
      subject_id: q.subject_id,
      section: q.section,
      topic: q.topic,
      question: q.question,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer.toLowerCase(),
      user_answer: userChoice,
      is_correct: isCorrect,
      is_answered: isAnswered,
      explanation: q.explanation,
      year: q.year,
      difficulty: q.difficulty,
      passage: q.passage_id ? passages[q.passage_id] : null
    });
  });

  let totalScore = 0;
  let maxScore = 0;
  const subjectScores = {};

  for (const [sId, stats] of Object.entries(subjectStats)) {
    if (stats.total > 0) {
      const scaled = Math.round((stats.correct / stats.total) * 100);
      subjectScores[sId] = {
        raw_correct: stats.correct,
        total_questions: stats.total,
        answered_questions: stats.answered,
        accuracy_percentage: Math.round((stats.correct / stats.total) * 100),
        scaled_score: scaled,
        max_score: 100
      };
      totalScore += scaled;
      maxScore += 100;
    }
  }

  let grade = 'Needs Improvement';
  let remarks = 'Continue practicing to master time management and question accuracy.';
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

  if (percentage >= 75) {
    grade = 'Exceptional (Competitive for Medicine & Top Engineering)';
    remarks = 'Outstanding performance! You are well within the cutoff marks for elite professional courses.';
  } else if (percentage >= 62) {
    grade = 'Very Good (Competitive for Engineering & Sciences)';
    remarks = 'Strong result! Above most university departmental cutoffs.';
  } else if (percentage >= 50) {
    grade = 'Average (Eligible for Most Courses)';
    remarks = 'Good foundation. Focus on weaker subjects to push your score past 250+.';
  }

  const timeSpent = parseInt(time_spent_seconds) || 0;
  const avgSecondsPerQuestion = question_ids.length > 0 ? Math.round(timeSpent / question_ids.length) : 0;

  const resultSummary = {
    exam_id: exam_id || 'jamb_' + Date.now(),
    mode: mode || 'full_mock',
    submitted_at: new Date().toISOString(),
    time_spent_seconds: timeSpent,
    avg_seconds_per_question: avgSecondsPerQuestion,
    total_score: totalScore,
    max_score: maxScore,
    percentage: Math.round(percentage),
    grade,
    remarks,
    subject_scores: subjectScores,
    topic_breakdown: topicStats,
    total_answered: reviewItems.filter(r => r.is_answered).length,
    total_correct: reviewItems.filter(r => r.is_correct).length,
    total_unanswered: reviewItems.filter(r => !r.is_answered).length,
    total_wrong: reviewItems.filter(r => r.is_answered && !r.is_correct).length
  };

  try {
    const existing = JSON.parse(localStorage.getItem('jamb_exam_history') || '[]');
    existing.unshift({
      id: resultSummary.exam_id,
      timestamp: resultSummary.submitted_at,
      mode: resultSummary.mode,
      total_score: totalScore,
      max_score: maxScore,
      summary: resultSummary
    });
    localStorage.setItem('jamb_exam_history', JSON.stringify(existing.slice(0, 20)));
  } catch (e) {}

  return {
    summary: resultSummary,
    review: reviewItems
  };
}
