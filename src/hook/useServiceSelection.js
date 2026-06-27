import { useState, useEffect, useRef, useMemo } from 'react';

// Manages which service is selected, the scroll-to-card behavior, and auto-clearing the selection when filters remove it from view.
//
// Note: only the selected ID is stored in state, the actual service object is derived fresh from `services` on every render. 
// This means edits or photo updates made elsewhere (via useServiceCRUD) show up immediately without any manual "if this was the selected one, also update X" syncing.
export function useServiceSelection(services, filteredServices) {
  // ── Map selection + scroll ─────────────────────────────────────────────────
  const [selectedId, setSelectedId] = useState(null);
  const cardRefs           = useRef({});
  const scrollContainerRef = useRef(null);

  const selectedService = useMemo(
    () => services.find(s => s.id === selectedId) ?? null,
    [services, selectedId]
  );

  // Map pin click → scroll to card in sidebar
  useEffect(() => {
    if (!selectedId) return;
    const el        = cardRefs.current[selectedId];
    const container = scrollContainerRef.current;
    if (!el || !container) return;
    container.scrollTo({ top: el.offsetTop - container.offsetTop - 16, behavior: 'smooth' });
  }, [selectedId]);

  // If filters remove the selected service, clear selection
  useEffect(() => {
    if (selectedId && !filteredServices.find(s => s.id === selectedId)) {
      setSelectedId(null);
    }
  }, [filteredServices, selectedId]);

  // Toggle off if clicking the already-selected service
  const handleSelectService = (service) =>
    setSelectedId(prev => prev === service.id ? null : service.id);

  return {
    selectedService,
    setSelectedService: (service) => setSelectedId(service?.id ?? null),
    cardRefs,
    scrollContainerRef,
    handleSelectService,
  };
}
