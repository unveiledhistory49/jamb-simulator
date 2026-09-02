import React from 'react';
import { BookOpen, Dna, Atom, FlaskConical, CheckCircle2 } from 'lucide-react';

export default function SubjectTabs({
  subjects = [],
  activeSubject,
  onSelectSubject,
  answers = {},
  allQuestions = []
}) {
  const getSubjectIcon = (id) => {
    switch (id) {
      case 'english': return <BookOpen size={14} className="sm:w-4 sm:h-4" />;
      case 'biology': return <Dna size={14} className="sm:w-4 sm:h-4" />;
      case 'physics': return <Atom size={14} className="sm:w-4 sm:h-4" />;
      case 'chemistry': return <FlaskConical size={14} className="sm:w-4 sm:h-4" />;
      default: return <BookOpen size={14} className="sm:w-4 sm:h-4" />;
    }
  };

  const getShortName = (id, name) => {
    switch (id) {
      case 'english': return 'English';
      case 'biology': return 'Biology';
      case 'physics': return 'Physics';
      case 'chemistry': return 'Chemistry';
      default: return name;
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 shadow-xs sticky top-[45px] md:top-[80px] z-30 px-3 md:px-4 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto scrollbar-none py-1.5 sm:py-2 gap-1.5 sm:gap-2">
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {subjects.map((subj) => {
            const isActive = activeSubject === subj.id;
            const subjQuestions = allQuestions.filter(q => q.subject_id === subj.id);
            const answeredCount = subjQuestions.filter(q => answers[q.id] !== undefined && answers[q.id] !== '').length;
            const isCompleted = answeredCount === subjQuestions.length && subjQuestions.length > 0;

            return (
              <button
                key={subj.id}
                onClick={() => onSelectSubject(subj.id)}
                className={`flex items-center space-x-1.5 sm:space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-medium text-xs sm:text-sm transition-all whitespace-nowrap border ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <span className={isActive ? 'text-emerald-400' : 'text-slate-500'}>
                  {getSubjectIcon(subj.id)}
                </span>
                <span className="font-semibold">
                  <span className="inline sm:hidden">{getShortName(subj.id, subj.name)}</span>
                  <span className="hidden sm:inline">{subj.name}</span>
                </span>
                <span
                  className={`text-[10px] sm:text-xs px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full font-mono font-bold transition ${
                    isActive
                      ? isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-200'
                      : isCompleted ? 'bg-emerald-100 text-emerald-700 font-bold' : 'bg-slate-200/80 text-slate-600'
                  }`}
                >
                  {answeredCount}/{subjQuestions.length || subj.count}
                </span>
                {isCompleted && (
                  <CheckCircle2 size={12} className={isActive ? "text-emerald-400" : "text-emerald-600"} />
                )}
              </button>
            );
          })}
        </div>

        {/* Advisory pacing label */}
        <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-500 font-medium pl-4 border-l border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          <span>English ~45m | Bio/Phy/Chem ~25m each</span>
        </div>
      </div>
    </div>
  );
}
