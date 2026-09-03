import React, { useState, useEffect } from 'react';
import { 
  Play, BookOpen, Clock, Award, History, Sparkles, CheckCircle2, 
  HelpCircle, ChevronRight, Dna, Atom, FlaskConical, Target, Zap, ShieldCheck,
  SlidersHorizontal, BookMarked, FileText, User, LogIn, LogOut, BarChart3, Layers
} from 'lucide-react';

export default function HomeDashboard({
  currentUser,
  onStartFullMock,
  onStartSubjectDrill,
  onRequireAuth,
  onOpenLearning,
  onLogout
}) {
  // Mode toggle: 'mock' (180 Qs) or 'drill' (single subject)
  const [activeMode, setActiveMode] = useState('mock');
  const [drillSubject, setDrillSubject] = useState('english');
  const [drillCount, setDrillCount] = useState(40);
  const [drillYear, setDrillYear] = useState('');

  // English customization options (passages and novel optional)
  const [includePassages, setIncludePassages] = useState(true);
  const [includeNovel, setIncludeNovel] = useState(true);

  const subjects = [
    { id: 'english', name: 'Use of English', icon: <BookOpen size={16} />, qCount: 60, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { id: 'biology', name: 'Biology', icon: <Dna size={16} />, qCount: 40, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { id: 'physics', name: 'Physics', icon: <Atom size={16} />, qCount: 40, color: 'text-sky-600 bg-sky-50 border-sky-200' },
    { id: 'chemistry', name: 'Chemistry', icon: <FlaskConical size={16} />, qCount: 40, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  ];

  const handleFullMockClick = () => {
    if (!currentUser) {
      onRequireAuth(() => onStartFullMock({ includePassages, includeNovel }));
    } else {
      onStartFullMock({ includePassages, includeNovel });
    }
  };

  const handleDrillClick = () => {
    if (!currentUser) {
      onRequireAuth(() => onStartSubjectDrill(drillSubject, drillCount, drillYear, { includePassages, includeNovel }));
    } else {
      onStartSubjectDrill(drillSubject, drillCount, drillYear, { includePassages, includeNovel });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* Top Navbar */}
      <div className="flex items-center justify-between bg-white px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="font-black text-slate-900 tracking-tight text-sm sm:text-base">
            JAMB CBT SIMULATOR
          </span>
          <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded-full border border-slate-200">
            5,800+ Qs
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {currentUser ? (
            <div className="flex items-center space-x-1.5">
              <button
                onClick={onOpenLearning}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 transition text-xs font-bold"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {currentUser.username.charAt(0).toUpperCase()}
                </div>
                <span className="capitalize">{currentUser.username}</span>
                <span className="hidden sm:inline text-[10px] text-emerald-700 font-normal">• Stats</span>
              </button>

              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                title="Log Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onRequireAuth(null)}
              className="flex items-center space-x-1 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition active:scale-95"
            >
              <LogIn size={13} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Headline (Compact, No Jargon) */}
      <div className="px-1 pt-1 sm:pt-2 space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          UTME Examination Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-snug">
          Timed simulation with instant scaled scoring, 4 core subjects, and personal weakness tracking.
        </p>
      </div>

      {/* Segmented Mode Switcher (Full Mock vs Subject Drill) */}
      <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center text-xs font-bold border border-slate-300/60">
        <button
          onClick={() => setActiveMode('mock')}
          className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center space-x-2 ${
            activeMode === 'mock'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Target size={15} className={activeMode === 'mock' ? 'text-emerald-600' : 'text-slate-400'} />
          <span>Full Mock (180 Qs)</span>
        </button>

        <button
          onClick={() => setActiveMode('drill')}
          className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center space-x-2 ${
            activeMode === 'drill'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Zap size={15} className={activeMode === 'drill' ? 'text-indigo-600' : 'text-slate-400'} />
          <span>Subject Drill</span>
        </button>
      </div>

      {/* MODE 1: FULL MOCK EXAM */}
      {activeMode === 'mock' && (
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <Target size={18} />
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">4-Subject Mock Exam</h2>
                <p className="text-xs text-slate-500">180 questions • 120-minute timer • 400 marks</p>
              </div>
            </div>
            <span className="hidden sm:inline text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
              Standard UTME
            </span>
          </div>

          {/* Compact Subject Quotas Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div className="text-[10px] text-slate-400 font-medium">English</div>
              <div className="font-bold text-slate-800 font-mono">60 Questions</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div className="text-[10px] text-slate-400 font-medium">Biology</div>
              <div className="font-bold text-slate-800 font-mono">40 Questions</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div className="text-[10px] text-slate-400 font-medium">Physics</div>
              <div className="font-bold text-slate-800 font-mono">40 Questions</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div className="text-[10px] text-slate-400 font-medium">Chemistry</div>
              <div className="font-bold text-slate-800 font-mono">40 Questions</div>
            </div>
          </div>

          {/* Compact English Options Accordion / Box */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center space-x-1.5">
                <SlidersHorizontal size={13} className="text-emerald-600" />
                <span>English Options</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Optional sections</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center space-x-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includePassages}
                  onChange={(e) => setIncludePassages(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                />
                <span className="text-xs text-slate-700">Passages</span>
              </label>

              <label className="flex items-center space-x-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeNovel}
                  onChange={(e) => setIncludeNovel(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                />
                <span className="text-xs text-slate-700">Novel Questions</span>
              </label>
            </div>
          </div>

          {/* Big Action Button */}
          <button
            onClick={handleFullMockClick}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-700/20 transition active:scale-95 flex items-center justify-center space-x-2"
          >
            <Play size={16} fill="currentColor" />
            <span>Launch Full 180-Question Mock</span>
          </button>
        </div>
      )}

      {/* MODE 2: CUSTOM SUBJECT DRILL */}
      {activeMode === 'drill' && (
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
              <Zap size={18} />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Custom Subject Drill</h2>
              <p className="text-xs text-slate-500">Practice single subjects or target problem areas</p>
            </div>
          </div>

          {/* Subject Selector (Compact 2x2 Grid) */}
          <div className="grid grid-cols-2 gap-2">
            {subjects.map(s => (
              <button
                key={s.id}
                onClick={() => {
                  setDrillSubject(s.id);
                  setDrillCount(s.id === 'english' ? 60 : 40);
                }}
                className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition ${
                  drillSubject === s.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                <span className={drillSubject === s.id ? 'text-emerald-400' : 'text-slate-500'}>
                  {s.icon}
                </span>
                <div className="font-semibold text-xs">{s.name}</div>
              </button>
            ))}
          </div>

          {/* Question Count Selector */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-600 block">Question Count:</span>
            <div className="grid grid-cols-4 gap-2">
              {[10, 20, 40, 60].map(cnt => (
                <button
                  key={cnt}
                  onClick={() => setDrillCount(cnt)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold transition border text-center ${
                    drillCount === cnt
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cnt} Qs
                </button>
              ))}
            </div>
          </div>

          {/* English Drills Customization */}
          {drillSubject === 'english' && (
            <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-xl p-3 space-y-2">
              <span className="text-xs font-bold text-indigo-950 block">English Drill Options:</span>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center space-x-2 text-xs text-indigo-900 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includePassages}
                    onChange={(e) => setIncludePassages(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                  />
                  <span>Passages</span>
                </label>
                <label className="flex items-center space-x-2 text-xs text-indigo-900 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeNovel}
                    onChange={(e) => setIncludeNovel(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                  />
                  <span>Novel Questions</span>
                </label>
              </div>
            </div>
          )}

          {/* Start Drill Button */}
          <button
            onClick={handleDrillClick}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/20 transition active:scale-95 flex items-center justify-center space-x-2"
          >
            <Play size={16} fill="currentColor" />
            <span>Start {subjects.find(s => s.id === drillSubject)?.name} Drill</span>
          </button>
        </div>
      )}

      {/* Desktop Only 8-Key Keyboard Guide (Hidden on mobile devices) */}
      <div className="hidden md:block bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs">
          <HelpCircle size={15} className="text-emerald-600" />
          <span>Desktop Keyboard Shortcuts</span>
        </div>
        <div className="grid grid-cols-5 gap-2 font-mono text-xs">
          <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <kbd className="font-bold text-slate-900">A B C D</kbd>
            <div className="text-[10px] text-slate-500 mt-0.5">Select Option</div>
          </div>
          <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <kbd className="font-bold text-slate-900">N</kbd>
            <div className="text-[10px] text-slate-500 mt-0.5">Next</div>
          </div>
          <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <kbd className="font-bold text-slate-900">P</kbd>
            <div className="text-[10px] text-slate-500 mt-0.5">Previous</div>
          </div>
          <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <kbd className="font-bold text-slate-900">R</kbd>
            <div className="text-[10px] text-slate-500 mt-0.5">Flag Review</div>
          </div>
          <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
            <kbd className="font-bold text-emerald-800">S</kbd>
            <div className="text-[10px] text-emerald-700 mt-0.5">Submit</div>
          </div>
        </div>
      </div>
    </div>
  );
}
