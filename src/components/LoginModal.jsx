import React, { useState } from 'react';
import { X, LogIn, Mail, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginModal({ onClose }) {
  const { login, error, clearError } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(email, password)) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[4000] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5">

        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Sign In</h2>
          <button onClick={onClose}
            className="text-slate-400 hover:text-slate-700 rounded-lg p-1 hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Email
            </label>
            <input
              type="email" required value={email}
              onChange={e => { setEmail(e.target.value); clearError(); }}
              placeholder="you@example.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" /> Password
            </label>
            <input
              type="password" required value={password}
              onChange={e => { setPassword(e.target.value); clearError(); }}
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
            <LogIn className="h-4 w-4" /> Sign In
          </button>
        </form>

        {/* Demo credentials helper — remove once the real auth API exists */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1 text-[11px] text-slate-500">
          <p className="flex items-center gap-1.5 font-semibold text-slate-600">
            <ShieldCheck className="h-3.5 w-3.5" /> Demo accounts
          </p>
          <p>Admin — admin@pawsinrecovery.ca / admin123</p>
          <p>User — user@pawsinrecovery.ca / user123</p>
        </div>
      </div>
    </div>
  );
}
