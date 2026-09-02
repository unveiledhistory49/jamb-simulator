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

export async function generateLocalExam({ mode = 'full_mock', subject = 'english', count = 40, year = null }) {
  const bank = await fetchQuestionBank();
  const allQs = bank.questions;
  const passages = bank.passages;

  let selected = [];
  let durationSeconds = 7200;

  if (mode === 'full_mock') {
    // 60 English + 40 Biology + 40 Physics + 40 Chemistry
    durationSeconds = 120 * 60;

    const engPool = allQs.filter(q => q.subject_id === 'english');
    const bioPool = allQs.filter(q => q.subject_id === 'biology');
    const phyPool = allQs.filter(q => q.subject_id === 'physics');
    const chemPool = allQs.filter(q => q.subject_id === 'chemistry');

    const shuffle = (arr) => [...arr].sort(() => 0.5 - Math.random());

    const engSelected = shuffle(engPool).slice(0, 60);
    const bioSelected = shuffle(bioPool).slice(0, 40);
    const phySelected = shuffle(phyPool).slice(0, 40);
    const chemSelected = shuffle(chemPool).slice(0, 40);

    selected = [...engSelected, ...bioSelected, ...phySelected, ...chemSelected];
  } else {
    let pool = allQs.filter(q => q.subject_id === subject);
    if (year) pool = pool.filter(q => q.year === parseInt(year));
    durationSeconds = Math.round(count * 40);
    selected = [...pool].sort(() => 0.5 - Math.random()).slice(0, count);
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

  // Save to localStorage for persistent browser history
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
