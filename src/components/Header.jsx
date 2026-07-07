import React from 'react';
import { LogIn, LogOut, Sun, Moon } from 'lucide-react';
import myLogo from '../assets/paws.jpg';
import { useTheme } from '../context/ThemeContext.jsx';

const LOGO_URL = 'https://pawsinrecovery.ca/wp-content/uploads/2025/08/cropped-Logo-July-2025.jpg'; // URL from paws

export default function Header({ resultCount, user, isAuthenticated, isAdmin, onSignIn, onLogout }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    /* ── Header ─────────────────────────────────────────────────────────── */
    <>
      <header className="bg-surface border-b border-divider-page px-4 sm:px-5 py-3 flex items-center justify-between gap-3 shrink-0 z-10">

        {/* Logo + description (Link to the PAWS site)*/}
        <a href="https://pawsinrecovery.ca/" target="_blank" rel="noopener noreferrer" className="flex flex-col min-w-0"
        >
          <img src={myLogo} alt="Paws in Recovery" className="h-14 sm:h-20 w-auto object-contain" />
        </a>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* No of Services after filter */}
          <span className="text-xs font-semibold bg-accent-soft text-accent-text-strong px-2.5 sm:px-3 py-1 rounded-full border border-accent-border whitespace-nowrap">
            {resultCount} {resultCount === 1 ? 'result' : 'results'}
          </span>

          {/* Dark mode toggle */}
          <button onClick={toggleTheme} title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-1.5 rounded-md text-faint hover:text-warning-icon hover:bg-warning-soft transition-colors">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Log In / Sign Out */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className={`text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-full border whitespace-nowrap ${
                isAdmin
                  ? 'bg-admin-soft text-admin-text border-admin-border'
                  : 'bg-surface-subtle text-secondary border-divider'
              }`}>
                {isAdmin ? 'Admin' : 'Member'}
              </span>
              <span className="text-sm text-secondary hidden md:inline">{user.name}</span>
              <button onClick={onLogout} title="Log out"
                className="p-1.5 rounded-md text-faint hover:text-danger-text hover:bg-danger-soft transition-colors">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button onClick={onSignIn}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors whitespace-nowrap">
              <LogIn className="h-3.5 w-3.5" /> Sign In
            </button>
          )}
        </div>
      </header>
      
      {/* Tagline Descripotion */}
      <p className="bg-surface border-b border-divider-page px-4 sm:px-5 py-1.5 text-[11px] sm:text-xs text-muted shrink-0">
        Windsor-Essex 2SLGBTQIA+ support programs
      </p>
    </>
  );
}
