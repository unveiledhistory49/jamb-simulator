import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, Target, Award, Calendar, 
  ChevronRight, CheckCircle2, Sparkles, Filter, Info, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

const TARGET_PRESETS = [
  { label: 'Medicine & Surgery', score: 280, color: '#10b981' },
  { label: 'Engineering & Tech', score: 250, color: '#0ea5e9' },
  { label: 'Pharmacy & Nursing', score: 240, color: '#6366f1' },
  { label: 'Core Sciences', score: 200, color: '#f59e0b' }
];

const SUBJECT_COLORS = {
  total: { line: '#0f172a', bg: 'rgba(15, 23, 42, 0.08)', name: 'Total Scaled (/400)' },
  english: { line: '#6366f1', name: 'English (/100)' },
  biology: { line: '#10b981', name: 'Biology (/100)' },
  physics: { line: '#0ea5e9', name: 'Physics (/100)' },
  chemistry: { line: '#f59e0b', name: 'Chemistry (/100)' }
};

export default function CumulativeTrendChart({ exams = [] }) {
  const [selectedMode, setSelectedMode] = useState('full_mock'); // 'full_mock' | 'all' | 'subject_drill'
  const [targetScore, setTargetScore] = useState(280);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [visibleLines, setVisibleLines] = useState({
    total: true,
    english: true,
    biology: true,
    physics: true,
    chemistry: true
  });

  // Filter and sort exams chronologically (oldest to newest)
  const filteredExams = useMemo(() => {
    return exams
      .filter(e => {
        if (selectedMode === 'all') return true;
        return e.mode === selectedMode;
      })
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [exams, selectedMode]);

  // Transform exams into data points
  const dataPoints = useMemo(() => {
    return filteredExams.map((e, index) => {
      const isFull = e.mode === 'full_mock';
      const maxScore = e.max_score || 400;
      const totalScore = Math.round(e.total_score || 0);

      // Extract subject scaled scores
      const subjectScores = e.subject_scores || e.summary?.subject_scores || {};
      const english = Math.round(subjectScores.english?.scaled_score || 0);
      const biology = Math.round(subjectScores.biology?.scaled_score || 0);
      const physics = Math.round(subjectScores.physics?.scaled_score || 0);
      const chemistry = Math.round(subjectScores.chemistry?.scaled_score || 0);

      const prev = index > 0 ? filteredExams[index - 1] : null;
      const prevTotal = prev ? Math.round(prev.total_score || 0) : null;
      const delta = prevTotal !== null ? totalScore - prevTotal : null;

      return {
        index,
        sessionNum: index + 1,
        id: e.id,
        date: new Date(e.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        fullDate: new Date(e.timestamp).toLocaleDateString(undefined, { dateStyle: 'medium', timeStyle: 'short' }),
        mode: e.mode,
        totalScore,
        maxScore,
        delta,
        english,
        biology,
        physics,
        chemistry
      };
    });
  }, [filteredExams]);

  // Overall trajectory metrics
  const firstScore = dataPoints.length > 0 ? dataPoints[0].totalScore : 0;
  const latestScore = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].totalScore : 0;
  const netGain = dataPoints.length > 1 ? latestScore - firstScore : 0;
  const avgGrowthPerMock = dataPoints.length > 1 ? Math.round(netGain / (dataPoints.length - 1)) : 0;
  const gapToTarget = targetScore - latestScore;

  // Chart dimensions & scaling
  const width = 800;
  const height = 340;
  const padding = { top: 30, right: 30, bottom: 40, left: 50 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const yMax = selectedMode === 'full_mock' ? 400 : 100;
  const yMin = 0;

  const getX = (index) => {
    if (dataPoints.length <= 1) return padding.left + graphWidth / 2;
    return padding.left + (index / (dataPoints.length - 1)) * graphWidth;
  };

  const getY = (val) => {
    const clamped = Math.max(yMin, Math.min(yMax, val));
    return padding.top + graphHeight - ((clamped - yMin) / (yMax - yMin)) * graphHeight;
  };

  // Generate SVG path for a metric
  const createPath = (key) => {
    if (dataPoints.length === 0) return '';
    return dataPoints.reduce((acc, pt, i) => {
      const x = getX(i);
      const y = getY(pt[key]);
      return i === 0 ? `M ${x},${y}` : `${acc} L ${x},${y}`;
    }, '');
  };

  // Area path for total score
  const createAreaPath = () => {
    if (dataPoints.length === 0) return '';
    const linePath = createPath('totalScore');
    const firstX = getX(0);
    const lastX = getX(dataPoints.length - 1);
    const bottomY = getY(0);
    return `${linePath} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
  };

  const toggleLine = (key) => {
    setVisibleLines(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & KPI Ribbon */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <TrendingUp size={20} />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  Cumulative Improvement Trajectory
                </h2>
                <p className="text-xs text-slate-500">
                  Track your scaled score progression, subject growth, and target readiness across sessions
                </p>
              </div>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setSelectedMode('full_mock')}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                selectedMode === 'full_mock'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Full Mocks (/400)
            </button>
            <button
              onClick={() => setSelectedMode('subject_drill')}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                selectedMode === 'subject_drill'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Subject Drills
            </button>
            <button
              onClick={() => setSelectedMode('all')}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                selectedMode === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All Practice
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Mini-Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Latest Mock Score</div>
            <div className="text-2xl font-black text-slate-900 font-mono mt-1">
              {latestScore} <span className="text-xs font-normal text-slate-400">/ {yMax}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {dataPoints.length > 0 ? `Session #${dataPoints.length}` : 'No sessions'}
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Cumulative Net Gain</div>
            <div className={`text-2xl font-black font-mono mt-1 flex items-center space-x-1 ${
              netGain > 0 ? 'text-emerald-600' : netGain < 0 ? 'text-rose-600' : 'text-slate-600'
            }`}>
              {netGain > 0 ? <ArrowUpRight size={22} /> : netGain < 0 ? <ArrowDownRight size={22} /> : null}
              <span>{netGain > 0 ? `+${netGain}` : netGain} pts</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {dataPoints.length > 1 ? `Across ${dataPoints.length} mocks` : 'Baseline established'}
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Average Pace per Mock</div>
            <div className="text-2xl font-black text-indigo-600 font-mono mt-1">
              {avgGrowthPerMock >= 0 ? `+${avgGrowthPerMock}` : avgGrowthPerMock} <span className="text-xs text-slate-400 font-normal">pts / mock</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Continuous velocity</div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Target Readiness Gap</div>
            <div className={`text-2xl font-black font-mono mt-1 ${
              gapToTarget <= 0 ? 'text-emerald-600' : 'text-amber-600'
            }`}>
              {gapToTarget <= 0 ? 'Target Met! 🎉' : `-${gapToTarget} pts`}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Goal: {targetScore} marks
            </div>
          </div>
        </div>

        {/* Target Benchmark Selector Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
            <Target size={15} className="text-emerald-600" />
            <span>Target Admission Benchmark:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {TARGET_PRESETS.map(preset => (
              <button
                key={preset.score}
                onClick={() => setTargetScore(preset.score)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition border ${
                  targetScore === preset.score
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {preset.label} ({preset.score})
              </button>
            ))}

            <div className="flex items-center space-x-1 pl-2 border-l border-slate-300">
              <span className="text-[11px] text-slate-500">Custom:</span>
              <input
                type="number"
                min="100"
                max="400"
                step="5"
                value={targetScore}
                onChange={(e) => setTargetScore(Number(e.target.value) || 280)}
                className="w-16 px-2 py-0.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg text-slate-800 text-center"
              />
            </div>
          </div>
        </div>

        {/* Interactive SVG Chart Container */}
        {dataPoints.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Award size={36} className="text-slate-400 mx-auto" />
            <div className="text-sm font-bold text-slate-700">No examination data available for this filter</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Complete your first mock examination to start charting your cumulative improvement timeline.
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Legend & Line Visibility Toggles */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs mb-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Total */}
                <button
                  onClick={() => toggleLine('total')}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold transition ${
                    visibleLines.total ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900 ring-2 ring-white"></span>
                  <span>Grand Total</span>
                </button>

                {/* English */}
                <button
                  onClick={() => toggleLine('english')}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition ${
                    visibleLines.english ? 'bg-indigo-50 text-indigo-900 border-indigo-300' : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                  <span>English</span>
                </button>

                {/* Biology */}
                <button
                  onClick={() => toggleLine('biology')}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition ${
                    visibleLines.biology ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>Biology</span>
                </button>

                {/* Physics */}
                <button
                  onClick={() => toggleLine('physics')}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition ${
                    visibleLines.physics ? 'bg-sky-50 text-sky-900 border-sky-300' : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                  <span>Physics</span>
                </button>

                {/* Chemistry */}
                <button
                  onClick={() => toggleLine('chemistry')}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition ${
                    visibleLines.chemistry ? 'bg-amber-50 text-amber-900 border-amber-300' : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>Chemistry</span>
                </button>
              </div>

              <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
                <span className="w-4 h-0.5 border-t-2 border-dashed border-rose-500 inline-block"></span>
                <span>Target: {targetScore}</span>
              </div>
            </div>

            {/* Native Responsive SVG */}
            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-auto min-w-[580px] select-none"
              >
                <defs>
                  {/* Total score gradient */}
                  <linearGradient id="totalAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0f172a" stopOpacity="0.16" />
                    <stop offset="100%" stopColor="#0f172a" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Gridlines & Y-Axis Labels */}
                {[0, 100, 200, 300, 400].filter(val => val <= yMax).map(val => {
                  const y = getY(val);
                  return (
                    <g key={val}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={width - padding.right}
                        y2={y}
                        stroke="#e2e8f0"
                        strokeWidth="1"
                        strokeDasharray={val === 0 ? "" : "4 4"}
                      />
                      <text
                        x={padding.left - 10}
                        y={y + 4}
                        textAnchor="end"
                        className="text-[11px] fill-slate-400 font-mono font-bold"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Target Admission Benchmark Dashed Line */}
                {targetScore <= yMax && (
                  <g>
                    <line
                      x1={padding.left}
                      y1={getY(targetScore)}
                      x2={width - padding.right}
                      y2={getY(targetScore)}
                      stroke="#f43f5e"
                      strokeWidth="1.5"
                      strokeDasharray="6 4"
                    />
                    <text
                      x={width - padding.right - 8}
                      y={getY(targetScore) - 6}
                      textAnchor="end"
                      className="text-[10px] fill-rose-600 font-bold font-mono"
                    >
                      Target Benchmark ({targetScore})
                    </text>
                  </g>
                )}

                {/* Total Score Gradient Area */}
                {visibleLines.total && (
                  <path
                    d={createAreaPath()}
                    fill="url(#totalAreaGrad)"
                  />
                )}

                {/* Subject Lines */}
                {visibleLines.english && (
                  <path
                    d={createPath('english')}
                    fill="none"
                    stroke={SUBJECT_COLORS.english.line}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.85"
                  />
                )}
                {visibleLines.biology && (
                  <path
                    d={createPath('biology')}
                    fill="none"
                    stroke={SUBJECT_COLORS.biology.line}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.85"
                  />
                )}
                {visibleLines.physics && (
                  <path
                    d={createPath('physics')}
                    fill="none"
                    stroke={SUBJECT_COLORS.physics.line}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.85"
                  />
                )}
                {visibleLines.chemistry && (
                  <path
                    d={createPath('chemistry')}
                    fill="none"
                    stroke={SUBJECT_COLORS.chemistry.line}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.85"
                  />
                )}

                {/* Main Total Score Line */}
                {visibleLines.total && (
                  <path
                    d={createPath('totalScore')}
                    fill="none"
                    stroke={SUBJECT_COLORS.total.line}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Interactive Data Points & Hover Targets */}
                {dataPoints.map((pt, i) => {
                  const x = getX(i);
                  const y = getY(pt.totalScore);
                  const isHovered = hoveredPoint?.index === i;

                  return (
                    <g key={pt.id}>
                      {/* Vertical guideline on hover */}
                      {isHovered && (
                        <line
                          x1={x}
                          y1={padding.top}
                          x2={x}
                          y2={height - padding.bottom}
                          stroke="#94a3b8"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                        />
                      )}

                      {/* X-Axis Session Label */}
                      <text
                        x={x}
                        y={height - padding.bottom + 20}
                        textAnchor="middle"
                        className={`text-[11px] font-mono ${isHovered ? 'fill-slate-900 font-bold' : 'fill-slate-500'}`}
                      >
                        #{pt.sessionNum}
                      </text>
                      <text
                        x={x}
                        y={height - padding.bottom + 32}
                        textAnchor="middle"
                        className="text-[9px] font-mono fill-slate-400"
                      >
                        {pt.date}
                      </text>

                      {/* Point Circle */}
                      {visibleLines.total && (
                        <circle
                          cx={x}
                          cy={y}
                          r={isHovered ? 6.5 : 4.5}
                          fill="#ffffff"
                          stroke="#0f172a"
                          strokeWidth="3"
                          className="transition-all cursor-pointer"
                        />
                      )}

                      {/* Transparent Hover Hitbox */}
                      <rect
                        x={x - (graphWidth / Math.max(1, dataPoints.length)) / 2}
                        y={padding.top}
                        width={graphWidth / Math.max(1, dataPoints.length)}
                        height={graphHeight}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredPoint(pt)}
                        onClick={() => setHoveredPoint(pt)}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Hover Tooltip Card */}
            {hoveredPoint && (
              <div 
                className="mt-4 p-4 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-700/80 animate-in fade-in duration-100 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Mock #{hoveredPoint.sessionNum}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {hoveredPoint.fullDate}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 font-mono">
                    <span className="text-sm font-extrabold text-emerald-400">
                      Score: {hoveredPoint.totalScore} / {hoveredPoint.maxScore}
                    </span>
                    {hoveredPoint.delta !== null && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        hoveredPoint.delta > 0 
                          ? 'bg-emerald-500/20 text-emerald-300' 
                          : hoveredPoint.delta < 0 
                            ? 'bg-rose-500/20 text-rose-300' 
                            : 'bg-slate-800 text-slate-300'
                      }`}>
                        {hoveredPoint.delta > 0 ? `+${hoveredPoint.delta}` : hoveredPoint.delta} pts
                      </span>
                    )}
                  </div>
                </div>

                {/* 4-Subject Breakdown in Tooltip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/50">
                    <div className="text-slate-400 text-[10px]">English</div>
                    <div className="text-sm font-bold text-indigo-300 mt-0.5">{hoveredPoint.english} / 100</div>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/50">
                    <div className="text-slate-400 text-[10px]">Biology</div>
                    <div className="text-sm font-bold text-emerald-300 mt-0.5">{hoveredPoint.biology} / 100</div>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/50">
                    <div className="text-slate-400 text-[10px]">Physics</div>
                    <div className="text-sm font-bold text-sky-300 mt-0.5">{hoveredPoint.physics} / 100</div>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/50">
                    <div className="text-slate-400 text-[10px]">Chemistry</div>
                    <div className="text-sm font-bold text-amber-300 mt-0.5">{hoveredPoint.chemistry} / 100</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
