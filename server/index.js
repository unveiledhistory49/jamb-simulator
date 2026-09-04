const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to SQLite Database
const dbPath = path.join(__dirname, '../data/jamb.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health / Status Endpoint
app.get('/api/status', (req, res) => {
  try {
    const counts = db.prepare('SELECT subject_id, count(*) as count FROM questions GROUP BY subject_id').all();
    const passagesCount = db.prepare('SELECT count(*) as count FROM passages').get().count;
    const historyCount = db.prepare('SELECT count(*) as count FROM exam_history').get().count;
    res.json({
      status: 'online',
      message: 'UTME (JAMB CBT) Simulator Engine Active',
      database: {
        subjects: counts,
        total_questions: counts.reduce((acc, c) => acc + c.count, 0),
        passages: passagesCount,
        completed_exams: historyCount
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Subject Info and Topic Lists
app.get('/api/subjects', (req, res) => {
  try {
    const subjects = db.prepare('SELECT * FROM subjects ORDER BY id').all();
    const enhanced = subjects.map(subj => {
      const topics = db.prepare('SELECT DISTINCT topic FROM questions WHERE subject_id = ? AND topic IS NOT NULL').all(subj.id).map(r => r.topic);
      const years = db.prepare('SELECT DISTINCT year FROM questions WHERE subject_id = ? AND year IS NOT NULL ORDER BY year DESC').all(subj.id).map(r => r.year);
      const totalCount = db.prepare('SELECT count(*) as count FROM questions WHERE subject_id = ?').get(subj.id).count;
      return {
        ...subj,
        total_in_bank: totalCount,
        topics,
        years
      };
    });
    res.json(enhanced);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper: Fetch passage details if needed
const getPassagesMap = () => {
  const rows = db.prepare('SELECT id, title, type, text FROM passages').all();
  const map = {};
  for (const r of rows) {
    map[r.id] = r;
  }
  return map;
};

// Generate an Exam (Full Mock 180 Qs or Subject Drill)
app.get('/api/exam/generate', (req, res) => {
  try {
    const mode = req.query.mode || 'full_mock'; // 'full_mock' | 'subject_drill'
    const targetSubject = req.query.subject; // e.g. 'physics'
    const requestedCount = parseInt(req.query.count) || 40;
    const selectedYear = req.query.year ? parseInt(req.query.year) : null;
    const selectedTopic = req.query.topic;

    const passagesMap = getPassagesMap();
    const examId = 'jamb_' + crypto.randomBytes(8).toString('hex');
    let examQuestions = [];
    let durationSeconds = 7200; // 120 minutes by default

    const includePassages = req.query.include_passages !== 'false';
    const includeNovel = req.query.include_novel !== 'false';

    if (mode === 'full_mock') {
      // Standard JAMB UTME: 180 Questions across 4 subjects
      // English: 60 Qs
      // Biology: 40 Qs
      // Physics: 40 Qs
      // Chemistry: 40 Qs
      durationSeconds = 120 * 60; // 120 minutes fixed continuous

      // 1. English (60 Questions)
      let engPassages = [];
      if (includePassages) {
        const engComprehension = db.prepare(`
          SELECT * FROM questions 
          WHERE subject_id = 'english' AND passage_id IS NOT NULL AND topic = 'Comprehension' 
          ORDER BY RANDOM() LIMIT 10
        `).all();

        const engCloze = db.prepare(`
          SELECT * FROM questions 
          WHERE subject_id = 'english' AND passage_id IS NOT NULL AND topic = 'Cloze Passage' 
          ORDER BY RANDOM() LIMIT 10
        `).all();

        engPassages = [...engComprehension, ...engCloze];
      }

      let engNovel = [];
      if (includeNovel) {
        engNovel = db.prepare(`
          SELECT * FROM questions 
          WHERE subject_id = 'english' AND (topic = 'The Life Changer' OR section LIKE '%Prescribed%') 
          ORDER BY RANDOM() LIMIT 10
        `).all();
      }

      // Lexis and Structure
      const engLexis = db.prepare(`
        SELECT * FROM questions 
        WHERE subject_id = 'english' AND section LIKE '%Lexis%' 
        ORDER BY RANDOM() LIMIT 30
      `).all();

      // Oral Forms
      const engOral = db.prepare(`
        SELECT * FROM questions 
        WHERE subject_id = 'english' AND section LIKE '%Oral%' 
        ORDER BY RANDOM() LIMIT 20
      `).all();

      let engPool = [...engPassages, ...engNovel, ...engLexis, ...engOral];
      
      // If pool is less than 60, fill with other random English questions conforming to preferences
      if (engPool.length < 60) {
        const existingIds = engPool.map(q => q.id);
        const placeholders = existingIds.length > 0 ? existingIds.map(() => '?').join(',') : '0';
        const needed = 60 - engPool.length;
        let fillerQuery = `SELECT * FROM questions WHERE subject_id = 'english' AND id NOT IN (${placeholders})`;
        if (!includePassages) {
          fillerQuery += ` AND passage_id IS NULL AND section NOT LIKE '%Passage%' AND section NOT LIKE '%Comprehension%'`;
        }
        if (!includeNovel) {
          fillerQuery += ` AND topic != 'The Life Changer' AND section NOT LIKE '%Prescribed%'`;
        }
        fillerQuery += ` ORDER BY RANDOM() LIMIT ?`;
        const filler = db.prepare(fillerQuery).all(...existingIds, needed);
        engPool.push(...filler);
      }
      engPool = engPool.slice(0, 60);

      // 2. Biology (40 Questions)
      const bioQuestions = db.prepare(`
        SELECT * FROM questions 
        WHERE subject_id = 'biology' 
        ORDER BY RANDOM() LIMIT 40
      `).all();

      // 3. Physics (40 Questions)
      const phyQuestions = db.prepare(`
        SELECT * FROM questions 
        WHERE subject_id = 'physics' 
        ORDER BY RANDOM() LIMIT 40
      `).all();

      // 4. Chemistry (40 Questions)
      const chemQuestions = db.prepare(`
        SELECT * FROM questions 
        WHERE subject_id = 'chemistry' 
        ORDER BY RANDOM() LIMIT 40
      `).all();

      examQuestions = [
        ...engPool,
        ...bioQuestions,
        ...phyQuestions,
        ...chemQuestions
      ];

    } else {
      // Subject Drill Mode
      const subject = targetSubject || 'english';
      const count = subject === 'english' ? (requestedCount || 60) : (requestedCount || 40);
      durationSeconds = Math.round((count * 40)); // ~40 seconds per question

      let query = 'SELECT * FROM questions WHERE subject_id = ?';
      const params = [subject];

      if (selectedYear) {
        query += ' AND year = ?';
        params.push(selectedYear);
      }
      if (selectedTopic) {
        query += ' AND topic = ?';
        params.push(selectedTopic);
      }

      query += ' ORDER BY RANDOM() LIMIT ?';
      params.push(count);

      examQuestions = db.prepare(query).all(...params);

      // Fallback if not enough questions with filters
      if (examQuestions.length < count) {
        const existingIds = examQuestions.map(q => q.id);
        const remaining = count - examQuestions.length;
        let fallbackQuery = 'SELECT * FROM questions WHERE subject_id = ?';
        const fallbackParams = [subject];
        if (existingIds.length > 0) {
          fallbackQuery += ` AND id NOT IN (${existingIds.map(() => '?').join(',')})`;
          fallbackParams.push(...existingIds);
        }
        fallbackQuery += ' ORDER BY RANDOM() LIMIT ?';
        fallbackParams.push(remaining);
        const filler = db.prepare(fallbackQuery).all(...fallbackParams);
        examQuestions.push(...filler);
      }
    }

    // Sanitize questions for candidate test session (hide correct_answer and explanation to prevent inspect-element cheating)
    const sanitizedQuestions = examQuestions.map((q, idx) => {
      const passage = q.passage_id ? passagesMap[q.passage_id] : null;
      return {
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
        passage: passage ? {
          id: passage.id,
          title: passage.title,
          type: passage.type,
          text: passage.text
        } : null
      };
    });

    res.json({
      exam_id: examId,
      mode,
      created_at: new Date().toISOString(),
      duration_seconds: durationSeconds,
      total_questions: sanitizedQuestions.length,
      subjects: mode === 'full_mock' 
        ? [
            { id: 'english', name: 'Use of English', count: 60, scale_to: 100 },
            { id: 'biology', name: 'Biology', count: 40, scale_to: 100 },
            { id: 'physics', name: 'Physics', count: 40, scale_to: 100 },
            { id: 'chemistry', name: 'Chemistry', count: 40, scale_to: 100 }
          ]
        : [
            { id: targetSubject || 'english', count: sanitizedQuestions.length, scale_to: 100 }
          ],
      questions: sanitizedQuestions
    });

  } catch (err) {
    console.error("Generate exam error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Submit Exam & Score Evaluation
app.post('/api/exam/submit', (req, res) => {
  try {
    const { exam_id, mode, time_spent_seconds, answers, question_ids, question_time_spent = {} } = req.body;
    // answers is an object: { [question_id]: 'a' | 'b' | 'c' | 'd' }
    // question_ids is array of question IDs in exam order

    if (!question_ids || !Array.isArray(question_ids) || question_ids.length === 0) {
      return res.status(400).json({ error: 'Missing question_ids in submission' });
    }

    const passagesMap = getPassagesMap();
    const placeholders = question_ids.map(() => '?').join(',');
    const dbQuestions = db.prepare(`SELECT * FROM questions WHERE id IN (${placeholders})`).all(...question_ids);
    const dbMap = {};
    for (const q of dbQuestions) {
      dbMap[q.id] = q;
    }

    // Evaluate per subject
    const subjectStats = {
      english: { correct: 0, total: 0, answered: 0, time_spent: 0 },
      biology: { correct: 0, total: 0, answered: 0, time_spent: 0 },
      physics: { correct: 0, total: 0, answered: 0, time_spent: 0 },
      chemistry: { correct: 0, total: 0, answered: 0, time_spent: 0 }
    };

    const topicStats = {};
    const reviewItems = [];

    question_ids.forEach((qid, idx) => {
      const q = dbMap[qid];
      if (!q) return;

      const userChoice = (answers && answers[qid]) ? String(answers[qid]).toLowerCase().trim() : null;
      const isCorrect = userChoice === q.correct_answer.toLowerCase();
      const isAnswered = userChoice !== null && userChoice !== '';
      const qSec = (question_time_spent && question_time_spent[qid]) || 0;
      const isTimeWaster = qSec > 90;
      const isRushedError = qSec < 15 && isAnswered && !isCorrect;

      const sId = q.subject_id;
      if (!subjectStats[sId]) {
        subjectStats[sId] = { correct: 0, total: 0, answered: 0, time_spent: 0 };
      }
      subjectStats[sId].total += 1;
      subjectStats[sId].time_spent += qSec;
      if (isAnswered) subjectStats[sId].answered += 1;
      if (isCorrect) subjectStats[sId].correct += 1;

      // Topic analytics
      const topic = q.topic || 'General';
      if (!topicStats[topic]) {
        topicStats[topic] = { subject: sId, correct: 0, total: 0, time_spent: 0 };
      }
      topicStats[topic].total += 1;
      topicStats[topic].time_spent += qSec;
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
        passage: q.passage_id ? passagesMap[q.passage_id] : null,
        time_spent_seconds: qSec,
        is_time_waster: isTimeWaster,
        is_rushed_error: isRushedError
      });
    });

    // Compute scaled scores according to UTME CBT specification
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
          max_score: 100,
          time_spent_seconds: stats.time_spent
        };
        totalScore += scaled;
        maxScore += 100;
      }
    }

    // Performance rating
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

    // Compute Pacing Diagnostics
    const timeWasters = reviewItems
      .filter(r => r.is_time_waster)
      .sort((a, b) => b.time_spent_seconds - a.time_spent_seconds);

    const rushedErrors = reviewItems
      .filter(r => r.is_rushed_error)
      .sort((a, b) => a.time_spent_seconds - b.time_spent_seconds);

    const subjectPacing = {};
    for (const [sId, stats] of Object.entries(subjectStats)) {
      if (stats.total > 0) {
        subjectPacing[sId] = {
          time_spent_seconds: stats.time_spent,
          percentage_of_total_time: timeSpent > 0 ? Math.round((stats.time_spent / timeSpent) * 100) : 0,
          avg_seconds_per_question: stats.total > 0 ? Math.round(stats.time_spent / stats.total) : 0
        };
      }
    }

    // Topic mastery list & Top 3 High-Yield Topics (weighted deficit)
    const topicBreakdown = Object.entries(topicStats).map(([topic, stat]) => {
      const accuracy = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
      const deficitScore = (100 - accuracy) * stat.total;
      return {
        topic,
        subject: stat.subject,
        correct: stat.correct,
        total: stat.total,
        accuracy,
        deficit_score: deficitScore,
        time_spent_seconds: stat.time_spent
      };
    });

    const sortedTopics = [...topicBreakdown]
      .filter(t => t.accuracy < 75 && t.total >= 1)
      .sort((a, b) => b.deficit_score - a.deficit_score);

    const top3HighYieldTopics = sortedTopics.slice(0, 3);

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
      topic_breakdown: topicBreakdown,
      top_3_high_yield_topics: top3HighYieldTopics,
      pacing_analysis: {
        time_wasters: timeWasters,
        time_wasters_count: timeWasters.length,
        rushed_errors: rushedErrors,
        rushed_errors_count: rushedErrors.length,
        subject_pacing: subjectPacing
      },
      total_answered: reviewItems.filter(r => r.is_answered).length,
      total_correct: reviewItems.filter(r => r.is_correct).length,
      total_unanswered: reviewItems.filter(r => !r.is_answered).length,
      total_wrong: reviewItems.filter(r => r.is_answered && !r.is_correct).length
    };

    // Save to exam_history table in SQLite
    try {
      cursor = db.prepare(`
        INSERT INTO exam_history (
          id, timestamp, mode, duration_seconds, time_spent_seconds,
          total_score, max_score, subject_scores, summary
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      cursor.run(
        resultSummary.exam_id,
        resultSummary.submitted_at,
        resultSummary.mode,
        7200,
        timeSpent,
        totalScore,
        maxScore,
        JSON.stringify(subjectScores),
        JSON.stringify(resultSummary)
      );
    } catch (saveErr) {
      console.warn("Could not save to history table:", saveErr.message);
    }

    res.json({
      summary: resultSummary,
      review: reviewItems
    });

  } catch (err) {
    console.error("Submit exam error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Past Exam History
app.get('/api/exam/history', (req, res) => {
  try {
    const rows = db.prepare('SELECT id, timestamp, mode, time_spent_seconds, total_score, max_score, summary FROM exam_history ORDER BY timestamp DESC LIMIT 20').all();
    const history = rows.map(r => ({
      ...r,
      summary: JSON.parse(r.summary)
    }));
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search Questions
app.get('/api/questions/search', (req, res) => {
  try {
    const q = req.query.q || '';
    const subject = req.query.subject;
    const year = req.query.year;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    let sql = 'SELECT * FROM questions WHERE 1=1';
    const params = [];

    if (subject) {
      sql += ' AND subject_id = ?';
      params.push(subject);
    }
    if (year) {
      sql += ' AND year = ?';
      params.push(parseInt(year));
    }
    if (q) {
      sql += ' AND (question LIKE ? OR topic LIKE ?)';
      params.push(`%${q}%`, `%${q}%`);
    }

    sql += ' ORDER BY year DESC, id ASC LIMIT ?';
    params.push(limit);

    const questions = db.prepare(sql).all(...params);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend in production if built
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) res.status(200).send("JAMB Simulator API Server Running. Start frontend dev server on port 5173.");
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`UTME Simulator Server listening on port ${PORT}`);
});
