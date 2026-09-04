import React, { useState } from 'react';
import { 
  Clock, AlertTriangle, Zap, ShieldAlert, CheckCircle2, 
  XCircle, ChevronRight, BarChart2, Hourglass, HelpCircle, ArrowRight
} from 'lucide-react';
import MathRenderer from './MathRenderer';

const SUBJECT_NAMES = {
  english: 'Use of English',
  biology: 'Biology',
  physics: 'Physics',
  chemistry: 'Chemistry'
};

const SUBJECT_COLORS = {
  english: 'bg-indigo-500 text-indigo-100',
  biology: 'bg-emerald-500 text-emerald-100',
  physics: 'bg-sky-500 text-sky-100',
  chemistry: 'bg-amber-500 text-amber-100'
};

function formatSeconds(totalSec = 0) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export default function PacingAnalytics({ 
  pacingData = {}, 
  totalQuestions = 0,
  avgSpeed = 0,
  timeSpentSeconds = 0 
}) {
  const [activeTab, setActiveTab] = useState('wasters'); // 'wasters' | 'rushed'
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);

  const timeWasters = pacingData?.time_wasters || [];
  const rushedErrors = pacingData?.rushed_errors || [];
  const subjectPacing = pacingData?.subject_pacing || {};

  // Compute pacing discipline rating
  const isSpeedOptimal = avgSpeed >= 30 && avgSpeed <= 48;
  const isTooSlow = avgSpeed > 48;
  const isTooFast = avgSpeed < 30 && avgSpeed > 0;

  let pacingRating = 'Balanced Pacing';
  let ratingColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';

  if (timeWasters.length >= 5) {
    pacingRating = 'Severe Time Drains';
    ratingColor = 'text-rose-700 bg-rose-50 border-rose-200';
  } else if (rushedErrors.length >= 4) {
    pacingRating = 'Rushing Pitfalls Detected';
    ratingColor = 'text-amber-700 bg-amber-50 border-amber-200';
  } else if (isTooSlow) {
    pacingRating = 'Pacing Too Slow (>48s/Q)';
    ratingColor = 'text-amber-700 bg-amber-50 border-amber-200';
  } else if (isTooFast) {
    pacingRating = 'Fast Tempo (<30s/Q)';
    ratingColor = 'text-sky-700 bg-sky-50 border-sky-200';
  }

  // Calculate total seconds wasted past 40s
  const totalSecondsWasted = timeWasters.reduce((acc, q) => acc + Math.max(0, (q.time_spent_seconds || 0) - 40), 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. TOP PACING KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Average Speed */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Question Speed</div>
          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-slate-900 flex items-baseline space-x-1">
            <span>{avgSpeed}s</span>
            <span className="text-xs text-slate-400 font-normal">/ Q</span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center space-x-1">
            <span>Target: ~40s (120m / 180Q)</span>
          </div>
        </div>

        {/* Time Wasters */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Time Wasters (&gt;90s)</div>
          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-rose-600 flex items-baseline space-x-1">
            <span>{timeWasters.length}</span>
            <span className="text-xs text-slate-400 font-normal">questions</span>
          </div>
          <div className="text-[11px] text-rose-600 font-medium">
            {totalSecondsWasted > 0 ? `Drained ~${formatSeconds(totalSecondsWasted)} extra` : 'No major time wasters'}
          </div>
        </div>

        {/* Rushed Errors */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rushed Errors (&lt;15s)</div>
          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-amber-600 flex items-baseline space-x-1">
            <span>{rushedErrors.length}</span>
            <span className="text-xs text-slate-400 font-normal">mistakes</span>
          </div>
          <div className="text-[11px] text-amber-600 font-medium">
            {rushedErrors.length > 0 ? 'Careless errors from rushing' : 'Great answer discipline'}
          </div>
        </div>

        {/* Pacing Rating */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pacing Health</div>
          <div className="pt-1">
            <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-lg border ${ratingColor}`}>
              {pacingRating}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Total Time: {formatSeconds(timeSpentSeconds)}
          </div>
        </div>
      </div>

      {/* 2. SUBJECT TIME DISTRIBUTION BAR */}
      {Object.keys(subjectPacing).length > 0 && (
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                <BarChart2 size={16} className="text-indigo-600" />
                <span>Subject Time Allocation Split</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Did you spend excessive minutes on one subject at the expense of others?
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Ideal: ~30 mins per subject in Full Mock
            </span>
          </div>

          {/* Multi-segment distribution bar */}
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 shadow-inner">
            {Object.entries(subjectPacing).map(([sId, stat]) => {
              const colorClass = sId === 'english' ? 'bg-indigo-500' : sId === 'biology' ? 'bg-emerald-500' : sId === 'physics' ? 'bg-sky-500' : 'bg-amber-500';
              return (
                <div
                  key={sId}
                  className={`${colorClass} transition-all duration-500`}
                  style={{ width: `${stat.percentage_of_total_time || 0}%` }}
                  title={`${SUBJECT_NAMES[sId] || sId}: ${formatSeconds(stat.time_spent_seconds)} (${stat.percentage_of_total_time}%)`}
                />
              );
            })}
          </div>

          {/* Subject pacing stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
            {Object.entries(subjectPacing).map(([sId, stat]) => {
              const colorDot = sId === 'english' ? 'bg-indigo-500' : sId === 'biology' ? 'bg-emerald-500' : sId === 'physics' ? 'bg-sky-500' : 'bg-amber-500';
              return (
                <div key={sId} className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 min-w-0">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colorDot}`} />
                    <span className="font-semibold text-slate-700 truncate capitalize text-[11px]">
                      {SUBJECT_NAMES[sId] || sId}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      {formatSeconds(stat.time_spent_seconds)}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {stat.avg_seconds_per_question}s/Q
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. PACING DRILLDOWN TABS: TIME WASTERS vs RUSHED ERRORS */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        {/* Toggle Pills */}
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <button
            onClick={() => setActiveTab('wasters')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'wasters'
                ? 'bg-rose-50 text-rose-800 border border-rose-200 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Hourglass size={14} className="text-rose-600" />
            <span>Time Wasters ({timeWasters.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rushed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'rushed'
                ? 'bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap size={14} className="text-amber-600" />
            <span>Rushed Errors ({rushedErrors.length})</span>
          </button>
        </div>

        {/* TIME WASTERS LIST */}
        {activeTab === 'wasters' && (
          <div className="space-y-2.5">
            {timeWasters.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                🎉 Great discipline! You did not spend more than 90 seconds on any single question.
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-[11px] text-slate-500">
                  Questions where you spent &gt;90s. In UTME, lingering too long risks leaving easy questions unread.
                </div>
                {timeWasters.map((q) => {
                  const isExpanded = expandedQuestionId === q.id;
                  const isCorrect = q.is_correct;
                  return (
                    <div
                      key={q.id}
                      className={`p-3 rounded-xl border transition ${
                        isCorrect
                          ? 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                          : 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                      }`}
                    >
                      <div 
                        onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                        className="flex items-start justify-between gap-3 cursor-pointer"
                      >
                        <div className="flex items-start space-x-2 min-w-0">
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0 mt-0.5 ${
                            isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            Q{q.number}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-1.5 text-[10px] text-slate-500">
                              <span className="uppercase font-bold capitalize">{q.subject_id}</span>
                              {q.topic && <span>• {q.topic}</span>}
                            </div>
                            <div className="font-medium text-xs text-slate-900 truncate max-w-md sm:max-w-xl">
                              {q.question}
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0 flex items-center space-x-2">
                          <div>
                            <span className="font-mono font-bold text-rose-700 text-xs block">
                              {formatSeconds(q.time_spent_seconds)}
                            </span>
                            <span className={`text-[10px] font-bold ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {isCorrect ? 'Correct' : 'Incorrect'}
                            </span>
                          </div>
                          <ChevronRight size={14} className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </div>
                      </div>

                      {/* Expanded Question Details */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-200/80 text-xs space-y-2">
                          <div className="text-slate-900 font-medium">
                            <MathRenderer text={q.question} />
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] pt-1">
                            <span className="text-slate-600">
                              Your Answer: <strong className={isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                                {q.user_answer ? q.user_answer.toUpperCase() : 'None'}
                              </strong>
                            </span>
                            <span className="text-slate-600">
                              Correct Answer: <strong className="text-emerald-700">{q.correct_answer.toUpperCase()}</strong>
                            </span>
                          </div>
                          {q.explanation && (
                            <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-700 text-xs">
                              <strong>Explanation: </strong>
                              <MathRenderer text={q.explanation} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* RUSHED ERRORS LIST */}
        {activeTab === 'rushed' && (
          <div className="space-y-2.5">
            {rushedErrors.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                ⭐ Awesome patience! You made 0 impulsive errors in under 15 seconds.
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-[11px] text-slate-500">
                  Questions answered in &lt;15s that turned out incorrect. Slowing down by just 10s prevents these marks from slipping away.
                </div>
                {rushedErrors.map((q) => {
                  const isExpanded = expandedQuestionId === q.id;
                  return (
                    <div
                      key={q.id}
                      className="p-3 rounded-xl border border-amber-200 bg-amber-50/40 hover:border-amber-300 transition"
                    >
                      <div 
                        onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                        className="flex items-start justify-between gap-3 cursor-pointer"
                      >
                        <div className="flex items-start space-x-2 min-w-0">
                          <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono font-bold bg-amber-100 text-amber-800 flex-shrink-0 mt-0.5">
                            Q{q.number}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-1.5 text-[10px] text-slate-500">
                              <span className="uppercase font-bold capitalize">{q.subject_id}</span>
                              {q.topic && <span>• {q.topic}</span>}
                            </div>
                            <div className="font-medium text-xs text-slate-900 truncate max-w-md sm:max-w-xl">
                              {q.question}
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0 flex items-center space-x-2">
                          <div>
                            <span className="font-mono font-bold text-amber-700 text-xs block">
                              {q.time_spent_seconds}s
                            </span>
                            <span className="text-[10px] font-bold text-rose-600">
                              Wrong
                            </span>
                          </div>
                          <ChevronRight size={14} className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </div>
                      </div>

                      {/* Expanded Question Details */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-200/80 text-xs space-y-2">
                          <div className="text-slate-900 font-medium">
                            <MathRenderer text={q.question} />
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] pt-1">
                            <span className="text-slate-600">
                              Your Answer: <strong className="text-rose-700">
                                {q.user_answer ? q.user_answer.toUpperCase() : 'None'}
                              </strong>
                            </span>
                            <span className="text-slate-600">
                              Correct Answer: <strong className="text-emerald-700">{q.correct_answer.toUpperCase()}</strong>
                            </span>
                          </div>
                          {q.explanation && (
                            <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-700 text-xs">
                              <strong>Explanation: </strong>
                              <MathRenderer text={q.explanation} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
