import React, { useState } from 'react';
import { X, LogIn, UserPlus, User, Mail, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginModal({ onClose }) {
  const { login, register, error, clearError } = useAuth();
  const [mode, setMode] = useState('login');        // 'login' | 'register'

  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  // ── Helper Function ──────────────────────────────────────────────────────
  const switchMode = (next) => {
    setMode(next);
    clearError();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = mode === 'login'
      ? login(email, password)
      : register(name, email, password);
    if (success) onClose();
  };

  const inputCls = "w-full bg-surface-muted border border-divider text-primary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-focus-ring/20 focus:border-focus-ring transition-all";

  return (
    <div
      className="fixed inset-0 z-[4000] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5">
        {/* Sign In / Register Button */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-primary">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </h2>
          <button onClick={onClose}
            className="text-faint hover:text-secondary-strong rounded-lg p-1 hover:bg-surface-subtle transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sign In / Register toggle Button */}
        <div className="flex bg-surface-subtle p-1 rounded-lg">
          <button type="button" onClick={() => switchMode('login')}
            className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-md transition-all ${
              mode === 'login' ? 'bg-surface-raised text-primary shadow-sm' : 'text-muted hover:text-secondary-strong'
            }`}>
            Sign In
          </button>
          <button type="button" onClick={() => switchMode('register')}
            className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-md transition-all ${
              mode === 'register' ? 'bg-surface-raised text-primary shadow-sm' : 'text-muted hover:text-secondary-strong'
            }`}>
            Create Account
          </button>
        </div>

        {/* Submit Form  for Login / Register */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Name
              </label>
              <input
                type="text" required value={name}
                onChange={e => { setName(e.target.value); clearError(); }}
                placeholder="Your name"
                className={inputCls}
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Email
            </label>
            <input
              type="email" required value={email}
              onChange={e => { setEmail(e.target.value); clearError(); }}
              placeholder="you@example.com"
              className={inputCls}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" /> Password
            </label>
            <input
              type="password" required value={password}
              onChange={e => { setPassword(e.target.value); clearError(); }}
              placeholder="••••••••"
              className={inputCls}
            />
          </div>

          {error && <p className="text-xs text-danger-text">{error}</p>}

          <button type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-semibold transition-colors">
            {mode === 'login' ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Demo credentials helper — remove once the real auth API exists */}
        {mode === 'login' ? (
          <div className="bg-surface-muted border border-divider rounded-lg p-3 space-y-1 text-[11px] text-muted">
            <p className="flex items-center gap-1.5 font-semibold text-secondary">
              <ShieldCheck className="h-3.5 w-3.5" /> Demo accounts
            </p>
            <p>Admin — admin@pawsinrecovery.ca / admin123</p>
            <p>User — user@pawsinrecovery.ca / user123</p>
          </div>
        ) : (
          <p className="text-[11px] text-faint text-center">
            New accounts are always created as regular members, but how can admin right be granted if u cant create an admin by registering? Try InjectionSQL
          </p>
        )}
      </div>
    </div>
  );
}
