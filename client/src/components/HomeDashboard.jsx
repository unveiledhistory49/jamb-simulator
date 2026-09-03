import React, { useState, useEffect } from 'react';
import { 
  Play, BookOpen, Clock, Award, History, Sparkles, CheckCircle2, 
  HelpCircle, ChevronRight, Dna, Atom, FlaskConical, Target, Zap, ShieldCheck,
  SlidersHorizontal, BookMarked, FileText, User, LogIn, LogOut, BarChart3
} from 'lucide-react';

export default function HomeDashboard({
  currentUser,
  onStartFullMock,
  onStartSubjectDrill,
  onRequireAuth,
  onOpenLearning,
  onLogout
}) {
  const [drillSubject, setDrillSubject] = useState('english');
  const [drillCount, setDrillCount] = useState(40);
  const [drillYear, setDrillYear] = useState('');
  const [pastHistory, setPastHistory] = useState([]);
  const [statusData, setStatusData] = useState(null);

  // English customization options (passages and novel optional)
  const [includePassages, setIncludePassages] = useState(true);
  const [includeNovel, setIncludeNovel] = useState(true);

  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => setStatusData(data))
      .catch(() => {});

    fetch('/api/exam/history')
      .then(res => res.json())
      .then(data => setPastHistory(data))
      .catch(() => {});
  }, []);

  const subjects = [
    { id: 'english', name: 'Use of English', icon: <BookOpen size={18} />, qCount: 60, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { id: 'biology', name: 'Biology', icon: <Dna size={18} />, qCount: 40, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { id: 'physics', name: 'Physics', icon: <Atom size={18} />, qCount: 40, color: 'text-sky-600 bg-sky-50 border-sky-200' },
    { id: 'chemistry', name: 'Chemistry', icon: <FlaskConical size={18} />, qCount: 40, color: 'text-amber-600 bg-amber-50 border-amber-200' },
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
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-8">
      {/* Top Public Navigation & Auth State Bar */}
      <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="font-extrabold text-slate-900 tracking-tight text-sm sm:text-base">
            JAMB CBT SIMULATOR
          </span>
          <span className="hidden sm:inline text-[11px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded-full border border-slate-200">
            2025/2026 Engine
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {currentUser ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={onOpenLearning}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 transition text-xs font-bold"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                  {currentUser.username.charAt(0).toUpperCase()}
                </div>
                <span className="capitalize">{currentUser.username}</span>
                <span className="hidden md:inline text-[10px] text-emerald-700 font-normal">• Learning Page</span>
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
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition active:scale-95"
            >
              <LogIn size={14} />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-2xl space-y-3 sm:space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <ShieldCheck size={14} />
            <span>AUTHENTIC JAMB CBT ENGINE • 2025/2026 FORMAT</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Master the UTME. <br /><span className="text-emerald-400">100% Free & Open-Source.</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Practice with over <strong>5,800 authentic questions</strong> across <strong>English, Biology, Physics, and Chemistry</strong>. Continuous 120-minute countdown, 8-key keyboard navigation, on-screen calculator, and scaled scoring out of 400.
          </p>

          <div className="pt-2 sm:pt-4 flex flex-wrap gap-4 items-center">
            <button
              onClick={handleFullMockClick}
              className="flex items-center space-x-2 px-6 py-3.5 rounded-2xl font-bold text-sm sm:text-base bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition active:scale-95"
            >
              <Play size={18} fill="currentColor" />
              <span>Launch Full 4-Subject Mock</span>
            </button>

            <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
              <Clock size={14} />
              <span>180 Qs • 120 Mins • 400 Marks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Structure & Format Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Compulsory</div>
          <div className="text-base sm:text-lg font-extrabold text-slate-900">Use of English</div>
          <p className="text-xs text-slate-600 hidden sm:block">60 Qs • Lexis, Structure, Oral & Optional Passages</p>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Core Science 1</div>
          <div className="text-base sm:text-lg font-extrabold text-slate-900">Biology</div>
          <p className="text-xs text-slate-600 hidden sm:block">40 Qs • Genetics, Cell Biology, Ecology, Physiology</p>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Core Science 2</div>
          <div className="text-base sm:text-lg font-extrabold text-slate-900">Physics</div>
          <p className="text-xs text-slate-600 hidden sm:block">40 Qs • Mechanics, Heat, Waves, Electricity, Modern</p>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Core Science 3</div>
          <div className="text-base sm:text-lg font-extrabold text-slate-900">Chemistry</div>
          <p className="text-xs text-slate-600 hidden sm:block">40 Qs • Organic, Inorganic, Stoichiometry, Redox</p>
        </div>
      </div>

      {/* Main Modes: Full Mock vs Subject Drill */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Card 1: Full Simulated Examination */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Target size={22} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Full UTME Mock Exam</h2>
                <p className="text-xs text-slate-500">Exact replica of live JAMB CBT examination (180 Qs)</p>
              </div>
            </div>

            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center space-x-2">
                <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
                <span><strong>Single continuous 120-minute countdown</strong> for all 180 questions</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
                <span>60 English + 40 Biology + 40 Physics + 40 Chemistry</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
                <span>Official scaling out of 400 (100 marks per subject)</span>
              </li>
            </ul>

            {/* English Preferences Toggle Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <SlidersHorizontal size={13} className="text-emerald-600" />
                  <span>Use of English Options</span>
                </span>
                <span className="text-[10px] text-slate-500">Configure Sections</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className={`flex items-start space-x-2 p-2.5 rounded-xl border cursor-pointer transition select-none ${includePassages ? 'bg-white border-emerald-300 ring-1 ring-emerald-300/40' : 'bg-slate-100/70 border-slate-200 opacity-80'}`}>
                  <input
                    type="checkbox"
                    checked={includePassages}
                    onChange={(e) => setIncludePassages(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                  />
                  <div>
                    <div className="font-semibold text-xs text-slate-800">Reading Passages</div>
                    <div className="text-[10px] text-slate-500">Comprehension & Cloze</div>
                  </div>
                </label>

                <label className={`flex items-start space-x-2 p-2.5 rounded-xl border cursor-pointer transition select-none ${includeNovel ? 'bg-white border-emerald-300 ring-1 ring-emerald-300/40' : 'bg-slate-100/70 border-slate-200 opacity-80'}`}>
                  <input
                    type="checkbox"
                    checked={includeNovel}
                    onChange={(e) => setIncludeNovel(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                  />
                  <div>
                    <div className="font-semibold text-xs text-slate-800">Prescribed Novel</div>
                    <div className="text-[10px] text-slate-500">The Life Changer book</div>
                  </div>
                </label>
              </div>

              {(!includePassages || !includeNovel) && (
                <p className="text-[11px] text-emerald-700 font-medium">
                  ✓ Remaining questions will be filled with Lexis, Structure & Oral English. Total stays 60 Qs.
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleFullMockClick}
            className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-2xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white shadow-md transition active:scale-95"
          >
            <span>Start Full 180-Question Mock</span>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Card 2: Focused Subject Drill */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Zap size={22} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Custom Subject Drill</h2>
                <p className="text-xs text-slate-500">Practice single subjects or specific past papers</p>
              </div>
            </div>

            {/* Subject Selector */}
            <div className="grid grid-cols-2 gap-2">
              {subjects.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    setDrillSubject(s.id);
                    setDrillCount(s.id === 'english' ? 60 : 40);
                  }}
                  className={`p-2.5 sm:p-3 rounded-xl border text-left flex items-center space-x-2 transition ${
                    drillSubject === s.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
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
            <div className="flex items-center space-x-2.5">
              <span className="text-xs text-slate-500 font-medium">Count:</span>
              {[10, 20, 40, 60].map(cnt => (
                <button
                  key={cnt}
                  onClick={() => setDrillCount(cnt)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition border ${
                    drillCount === cnt
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {cnt} Qs
                </button>
              ))}
            </div>

            {/* Optional English toggles when English is selected */}
            {drillSubject === 'english' && (
              <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-2xl p-3 space-y-2">
                <span className="text-xs font-bold text-indigo-950 block">English Drill Options:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="flex items-center space-x-2 text-xs text-indigo-900 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includePassages}
                      onChange={(e) => setIncludePassages(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>Include Passages</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs text-indigo-900 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeNovel}
                      onChange={(e) => setIncludeNovel(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>Include Novel Questions</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleDrillClick}
            className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-2xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition active:scale-95"
          >
            <span>Start {subjects.find(s => s.id === drillSubject)?.name} Drill</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Official 8-Key Keyboard Guide */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm sm:text-base">
          <HelpCircle size={18} className="text-emerald-600" />
          <span>Official JAMB 8-Key CBT Navigation System</span>
        </div>
        <p className="text-xs text-slate-600">
          JAMB centers utilize a standardized 8-key keyboard system for mouse-free navigation:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 font-mono text-xs">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-2">
            <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded shadow-xs font-bold text-slate-900">A B C D</kbd>
            <span className="text-slate-600 text-[11px]">Options</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-2">
            <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded shadow-xs font-bold text-slate-900">N</kbd>
            <span className="text-slate-600 text-[11px]">Next</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-2">
            <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded shadow-xs font-bold text-slate-900">P</kbd>
            <span className="text-slate-600 text-[11px]">Previous</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-2">
            <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded shadow-xs font-bold text-slate-900">R</kbd>
            <span className="text-slate-600 text-[11px]">Flag Review</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-2">
            <kbd className="px-2 py-0.5 bg-emerald-50 border border-emerald-300 rounded shadow-xs font-bold text-emerald-800">S</kbd>
            <span className="text-slate-600 text-[11px]">Submit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
