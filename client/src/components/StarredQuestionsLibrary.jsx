import React, { useState, useMemo } from 'react';
import { 
  Star, Search, Play, Trash2, BookOpen, CheckCircle2, 
  HelpCircle, ChevronRight, Dna, Atom, FlaskConical, Filter, Sparkles
} from 'lucide-react';
import MathRenderer from './MathRenderer';

export default function StarredQuestionsLibrary({
  starredQuestions = [],
  onToggleStar,
  onStartStarredDrill
}) {
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const subjectMeta = {
    english: { name: 'Use of English', icon: <BookOpen size={14} />, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
    biology: { name: 'Biology', icon: <Dna size={14} />, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    physics: { name: 'Physics', icon: <Atom size={14} />, color: 'text-sky-700 bg-sky-50 border-sky-200' },
    chemistry: { name: 'Chemistry', icon: <FlaskConical size={14} />, color: 'text-amber-700 bg-amber-50 border-amber-200' },
  };

  const subjectCounts = useMemo(() => {
    const counts = { all: starredQuestions.length, english: 0, biology: 0, physics: 0, chemistry: 0 };
    starredQuestions.forEach(q => {
      const sId = (q.subject_id || '').toLowerCase();
      if (counts[sId] !== undefined) counts[sId]++;
    });
    return counts;
  }, [starredQuestions]);

  const filteredQuestions = useMemo(() => {
    return starredQuestions.filter(q => {
      const matchesSubject = selectedSubject === 'all' || (q.subject_id || '').toLowerCase() === selectedSubject;
      if (!matchesSubject) return false;

      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const text = (q.question || q.question_text || '').toLowerCase();
      const topic = (q.topic || '').toLowerCase();
      return text.includes(query) || topic.includes(query);
    });
  }, [starredQuestions, selectedSubject, searchQuery]);

  const handleLaunchDrill = () => {
    if (filteredQuestions.length === 0) return;
    onStartStarredDrill(filteredQuestions);
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 border border-amber-200">
              <Star size={18} className="fill-amber-400 text-amber-500" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Starred Tricky Questions Library
              </h2>
              <p className="text-xs text-slate-500">
                Revisit difficult questions bookmarked during exams and solutions reviews
              </p>
            </div>
          </div>
        </div>

        {starredQuestions.length > 0 && (
          <button
            onClick={handleLaunchDrill}
            className="self-start sm:self-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 flex items-center space-x-1.5 cursor-pointer"
          >
            <Play size={13} className="fill-current" />
            <span>Practice Starred Drill ({filteredQuestions.length} Qs)</span>
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Subject Filter Pills */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedSubject('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
              selectedSubject === 'all'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            All ({subjectCounts.all})
          </button>

          {['english', 'biology', 'physics', 'chemistry'].map(sId => (
            <button
              key={sId}
              onClick={() => setSelectedSubject(sId)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border flex items-center space-x-1.5 ${
                selectedSubject === sId
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{subjectMeta[sId]?.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                selectedSubject === sId ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-700'
              }`}>
                {subjectCounts[sId]}
              </span>
            </button>
          ))}
        </div>

        {/* Search Filter */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search keywords or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Questions List */}
      {starredQuestions.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-14 h-14 bg-amber-50 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-200/60 shadow-xs">
            <Star size={28} className="fill-amber-400/20 text-amber-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800">No Starred Questions Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              When tackling full mocks or subject drills, click the <span className="inline-flex items-center text-amber-600 font-semibold px-1 py-0.5 bg-amber-50 rounded border border-amber-200">⭐ Star</span> button on tricky or high-yield questions to build your personal revision library.
            </p>
          </div>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500 space-y-1">
          <p>No starred questions matching current filter & search.</p>
          <button 
            onClick={() => { setSelectedSubject('all'); setSearchQuery(''); }}
            className="text-emerald-600 font-bold hover:underline cursor-pointer"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const sId = (q.subject_id || 'english').toLowerCase();
            const meta = subjectMeta[sId] || subjectMeta.english;
            const qText = q.question || q.question_text || '';
            const opts = q.options || {
              a: q.option_a,
              b: q.option_b,
              c: q.option_c,
              d: q.option_d
            };

            return (
              <div 
                key={q.id || q.question_id || idx}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs space-y-3"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold font-mono bg-slate-900 text-white px-2 py-0.5 rounded-md">
                      #{idx + 1}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${meta.color}`}>
                      {meta.name}
                    </span>
                    {q.topic && (
                      <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium truncate max-w-[200px]">
                        {q.topic}
                      </span>
                    )}
                    {q.year && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {q.year}
                      </span>
                    )}
                  </div>

                  {/* Unstar / Remove Button */}
                  <button
                    onClick={() => onToggleStar(q)}
                    className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition active:scale-95 cursor-pointer"
                    title="Remove from Starred Library"
                  >
                    <Star size={13} className="fill-amber-500 text-amber-500" />
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>

                {/* Question Body */}
                <div className="text-xs sm:text-sm font-medium text-slate-900 leading-relaxed">
                  <MathRenderer text={qText} />
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {[
                    { key: 'a', label: 'A', text: opts.a },
                    { key: 'b', label: 'B', text: opts.b },
                    { key: 'c', label: 'C', text: opts.c },
                    { key: 'd', label: 'D', text: opts.d }
                  ].map(opt => {
                    const isCorrect = (q.correct_answer || '').toLowerCase() === opt.key;
                    return (
                      <div
                        key={opt.key}
                        className={`p-2.5 rounded-xl border text-xs flex items-start space-x-2 transition ${
                          isCorrect
                            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-medium'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] uppercase shrink-0 ${
                          isCorrect ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
                        }`}>
                          {opt.label}
                        </span>
                        <div className="flex-1 pt-0.5">
                          <MathRenderer text={opt.text || ''} />
                        </div>
                        {isCorrect && (
                          <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Card */}
                {q.explanation && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                    <div className="font-bold text-slate-900 flex items-center space-x-1">
                      <Sparkles size={13} className="text-amber-500" />
                      <span>UTME Syllabus Explanation:</span>
                    </div>
                    <div className="leading-relaxed text-slate-600">
                      <MathRenderer text={q.explanation} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
