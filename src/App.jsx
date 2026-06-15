import React, { useState, useEffect, useRef } from 'react';
import { useServiceDirectory } from './hook/useServiceDirectory.jsx';
import LeafletTestMap from './components/LeafletTestMap.jsx';
import ServiceFormModal from './components/ServiceFormModal.jsx';
import servicesData from './data/service.json';
import { Search, MapPin, Phone, Globe, ExternalLink, 
  SlidersHorizontal, X, ChevronRight, Plus, Pencil, Trash2
} from 'lucide-react';

// Helper calculation to build external Google Map link pointers cleanly
const buildGoogleMapsLink = (address) => {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
};

// ── Filter pill button ─────────────────────────────────────────────────────────
function Pill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
        active
          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
      }`}
    >
      {label}
    </button>
  );
}

// ── Compact card for the sidebar ───────────────────────────────────────────────
function ServiceCard({ service, isSelected, onClick, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <article
      onClick={onClick}
      className={`rounded-xl border p-4 cursor-pointer transition-all space-y-2 group ${
        isSelected
          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      {/* Name + chevron + action buttons */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-900 text-sm leading-snug">{service.Name}</h3>
        <ChevronRight className={`h-4 w-4 shrink-0 mt-0.5 transition-colors ${isSelected ? 'text-blue-500' : 'text-slate-300'}`} />

        {/* Edit / Delete — visible on hover or when selected */}
        <div
          className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(service)}
            title="Edit"
            className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>

          {confirmDelete ? (
            <span className="flex items-center gap-1 text-[11px] bg-red-50 border border-red-200 text-red-600 rounded-md px-2 py-0.5">
              Sure?
              <button
                onClick={() => { onDelete(service); setConfirmDelete(false); }}
                className="font-bold hover:underline"
              >Yes</button>
              <span className="text-red-300">/</span>
              <button onClick={() => setConfirmDelete(false)} className="hover:underline">No</button>
            </span>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              title="Delete"
              className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Tag badges */}
      {service.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {service.tags.map(tag => (
            <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Location or Helpline badge */}
      {service.Location ? (
        <div className="flex items-start gap-1.5 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-slate-400" />
          <span className="line-clamp-2 leading-snug">{service.Location}</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-xs font-medium text-purple-600">
          <Globe className="h-3.5 w-3.5 shrink-0" />
          <span>Provincial / National Helpline</span>
        </div>
      )}

      {/* Phone */}
      {service.Phone && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span>{service.Phone}</span>
        </div>
      )}

      {/* Action links */}
      <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
        {service.Website && (
          <a
            href={service.Website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
          >
            <Globe className="h-3 w-3" /> Website
          </a>
        )}
        {service.Location && (
          <a
            href={buildGoogleMapsLink(service.Location)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
          >
            <ExternalLink className="h-3 w-3" /> Directions
          </a>
        )}
      </div>
    </article>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────────
export default function App() {
  // ── Services state — source of truth (swap useState init below for fetch() later when the back end is finallize) ──
  const [services, setServices] = useState(servicesData);
  // const [services, setServices] = useState([]);
  // useEffect(() => { fetch('/api/services').then(r => r.json()).then(setServices); }, []);

  const {
    searchQuery,        setSearchQuery,
    categoryFilter,     setCategoryFilter,
    inclusivityFilter,  setInclusivityFilter,
    filteredServices
  } = useServiceDirectory(services);

  // ── Shared selection state ─────────────────────────────────────────────────
  const [selectedService, setSelectedService] = useState(null);
  const cardRefs = useRef({});
  const scrollContainerRef = useRef(null);

  // Map pin click → scroll to card in sidebar
  useEffect(() => {
    if (!selectedService) return;
    const el        = cardRefs.current[selectedService.Name];
    const container = scrollContainerRef.current;
    if (!el || !container) return;

    // Scroll within the sidebar container, not the page
    const cardTop = el.offsetTop - container.offsetTop;
    container.scrollTo({ top: cardTop - 16, behavior: 'smooth' });
  }, [selectedService]);

  // If filters remove the selected service, clear selection
  useEffect(() => {
    if (selectedService && !filteredServices.find(s => s.Name === selectedService.Name)) {
      setSelectedService(null);
    }
  }, [filteredServices]);

  // Toggle off if clicking the already selected service
  const handleSelectService = (service) => {
    setSelectedService(prev => prev?.Name === service.Name ? null : service);
  };

  // ── CRUD modal state ────────────────────────────────────────────────────────
  const [modal, setModal] = useState(null); // null | { mode: 'add' | 'edit', service?: object }

  const openAdd  = ()        => setModal({ mode: 'add' });
  const openEdit = (service) => setModal({ mode: 'edit', service });
  const closeModal = ()      => setModal(null);

  const handleSave = (formData) => {
    if (modal.mode === 'add') {
      setServices(prev => [...prev, formData]);
    } else {
      setServices(prev => prev.map(s => s.Name === modal.service.Name ? formData : s));
      // Update selection if the edited service was selected
      if (selectedService?.Name === modal.service.Name) setSelectedService(formData);
    }
    closeModal();
  };

  const handleDelete = (service) => {
    setServices(prev => prev.filter(s => s.Name !== service.Name));
    if (selectedService?.Name === service.Name) setSelectedService(null);
  };

  // ── Filter label maps ──────────────────────────────────────────────────────
  // Map display labels back to filter values
  const accessFilterMap  = { 
    'All': 'All', 
    'In-Person': 'In-Person', 
    'Helplines': 'Virtual/Helpline' 
  };
  const focusFilterMap   = { 
    'All': 'All', 
    'Youth': 'Youth Focus', 
    'Seniors': 'Senior Focus', 
    'Allies': 'Family/Ally Focus' 
  };
  const focusFilterMapRev = Object.fromEntries(Object.entries(focusFilterMap).map(([k,v]) => [v,k]));

  return (
    // HEADER, BODY and CRUD MODAL
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between shrink-0 z-10">
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-tight tracking-tight">
            Community Services Directory
          </h1>
          <p className="text-xs text-slate-500">Windsor-Essex 2SLGBTQIA+ support programs</p>
        </div>
        <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
          {filteredServices.length} {filteredServices.length === 1 ? 'result' : 'results'}
        </span>
      </header>

      {/* ── Body: sidebar + map ───────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left sidebar ─────────────────────────────────────────────────── */}
        <aside className="w-[380px] shrink-0 flex flex-col border-r border-slate-200 bg-slate-50 overflow-hidden">

          {/* Filters — fixed, doesn't scroll */}
          <div className="p-4 bg-white border-b border-slate-200 space-y-3 shrink-0">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            {/* Accessibility model pills */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <SlidersHorizontal className="h-3 w-3" /> Access
              </p>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(accessFilterMap).map(opt => (
                  <Pill key={opt} label={opt}
                    active={categoryFilter === accessFilterMap[opt]}
                    onClick={() => setCategoryFilter(accessFilterMap[opt])}
                  />
                ))}
              </div>
            </div>
            {/* Focus Group pills */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <SlidersHorizontal className="h-3 w-3" /> Focus
              </p>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(focusFilterMap).map(opt => (
                  <Pill key={opt} label={opt}
                    active={inclusivityFilter === focusFilterMap[opt]}
                    onClick={() => setInclusivityFilter(focusFilterMap[opt])}
                  />
                ))}
              </div>
            </div>
            {/* Adding a service button */}
            <button onClick={openAdd} className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
              <Plus className="h-4 w-4" /> Add Service
            </button>
          </div>

          {/* Cards list — scrolls independently */}
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
            {filteredServices.length > 0 ? (
              filteredServices.map(service => (
                <div key={service.Name} ref={el => { cardRefs.current[service.Name] = el; }}>
                  <ServiceCard
                    service={service}
                    isSelected={selectedService?.Name === service.Name}
                    onClick={() => handleSelectService(service)}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                  />
                </div>
              ))
            ) : (
              /* Spans the empty message across all available columns when no filters match */
              <div className="col-span-full text-center text-slate-400 text-sm py-12">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                No services match your filters.
                <br />
                <button
                  onClick={() => { setSearchQuery(''); setCategoryFilter('All'); setInclusivityFilter('All'); }}
                  className="mt-2 text-blue-600 text-xs underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* ── Map panel - The Right side ────────────────────────────── */}
        <main className="flex-1 relative">
          {/* Selected service info bar */}
          {selectedService && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 bg-white rounded-full shadow-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800 max-w-sm">
              <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
              <span className="truncate">{selectedService.Name}</span>
              <button onClick={() => setSelectedService(null)} className="ml-1 text-slate-400 hover:text-slate-700 shrink-0">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <LeafletTestMap
            services={filteredServices}
            selectedService={selectedService}
            onSelectService={handleSelectService}
          />
        </main>
      </div>

      {/* ── CRUD Modal ───────────────────────────────────────────────────────── */}
      {modal && (
        <ServiceFormModal
          mode={modal.mode}
          initial={modal.service ?? null}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}

    </div>
  );
}