import { useState, useEffect } from 'react';
import { createService } from '../models/Service.js';
import servicesData from '../data/service.json';
import api from '../api/axiosConfig.js';

// Owns the services array and every create/update/delete/image operation.
// IMPORTANT: Add/edit/delete are still in-memory only, WHEN it is ready swap handleSave/handleDelete for real POST/PUT/DELETE calls once those endpoints exist; nothing else here needs to change.
export function useServiceCRUD() {
  const [services, setServices] = useState(() => servicesData.map(createService));
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await api.get('/services.php');
        if (cancelled) return;

        const json = response.data;
        if (!json.success) throw new Error(json.message || 'API returned success: false');
        setServices(json.data.map(createService));
      } catch (err) {
        if (cancelled) return;
        // use the classic service.json offline mode
        console.error('Failed to load services from the API, falling back to local data\n Full Error:', err);
        setServices(servicesData.map(createService));
        setError('Could not reach the live directory — showing sample data instead.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const [modal, setModal]               = useState(null); // null | { mode: 'add'|'edit', service? }
  const [deleteTarget, setDeleteTarget] = useState(null); // service pending deletion confirmation

  const openAdd    = ()        => setModal({ mode: 'add' });
  const openEdit   = (service) => setModal({ mode: 'edit', service });
  const closeModal = ()        => setModal(null);

  const handleSave = (formData) => {
    const normalized = createService(formData);
    if (modal.mode === 'add') {
      // Temporary client-side ID — will be assigned by the DB on real save
      setServices(prev => [...prev, { ...normalized, id: Date.now() }]);
    } else {
      setServices(prev => prev.map(s => s.id === modal.service.id ? { ...normalized, id: s.id } : s));
    }
    closeModal();
  };

  const handleDelete = (service) => {
    setServices(prev => prev.filter(s => s.id !== service.id));
    setDeleteTarget(null);
  };

  // Updates a service's photo in-memory (temporary, until DB supports images)
  const handleUpdateImage = (id, dataUrl) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, image_url: dataUrl } : s));
  };

  return {
    services, loading, error,
    modal, openAdd, openEdit, closeModal,
    deleteTarget, setDeleteTarget,
    handleSave, handleDelete, handleUpdateImage,
  };
}
