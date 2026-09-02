import React, { useState, useEffect } from 'react';
import { 
  Play, BookOpen, Clock, Award, History, Sparkles, CheckCircle2, 
  HelpCircle, ChevronRight, Dna, Atom, FlaskConical, Target, Zap, ShieldCheck
} from 'lucide-react';

export default function HomeDashboard({
  onStartFullMock,
  onStartSubjectDrill,
  onViewHistory
}) {
  const [drillSubject, setDrillSubject] = useState('english');
  const [drillCount, setDrillCount] = useState(40);
  const [drillYear, setDrillYear] = useState('');
  const [pastHistory, setPastHistory] = useState([]);
  const [statusData, setStatusData] = useState(null);

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
    { id: 'english', name: 'Use of English', icon: <BookOpen size={20} />, qCount: 60, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { id: 'biology', name: 'Biology', icon: <Dna size={20} />, qCount: 40, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { id: 'physics', name: 'Physics', icon: <Atom size={20} />, qCount: 40, color: 'text-sky-600 bg-sky-50 border-sky-200' },
    { id: 'chemistry', name: 'Chemistry', icon: <FlaskConical size={20} />, qCount: 40, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-8 md:p-10 shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <ShieldCheck size={14} />
            <span>AUTHENTIC JAMB CBT ENGINE • 2025/2026 FORMAT</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Master the UTME. <br /><span className="text-emerald-400">100% Free & Open-Source.</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Practice with over <strong>5,800 authentic questions</strong> across <strong>English, Biology, Physics, and Chemistry</strong>. Standard continuous 120-minute timer, 8-key keyboard navigation, on-screen calculator, and scaled scoring out of 400.
          </p>

          <div className="pt-4 flex flex-wrap gap-4 items-center">
            <button
              onClick={onStartFullMock}
              className="flex items-center space-x-2.5 px-7 py-3.5 rounded-2xl font-bold text-base bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition active:scale-95"
            >
              <Play size={20} fill="currentColor" />
              <span>Launch Full 4-Subject Mock</span>
            </button>

            <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
              <Clock size={15} />
              <span>180 Qs • 120 Mins • 400 Marks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Structure & Format Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Compulsory Subject</div>
          <div className="text-xl font-extrabold text-slate-900">Use of English</div>
          <p className="text-xs text-slate-600">60 Questions • Comprehension, Cloze, Prescribed Text, Lexis & Oral</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Core Science 1</div>
          <div className="text-xl font-extrabold text-slate-900">Biology</div>
          <p className="text-xs text-slate-600">40 Questions • Genetics, Cell Biology, Ecology, Physiology</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Core Science 2</div>
          <div className="text-xl font-extrabold text-slate-900">Physics</div>
          <p className="text-xs text-slate-600">40 Questions • Mechanics, Thermal, Optics, Electricity, Modern</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Core Science 3</div>
          <div className="text-xl font-extrabold text-slate-900">Chemistry</div>
          <p className="text-xs text-slate-600">40 Questions • Organic, Inorganic, Physical & Stoichiometry</p>
        </div>
      </div>

      {/* Main Modes: Full Mock vs Subject Drill */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card 1: Full Simulated Examination */}
        <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Target size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Full UTME Mock Exam</h2>
                <p className="text-xs text-slate-500">Exact replica of live JAMB CBT examination</p>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-600 pt-2">
              <li className="flex items-center space-x-2">
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                <span><strong>Single continuous 120-minute countdown</strong> for all 180 questions</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                <span>60 English + 40 Biology + 40 Physics + 40 Chemistry</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                <span>Official scaling out of 400 (100 marks per subject)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                <span>Full question palette with review flagging & on-screen calculator</span>
              </li>
            </ul>
          </div>

          <button
            onClick={onStartFullMock}
            className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-2xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white shadow-md transition active:scale-95"
          >
            <span>Start Full 180-Question Mock</span>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Card 2: Focused Subject Drill */}
        <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Zap size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Custom Subject Drill</h2>
                <p className="text-xs text-slate-500">Practice one subject or specific past examination years</p>
              </div>
            </div>

            {/* Subject Selector */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {subjects.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    setDrillSubject(s.id);
                    setDrillCount(s.id === 'english' ? 60 : 40);
                  }}
                  className={`p-3 rounded-xl border text-left flex items-center space-x-2.5 transition ${
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
            <div className="flex items-center space-x-3 pt-2">
              <span className="text-xs text-slate-500 font-medium">Questions:</span>
              {[10, 20, 40, 60].map(cnt => (
                <button
                  key={cnt}
                  onClick={() => setDrillCount(cnt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition border ${
                    drillCount === cnt
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {cnt} Qs
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => onStartSubjectDrill(drillSubject, drillCount, drillYear)}
            className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-2xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition active:scale-95"
          >
            <span>Start {subjects.find(s => s.id === drillSubject)?.name} Drill</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Official 8-Key Keyboard Shortcut Guide */}
      <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-base">
          <HelpCircle size={18} className="text-emerald-600" />
          <span>Official JAMB 8-Key CBT Navigation System</span>
        </div>
        <p className="text-xs text-slate-600">
          JAMB centers utilize a standardized keyboard navigation system so candidates don't rely on the mouse. Our simulator fully supports these keys:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1 font-mono text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-2.5">
            <kbd className="px-2 py-1 bg-white border border-slate-300 rounded shadow-sm font-bold text-slate-900">A B C D</kbd>
            <span className="text-slate-600">Select Option</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-2.5">
            <kbd className="px-2.5 py-1 bg-white border border-slate-300 rounded shadow-sm font-bold text-slate-900">N</kbd>
            <span className="text-slate-600">Next Question</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-2.5">
            <kbd className="px-2.5 py-1 bg-white border border-slate-300 rounded shadow-sm font-bold text-slate-900">P</kbd>
            <span className="text-slate-600">Previous Question</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-2.5">
            <kbd className="px-2.5 py-1 bg-white border border-slate-300 rounded shadow-sm font-bold text-slate-900">R</kbd>
            <span className="text-slate-600">Flag for Review</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-2.5">
            <kbd className="px-2.5 py-1 bg-emerald-50 border border-emerald-300 rounded shadow-sm font-bold text-emerald-800">S</kbd>
            <span className="text-slate-600">Submit Exam</span>
          </div>
        </div>
      </div>

      {/* Past Mock Attempts (if any) */}
      {pastHistory.length > 0 && (
        <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 font-bold text-slate-900 text-base">
              <History size={18} className="text-emerald-600" />
              <span>Recent Mock Attempts & Score Progression</span>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {pastHistory.slice(0, 5).map(hist => (
              <div key={hist.id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <div className="font-semibold text-slate-800 uppercase tracking-wide text-xs">
                    {hist.mode === 'full_mock' ? 'Full 4-Subject Mock' : 'Subject Drill'}
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    {new Date(hist.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-lg font-bold text-emerald-600">
                    {hist.total_score} <span className="text-xs text-slate-400">/ {hist.max_score}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
