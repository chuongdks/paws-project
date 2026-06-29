import React from 'react';
import { LogIn, LogOut } from 'lucide-react';

const LOGO_URL = 'https://pawsinrecovery.ca/wp-content/uploads/2025/08/cropped-Logo-July-2025.jpg';

export default function Header({ resultCount, user, isAuthenticated, isAdmin, onSignIn, onLogout }) {
  return (
    /* ── Header ─────────────────────────────────────────────────────────── */
    <header className="bg-white border-b border-slate-200 px-4 sm:px-5 py-3 flex items-center justify-between gap-3 shrink-0 z-10">

      {/* Logo + description (Link to the PAWS site)*/}
      <a
        href="https://pawsinrecovery.ca/"
        target="_blank" rel="noopener noreferrer"
        className="flex flex-col min-w-0"
      >
        <img src={LOGO_URL} alt="Paws in Recovery" className="h-9 sm:h-11 w-auto object-contain" />
      </a>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* No of Services after filter */}
        <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 sm:px-3 py-1 rounded-full border border-blue-100 whitespace-nowrap">
          {resultCount} {resultCount === 1 ? 'result' : 'results'}
        </span>

        {/* Log In / Sign Out */}
        {isAuthenticated ? (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className={`text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-full border whitespace-nowrap ${
              isAdmin
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {isAdmin ? 'Admin' : 'Member'}
            </span>
            <span className="text-sm text-slate-600 hidden md:inline">{user.name}</span>
            <button onClick={onLogout} title="Log out"
              className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button onClick={onSignIn}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap">
            <LogIn className="h-3.5 w-3.5" /> Sign In
          </button>
        )}
      </div>

      {/* Always visible, even on mobile — doesn't disappear like the old subtitle did */}
      <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-snug">
        Windsor-Essex 2SLGBTQIA+ support programs
      </p>
    </header>
  );
}
