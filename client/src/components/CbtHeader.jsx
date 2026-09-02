import React, { useState } from 'react';
import { 
  Clock, Calculator, User, Maximize2, ZoomIn, ZoomOut, 
  Bookmark, MoreVertical, X, CheckCircle2, ShieldCheck 
} from 'lucide-react';

export default function CbtHeader({
  candidateName = "Engr. Candidate (Science UTME)",
  regNumber = "2026/UTME/948201",
  timeRemaining = 7200,
  onToggleCalculator,
  isCalculatorOpen,
  fontSize,
  onFontSizeChange,
  examMode = "full_mock",
  totalAnswered = 0,
  totalQuestions = 180,
  flaggedCount = 0,
  activeSubjectName = "Use of English",
  subjectQuestionIndex = 1,
  totalInSubject = 60
}) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isUrgent = timeRemaining <= 300;
  const isWarning = timeRemaining <= 900 && !isUrgent;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <>
      <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md sticky top-0 z-40">
        {/* Desktop-Only Top National Bar */}
        <div className="hidden md:flex bg-emerald-900/90 text-emerald-100 text-xs px-4 py-1.5 justify-between items-center border-b border-emerald-800/60 font-medium">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="tracking-wide uppercase font-semibold">JOINT ADMISSIONS AND MATRICULATION BOARD (JAMB) • CBT SIMULATION</span>
          </div>
          <div className="flex items-center space-x-4 text-emerald-200/90 text-[11px]">
            <span>CENTER: CBT NATIONAL DIGITAL COMPLEX (LAB 02)</span>
            <span>COMBINATION: ENG | BIO | PHY | CHM</span>
          </div>
        </div>

        {/* --- MOBILE VIEW: Ultra-Slim Single Line Bar (Height: ~48px) --- */}
        <div className="flex md:hidden items-center justify-between px-3 py-2">
          {/* Live Timer Pill */}
          <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl font-mono font-bold text-sm border shadow-sm ${
            isUrgent
              ? 'bg-rose-950/90 border-rose-500 text-rose-300 animate-pulse'
              : isWarning
              ? 'bg-amber-950/90 border-amber-500 text-amber-300'
              : 'bg-slate-800 border-slate-700 text-emerald-400'
          }`}>
            <Clock size={14} className={isUrgent ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'} />
            <span>{formatTime(timeRemaining)}</span>
          </div>

          {/* Progress / Subject indicator */}
          <div className="text-xs text-slate-300 flex items-center space-x-1.5 font-medium">
            <span className="text-slate-400 font-mono">Q{subjectQuestionIndex}/{totalInSubject}</span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-mono font-bold">{totalAnswered}/{totalQuestions} ans</span>
            {flaggedCount > 0 && (
              <span className="text-amber-400 flex items-center text-[11px]">
                <Bookmark size={11} fill="currentColor" className="mr-0.5" />
                {flaggedCount}
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-1">
            <button
              onClick={onToggleCalculator}
              className={`p-1.5 rounded-lg border transition ${
                isCalculatorOpen 
                  ? 'bg-emerald-600 text-white border-emerald-500' 
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
              title="Calculator"
            >
              <Calculator size={16} />
            </button>

            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:text-white"
              title="Candidate Profile & Settings"
            >
              <MoreVertical size={16} />
            </button>
          </div>
        </div>

        {/* --- DESKTOP VIEW: Full Spacious Layout --- */}
        <div className="hidden md:flex px-4 py-2.5 max-w-7xl mx-auto items-center justify-between gap-4">
          {/* Candidate Profile Box */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center text-slate-300 shadow-inner">
              <User size={22} className="text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-100 text-sm">{candidateName}</span>
                <span className="text-[9px] uppercase font-bold tracking-widest bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">Verified</span>
              </div>
              <div className="text-xs text-slate-400 font-mono flex items-center space-x-3 mt-0.5">
                <span>REG: <strong className="text-slate-200">{regNumber}</strong></span>
                <span>• SEAT: <strong>B-42</strong></span>
              </div>
            </div>
          </div>

          {/* Live Continuous Timer */}
          <div className="flex items-center space-x-4">
            <div className={`px-4 py-1.5 rounded-xl flex items-center space-x-3 border shadow-lg transition-all duration-300 ${
              isUrgent
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse ring-2 ring-rose-500/40'
                : isWarning
                ? 'bg-amber-950/80 border-amber-500 text-amber-300 ring-2 ring-amber-500/30'
                : 'bg-slate-800/90 border-slate-700 text-emerald-400'
            }`}>
              <Clock size={20} className={isUrgent ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'} />
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-0.5">
                  Time Remaining
                </div>
                <div className="text-2xl font-mono font-extrabold tracking-wider leading-none">
                  {formatTime(timeRemaining)}
                </div>
              </div>
            </div>
          </div>

          {/* Controls: Calculator, Font Size, Fullscreen */}
          <div className="flex items-center space-x-2.5">
            <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs">
              <span className="text-slate-400">Answered: </span>
              <strong className="text-emerald-400 font-mono">{totalAnswered}/{totalQuestions}</strong>
              {flaggedCount > 0 && (
                <div className="flex items-center text-amber-400 space-x-1 pl-2 border-l border-slate-700">
                  <Bookmark size={12} fill="currentColor" />
                  <strong className="font-mono">{flaggedCount}</strong>
                </div>
              )}
            </div>

            <button
              onClick={onToggleCalculator}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                isCalculatorOpen
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
              title="Open On-Screen Calculator"
            >
              <Calculator size={15} />
              <span>Calculator</span>
            </button>

            {/* Font Resizer */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-0.5">
              <button
                onClick={() => onFontSizeChange('sm')}
                className={`px-2 py-1 text-xs rounded-lg transition ${fontSize === 'sm' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                title="Small Text"
              >
                A-
              </button>
              <button
                onClick={() => onFontSizeChange('base')}
                className={`px-2 py-1 text-xs rounded-lg transition ${fontSize === 'base' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                title="Normal Text"
              >
                A
              </button>
              <button
                onClick={() => onFontSizeChange('lg')}
                className={`px-2 py-1 text-xs rounded-lg transition ${fontSize === 'lg' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                title="Large Text"
              >
                A+
              </button>
            </div>

            <button
              onClick={toggleFullscreen}
              className="p-2 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl border border-slate-700 transition"
              title="Toggle Fullscreen"
            >
              <Maximize2 size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Candidate Profile & Settings Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 text-white rounded-2xl border border-slate-700 p-5 max-w-xs w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-sm font-bold flex items-center space-x-2 text-emerald-400">
                <ShieldCheck size={16} />
                <span>Candidate Verification</span>
              </span>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400">Name:</span>
                <p className="font-bold text-slate-100">{candidateName}</p>
              </div>
              <div>
                <span className="text-slate-400">Reg Number:</span>
                <p className="font-mono text-emerald-300 font-bold">{regNumber}</p>
              </div>
              <div>
                <span className="text-slate-400">Examination Center:</span>
                <p className="text-slate-300">CBT National Complex (Lab 02, Seat B-42)</p>
              </div>
              <div>
                <span className="text-slate-400">Subjects:</span>
                <p className="text-slate-300">ENG | BIO | PHY | CHM</p>
              </div>
            </div>

            {/* Font Size Adjuster for Mobile */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400 block mb-2">Question Text Size:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onFontSizeChange('sm')}
                  className={`py-1.5 text-xs rounded-xl border transition ${fontSize === 'sm' ? 'bg-emerald-600 border-emerald-500 font-bold text-white' : 'bg-slate-800 border-slate-700 text-slate-300'}`}
                >
                  Small (A-)
                </button>
                <button
                  onClick={() => onFontSizeChange('base')}
                  className={`py-1.5 text-xs rounded-xl border transition ${fontSize === 'base' ? 'bg-emerald-600 border-emerald-500 font-bold text-white' : 'bg-slate-800 border-slate-700 text-slate-300'}`}
                >
                  Medium (A)
                </button>
                <button
                  onClick={() => onFontSizeChange('lg')}
                  className={`py-1.5 text-xs rounded-xl border transition ${fontSize === 'lg' ? 'bg-emerald-600 border-emerald-500 font-bold text-white' : 'bg-slate-800 border-slate-700 text-slate-300'}`}
                >
                  Large (A+)
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-200 border border-slate-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
