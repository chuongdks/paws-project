import React, { useState, useRef, useEffect } from 'react';
import { LogIn, LogOut, Sun, Moon, Menu, X } from 'lucide-react';
import myLogo from '../assets/paws.jpg';
import { useTheme } from '../context/ThemeContext.jsx';

const LOGO_URL = 'https://pawsinrecovery.ca/wp-content/uploads/2025/08/cropped-Logo-July-2025.jpg'; // URL from paws

// Mirrors the nav links from the PAWS WordPress site header 
const NAV_LINKS = [
  { label: 'About Us',            href: 'https://pawsinrecovery.ca/about-us/' },
  { label: 'Join Our Community',  href: 'https://pawsinrecovery.ca/funding/' },
  { label: 'Members of our Team', href: 'https://pawsinrecovery.ca/staffvolunteers/' },
  { label: 'Event Calendar',      href: 'https://pawsinrecovery.ca/event-calendar/' },
  { label: 'Funding & Donations', href: 'https://pawsinrecovery.ca/funding-and-donations/' },
  { label: 'Contact Us',          href: 'https://pawsinrecovery.ca/contact-us/' },
];

export default function Header({ resultCount, user, isAuthenticated, isAdmin, onSignIn, onLogout, onOpenAccount }) {
  const { isDark, toggleTheme } = useTheme();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const rootRef = useRef(null);

  // Close the mobile menu on outside click or Escape
  useEffect(() => {
    if (!mobileNavOpen) return;

    const handleClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setMobileNavOpen(false);
    };
    const handleKey = (e) => { if (e.key === 'Escape') setMobileNavOpen(false); };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [mobileNavOpen]);

  // Collapse the mobile menu automatically if the viewport grows past the breakpoint
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handleChange = () => setMobileNavOpen(false);
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  return (
    /* ── Header ─────────────────────────────────────────────────────────── */
    <div ref={rootRef} className="relative shrink-0 z-20">
      <header className="bg-surface border-b border-divider-page px-4 sm:px-5 py-0 flex items-center justify-between gap-3 z-10">

        {/* Logo + description (Link to the PAWS site)*/}
        <a href="https://pawsinrecovery.ca/" target="_blank" rel="noopener noreferrer" className="flex flex-col min-w-0 shrink-0"
        >
          <img src={myLogo} alt="Paws in Recovery" className="h-10 sm:h-14 w-auto object-contain" />
        </a>

        {/* Site nav — mirrors the main PAWS site's header links. Hidden below lg, where the hamburger toggle + collapsible vertical menu belowtakes over instead  */}
        <nav aria-label="Main navigation" className="hidden lg:flex flex-1 items-center justify-center min-w-0">
          <ul className="flex items-center gap-5 xl:gap-6 flex-wrap justify-center">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noopener noreferrer"
                  className="text-sm font-medium text-secondary hover:text-accent-text transition-colors whitespace-nowrap">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

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
              <button onClick={onOpenAccount} title="View my account"
                className="flex items-center gap-1.5 sm:gap-2 rounded-full hover:bg-surface-subtle px-1.5 py-1 transition-colors">
                <span className={`text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-full border whitespace-nowrap ${
                  isAdmin
                    ? 'bg-admin-soft text-admin-text border-admin-border'
                    : 'bg-surface-subtle text-secondary border-divider'
                }`}>
                  {isAdmin ? 'Admin' : 'Member'}
                </span>
                <span className="text-sm text-secondary hidden md:inline">{user.name}</span>
              </button>
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

          {/* Hamburger toggle — only shown below lg, where the horizontal nav is hidden */}
          <button onClick={() => setMobileNavOpen(o => !o)}
            aria-expanded={mobileNavOpen} aria-controls="mobile-nav-menu" aria-label="Toggle navigation menu"
            className="lg:hidden p-1.5 rounded-md text-faint hover:text-accent-text hover:bg-accent-soft transition-colors">
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Collapsible vertical nav. phone/small-screen only */}
      <nav id="mobile-nav-menu" aria-label="Main navigation (mobile)"
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out bg-surface border-b border-divider-page ${
          mobileNavOpen ? 'max-h-96' : 'max-h-0 border-b-0'
        }`}>
        <ul className="flex flex-col px-4 sm:px-5 py-1">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label} className="border-b border-divider-subtle last:border-0">
              <a href={href} target="_blank" rel="noopener noreferrer"
                onClick={() => setMobileNavOpen(false)}
                className="block py-3 text-sm font-medium text-secondary hover:text-accent-text transition-colors">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Disclaimer Descripotion */}
      <p className="bg-surface border-b border-divider-page px-4 sm:px-5 py-0.5 text-[11px] sm:text-xs text-muted">
        Welcome to the Safe Spaces & Services Map. This map is designed to help connect 2SLGBTQIA+ community members, allies, and visitors with businesses, organizations, services, performers and spaces that strive to be inclusive, respectful and welcoming.
        <br />
        While we make every effort to keep listings accurate and up to date, inclusion and safety are personal experiences and cannot be guaranteed.
      </p>
      <p className="bg-danger-soft border-b border-danger-border px-4 sm:px-5 py-1.5 text-[11px] sm:text-xs text-danger-text text-left">
        A listing on this map does not constitute an endorsement or guarentee of services accessibility or conduct. If you notice inaccurate information or would like to suggest an addition or update, please contact us. Together we can help keep this resource welcoming, accurate and community driven.
      </p>
    </div>
  );
}
