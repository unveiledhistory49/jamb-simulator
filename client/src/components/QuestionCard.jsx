import React, { useState } from 'react';
import { 
  Bookmark, ChevronLeft, ChevronRight, CheckCircle2, 
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
  onSelectOption,
  onClearAnswer,
  onToggleFlag,
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
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-relaxed',
    lg: 'text-lg leading-loose'
  };

  const currentFontClass = fontClasses[fontSize] || fontClasses.base;

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">
      {/* --- DESKTOP PASSAGE PANEL (lg: and above) --- */}
      {question.passage && (
        <div className="hidden lg:flex w-full lg:w-1/2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-col h-[560px]">
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
        <div className="w-full lg:hidden bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-1">
          <button
            onClick={() => setIsMobilePassageOpen(!isMobilePassageOpen)}
            className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between transition text-left"
          >
            <div className="flex items-center space-x-2 text-slate-800 font-semibold text-xs sm:text-sm">
              <BookOpen size={16} className="text-emerald-600" />
              <span className="truncate max-w-[220px] sm:max-w-md">{question.passage.title || 'Reference Passage'}</span>
              <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                {question.passage.type}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-emerald-700 font-bold">
              <span>{isMobilePassageOpen ? 'Hide Passage' : 'View Passage'}</span>
              {isMobilePassageOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </button>

          {isMobilePassageOpen && (
            <div className="p-4 bg-slate-50/50 border-t border-slate-200 max-h-72 overflow-y-auto font-serif text-slate-800 text-sm leading-relaxed whitespace-pre-line select-text">
              {question.passage.text}
            </div>
          )}
        </div>
      )}

      {/* --- QUESTION & OPTIONS AREA --- */}
      <div className={`w-full ${question.passage ? 'lg:w-1/2' : 'max-w-4xl mx-auto'} bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 flex flex-col justify-between min-h-[460px] sm:min-h-[520px]`}>
        <div>
          {/* Top Meta Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3 sm:mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-slate-900 text-white">
                Q {subjectQuestionIndex} of {totalInSubject}
              </span>
              {question.topic && (
                <span className="text-[11px] sm:text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-slate-200/60 truncate max-w-[140px] sm:max-w-xs">
                  {question.topic}
                </span>
              )}
              {question.year && (
                <span className="text-xs text-slate-400 font-mono hidden md:inline-block">
                  (JAMB {question.year})
                </span>
              )}
            </div>

            {/* Flag for Review Button */}
            <button
              onClick={onToggleFlag}
              className={`flex items-center space-x-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold border transition ${
                isFlagged
                  ? 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-300/40'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
              }`}
              title="Flag question for review later (Press R)"
            >
              <Bookmark size={14} fill={isFlagged ? "currentColor" : "none"} className={isFlagged ? "text-amber-600" : "text-slate-400"} />
              <span>{isFlagged ? 'Flagged' : 'Flag (R)'}</span>
            </button>
          </div>

          {/* Question Stem */}
          <div className={`text-slate-900 font-medium mb-4 sm:mb-6 ${currentFontClass}`}>
            <MathRenderer text={question.question} />
          </div>

          {/* Optional Diagram if available */}
          {Boolean(question.has_image && question.image_url) && (
            <div className="mb-4 sm:mb-6 p-2 bg-slate-50 border border-slate-200 rounded-xl flex justify-center">
              <img
                src={question.image_url}
                alt="Question Diagram"
                className="max-h-52 object-contain rounded-lg"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          {/* Options Grid (A, B, C, D) */}
          <div className="space-y-2.5 sm:space-y-3">
            {options.map((opt) => {
              const isSelected = userAnswer === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => onSelectOption(opt.key)}
                  className={`w-full text-left p-3 sm:p-4 rounded-xl border transition-all flex items-start space-x-3 sm:space-x-3.5 group relative ${
                    isSelected
                      ? 'bg-emerald-50/90 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/80 hover:border-slate-300 text-slate-800'
                  }`}
                >
                  {/* Option Badge A/B/C/D */}
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-xs sm:text-sm transition font-mono ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-300 group-hover:border-slate-400'
                  }`}>
                    {opt.label}
                  </div>

                  {/* Option Content */}
                  <div className={`flex-1 pt-0.5 sm:pt-1 text-sm sm:text-base ${isSelected ? 'font-semibold text-emerald-950' : 'text-slate-700'} ${currentFontClass}`}>
                    <MathRenderer text={opt.text} />
                  </div>

                  {isSelected && (
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Action Controls */}
        <div className="border-t border-slate-100 pt-3 sm:pt-4 mt-4 sm:mt-6 flex flex-wrap items-center justify-between gap-2.5">
          {/* Left: Previous Button & Clear Choice */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onPrevious}
              disabled={!hasPrevious}
              className={`flex items-center space-x-1 sm:space-x-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition border ${
                hasPrevious
                  ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 shadow-sm active:scale-95'
                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
              }`}
            >
              <ChevronLeft size={16} />
              <span>Previous <kbd className="hidden sm:inline font-mono text-[10px] bg-slate-100 px-1 py-0.5 rounded border ml-1">P</kbd></span>
            </button>

            {userAnswer && (
              <button
                onClick={onClearAnswer}
                className="text-xs text-slate-500 hover:text-rose-600 px-2 py-1.5 rounded-lg hover:bg-rose-50 transition font-medium"
                title="Clear selected option"
              >
                Clear
              </button>
            )}
          </div>

          {/* Right: Next & Submit */}
          <div className="flex items-center space-x-2">
            {hasNext && (
              <button
                onClick={onNext}
                className="flex items-center space-x-1 sm:space-x-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition active:scale-95 border border-slate-800"
              >
                <span>Next</span>
                <kbd className="hidden sm:inline font-mono text-[10px] bg-slate-800 text-slate-300 px-1 py-0.5 rounded border border-slate-700 ml-1">N</kbd>
                <ChevronRight size={16} />
              </button>
            )}

            <button
              onClick={onSubmitExam}
              className="flex items-center space-x-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-700/20 transition active:scale-95 border border-emerald-600"
            >
              <Send size={14} />
              <span>Submit</span>
              <kbd className="hidden sm:inline font-mono text-[10px] bg-emerald-700 text-emerald-100 px-1 py-0.5 rounded border border-emerald-500 ml-1">S</kbd>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
