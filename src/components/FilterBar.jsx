import React, { useState, useRef, useEffect } from 'react';
import { Search, SlidersHorizontal, ChevronDown, Check, Plus, X } from 'lucide-react';

// ── Generic dropdown shell, click the button to toggle a popover ────────────
function FilterDropdown({ label, activeLabel, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const handleKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  const isFiltered = activeLabel && activeLabel !== 'All';

  return (
    <div ref={ref} className="relative w-full sm:w-auto">
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full sm:w-auto flex items-center justify-between sm:justify-start gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
          isFiltered
            ? 'bg-accent-soft text-accent-text-strong border-accent-ring'
            : 'bg-surface-raised text-secondary border-divider hover:border-divider-strong'
        }`}
      >
        <span className="truncate">{label}{isFiltered ? `: ${activeLabel}` : ''}</span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 bg-surface-raised border border-divider rounded-xl shadow-lg p-2 z-[1100] w-full sm:w-auto sm:min-w-[220px] max-h-72 overflow-y-auto">
          {children}
        </div>
      )}
    </div>
  );
}

// ── A single option row inside a dropdown panel ────────────────────────────────
function DropdownOption({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
        active ? 'bg-accent-soft text-accent-text-strong font-semibold' : 'text-secondary hover:bg-surface-subtle'
      }`}
    >
      <span className="truncate">{label}</span>
      {active && <Check className="h-3.5 w-3.5 shrink-0 text-accent-text" />}
    </button>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
export default function FilterBar({
  searchQuery, setSearchQuery,
  accessFilter, setAccessFilter,
  categoryFilter, setCategoryFilter,
  activeCategories,
  isUser, onAddService,
}) {
  const ACCESS_OPTIONS = ['All', 'In-Person', 'No Fixed Location'];
  const categoryLabel = categoryFilter === 'All'
    ? 'All'
    : activeCategories.find(c => c.id === categoryFilter)?.name ?? 'All';

  const hasActiveFilters = searchQuery.trim() !== '' || accessFilter !== 'All' || categoryFilter !== 'All';

  const clearAll = () => {
    setSearchQuery('');
    setAccessFilter('All');
    setCategoryFilter('All');
  };

  return (
    <div className="bg-surface border-b border-divider-page px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 shrink-0 z-10">

      {/* Search */}
      <div className="relative w-full sm:w-64 shrink-0">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-faint" />
        <input
          type="text" placeholder="Search services..."
          value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-surface-muted border border-divider rounded-lg pl-9 pr-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring/20 focus:border-focus-ring transition-all"
        />
      </div>

      {/* Divider only appear once everything sits on one row */}
      <div className="hidden sm:block h-6 w-px bg-divider" />

      <FilterDropdown label="Access" activeLabel={accessFilter}>
        {ACCESS_OPTIONS.map(opt => (
          <DropdownOption key={opt} label={opt}
            active={accessFilter === opt}
            onClick={() => setAccessFilter(opt)} />
        ))}
      </FilterDropdown>

      <FilterDropdown label="Category" activeLabel={categoryLabel}>
        <DropdownOption label="All" active={categoryFilter === 'All'}
          onClick={() => setCategoryFilter('All')} />
        {activeCategories.map(cat => (
          <DropdownOption key={cat.id} label={cat.name}
            active={categoryFilter === cat.id}
            onClick={() => setCategoryFilter(cat.id)} />
        ))}
      </FilterDropdown>

      {hasActiveFilters && (
        <button onClick={clearAll}
          className="flex items-center gap-1 text-xs text-faint hover:text-secondary-strong transition-colors">
          <X className="h-3.5 w-3.5" /> Clear filters
        </button>
      )}

      {isUser && (
        <button onClick={onAddService}
          className="w-full sm:w-auto sm:ml-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-semibold transition-colors shrink-0">
          <Plus className="h-4 w-4" /> Add Service
        </button>
      )}
    </div>
  );
}
