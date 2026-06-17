import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useServiceDirectory } from './hook/useServiceDirectory.js';
import LeafletTestMap from './components/LeafletTestMap.jsx';
import ServiceFormModal from './components/ServiceFormModal.jsx';
import { CATEGORIES, getCategoryName, fullAddress, createService, isVerified } from './models/Service.js';
import servicesData from './data/service.json';
import { 
  Search, MapPin, Phone, Globe, ExternalLink, 
  SlidersHorizontal, X, Plus, Pencil, Trash2, 
  AlertTriangle, BadgeCheck, ShieldAlert
} from 'lucide-react';

// Helper calculation to build external Google Map link pointers cleanly
const buildGoogleMapsLink = (s) => {
  const addr = s.google_maps_url ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress(s))}`;
  return addr;
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

// ── Delete confirmation modal ──────────────────────────────────────────────────
function DeleteConfirmModal({ service, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5">
        {/* Icon + message */}
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-red-50 rounded-xl shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Delete Service</h3>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              Are you sure you want to remove{' '}
              <span className="font-semibold text-slate-700">{service.name}</span>?
              This cannot be undone.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-1">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Verification badge ─────────────────────────────────────────────────────────
function VerificationBadge({ status }) {
  if (status === 'verified') return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
      <BadgeCheck className="h-3 w-3" /> Verified
    </span>
  );
  if (status === 'needs verification') return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
      <ShieldAlert className="h-3 w-3" /> Unverified
    </span>
  );
  return null;
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
      <h3 className="font-semibold text-slate-900 text-sm leading-snug">
        {service.name}
      </h3>

      {/* Category + verification */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
          {getCategoryName(service.category_id)}
        </span>
        <VerificationBadge status={service.verification_status} />
      </div>

      {/* PAWS tags */}
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
      {fullAddress(service) ? (
        <div className="flex items-start gap-1.5 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-slate-400" />
          <span className="line-clamp-2 leading-snug">{fullAddress(service)}</span>
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

      {/* Inclusivity notes */}
      {service.inclusivity_notes && (
        <p className="text-[11px] text-slate-400 italic leading-snug line-clamp-2">
          {service.inclusivity_notes}
        </p>
      )}

      {/* Action row — links on left, edit/delete on right */}
      <div onClick={e => e.stopPropagation()} className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
        {/* External links */}
        <div className="flex items-center gap-3">
          {service.website_url && (
            <a href={service.website_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
              <Globe className="h-3 w-3" /> Website
            </a>
          )}
          {fullAddress(service) && (
            <a href={buildGoogleMapsLink(service)} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700">
              <ExternalLink className="h-3 w-3" /> Directions
            </a>
          )}
        </div>

        {/* Edit + Delete — right side, appear on hover */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onEdit(service)}
            title="Edit"
            className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(service)}
            title="Delete"
            className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>
    </article>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────────
export default function App() {
  // ── Services state — source of truth (swap useState init below for fetch() later when the back end is finallize) ──
  const [services, setServices] = useState(() => servicesData.map(createService));
  // const [services, setServices] = useState([]);
  // useEffect(() => { fetch('/api/services').then(r => r.json()).then(setServices); }, []);

  const {
    searchQuery,      setSearchQuery,
    accessFilter,     setAccessFilter,
    categoryFilter,   setCategoryFilter,
    filteredServices
  } = useServiceDirectory(services);

  // Categories that actually have services in the current data (for filter pills)
  const activeCategories = useMemo(() => {
    const usedIds = [...new Set(services.map(s => s.category_id))];
    return CATEGORIES.filter(c => usedIds.includes(c.id));
  }, [services]);

  // ── Shared selection state ─────────────────────────────────────────────────
  const [selectedService, setSelectedService] = useState(null);
  const cardRefs = useRef({});
  const scrollContainerRef = useRef(null);

  // Map pin click → scroll to card in sidebar
  useEffect(() => {
    if (!selectedService) return;
    const el        = cardRefs.current[selectedService.id];
    const container = scrollContainerRef.current;
    if (!el || !container) return;

    // Scroll within the sidebar container, not the page
    const cardTop = el.offsetTop - container.offsetTop;
    container.scrollTo({ top: cardTop - 16, behavior: 'smooth' });
  }, [selectedService]);

  // If filters remove the selected service, clear selection
  useEffect(() => {
    if (selectedService && !filteredServices.find(s => s.id === selectedService.id)) {
      setSelectedService(null);
    }
  }, [filteredServices]);

  // Toggle off if clicking the already selected service
  const handleSelectService = (service) => {
    setSelectedService(prev => prev?.id === service.id ? null : service);
  };

  // ── CRUD modal state ────────────────────────────────────────────────────────
  const [modal, setModal]               = useState(null); // null | { mode: 'add' | 'edit', service?: object }
  const [deleteTarget, setDeleteTarget] = useState(null); // service pending deletion

  const openAdd  = ()        => setModal({ mode: 'add' });
  const openEdit = (service) => setModal({ mode: 'edit', service });
  const closeModal = ()      => setModal(null);

  const handleSave = (formData) => {
    if (modal.mode === 'add') {
      // Temporary client-side ID — will be assigned by the DB on real save
      setServices(prev => [...prev, { ...normalized, id: Date.now() }]);
    } else {
      setServices(prev => prev.map(s => s.id === modal.service.id ? { ...normalized, id: s.id } : s));
      // Update selection if the edited service was selected
      if (selectedService?.id === modal.service.id) setSelectedService({ ...normalized, id: modal.service.id });
    }
    closeModal();
  };

  const handleDelete = (service) => {
    setServices(prev => prev.filter(s => s.id !== service.id));
    if (selectedService?.id === service.id) setSelectedService(null);
    setDeleteTarget(null);
  };

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
                {['All', 'In-Person', 'Helplines'].map(opt => (
                  <Pill key={opt} label={opt}
                    active={accessFilter === opt}
                    onClick={() => setAccessFilter(opt)} />
                ))}
              </div>
            </div>

            {/* Category filter — only shows categories present in the data */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <SlidersHorizontal className="h-3 w-3" /> Category
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Pill label="All" active={categoryFilter === 'All'}
                  onClick={() => setCategoryFilter('All')} />
                {activeCategories.map(cat => (
                  <Pill key={cat.id} label={cat.name}
                    active={categoryFilter === cat.id}
                    onClick={() => setCategoryFilter(cat.id)} />
                ))}
              </div>
            </div>
            
            {/* Adding a service button */}
            <button onClick={openAdd} className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
              <Plus className="h-4 w-4" /> Add Service
            </button>
          </div>

          {/* Cards list — scrolls independently */}
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredServices.length > 0 ? (
              filteredServices.map(service => (
                <div key={service.id} ref={el => { cardRefs.current[service.id] = el; }}>
                  <ServiceCard
                    service={service}
                    isSelected={selectedService?.id === service.id}
                    onClick={() => handleSelectService(service)}
                    onEdit={openEdit}
                    onDelete={setDeleteTarget}
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
                  className="mt-2 text-blue-600 text-xs underline">
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
              <span className="truncate">{selectedService.name}</span>
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

      {/* ── Add / Edit modal ───────────────────────────────────────────────────────── */}
      {modal && (
        <ServiceFormModal
          mode={modal.mode}
          initial={modal.service ?? null}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}

      {/* ── Delete confirmation modal ─────────────────────────────────────────── */}
      {deleteTarget && (
        <DeleteConfirmModal
          service={deleteTarget}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

    </div>
  );
}