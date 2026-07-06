import React from 'react';
import { LogIn, LogOut, Sun, Moon } from 'lucide-react';
import myLogo from '../assets/paws.jpg'; 
import { useTheme } from '../context/ThemeContext.jsx';

const LOGO_URL = 'https://pawsinrecovery.ca/wp-content/uploads/2025/08/cropped-Logo-July-2025.jpg'; // URL from paws, online version

export default function Header({ resultCount, user, isAuthenticated, isAdmin, onSignIn, onLogout }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    /* ── Header ─────────────────────────────────────────────────────────── */
    <>
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-5 py-3 flex items-center justify-between gap-3 shrink-0 z-10">

        {/* Logo + description (Link to the PAWS site)*/}
        <a href="https://pawsinrecovery.ca/" target="_blank" rel="noopener noreferrer" className="flex flex-col min-w-0"
        >
          <img src={myLogo} alt="Paws in Recovery" className="h-14 sm:h-20 w-auto object-contain" />
        </a>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* No of Services after filter */}
          <span className="text-xs font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2.5 sm:px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900 whitespace-nowrap">
            {resultCount} {resultCount === 1 ? 'result' : 'results'}
          </span>

          {/* Dark mode toggle */}
          <button onClick={toggleTheme} title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-1.5 rounded-md text-slate-400 dark:text-slate-500 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Log In / Sign Out */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className={`text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-full border whitespace-nowrap ${
                isAdmin
                  ? 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}>
                {isAdmin ? 'Admin' : 'Member'}
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-300 hidden md:inline">{user.name}</span>
              <button onClick={onLogout} title="Log out"
                className="p-1.5 rounded-md text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors">
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
      </header>
      
      {/* Tagline Descripotion */}
      <p className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-5 py-1.5 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 shrink-0">
        Windsor-Essex 2SLGBTQIA+ support programs
      </p>
    </>
  );
}
