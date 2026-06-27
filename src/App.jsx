import React, { useState, useMemo } from 'react';
import { useServiceDirectory } from './hook/useServiceDirectory.js';
import { useServiceCRUD } from './hook/useServiceCRUD.js';
import { useServiceSelection } from './hook/useServiceSelection.js';
import { useAuth } from './context/AuthContext.jsx';
import { CATEGORIES } from './models/Service.js';

import Header from './components/Header.jsx';
import FilterBar from './components/FilterBar.jsx';
import Sidebar from './components/Sidebar.jsx';
import ServiceDetailPanel from './components/ServiceDetailPanel.jsx';
import LeafletTestMap from './components/LeafletTestMap.jsx';
import ServiceFormModal from './components/ServiceFormModal.jsx';
import LoginModal from './components/LoginModal.jsx';
import DeleteConfirmModal from './components/DeleteConfirmModal.jsx';

// ── Main App ───────────────────────────────────────────────────────────────────
export default function App() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  // Services array + every create/update/delete/image operation
  const {
    services,
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

  const clearAllFilters = () => {
    setSearchQuery('');
    setAccessFilter('All');
    setCategoryFilter('All');
  };

  return (
    /* HEADER, FILTER BAR, BODY and CRUD MODAL */
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">
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
        isAdmin={isAdmin} onAddService={openAdd}
      />

      {/* ── Body: sidebar + detail panel + map ───────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <Sidebar
          filteredServices={filteredServices}
          selectedService={selectedService}
          onSelectService={handleSelectService}
          onEdit={openEdit} onDelete={setDeleteTarget} isAdmin={isAdmin}
          cardRefs={cardRefs} scrollContainerRef={scrollContainerRef}
          onClearFilters={clearAllFilters}
        />

        {/* ── Detail panel + Map ───────────────────────────────────────────── */}
        <main className="flex-1 flex overflow-hidden">

          {/* Detail panel — only renders when a service is selected */}
          {selectedService && (
            <ServiceDetailPanel
              service={selectedService}
              onClose={() => setSelectedService(null)}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              onUpdateImage={handleUpdateImage}
              isAdmin={isAdmin}
            />
          )}

          {/* Map fills whatever space remains */}
          <div className="flex-1 relative">
            {!selectedService && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-full shadow-lg border border-slate-200 px-4 py-2 text-sm text-slate-500">
                Select a service or click a map pin to view full details
              </div>
            )}
            <LeafletTestMap
              services={filteredServices}
              selectedService={selectedService}
              onSelectService={handleSelectService}
            />
          </div>
        </main>
      </div>

      {/* ── Login modal ───────────────────────────────────────────────────────── */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
        
      {/* ── Add / Edit pop up modal ───────────────────────────────────────────────────────── */}
      {modal && (
        <ServiceFormModal mode={modal.mode} initial={modal.service ?? null}
          onSave={handleSave} onClose={closeModal} />
      )}

      {/* ── Delete confirmation modal ─────────────────────────────────────────── */}
      {deleteTarget && (
        <DeleteConfirmModal service={deleteTarget}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}
