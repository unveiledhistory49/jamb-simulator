import React, { useState, useMemo } from 'react';
import { 
  Target, AlertTriangle, CheckCircle2, Flame, Sparkles, 
  ArrowRight, RotateCcw, Filter, Search, BookOpen, Dna, Atom, FlaskConical, Play
} from 'lucide-react';

const SUBJECT_CONFIG = {
  english: { name: 'Use of English', icon: <BookOpen size={14} />, badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  biology: { name: 'Biology', icon: <Dna size={14} />, badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  physics: { name: 'Physics', icon: <Atom size={14} />, badge: 'bg-sky-50 text-sky-700 border-sky-200' },
  chemistry: { name: 'Chemistry', icon: <FlaskConical size={14} />, badge: 'bg-amber-50 text-amber-700 border-amber-200' }
};

export default function TopicHeatmap({ 
  topics = [], 
  top3HighYield = [], 
  onStartRevisionDrill,
  onStartSingleTopicDrill
}) {
  const [activeSubjectFilter, setActiveSubjectFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Normalize topic list
  const normalizedTopics = useMemo(() => {
    if (!topics || topics.length === 0) return [];
    
    // If topics is array of objects
    return topics.map(t => {
      const acc = typeof t.accuracy === 'number' ? t.accuracy : Math.round(((t.correct || 0) / (t.total || 1)) * 100);
      return {
        topic: t.topic || 'General',
        subject: (t.subject || 'english').toLowerCase(),
        correct: t.correct || 0,
        total: t.total || 0,
        accuracy: acc,
        deficitScore: t.deficit_score || (100 - acc) * (t.total || 1)
      };
    });
  }, [topics]);

  // Filter topics based on active subject & search query
  const filteredTopics = useMemo(() => {
    return normalizedTopics.filter(t => {
      const matchesSubject = activeSubjectFilter === 'all' || t.subject === activeSubjectFilter;
      const matchesSearch = !searchQuery || t.topic.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSubject && matchesSearch;
    }).sort((a, b) => a.accuracy - b.accuracy); // Lowest accuracy first
  }, [normalizedTopics, activeSubjectFilter, searchQuery]);

  // Compute Top 3 if not directly provided
  const highYieldTopics = useMemo(() => {
    if (top3HighYield && top3HighYield.length > 0) return top3HighYield;
    return [...normalizedTopics]
      .filter(t => t.accuracy < 75 && t.total >= 1)
      .sort((a, b) => b.deficitScore - a.deficitScore)
      .slice(0, 3);
  }, [top3HighYield, normalizedTopics]);

  // Counts by mastery category
  const stats = useMemo(() => {
    let critical = 0; // < 50%
    let developing = 0; // 50 - 74%
    let mastered = 0; // >= 75%
    normalizedTopics.forEach(t => {
      if (t.accuracy < 50) critical++;
      else if (t.accuracy < 75) developing++;
      else mastered++;
    });
    return { critical, developing, mastered, total: normalizedTopics.length };
  }, [normalizedTopics]);

  const handleLaunchTop3Drill = () => {
    if (!onStartRevisionDrill) return;
    const topicNames = highYieldTopics.map(t => t.topic);
    onStartRevisionDrill(topicNames);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. TOP 3 HIGH-YIELD REVISION DIRECTIVES BANNER */}
      {highYieldTopics.length > 0 && (
        <div className="bg-gradient-to-br from-rose-500/10 via-amber-500/5 to-transparent border border-rose-200/80 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-rose-600 text-white shadow-xs">
                <Flame size={18} />
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center space-x-1.5">
                  <span>Top 3 High-Yield Topics to Revise</span>
                  <span className="text-[10px] uppercase font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-200">
                    Highest Deficit
                  </span>
                </h3>
                <p className="text-xs text-slate-600">
                  Mastering these 3 topics yields the largest immediate score increase in your next UTME mock.
                </p>
              </div>
            </div>

            {onStartRevisionDrill && (
              <button
                onClick={handleLaunchTop3Drill}
                className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Play size={13} fill="currentColor" />
                <span>Launch 20-Q Revision Drill</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {highYieldTopics.map((item, idx) => {
              const subj = SUBJECT_CONFIG[item.subject] || { name: item.subject, badge: 'bg-slate-100 text-slate-700 border-slate-200' };
              const marksLost = (item.total - item.correct);
              return (
                <div key={item.topic} className="bg-white p-3 sm:p-3.5 rounded-xl border border-rose-100 shadow-xs space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center space-x-1 ${subj.badge}`}>
                      <span>#{idx + 1}</span>
                      <span>•</span>
                      <span className="capitalize">{subj.name}</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-700">
                      {item.accuracy}% Accuracy
                    </span>
                  </div>

                  <div className="font-bold text-xs sm:text-sm text-slate-900 leading-snug truncate" title={item.topic}>
                    {item.topic}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span>Missed: <strong className="text-rose-600 font-mono">{marksLost} Qs</strong></span>
                    {onStartSingleTopicDrill && (
                      <button
                        onClick={() => onStartSingleTopicDrill(item.topic, item.subject)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-0.5"
                      >
                        <span>Drill</span>
                        <ArrowRight size={11} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. SYLLABUS MASTERY HEATMAP CONTAINER */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        {/* Header & Category Stats */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Syllabus Topic Mastery Heatmap
            </h3>
            <p className="text-xs text-slate-500">
              Visual accuracy breakdown across all UTME curriculum topics
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Critical ({stats.critical})</span>
            </span>
            <span className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Developing ({stats.developing})</span>
            </span>
            <span className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Mastered ({stats.mastered})</span>
            </span>
          </div>
        </div>

        {/* Filter Controls: Subject Tabs & Search */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Subject Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold overflow-x-auto no-scrollbar max-w-full">
            <button
              onClick={() => setActiveSubjectFilter('all')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                activeSubjectFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All ({normalizedTopics.length})
            </button>
            {Object.entries(SUBJECT_CONFIG).map(([sId, cfg]) => {
              const count = normalizedTopics.filter(t => t.subject === sId).length;
              return (
                <button
                  key={sId}
                  onClick={() => setActiveSubjectFilter(sId)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition flex items-center space-x-1 ${
                    activeSubjectFilter === sId
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <span>{cfg.icon}</span>
                  <span className="capitalize">{cfg.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-56">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-500 text-slate-800"
            />
          </div>
        </div>

        {/* Topic Grid */}
        {filteredTopics.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
            {normalizedTopics.length === 0
              ? 'Complete a practice mock to populate your topic mastery diagnostics.'
              : 'No topics match your current filter.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {filteredTopics.map((t) => {
              const subj = SUBJECT_CONFIG[t.subject] || { name: t.subject, badge: 'bg-slate-100 text-slate-700' };
              const isCritical = t.accuracy < 50;
              const isDeveloping = t.accuracy >= 50 && t.accuracy < 75;
              const isMastered = t.accuracy >= 75;

              const progressColor = isCritical ? 'bg-rose-500' : isDeveloping ? 'bg-amber-500' : 'bg-emerald-500';
              const badgeColor = isCritical 
                ? 'bg-rose-100 text-rose-800 border-rose-200' 
                : isDeveloping 
                ? 'bg-amber-100 text-amber-800 border-amber-200' 
                : 'bg-emerald-100 text-emerald-800 border-emerald-200';

              return (
                <div 
                  key={`${t.subject}_${t.topic}`}
                  className="bg-slate-50/70 hover:bg-white p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition shadow-2xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider capitalize">
                        {subj.name}
                      </div>
                      <div className="font-bold text-xs text-slate-900 truncate" title={t.topic}>
                        {t.topic}
                      </div>
                    </div>
                    <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border flex-shrink-0 ${badgeColor}`}>
                      {t.accuracy}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
                      style={{ width: `${Math.max(6, t.accuracy)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span className="font-mono">{t.correct} / {t.total} Qs correct</span>
                    {onStartSingleTopicDrill && (
                      <button
                        onClick={() => onStartSingleTopicDrill(t.topic, t.subject)}
                        className="text-[11px] font-bold text-slate-700 hover:text-emerald-700 transition"
                      >
                        Drill →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
