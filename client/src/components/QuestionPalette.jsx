import React, { useState } from 'react';
import { Bookmark, CheckCircle2, Circle, Filter } from 'lucide-react';

export default function QuestionPalette({
  subjectQuestions = [],
  currentIndex,
  onSelectIndex,
  answers = {},
  flagged = {},
  activeSubjectName = "Use of English"
}) {
  const [filter, setFilter] = useState('all'); // 'all', 'answered', 'unanswered', 'flagged'

  const answeredCount = subjectQuestions.filter(q => answers[q.id] !== undefined && answers[q.id] !== '').length;
  const flaggedCount = subjectQuestions.filter(q => flagged[q.id]).length;
  const unansweredCount = subjectQuestions.length - answeredCount;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mt-6">
      {/* Header & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <span>Question Palette — {activeSubjectName}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Click any number to navigate directly to that question</p>
        </div>

        {/* Legend Pills & Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
              filter === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>All ({subjectQuestions.length})</span>
          </button>

          <button
            onClick={() => setFilter('answered')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
              filter === 'answered'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span>Answered ({answeredCount})</span>
          </button>

          <button
            onClick={() => setFilter('unanswered')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
              filter === 'unanswered'
                ? 'bg-slate-700 text-white border-slate-700 shadow-sm'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-slate-400"></div>
            <span>Unanswered ({unansweredCount})</span>
          </button>

          <button
            onClick={() => setFilter('flagged')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
              filter === 'flagged'
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Bookmark size={12} fill="currentColor" />
            <span>Flagged ({flaggedCount})</span>
          </button>
        </div>
      </div>

      {/* Questions Grid */}
      <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 xl:grid-cols-20 gap-2">
        {subjectQuestions.map((q, idx) => {
          const isCurrent = idx === currentIndex;
          const isAnswered = answers[q.id] !== undefined && answers[q.id] !== '';
          const isItemFlagged = flagged[q.id];

          // Filter condition
          if (filter === 'answered' && !isAnswered) return null;
          if (filter === 'unanswered' && isAnswered) return null;
          if (filter === 'flagged' && !isItemFlagged) return null;

          let badgeClass = 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100';
          if (isAnswered) {
            badgeClass = 'bg-emerald-600 text-white border-emerald-600 shadow-sm hover:bg-emerald-700';
          }
          if (isItemFlagged) {
            badgeClass = isAnswered 
              ? 'bg-emerald-700 text-white border-amber-400 ring-2 ring-amber-400/80 shadow-sm'
              : 'bg-amber-100 text-amber-900 border-amber-400 ring-1 ring-amber-400/60 font-bold';
          }
          if (isCurrent) {
            badgeClass += ' ring-2 ring-slate-900 ring-offset-2 scale-105 font-extrabold';
          }

          return (
            <button
              key={q.id}
              onClick={() => onSelectIndex(idx)}
              className={`relative h-10 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center border ${badgeClass}`}
              title={`Question ${idx + 1} (${isAnswered ? 'Answered: ' + answers[q.id].toUpperCase() : 'Unanswered'}${isItemFlagged ? ', Flagged' : ''})`}
            >
              <span>{idx + 1}</span>
              {isItemFlagged && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border border-white flex items-center justify-center">
                  <Bookmark size={7} fill="#ffffff" stroke="#ffffff" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
