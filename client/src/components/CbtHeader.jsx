import React from 'react';
import { Clock, Calculator, User, Maximize2, Minimize2, ZoomIn, ZoomOut, AlertCircle, Bookmark } from 'lucide-react';

export default function CbtHeader({
  candidateName = "Candidate Engineer / Scholar",
  regNumber = "2026/UTME/948201",
  timeRemaining = 7200, // in seconds
  onToggleCalculator,
  isCalculatorOpen,
  fontSize,
  onFontSizeChange,
  examMode = "full_mock",
  totalAnswered = 0,
  totalQuestions = 180,
  flaggedCount = 0
}) {
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Timer urgency states
  // > 15 mins: normal blue/dark
  // <= 15 mins (900s): amber warning
  // <= 5 mins (300s): red danger pulsing
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
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md sticky top-0 z-40">
      {/* Top National / JAMB Bar */}
      <div className="bg-emerald-900/90 text-emerald-100 text-xs px-4 py-1.5 flex justify-between items-center border-b border-emerald-800/60 font-medium">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="tracking-wide uppercase font-semibold">JOINT ADMISSIONS AND MATRICULATION BOARD (JAMB) • CBT SIMULATION</span>
        </div>
        <div className="hidden sm:flex items-center space-x-4 text-emerald-200/90">
          <span>CENTER: CBT NATIONAL DIGITAL COMPLEX (LAB 02)</span>
          <span>COMBINATION: ENG | BIO | PHY | CHM</span>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="px-4 py-3 max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Candidate Profile Box */}
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center text-slate-300 shadow-inner">
            <User size={26} className="text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-100 text-base">{candidateName}</span>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">Verified</span>
            </div>
            <div className="text-xs text-slate-400 font-mono flex items-center space-x-3 mt-0.5">
              <span>REG: <strong className="text-slate-200">{regNumber}</strong></span>
              <span className="hidden md:inline">• SEAT: <strong>B-42</strong></span>
            </div>
          </div>
        </div>

        {/* Live Continuous Timer */}
        <div className="flex items-center space-x-4">
          <div className={`px-4 py-2 rounded-2xl flex items-center space-x-3 border shadow-lg transition-all duration-300 ${
            isUrgent
              ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse ring-2 ring-rose-500/40'
              : isWarning
              ? 'bg-amber-950/80 border-amber-500 text-amber-300 ring-2 ring-amber-500/30'
              : 'bg-slate-800/90 border-slate-700 text-emerald-400'
          }`}>
            <Clock size={22} className={isUrgent ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'} />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1">
                Time Remaining
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-extrabold tracking-wider leading-none">
                {formatTime(timeRemaining)}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Utilities: Calculator, Text Size, Progress, Fullscreen */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Progress Mini Pill */}
          <div className="hidden lg:flex items-center space-x-3 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs">
            <div>
              <span className="text-slate-400">Answered: </span>
              <strong className="text-emerald-400 font-mono">{totalAnswered}/{totalQuestions}</strong>
            </div>
            {flaggedCount > 0 && (
              <div className="flex items-center text-amber-400 space-x-1 pl-2 border-l border-slate-700">
                <Bookmark size={13} fill="currentColor" />
                <strong className="font-mono">{flaggedCount}</strong>
              </div>
            )}
          </div>

          {/* Calculator Trigger */}
          <button
            onClick={onToggleCalculator}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              isCalculatorOpen
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
            title="Open On-Screen Calculator"
          >
            <Calculator size={16} />
            <span className="hidden sm:inline">Calculator</span>
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

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl border border-slate-700 transition"
            title="Toggle Fullscreen"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
