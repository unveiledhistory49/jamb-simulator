import React, { useState } from 'react';
import { 
  X, Lock, User, UserPlus, LogIn, AlertCircle, 
  Sparkles, ShieldCheck, CheckCircle2, KeyRound 
} from 'lucide-react';
import { signIn, signUp } from '../utils/supabaseClient';

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  actionTitle = "Launch Examination"
}) {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleFillDemo = () => {
    setUsername('charles');
    setPassword('123');
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    if (tab === 'register') {
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
      if (password.length < 3) {
        setErrorMsg('Password must be at least 3 characters.');
        return;
      }
    }

    setIsLoading(true);
    try {
      let user;
      if (tab === 'login') {
        user = await signIn(username, password);
      } else {
        user = await signUp(username, password);
      }
      setIsLoading(false);
      onSuccess(user);
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Authentication failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>

          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
            <ShieldCheck size={13} />
            <span>CANDIDATE PROFILE</span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white">
            {tab === 'login' ? 'Sign In to Proceed' : 'Create Candidate Account'}
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {tab === 'login' 
              ? `Sign in to track your scores, save your mistake bank, and view your personalized learning page.`
              : 'Simple registration. No email verification or OAuth needed.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => { setTab('login'); setErrorMsg(''); }}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 border-b-2 transition ${
              tab === 'login'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn size={16} />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setErrorMsg(''); }}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 border-b-2 transition ${
              tab === 'register'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus size={16} />
            <span>Create Account</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start space-x-2">
              <AlertCircle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Demo Fill Button */}
          {tab === 'login' && (
            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-emerald-950 flex items-center space-x-1">
                  <Sparkles size={13} className="text-emerald-600" />
                  <span>Configured User</span>
                </div>
                <div className="text-[11px] text-emerald-800 font-mono">
                  charles / 123
                </div>
              </div>
              <button
                type="button"
                onClick={handleFillDemo}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95"
              >
                Auto Fill
              </button>
            </div>
          )}

          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
              <User size={14} className="text-slate-400" />
              <span>Username</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. charles"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-sm transition outline-hidden text-slate-900"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
              <Lock size={14} className="text-slate-400" />
              <span>Password</span>
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-sm transition outline-hidden text-slate-900"
            />
          </div>

          {/* Confirm Password (Register tab only) */}
          {tab === 'register' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
                <KeyRound size={14} className="text-slate-400" />
                <span>Confirm Password</span>
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-sm transition outline-hidden text-slate-900"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-md transition active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <span className="animate-pulse">Authenticating...</span>
            ) : (
              <>
                <span>{tab === 'login' ? 'Sign In & Start Exam' : 'Create Account & Start Exam'}</span>
                <CheckCircle2 size={16} />
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-slate-500 pt-1">
            {tab === 'login' ? (
              <>Don't have an account? <button type="button" onClick={() => { setTab('register'); setErrorMsg(''); }} className="text-emerald-700 font-bold hover:underline">Create one in seconds</button></>
            ) : (
              <>Already have an account? <button type="button" onClick={() => { setTab('login'); setErrorMsg(''); }} className="text-emerald-700 font-bold hover:underline">Sign in here</button></>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
