import React, { useState, useEffect } from 'react';
import { 
  Trophy, CheckCircle2, XCircle, Clock, Award, BarChart3, 
  RotateCcw, Home, Filter, BookOpen, AlertCircle, ChevronDown, ChevronUp,
  Bookmark, ArrowRight, Zap, Target
} from 'lucide-react';
import confetti from 'canvas-confetti';
import MathRenderer from './MathRenderer';
import TopicHeatmap from './TopicHeatmap';
import PacingAnalytics from './PacingAnalytics';

export default function ResultDashboard({
  resultData,
  onRetakeExam,
  onGoHome,
  currentUser,
  onOpenLearning,
  onStartRevisionDrill,
  onStartSingleTopicDrill
}) {
  const [activeTab, setActiveTab] = useState('review'); // 'review' | 'pacing' | 'topics'
  const [reviewFilter, setReviewFilter] = useState('all'); // 'all', 'wrong', 'correct', 'unanswered'
  const [expandedPassageId, setExpandedPassageId] = useState(null);

  const summary = resultData?.summary || {};
  const reviewItems = resultData?.review || [];

  useEffect(() => {
    // Trigger celebratory confetti if score >= 200/400 (50%)
    if (summary.total_score >= 200) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }
  }, [summary.total_score]);

  const subjectScores = summary.subject_scores || {};
  const subjectList = Object.entries(subjectScores);

  // Filtered review questions
  const filteredQuestions = reviewItems.filter(item => {
    if (reviewFilter === 'wrong') return item.is_answered && !item.is_correct;
    if (reviewFilter === 'correct') return item.is_correct;
    if (reviewFilter === 'unanswered') return !item.is_answered;
    return true;
  });

  const formatSeconds = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}m ${s}s`;
  };

  const getSubjectName = (id) => {
    switch (id) {
      case 'english': return 'Use of English';
      case 'biology': return 'Biology';
      case 'physics': return 'Physics';
      case 'chemistry': return 'Chemistry';
      default: return id.toUpperCase();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* Top Banner: Score & Remarks */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-4 sm:p-6 shadow-md border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="text-center sm:text-left space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Award size={13} />
              <span>OFFICIAL CBT REPORT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Exam Results & Performance
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-lg">
              {summary.remarks}
            </p>
          </div>

          {/* Grand Scaled Score Display */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 text-center w-full sm:w-auto min-w-[200px] shadow-inner">
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
              {summary.mode === 'full_mock' ? 'Aggregated UTME Score' : 'Subject Scaled Score'}
            </div>
            <div className="text-4xl sm:text-5xl font-mono font-extrabold text-emerald-400 tracking-tight">
              {summary.total_score}
              <span className="text-xl text-slate-500 font-normal"> / {summary.max_score}</span>
            </div>
            <div className="mt-1 text-xs font-semibold text-slate-300">
              Score: <strong className="text-emerald-300">{summary.percentage}%</strong> • {summary.grade}
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-800/80 text-center">
          <div className="p-3 bg-slate-800/50 rounded-xl">
            <div className="text-xs text-slate-400">Total Answered</div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {summary.total_answered} <span className="text-xs font-normal text-slate-400">/ {reviewItems.length}</span>
            </div>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-xl">
            <div className="text-xs text-slate-400">Correct Answers</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{summary.total_correct}</div>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-xl">
            <div className="text-xs text-slate-400">Time Spent</div>
            <div className="text-xl font-bold font-mono text-amber-300 mt-1">
              {formatSeconds(summary.time_spent_seconds || 0)}
            </div>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-xl">
            <div className="text-xs text-slate-400">Avg Speed</div>
            <div className="text-xl font-bold font-mono text-slate-200 mt-1">
              {summary.avg_seconds_per_question}s <span className="text-xs font-normal text-slate-400">/ Q (Target: ~40s)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {subjectList.map(([sId, stats]) => (
          <div key={sId} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-sm">{getSubjectName(sId)}</span>
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                {stats.raw_correct}/{stats.total_questions}
              </span>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Scaled Score</span>
                <strong className="text-emerald-700 font-mono text-sm">{stats.scaled_score} / 100</strong>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    stats.accuracy_percentage >= 70 ? 'bg-emerald-500' : stats.accuracy_percentage >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${stats.accuracy_percentage}%` }}
                ></div>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 flex justify-between">
              <span>Accuracy: {stats.accuracy_percentage}%</span>
              <span>Attempted: {stats.answered_questions}/{stats.total_questions}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tertiary University Cut-Off Benchmark Analysis */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
          <BarChart3 size={18} className="text-emerald-600" />
          <span>Course Competitiveness & University Benchmarks</span>
        </h3>
        <p className="text-xs text-slate-600">
          Typical aggregate benchmark indicators for Nigerian Federal and State Universities based on recent UTME trends:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Tier 1: Medicine / Law / Pharmacy */}
          <div className={`p-4 rounded-xl border ${summary.total_score >= 280 ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200 opacity-70'}`}>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Tier 1: Highly Competitive</div>
            <div className="font-bold text-slate-900 text-sm mt-1">Medicine, Surgery, Law, Pharmacy</div>
            <div className="text-xs text-slate-600 mt-2 font-mono">
              Target: <strong>280 - 320+</strong>
            </div>
            <div className="mt-3">
              {summary.total_score >= 280 ? (
                <span className="text-xs font-bold text-emerald-700 flex items-center space-x-1">
                  <CheckCircle2 size={13} />
                  <span>Competitive Range</span>
                </span>
              ) : (
                <span className="text-xs text-slate-500">
                  Gap to target: {280 - summary.total_score} marks
                </span>
              )}
            </div>
          </div>

          {/* Tier 2: Engineering / Computer Science / Nursing */}
          <div className={`p-4 rounded-xl border ${summary.total_score >= 240 ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Tier 2: Competitive STEM</div>
            <div className="font-bold text-slate-900 text-sm mt-1">Engineering, Computer Science, Nursing</div>
            <div className="text-xs text-slate-600 mt-2 font-mono">
              Target: <strong>240 - 275</strong>
            </div>
            <div className="mt-3">
              {summary.total_score >= 240 ? (
                <span className="text-xs font-bold text-emerald-700 flex items-center space-x-1">
                  <CheckCircle2 size={13} />
                  <span>Competitive Range</span>
                </span>
              ) : (
                <span className="text-xs text-slate-500">
                  Gap to target: {240 - summary.total_score} marks
                </span>
              )}
            </div>
          </div>

          {/* Tier 3: General Sciences / Agricultural Sciences */}
          <div className={`p-4 rounded-xl border ${summary.total_score >= 200 ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Tier 3: Core Sciences</div>
            <div className="font-bold text-slate-900 text-sm mt-1">Biochemistry, Microbiology, Physics, Chem</div>
            <div className="text-xs text-slate-600 mt-2 font-mono">
              Target: <strong>200 - 235</strong>
            </div>
            <div className="mt-3">
              {summary.total_score >= 200 ? (
                <span className="text-xs font-bold text-emerald-700 flex items-center space-x-1">
                  <CheckCircle2 size={13} />
                  <span>Eligible for Merit Admission</span>
                </span>
              ) : (
                <span className="text-xs text-slate-500">
                  Gap to target: {200 - summary.total_score} marks
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar pb-0.5">
        <button
          onClick={() => setActiveTab('review')}
          className={`whitespace-nowrap pb-2.5 sm:pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center space-x-1.5 ${
            activeTab === 'review'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen size={15} />
          <span>Solutions Review</span>
        </button>

        <button
          onClick={() => setActiveTab('pacing')}
          className={`whitespace-nowrap pb-2.5 sm:pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center space-x-1.5 ${
            activeTab === 'pacing'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock size={15} />
          <span>Time Drain & Pacing</span>
          {summary.pacing_analysis?.time_wasters_count > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded-full font-mono font-bold">
              {summary.pacing_analysis.time_wasters_count}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('topics')}
          className={`whitespace-nowrap pb-2.5 sm:pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center space-x-1.5 ${
            activeTab === 'topics'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 size={15} />
          <span>Topic Weakness Heatmap</span>
        </button>
      </div>

      {activeTab === 'pacing' && (
        <PacingAnalytics
          pacingData={summary.pacing_analysis}
          totalQuestions={reviewItems.length}
          avgSpeed={summary.avg_seconds_per_question}
          timeSpentSeconds={summary.time_spent_seconds}
        />
      )}

      {activeTab === 'topics' && (
        <TopicHeatmap
          topics={summary.topic_breakdown}
          top3HighYield={summary.top_3_high_yield_topics}
          onStartRevisionDrill={onStartRevisionDrill}
          onStartSingleTopicDrill={onStartSingleTopicDrill}
        />
      )}

      {/* Solutions & In-Depth Question Review Section */}
      {activeTab === 'review' && (
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4 sm:space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
                <BookOpen size={18} className="text-emerald-600" />
                <span>Comprehensive Solution & Answer Review</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review every question, verify step-by-step explanations, and reinforce syllabus concepts
              </p>
            </div>

          {/* Review Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setReviewFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                reviewFilter === 'all'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              All Questions ({reviewItems.length})
            </button>
            <button
              onClick={() => setReviewFilter('wrong')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                reviewFilter === 'wrong'
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
              }`}
            >
              Incorrect ({summary.total_wrong})
            </button>
            <button
              onClick={() => setReviewFilter('correct')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                reviewFilter === 'correct'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              Correct ({summary.total_correct})
            </button>
            <button
              onClick={() => setReviewFilter('unanswered')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                reviewFilter === 'unanswered'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              }`}
            >
              Unanswered ({summary.total_unanswered})
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {filteredQuestions.map((q, idx) => {
            const options = [
              { key: 'a', label: 'A', text: q.option_a },
              { key: 'b', label: 'B', text: q.option_b },
              { key: 'c', label: 'C', text: q.option_c },
              { key: 'd', label: 'D', text: q.option_d },
            ];

            return (
              <div
                key={q.id}
                className={`p-6 rounded-2xl border transition-all ${
                  q.is_correct
                    ? 'bg-white border-slate-200'
                    : q.is_answered
                    ? 'bg-rose-50/20 border-rose-200 ring-1 ring-rose-200'
                    : 'bg-slate-50/60 border-slate-200'
                }`}
              >
                {/* Meta header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold font-mono px-2 py-0.5 rounded bg-slate-900 text-white">
                      Q{q.number}
                    </span>
                    <span className="font-semibold text-slate-700 uppercase tracking-wide">
                      {getSubjectName(q.subject_id)}
                    </span>
                    {q.topic && (
                      <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {q.topic}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {typeof q.time_spent_seconds === 'number' && q.time_spent_seconds > 0 && (
                      <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        ⏱️ {q.time_spent_seconds}s
                      </span>
                    )}
                    {q.is_time_waster && (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">
                        ⏳ Time Waster
                      </span>
                    )}
                    {q.is_rushed_error && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                        ⚡ Rushed Error
                      </span>
                    )}
                    {q.is_correct ? (
                      <span className="flex items-center space-x-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 size={14} />
                        <span>Correct</span>
                      </span>
                    ) : q.is_answered ? (
                      <span className="flex items-center space-x-1 text-rose-700 font-bold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                        <XCircle size={14} />
                        <span>Incorrect</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        <AlertCircle size={14} />
                        <span>Unanswered</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Attached Passage Toggle (if any) */}
                {q.passage && (
                  <div className="mb-4 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <button
                      onClick={() => setExpandedPassageId(expandedPassageId === q.id ? null : q.id)}
                      className="w-full px-4 py-2.5 flex items-center justify-between text-left font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <span className="flex items-center space-x-2">
                        <BookOpen size={14} className="text-emerald-600" />
                        <span>Reference Passage: {q.passage.title}</span>
                      </span>
                      {expandedPassageId === q.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {expandedPassageId === q.id && (
                      <div className="p-4 border-t border-slate-200 font-serif text-slate-800 text-sm whitespace-pre-line leading-relaxed max-h-60 overflow-y-auto">
                        {q.passage.text}
                      </div>
                    )}
                  </div>
                )}

                {/* Question Stem with KaTeX math */}
                <div className="text-slate-900 font-medium text-base mb-4">
                  <MathRenderer text={q.question} />
                </div>

                {/* Options List */}
                <div className="space-y-2 mb-4">
                  {options.map((opt) => {
                    const isCorrectAnswer = opt.key === q.correct_answer;
                    const isUserChoice = opt.key === q.user_answer;

                    let optClass = 'bg-slate-50 border-slate-200 text-slate-700';
                    if (isCorrectAnswer) {
                      optClass = 'bg-emerald-50/90 border-emerald-500 text-emerald-950 font-semibold ring-1 ring-emerald-500';
                    } else if (isUserChoice && !isCorrectAnswer) {
                      optClass = 'bg-rose-50/90 border-rose-400 text-rose-950 font-medium';
                    }

                    return (
                      <div
                        key={opt.key}
                        className={`p-3 rounded-xl border flex items-start space-x-3 text-sm transition ${optClass}`}
                      >
                        <span className={`w-6 h-6 rounded-md font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                          isCorrectAnswer
                            ? 'bg-emerald-600 text-white'
                            : isUserChoice
                            ? 'bg-rose-600 text-white'
                            : 'bg-white text-slate-600 border border-slate-300'
                        }`}>
                          {opt.label}
                        </span>
                        <div className="flex-1 pt-0.5">
                          <MathRenderer text={opt.text} />
                        </div>
                        {isCorrectAnswer && (
                          <span className="text-xs font-bold text-emerald-700 flex items-center space-x-1">
                            <CheckCircle2 size={15} />
                            <span className="hidden sm:inline">Correct Answer</span>
                          </span>
                        )}
                        {isUserChoice && !isCorrectAnswer && (
                          <span className="text-xs font-bold text-rose-700 flex items-center space-x-1">
                            <XCircle size={15} />
                            <span className="hidden sm:inline">Your Choice</span>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Box */}
                {q.explanation && (
                  <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl text-xs text-emerald-950 flex items-start space-x-2">
                    <span className="font-bold text-emerald-800 flex-shrink-0">Explanation:</span>
                    <span className="leading-relaxed"><MathRenderer text={q.explanation} /></span>
                  </div>
                )}
              </div>
            );
          })}
          </div>
        </div>
      )}

      {/* Persistent Bottom Actions across all tabs */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={onGoHome}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer"
          >
            <Home size={15} />
            <span>Dashboard</span>
          </button>
          {currentUser && onOpenLearning && (
            <button
              onClick={onOpenLearning}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 transition cursor-pointer"
            >
              <BarChart3 size={15} className="text-emerald-700" />
              <span>My Learning Page</span>
            </button>
          )}
        </div>
        <button
          onClick={onRetakeExam}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-700/20 transition active:scale-95 cursor-pointer"
        >
          <RotateCcw size={15} />
          <span>Take Another Mock Exam</span>
        </button>
      </div>
    </div>
  );
}
