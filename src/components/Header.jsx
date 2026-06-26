import React from 'react';
import { LogIn, LogOut } from 'lucide-react';

export default function Header({ resultCount, user, isAuthenticated, isAdmin, onSignIn, onLogout }) {
  return (
    /* ── Header ─────────────────────────────────────────────────────────── */
    <header className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between shrink-0 z-10">
      <div>
        <h1 className="text-lg font-bold text-slate-900 leading-tight tracking-tight">
          Community Services Directory
        </h1>
        <p className="text-xs text-slate-500">Windsor-Essex 2SLGBTQIA+ support programs</p>
      </div>

      <div className="flex items-center gap-3">
        {/* No of Services after filter */}
        <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
          {resultCount} {resultCount === 1 ? 'result' : 'results'}
        </span>

        {/* Log In / Sign Out */}
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
              isAdmin
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {isAdmin ? 'Admin' : 'Member'}
            </span>
            <span className="text-sm text-slate-600 hidden sm:inline">{user.name}</span>
            <button onClick={onLogout} title="Log out"
              className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button onClick={onSignIn}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            <LogIn className="h-3.5 w-3.5" /> Sign In
          </button>
        )}
      </div>
    </header>
  );
}
