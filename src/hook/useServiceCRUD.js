import { useState } from 'react';
import { createService } from '../models/Service.js';
import servicesData from '../data/service.json';

// Owns the services array and every create/update/delete/image operation.
// IMPORTANT: Swap the useState initializer below for a fetch('/api/services') call once the PHP backend is ready — nothing else in this hook needs to change.
export function useServiceCRUD() {
  const [services, setServices] = useState(() => servicesData.map(createService));
  // const [services, setServices] = useState([]);
  // useEffect(() => { fetch('/api/services').then(r => r.json()).then(setServices); }, []);

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
    services,
    modal, openAdd, openEdit, closeModal,
    deleteTarget, setDeleteTarget,
    handleSave, handleDelete, handleUpdateImage,
  };
}
