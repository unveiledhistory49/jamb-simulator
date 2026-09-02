import React, { useState } from 'react';
import { X, Delete, Minimize2 } from 'lucide-react';

export default function JambCalculator({ isOpen, onClose }) {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [clearOnNext, setClearOnNext] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (digit) => {
    if (display === '0' || clearOnNext) {
      setDisplay(digit);
      setClearOnNext(false);
    } else {
      if (display.length < 14) {
        setDisplay(display + digit);
      }
    }
  };

  const handleDecimal = () => {
    if (clearOnNext) {
      setDisplay('0.');
      setClearOnNext(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOp = (op) => {
    const current = parseFloat(display);
    if (prevValue === null) {
      setPrevValue(current);
    } else if (operator) {
      const result = calculate(prevValue, current, operator);
      setPrevValue(result);
      setDisplay(String(result).slice(0, 14));
    }
    setOperator(op);
    setClearOnNext(true);
  };

  const calculate = (a, b, op) => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b === 0 ? 'Error' : a / b;
      default: return b;
    }
  };

  const handleEquals = () => {
    if (operator === null || prevValue === null) return;
    const current = parseFloat(display);
    const result = calculate(prevValue, current, operator);
    setDisplay(String(result).slice(0, 14));
    setPrevValue(null);
    setOperator(null);
    setClearOnNext(true);
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperator(null);
    setClearOnNext(false);
  };

  const handleSqrt = () => {
    const val = parseFloat(display);
    if (val < 0) {
      setDisplay('Error');
    } else {
      setDisplay(String(Math.sqrt(val)).slice(0, 14));
    }
    setClearOnNext(true);
  };

  const handlePercent = () => {
    const val = parseFloat(display);
    setDisplay(String(val / 100).slice(0, 14));
    setClearOnNext(true);
  };

  const handleToggleSign = () => {
    const val = parseFloat(display);
    setDisplay(String(-val));
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-72 bg-slate-800 text-white rounded-2xl shadow-2xl border border-slate-700 overflow-hidden select-none animate-in fade-in zoom-in-95 duration-150">
      {/* Header */}
      <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between border-b border-slate-700 cursor-move">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-xs font-bold tracking-wider text-slate-300 uppercase">JAMB CBT Calculator</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
          title="Close Calculator"
        >
          <X size={16} />
        </button>
      </div>

      {/* Screen */}
      <div className="p-4 bg-slate-950 text-right">
        <div className="text-xs text-slate-400 h-4 font-mono">
          {prevValue !== null ? `${prevValue} ${operator || ''}` : ''}
        </div>
        <div className="text-3xl font-mono font-bold tracking-tight text-emerald-400 overflow-x-auto whitespace-nowrap scrollbar-none">
          {display}
        </div>
      </div>

      {/* Keypad */}
      <div className="p-3 grid grid-cols-4 gap-2 bg-slate-900 text-sm font-semibold">
        <button onClick={handleClear} className="p-2.5 bg-rose-900/40 text-rose-300 hover:bg-rose-800/60 rounded-xl transition">C</button>
        <button onClick={handleSqrt} className="p-2.5 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl transition">√</button>
        <button onClick={handlePercent} className="p-2.5 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl transition">%</button>
        <button onClick={() => handleOp('/')} className="p-2.5 bg-amber-600/30 text-amber-300 hover:bg-amber-600/50 rounded-xl transition">÷</button>

        <button onClick={() => handleDigit('7')} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl transition">7</button>
        <button onClick={() => handleDigit('8')} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl transition">8</button>
        <button onClick={() => handleDigit('9')} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl transition">9</button>
        <button onClick={() => handleOp('*')} className="p-2.5 bg-amber-600/30 text-amber-300 hover:bg-amber-600/50 rounded-xl transition">×</button>

        <button onClick={() => handleDigit('4')} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl transition">4</button>
        <button onClick={() => handleDigit('5')} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl transition">5</button>
        <button onClick={() => handleDigit('6')} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl transition">6</button>
        <button onClick={() => handleOp('-')} className="p-2.5 bg-amber-600/30 text-amber-300 hover:bg-amber-600/50 rounded-xl transition">−</button>

        <button onClick={() => handleDigit('1')} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl transition">1</button>
        <button onClick={() => handleDigit('2')} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl transition">2</button>
        <button onClick={() => handleDigit('3')} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl transition">3</button>
        <button onClick={() => handleOp('+')} className="p-2.5 bg-amber-600/30 text-amber-300 hover:bg-amber-600/50 rounded-xl transition">+</button>

        <button onClick={handleToggleSign} className="p-2.5 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl transition">±</button>
        <button onClick={() => handleDigit('0')} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl transition">0</button>
        <button onClick={handleDecimal} className="p-2.5 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl transition">.</button>
        <button onClick={handleEquals} className="p-2.5 bg-emerald-600 text-white hover:bg-emerald-500 rounded-xl transition font-bold">=</button>
      </div>
    </div>
  );
}
