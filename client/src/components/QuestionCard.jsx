import React from 'react';
import { Bookmark, ChevronLeft, ChevronRight, CheckCircle2, RotateCcw, AlertTriangle, BookOpen, Send } from 'lucide-react';
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
  if (!question) return null;

  const options = [
    { key: 'a', label: 'A', text: question.option_a },
    { key: 'b', label: 'B', text: question.option_b },
    { key: 'c', label: 'C', text: question.option_c },
    { key: 'd', label: 'D', text: question.option_d },
  ];

  // Font size classes
  const fontClasses = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-relaxed',
    lg: 'text-lg leading-loose'
  };

  const currentFontClass = fontClasses[fontSize] || fontClasses.base;

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Passage Panel (if question has an attached reading comprehension or cloze passage) */}
      {question.passage && (
        <div className="w-full lg:w-1/2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[520px]">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-800 font-semibold text-sm">
              <BookOpen size={18} className="text-emerald-600" />
              <span>{question.passage.title || 'Reading Passage'}</span>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
              {question.passage.type}
            </span>
          </div>
          <div className="p-5 overflow-y-auto flex-1 font-serif text-slate-800 text-base leading-relaxed whitespace-pre-line select-text">
            {question.passage.text}
          </div>
        </div>
      )}

      {/* Question & Options Area */}
      <div className={`w-full ${question.passage ? 'lg:w-1/2' : 'max-w-4xl mx-auto'} bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between min-h-[520px]`}>
        <div>
          {/* Top Meta Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-slate-900 text-white">
                Q {subjectQuestionIndex} of {totalInSubject}
              </span>
              {question.topic && (
                <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60 hidden sm:inline-block">
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
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                isFlagged
                  ? 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-300/40'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
              }`}
              title="Bookmark question for review later (Press R)"
            >
              <Bookmark size={15} fill={isFlagged ? "currentColor" : "none"} className={isFlagged ? "text-amber-600" : "text-slate-400"} />
              <span>{isFlagged ? 'Flagged for Review' : 'Flag (R)'}</span>
            </button>
          </div>

          {/* Question Stem */}
          <div className={`text-slate-900 font-medium mb-6 ${currentFontClass}`}>
            <MathRenderer text={question.question} />
          </div>

          {/* Optional Diagram if available */}
          {Boolean(question.has_image && question.image_url) && (
            <div className="mb-6 p-2 bg-slate-50 border border-slate-200 rounded-xl flex justify-center">
              <img
                src={question.image_url}
                alt="Question Diagram"
                className="max-h-60 object-contain rounded-lg"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          {/* Options Grid (A, B, C, D) */}
          <div className="space-y-3">
            {options.map((opt) => {
              const isSelected = userAnswer === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => onSelectOption(opt.key)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start space-x-3.5 group relative ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/80 hover:border-slate-300 text-slate-800'
                  }`}
                >
                  {/* Keyboard Badge / Radio */}
                  <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-sm transition font-mono ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-300 group-hover:border-slate-400'
                  }`}>
                    {opt.label}
                  </div>

                  {/* Option Content with LaTeX math rendering */}
                  <div className={`flex-1 pt-1 ${isSelected ? 'font-semibold text-emerald-950' : 'text-slate-700'} ${currentFontClass}`}>
                    <MathRenderer text={opt.text} />
                  </div>

                  {isSelected && (
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Action Controls: Prev, Clear, Next, Submit */}
        <div className="border-t border-slate-100 pt-4 mt-6 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Previous Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onPrevious}
              disabled={!hasPrevious}
              className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm transition border ${
                hasPrevious
                  ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-sm active:scale-95'
                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
              }`}
            >
              <ChevronLeft size={18} />
              <span>Previous <kbd className="hidden sm:inline font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border ml-1">P</kbd></span>
            </button>

            {userAnswer && (
              <button
                onClick={onClearAnswer}
                className="text-xs text-slate-500 hover:text-rose-600 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition font-medium"
                title="Clear selected option"
              >
                Clear Choice
              </button>
            )}
          </div>

          {/* Right: Next & Submit */}
          <div className="flex items-center space-x-2.5">
            {hasNext ? (
              <button
                onClick={onNext}
                className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl font-semibold text-sm bg-slate-900 text-white hover:bg-slate-800 shadow-md transition active:scale-95 border border-slate-800"
              >
                <span>Next</span>
                <kbd className="hidden sm:inline font-mono text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700 ml-1">N</kbd>
                <ChevronRight size={18} />
              </button>
            ) : null}

            <button
              onClick={onSubmitExam}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-700/20 transition active:scale-95 border border-emerald-600"
            >
              <Send size={15} />
              <span>Submit Exam</span>
              <kbd className="hidden sm:inline font-mono text-[10px] bg-emerald-700 text-emerald-100 px-1.5 py-0.5 rounded border border-emerald-500 ml-1">S</kbd>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
