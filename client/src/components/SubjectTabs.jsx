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
      case 'english': return <BookOpen size={16} />;
      case 'biology': return <Dna size={16} />;
      case 'physics': return <Atom size={16} />;
      case 'chemistry': return <FlaskConical size={16} />;
      default: return <BookOpen size={16} />;
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm sticky top-[95px] z-30 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto scrollbar-none py-2 gap-2">
        <div className="flex items-center space-x-2">
          {subjects.map((subj) => {
            const isActive = activeSubject === subj.id;
            // Count answered questions for this subject
            const subjQuestions = allQuestions.filter(q => q.subject_id === subj.id);
            const answeredCount = subjQuestions.filter(q => answers[q.id] !== undefined && answers[q.id] !== '').length;
            const isCompleted = answeredCount === subjQuestions.length && subjQuestions.length > 0;

            return (
              <button
                key={subj.id}
                onClick={() => onSelectSubject(subj.id)}
                className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap border ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <span className={isActive ? 'text-emerald-400' : 'text-slate-500'}>
                  {getSubjectIcon(subj.id)}
                </span>
                <span className="font-semibold">{subj.name}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold transition ${
                    isActive
                      ? isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-200'
                      : isCompleted ? 'bg-emerald-100 text-emerald-700 font-bold' : 'bg-slate-200/80 text-slate-600'
                  }`}
                >
                  {answeredCount}/{subjQuestions.length || subj.count}
                </span>
                {isCompleted && (
                  <CheckCircle2 size={14} className={isActive ? "text-emerald-400" : "text-emerald-600"} />
                )}
              </button>
            );
          })}
        </div>

        {/* Advisory pacing label */}
        <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-500 font-medium pl-4 border-l border-slate-200">
          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
          <span>Advisory Split: English ~45m | Bio/Phy/Chem ~25m each</span>
        </div>
      </div>
    </div>
  );
}
