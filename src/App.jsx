import React, { useState, useMemo, useRef } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useServiceDirectory } from './hook/useServiceDirectory.js';
import { useServiceCRUD } from './hook/useServiceCRUD.js';
import { useServiceSelection } from './hook/useServiceSelection.js';
import { useReviews } from './hook/useReviews.js';
import { useAuth } from './context/AuthContext.jsx';
import { CATEGORIES } from './models/Service.js';

import DeleteConfirmModal from './components/DeleteConfirmModal.jsx';
import FilterBar from './components/FilterBar.jsx';
import Header from './components/Header.jsx';
import LeafletTestMap from './components/LeafletTestMap.jsx';
import LoginModal from './components/LoginModal.jsx';
import ServiceDetailPanel from './components/ServiceDetailPanel.jsx';
import ServiceFormModal from './components/ServiceFormModal.jsx';
import Sidebar from './components/Sidebar.jsx';
import Footer from './components/Footer.jsx';

// ── Main App ───────────────────────────────────────────────────────────────────
export default function App() {
  const { user, isAuthenticated, isAdmin, isUser, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const mapSectionRef = useRef(null);

  // Reviews — owns its own array, scoped per service via getReviewsFor
  const { getReviewsFor, addReview, deleteReview, hasUserReviewed } = useReviews();

  // Services array + every create/update/delete/image operation
  const {
    services, loading, error,
    modal, openAdd, openEdit, closeModal,
    deleteTarget, setDeleteTarget,
    handleSave, handleDelete, handleUpdateImage,
  } = useServiceCRUD();

  // Search + access/category filtering
  const {
    searchQuery,    setSearchQuery,
    accessFilter,   setAccessFilter,
    categoryFilter, setCategoryFilter,
    filteredServices,
  } = useServiceDirectory(services);

  // Categories that actually have services in the current data (for filter pills)
  const activeCategories = useMemo(() => {
    const usedIds = [...new Set(services.map(s => s.category_id))];
    return CATEGORIES.filter(c => usedIds.includes(c.id));
  }, [services]);

  // Selection + scroll-to-card — selectedService is derived live from
  // `services`, so edits/photo updates show up immediately, no manual syncing
  const {
    selectedService, setSelectedService,
    cardRefs, scrollContainerRef,
    handleSelectService,
  } = useServiceSelection(services, filteredServices);

  // Clear all filter function
  const clearAllFilters = () => {
    setSearchQuery('');
    setAccessFilter('All');
    setCategoryFilter('All');
  };

  // Auto scroll to map when select a Service
  // call requestAnimationFrame() twice to wait for the detail panel to render first. NOTE: need better way to do this
  const handleSelectServiceAndScroll = (service) => {
    handleSelectService(service);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  };

  // Return back from detail to lists, and also scroll back to top
  const handleBackToResults = () => {
    setSelectedService(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    /* HEADER, FILTER BAR, BODY and CRUD MODAL */
    <div className="min-h-screen md:h-screen flex flex-col bg-app-bg overflow-y-auto md:overflow-hidden">

      {/* ── Header: Website name, logo, and others and Logging In/Sign Out ─── */}
      <Header
        resultCount={filteredServices.length}
        user={user} isAuthenticated={isAuthenticated} isAdmin={isAdmin}
        onSignIn={() => setShowLogin(true)} onLogout={logout}
      />

      {/* ── Filter bar: spans full width above all 3 columns ───────────────── */}
      <FilterBar
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        accessFilter={accessFilter} setAccessFilter={setAccessFilter}
        categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
        activeCategories={activeCategories}
        isUser={isUser} onAddService={openAdd}
      />

      {/* ── Error banner: only shows if the live API was unreachable ───────── */}
      {error && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 sm:px-5 py-2 flex items-center gap-1.5 text-xs text-amber-700 shrink-0">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {error}
        </div>
      )}

      {/* ── Body: sidebar -> detail panel + map (stacked on mobile, row on desktop) ───────────────────────────── */}
      <div className="flex flex-1 flex-col md:flex-row md:overflow-hidden">

        {/* Left slot: Loading API first then List OR Detail, mutually exclusive */}
        <div className="w-full md:w-[400px] shrink-0">
          {loading ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400 text-sm border-r border-slate-200 bg-slate-50 py-16">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading services…
            </div>
          ) : selectedService ? (
            <ServiceDetailPanel
              service={selectedService}
              onClose={handleBackToResults}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              onUpdateImage={handleUpdateImage}
              isAdmin={isAdmin}
              isAuthenticated={isAuthenticated}
              reviews={getReviewsFor(selectedService.id)}
              canReview={!isAdmin && isAuthenticated && !hasUserReviewed(selectedService.id, user?.id)}
              onAddReview={(formData) => addReview(selectedService.id, formData, user)}
              onDeleteReview={deleteReview}
            />
          ) : (
            <Sidebar
              filteredServices={filteredServices}
              selectedService={selectedService}
              onSelectService={handleSelectServiceAndScroll}
              onEdit={openEdit} onDelete={setDeleteTarget} isAdmin={isAdmin}
              cardRefs={cardRefs} scrollContainerRef={scrollContainerRef}
              onClearFilters={clearAllFilters}
            />
          )}
        </div>

        {/* Right slot: Map, always visible regardless of selection */}
        <div ref={mapSectionRef} className="relative w-full h-[400px] md:h-auto md:flex-1">
          {!selectedService && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-surface-raised rounded-full shadow-lg border border-divider px-4 py-2 text-sm text-muted">
              Select a service or click a map pin to view full details
            </div>
          )}
          <LeafletTestMap
            services={filteredServices}
            selectedService={selectedService}
            onSelectService={handleSelectServiceAndScroll}
          />
        </div>
      </div>

      <Footer></Footer>
      
      {/* ── Login modal ───────────────────────────────────────────────────────── */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
        
      {/* ── Add / Edit pop up modal ───────────────────────────────────────────────────────── */}
      {modal && (
        <ServiceFormModal mode={modal.mode} initial={modal.service ?? null}
          onSave={handleSave} onClose={closeModal} />
      )}

      {/* ── Delete confirmation modal ─────────────────────────────────────────── */}
      {deleteTarget && (
        <DeleteConfirmModal
          title="Delete Service"
          message={<>Are you sure you want to remove <span className="font-semibold text-secondary-strong">{deleteTarget.name}</span>? This cannot be undone.</>}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
