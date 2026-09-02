import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle, ArrowLeft, Send } from 'lucide-react';

export default function SubmitModal({
  isOpen,
  onClose,
  onConfirmSubmit,
  subjects = [],
  allQuestions = [],
  answers = {},
  isSubmitting = false
}) {
  if (!isOpen) return null;

  const totalQuestions = allQuestions.length;
  const totalAnswered = allQuestions.filter(q => answers[q.id] !== undefined && answers[q.id] !== '').length;
  const totalUnanswered = totalQuestions - totalAnswered;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <AlertTriangle size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Confirm Exam Submission</h2>
            <p className="text-xs text-slate-500">Please review your answer summary across all subjects</p>
          </div>
        </div>

        {/* Overall Status Banner */}
        <div className={`p-4 rounded-2xl border mb-5 flex items-center justify-between ${
          totalUnanswered === 0
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Progress</div>
            <div className="text-2xl font-bold font-mono mt-0.5">
              {totalAnswered} <span className="text-base font-normal text-slate-500">of {totalQuestions} answered</span>
            </div>
          </div>
          {totalUnanswered > 0 ? (
            <div className="text-right">
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-200 text-amber-900">
                <AlertTriangle size={12} />
                <span>{totalUnanswered} Unattempted</span>
              </span>
            </div>
          ) : (
            <div className="text-right">
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-200 text-emerald-900">
                <CheckCircle2 size={12} />
                <span>100% Completed</span>
              </span>
            </div>
          )}
        </div>

        {/* Subject-by-Subject Breakdown */}
        <div className="space-y-2.5 mb-6">
          {subjects.map((subj) => {
            const subjQs = allQuestions.filter(q => q.subject_id === subj.id);
            const subjAnswered = subjQs.filter(q => answers[q.id] !== undefined && answers[q.id] !== '').length;
            const subjUnanswered = subjQs.length - subjAnswered;
            const isFull = subjUnanswered === 0;

            return (
              <div key={subj.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-sm">
                <div className="font-semibold text-slate-800">{subj.name}</div>
                <div className="flex items-center space-x-3 font-mono text-xs">
                  <span className="text-emerald-700 font-bold">{subjAnswered} Answered</span>
                  <span className="text-slate-300">|</span>
                  <span className={subjUnanswered > 0 ? "text-amber-700 font-bold" : "text-slate-400"}>
                    {subjUnanswered} Unanswered
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {totalUnanswered > 0 && (
          <p className="text-xs text-amber-700 mb-6 bg-amber-50/60 p-3 rounded-xl border border-amber-200/60">
            <strong>Note:</strong> In UTME (JAMB), there is <em>no negative marking</em>. It is advantageous to guess or attempt all questions before submitting.
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 border-t border-slate-100 pt-4">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition border border-slate-200"
          >
            <ArrowLeft size={16} />
            <span>Return to Exam</span>
          </button>
          <button
            onClick={onConfirmSubmit}
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-700/20 transition active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Grading Exam...</span>
            ) : (
              <>
                <Send size={16} />
                <span>Submit Final Exam</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
