import React, { useState } from 'react';
import { Bookmark, CheckCircle2, Circle, Filter, ChevronDown, ChevronUp, LayoutGrid } from 'lucide-react';

export default function QuestionPalette({
  subjectQuestions = [],
  currentIndex,
  onSelectIndex,
  answers = {},
  flagged = {},
  activeSubjectName = "Use of English"
}) {
  const [filter, setFilter] = useState('all'); // 'all', 'answered', 'unanswered', 'flagged'
  const [isOpen, setIsOpen] = useState(true);

  const answeredCount = subjectQuestions.filter(q => answers[q.id] !== undefined && answers[q.id] !== '').length;
  const flaggedCount = subjectQuestions.filter(q => flagged[q.id]).length;
  const unansweredCount = subjectQuestions.length - answeredCount;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 sm:p-5 mt-4 sm:mt-6 transition-all">
      {/* Header & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 border-b border-slate-100 pb-3 mb-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 text-left group"
        >
          <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-slate-200 text-slate-700 flex items-center justify-center transition">
            <LayoutGrid size={15} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center space-x-1.5">
              <span>{activeSubjectName} Palette</span>
              <span className="text-slate-400 font-normal">({subjectQuestions.length})</span>
            </h3>
            <p className="text-[11px] text-slate-500 hidden sm:block">Click any number to jump to question</p>
          </div>
          <span className="text-slate-400 pl-1">
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </button>

        {/* Legend Pills & Filter Buttons */}
        {isOpen && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition border ${
                filter === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              All ({subjectQuestions.length})
            </button>

            <button
              onClick={() => setFilter('answered')}
              className={`flex items-center space-x-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition border ${
                filter === 'answered'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <span>Ans ({answeredCount})</span>
            </button>

            <button
              onClick={() => setFilter('unanswered')}
              className={`flex items-center space-x-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition border ${
                filter === 'unanswered'
                  ? 'bg-slate-700 text-white border-slate-700 shadow-xs'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
              <span>Unans ({unansweredCount})</span>
            </button>

            <button
              onClick={() => setFilter('flagged')}
              className={`flex items-center space-x-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition border ${
                filter === 'flagged'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Bookmark size={11} fill="currentColor" />
              <span>Flag ({flaggedCount})</span>
            </button>
          </div>
        )}
      </div>

      {/* Questions Grid */}
      {isOpen && (
        <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 xl:grid-cols-20 gap-1.5 sm:gap-2 pt-1">
          {subjectQuestions.map((q, idx) => {
            const isCurrent = idx === currentIndex;
            const isAnswered = answers[q.id] !== undefined && answers[q.id] !== '';
            const isItemFlagged = flagged[q.id];

            if (filter === 'answered' && !isAnswered) return null;
            if (filter === 'unanswered' && isAnswered) return null;
            if (filter === 'flagged' && !isItemFlagged) return null;

            let badgeClass = 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100';
            if (isAnswered) {
              badgeClass = 'bg-emerald-600 text-white border-emerald-600 shadow-xs hover:bg-emerald-700';
            }
            if (isItemFlagged) {
              badgeClass = isAnswered 
                ? 'bg-emerald-700 text-white border-amber-400 ring-2 ring-amber-400/80 shadow-xs'
                : 'bg-amber-100 text-amber-900 border-amber-400 ring-1 ring-amber-400/60 font-bold';
            }
            if (isCurrent) {
              badgeClass += ' ring-2 ring-slate-900 ring-offset-1 sm:ring-offset-2 scale-105 font-extrabold';
            }

            return (
              <button
                key={q.id}
                onClick={() => onSelectIndex(idx)}
                className={`relative h-9 sm:h-10 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center border ${badgeClass}`}
                title={`Question ${idx + 1} (${isAnswered ? 'Answered: ' + answers[q.id].toUpperCase() : 'Unanswered'}${isItemFlagged ? ', Flagged' : ''})`}
              >
                <span>{idx + 1}</span>
                {isItemFlagged && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-amber-500 rounded-full border border-white flex items-center justify-center">
                    <Bookmark size={6} fill="#ffffff" stroke="#ffffff" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
