import React, { useState, useEffect } from 'react';
import { 
  User, Award, Clock, ArrowLeft, RotateCcw, AlertTriangle, 
  CheckCircle2, ChevronRight, BarChart3, BookOpen, Dna, Atom, 
  FlaskConical, Target, ShieldCheck, Sparkles, LogOut, RefreshCw, Trash2
} from 'lucide-react';
import { fetchUserExams, fetchUserMistakes, resolveMistakeInCloud } from '../utils/supabaseClient';
import MathRenderer from './MathRenderer';

export default function UserLearningDashboard({
  user,
  onBackToHome,
  onStartExamWithQuestions,
  onLogout
}) {
  const [exams, setExams] = useState([]);
  const [mistakes, setMistakes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'mistakes' | 'history'
  const [selectedMistake, setSelectedMistake] = useState(null);

  const loadUserData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [examList, mistakeList] = await Promise.all([
        fetchUserExams(user.username),
        fetchUserMistakes(user.username)
      ]);
      setExams(examList);
      setMistakes(mistakeList);
    } catch (e) {
      console.warn("Could not fetch user learning records:", e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadUserData();
  }, [user]);

  // Aggregate stats
  const totalExams = exams.length;
  const bestScore = totalExams > 0 ? Math.max(...exams.map(e => e.total_score || 0)) : 0;
  const avgScore = totalExams > 0 
    ? Math.round(exams.reduce((sum, e) => sum + (e.total_score || 0), 0) / totalExams) 
    : 0;

  // Aggregate topic strengths & weaknesses across all past exams
  const topicAgg = {};
  exams.forEach(e => {
    const breakdown = e.summary?.topic_breakdown || {};
    Object.entries(breakdown).forEach(([topic, stat]) => {
      if (!topicAgg[topic]) {
        topicAgg[topic] = { subject: stat.subject, correct: 0, total: 0 };
      }
      topicAgg[topic].correct += (stat.correct || 0);
      topicAgg[topic].total += (stat.total || 0);
    });
  });

  const topicsList = Object.entries(topicAgg).map(([topic, stat]) => ({
    topic,
    subject: stat.subject,
    accuracy: stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0,
    total: stat.total
  })).sort((a, b) => a.accuracy - b.accuracy);

  const weakTopics = topicsList.filter(t => t.accuracy < 50 && t.total >= 2);
  const strongTopics = topicsList.filter(t => t.accuracy >= 75 && t.total >= 2);

  // Launch a custom drill from unresolved mistakes
  const handleLaunchMistakeDrill = () => {
    if (mistakes.length === 0) return;

    // Convert mistake rows into standard question format
    const drillQuestions = mistakes.map((m, idx) => ({
      number: idx + 1,
      id: m.question_id,
      subject_id: m.subject_id,
      topic: m.topic,
      question: m.question_text,
      option_a: m.options?.a || '',
      option_b: m.options?.b || '',
      option_c: m.options?.c || '',
      option_d: m.options?.d || '',
      correct_answer: m.correct_answer,
      explanation: m.explanation,
      mistake_record_id: m.id
    }));

    onStartExamWithQuestions({
      exam_id: 'mistake_drill_' + Date.now(),
      mode: 'mistake_drill',
      duration_seconds: drillQuestions.length * 50,
      total_questions: drillQuestions.length,
      subjects: [{ id: 'mistakes', name: 'Mistake Drill', count: drillQuestions.length, scale_to: 100 }],
      questions: drillQuestions
    });
  };

  const getSubjectColor = (subj) => {
    switch (subj) {
      case 'english': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case 'biology': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'physics': return 'text-sky-600 bg-sky-50 border-sky-200';
      case 'chemistry': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-8 animate-in fade-in">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToHome}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Back to Practice Portal"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 capitalize">
                {user.username}'s Learning Dashboard
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/20 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Cloud Synced
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono">
              Individual learning records saved via Supabase
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadUserData}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition text-xs font-semibold flex items-center space-x-1"
            title="Refresh Data from Supabase"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin text-emerald-600" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={onLogout}
            className="p-2 text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition text-xs font-semibold flex items-center space-x-1"
            title="Log Out"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Candidate Performance Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Candidate Account</div>
          <div className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <span className="capitalize">{user.username}</span>
          </div>
          <div className="text-xs text-emerald-600 font-medium">Science Combination</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Mocks Attempted</div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">{totalExams}</div>
          <div className="text-xs text-slate-500">Across full mocks & drills</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Highest Scaled Score</div>
          <div className="text-3xl font-extrabold text-emerald-600 font-mono">
            {bestScore} <span className="text-xs text-slate-400 font-normal">/ 400</span>
          </div>
          <div className="text-xs text-slate-500">
            {bestScore >= 280 ? 'Competitive for Medicine/Law' : bestScore >= 240 ? 'Safe for Engineering' : 'Continue Practicing'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Mistake Vault</div>
          <div className="text-3xl font-extrabold text-amber-600 font-mono">{mistakes.length}</div>
          <div className="text-xs text-slate-500">Unresolved questions to re-test</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition ${
            activeTab === 'overview'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Weakness Diagnostics & Topics
        </button>

        <button
          onClick={() => setActiveTab('mistakes')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center space-x-1.5 ${
            activeTab === 'mistakes'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Mistake Bank</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full font-mono font-bold">
            {mistakes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition ${
            activeTab === 'history'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Exam History ({exams.length})
        </button>
      </div>

      {/* TAB 1: WEAKNESS DIAGNOSTICS & TOPICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Mistake Bank Banner Callout */}
          {mistakes.length > 0 && (
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-sm font-bold text-amber-950 flex items-center space-x-2">
                  <AlertTriangle size={17} className="text-amber-600" />
                  <span>You have {mistakes.length} unresolved mistake(s) in your bank</span>
                </div>
                <p className="text-xs text-amber-900/80">
                  Re-attempt these questions until you score 100% to cement difficult concepts.
                </p>
              </div>

              <button
                onClick={handleLaunchMistakeDrill}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95 flex items-center space-x-2"
              >
                <RotateCcw size={14} />
                <span>Drill Mistakes ({mistakes.length} Qs)</span>
              </button>
            </div>
          )}

          {/* Topic Strengths & Weaknesses Heatmap */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weak Topics */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 text-rose-800 font-bold text-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                <span>High-Yield Weaknesses to Revise</span>
              </div>
              <p className="text-xs text-slate-500">Topics where your accuracy is currently below 50%:</p>

              {weakTopics.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-500 text-center">
                  {totalExams === 0 ? 'Take your first mock to generate topic weakness diagnostics.' : 'No critical weaknesses detected! Keep practicing.'}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {weakTopics.map(t => (
                    <div key={t.topic} className="p-3 rounded-xl border border-rose-100 bg-rose-50/50 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-xs text-slate-900">{t.topic}</div>
                        <div className="text-[10px] text-slate-500 capitalize">{t.subject}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-rose-700 font-mono">{t.accuracy}%</div>
                        <div className="text-[10px] text-slate-400 font-mono">{t.total} questions</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Strong Topics */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <span>Mastered Topics</span>
              </div>
              <p className="text-xs text-slate-500">Topics where your accuracy is 75% or higher:</p>

              {strongTopics.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-500 text-center">
                  {totalExams === 0 ? 'Take your first mock to track mastered topics.' : 'Keep practicing to master topics at 75%+.'}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {strongTopics.map(t => (
                    <div key={t.topic} className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/50 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-xs text-slate-900">{t.topic}</div>
                        <div className="text-[10px] text-slate-500 capitalize">{t.subject}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-emerald-700 font-mono">{t.accuracy}%</div>
                        <div className="text-[10px] text-slate-400 font-mono">{t.total} questions</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MISTAKE BANK */}
      {activeTab === 'mistakes' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Personal Mistake Vault</h2>
              <p className="text-xs text-slate-500">Review questions you missed during your previous mock exams</p>
            </div>

            {mistakes.length > 0 && (
              <button
                onClick={handleLaunchMistakeDrill}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 flex items-center space-x-1.5"
              >
                <RotateCcw size={14} />
                <span>Launch Mistake Retest Drill</span>
              </button>
            )}
          </div>

          {mistakes.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <CheckCircle2 size={36} className="text-emerald-500 mx-auto" />
              <div className="text-sm font-bold text-slate-800">Your Mistake Bank is Clean!</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Any questions you miss during mock exams will automatically be cataloged here for spaced repetition.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {mistakes.map((m, idx) => (
                <div 
                  key={m.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold font-mono bg-slate-900 text-white px-2 py-0.5 rounded-md">
                        #{idx + 1}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${getSubjectColor(m.subject_id)}`}>
                        {m.subject_id}
                      </span>
                      {m.topic && (
                        <span className="text-xs text-slate-500 font-medium">
                          {m.topic}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs sm:text-sm font-medium text-slate-900">
                    <MathRenderer text={m.question_text} />
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 pt-1">
                    <div className="text-rose-700">
                      <strong>Your choice:</strong> {m.user_answer ? m.user_answer.toUpperCase() : 'Left Blank'}
                    </div>
                    <div className="text-emerald-700 font-bold">
                      <strong>Correct answer:</strong> {m.correct_answer.toUpperCase()}
                    </div>
                    {m.explanation && (
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 mt-2">
                        <strong>Explanation: </strong>
                        <MathRenderer text={m.explanation} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: EXAM HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Cloud Synced Exam History</h2>
          <p className="text-xs text-slate-500">Every mock exam you submit is automatically archived in Supabase</p>

          {exams.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              No exams recorded yet. Start a Full Mock or Subject Drill to see your history here!
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {exams.map(e => (
                <div key={e.id} className="py-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-slate-800 text-sm capitalize">
                      {e.mode === 'full_mock' ? 'Full 4-Subject UTME Mock (180 Qs)' : `${e.mode} Practice`}
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {new Date(e.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                    <div className="text-xs text-slate-600 mt-1 flex items-center space-x-3">
                      <span>Time: <strong>{Math.floor(e.time_spent_seconds / 60)} mins</strong></span>
                      <span>Avg: <strong>{e.summary?.avg_seconds_per_question || 40}s / question</strong></span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-black text-emerald-600 font-mono">
                      {e.total_score} <span className="text-xs text-slate-400 font-normal">/ {e.max_score}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-semibold">
                      {e.summary?.grade || 'Completed'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
