import React, { useState } from 'react';
import { 
  Bookmark, Star, ChevronLeft, ChevronRight, CheckCircle2, 
  RotateCcw, AlertTriangle, BookOpen, Send, ChevronDown, ChevronUp, Eye
} from 'lucide-react';
import MathRenderer from './MathRenderer';

export default function QuestionCard({
  question,
  questionNumber,
  subjectQuestionIndex,
  totalInSubject,
  userAnswer,
  isFlagged,
  isStarred = false,
  onSelectOption,
  onClearAnswer,
  onToggleFlag,
  onToggleStar,
  onNext,
  onPrevious,
  hasPrevious,
  hasNext,
  onSubmitExam,
  fontSize = 'base'
}) {
  const [isMobilePassageOpen, setIsMobilePassageOpen] = useState(false);

  if (!question) return null;

  const options = [
    { key: 'a', label: 'A', text: question.option_a },
    { key: 'b', label: 'B', text: question.option_b },
    { key: 'c', label: 'C', text: question.option_c },
    { key: 'd', label: 'D', text: question.option_d },
  ];

  const fontClasses = {
    sm: 'text-xs sm:text-sm leading-relaxed',
    base: 'text-sm sm:text-base leading-relaxed',
    lg: 'text-base sm:text-lg leading-loose'
  };

  const currentFontClass = fontClasses[fontSize] || fontClasses.base;

  return (
    <div className="flex flex-col lg:flex-row gap-3 lg:gap-6 items-start pb-20 sm:pb-0">
      {/* --- DESKTOP PASSAGE PANEL (lg: and above) --- */}
      {question.passage && (
        <div className="hidden lg:flex w-full lg:w-1/2 bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden flex-col h-[560px]">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-800 font-semibold text-sm">
              <BookOpen size={18} className="text-emerald-600" />
              <span>{question.passage.title || 'Reading Passage'}</span>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full">
              {question.passage.type}
            </span>
          </div>
          <div className="p-6 overflow-y-auto flex-1 font-serif text-slate-800 text-base leading-relaxed whitespace-pre-line select-text">
            {question.passage.text}
          </div>
        </div>
      )}

      {/* --- MOBILE PASSAGE BAR & COLLAPSIBLE DRAWER (< lg) --- */}
      {question.passage && (
        <div className="w-full lg:hidden bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden mb-1">
          <button
            onClick={() => setIsMobilePassageOpen(!isMobilePassageOpen)}
            className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between transition text-left"
          >
            <div className="flex items-center space-x-2 text-slate-800 font-semibold text-xs">
              <BookOpen size={15} className="text-emerald-600" />
              <span className="truncate max-w-[200px]">{question.passage.title || 'Passage'}</span>
              <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                {question.passage.type}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-emerald-700 font-bold">
              <span>{isMobilePassageOpen ? 'Hide' : 'Read'}</span>
              {isMobilePassageOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </div>
          </button>

          {isMobilePassageOpen && (
            <div className="p-3.5 bg-slate-50/70 border-t border-slate-200 max-h-64 overflow-y-auto font-serif text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line select-text">
              {question.passage.text}
            </div>
          )}
        </div>
      )}

      {/* --- QUESTION & OPTIONS AREA --- */}
      <div className={`w-full ${question.passage ? 'lg:w-1/2' : 'max-w-4xl mx-auto'} bg-white rounded-2xl shadow-xs border border-slate-200 p-3.5 sm:p-6 flex flex-col justify-between min-h-[380px] sm:min-h-[480px]`}>
        <div>
          {/* Top Meta Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-lg bg-slate-900 text-white">
                Q {subjectQuestionIndex} / {totalInSubject}
              </span>
              {question.year && (
                <span className="text-[10px] sm:text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {question.year}
                </span>
              )}
              {question.topic && (
                <span className="hidden sm:inline-block text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[180px]">
                  {question.topic}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2">
              {userAnswer && (
                <button
                  onClick={onClearAnswer}
                  className="text-[11px] text-slate-500 hover:text-rose-600 px-2 py-0.5 rounded-md hover:bg-rose-50 transition"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => onToggleStar && onToggleStar(question)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition active:scale-95 cursor-pointer ${
                  isStarred
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
                }`}
                title={isStarred ? "Remove from Starred Library" : "Star / Bookmark tricky question"}
              >
                <Star size={13} className={isStarred ? 'fill-amber-500 text-amber-500' : 'text-slate-400'} />
                <span>{isStarred ? 'Starred' : 'Star'}</span>
              </button>
              <button
                onClick={onToggleFlag}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  isFlagged
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
                }`}
              >
                <Bookmark size={13} className={isFlagged ? 'fill-amber-600 text-amber-600' : ''} />
                <span>{isFlagged ? 'Flagged' : 'Flag'}</span>
              </button>
            </div>
          </div>

          {/* Question Text */}
          <div className={`font-medium text-slate-900 mb-4 sm:mb-6 ${currentFontClass}`}>
            <MathRenderer text={question.question} />
          </div>

          {/* Options List */}
          <div className="space-y-2 sm:space-y-2.5">
            {options.map((opt) => {
              if (!opt.text) return null;
              const isSelected = userAnswer === opt.key;

              return (
                <button
                  key={opt.key}
                  onClick={() => onSelectOption(opt.key)}
                  className={`w-full p-3 sm:p-3.5 rounded-xl border text-left flex items-start space-x-3 transition active:scale-[0.99] cursor-pointer select-none ${
                    isSelected
                      ? 'bg-emerald-50/90 border-emerald-500 text-emerald-950 shadow-xs ring-1 ring-emerald-500/30'
                      : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-800'
                  }`}
                >
                  <span
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0 transition ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {opt.label}
                  </span>

                  <div className={`flex-1 text-xs sm:text-sm pt-0.5 sm:pt-1 leading-snug ${isSelected ? 'font-semibold text-emerald-950' : 'text-slate-800'}`}>
                    <MathRenderer text={opt.text} />
                  </div>

                  {isSelected && (
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop Bottom Action Controls (hidden on mobile, handled by sticky bottom bar) */}
        <div className="hidden sm:flex border-t border-slate-100 pt-4 mt-6 items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={onPrevious}
              disabled={!hasPrevious}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition border ${
                hasPrevious
                  ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 shadow-xs active:scale-95'
                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
              }`}
            >
              <ChevronLeft size={16} />
              <span>Previous <kbd className="font-mono text-[10px] bg-slate-100 px-1 py-0.5 rounded border ml-1">P</kbd></span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {hasNext && (
              <button
                onClick={onNext}
                className="flex items-center space-x-1.5 px-5 py-2 rounded-xl font-semibold text-xs sm:text-sm bg-slate-900 text-white hover:bg-slate-800 shadow-xs transition active:scale-95 border border-slate-800"
              >
                <span>Next</span>
                <kbd className="font-mono text-[10px] bg-slate-800 text-slate-300 px-1 py-0.5 rounded border border-slate-700 ml-1">N</kbd>
                <ChevronRight size={16} />
              </button>
            )}

            <button
              onClick={onSubmitExam}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-700/20 transition active:scale-95 border border-emerald-600"
            >
              <Send size={14} />
              <span>Submit</span>
              <kbd className="font-mono text-[10px] bg-emerald-700 text-emerald-100 px-1 py-0.5 rounded border border-emerald-500 ml-1">S</kbd>
            </button>
          </div>
        </div>
      </div>

      {/* --- STICKY MOBILE BOTTOM NAVIGATION BAR (< sm screens) --- */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-between shadow-lg">
        {/* Left: Previous */}
        <button
          onClick={onPrevious}
          disabled={!hasPrevious}
          className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center space-x-1 transition ${
            hasPrevious
              ? 'bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-95'
              : 'text-slate-300 cursor-not-allowed'
          }`}
        >
          <ChevronLeft size={16} />
          <span>Prev</span>
        </button>

        {/* Middle: Star, Flag & Submit */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => onToggleStar && onToggleStar(question)}
            className={`p-2 rounded-xl text-xs transition border active:scale-95 cursor-pointer ${
              isStarred 
                ? 'bg-amber-100 text-amber-900 border-amber-300' 
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
            title={isStarred ? "Remove Star" : "Star tricky question"}
          >
            <Star size={16} className={isStarred ? 'fill-amber-500 text-amber-500' : 'text-slate-400'} />
          </button>

          <button
            onClick={onToggleFlag}
            className={`p-2 rounded-xl text-xs transition border ${
              isFlagged 
                ? 'bg-amber-100 text-amber-900 border-amber-300' 
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
            title="Flag question for review"
          >
            <Bookmark size={16} className={isFlagged ? 'fill-amber-600 text-amber-600' : ''} />
          </button>

          <button
            onClick={onSubmitExam}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition active:scale-95 flex items-center space-x-1"
          >
            <Send size={12} />
            <span>Submit</span>
          </button>
        </div>

        {/* Right: Next */}
        <button
          onClick={onNext}
          className="px-4 py-2 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 shadow-xs transition active:scale-95 flex items-center space-x-1"
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
