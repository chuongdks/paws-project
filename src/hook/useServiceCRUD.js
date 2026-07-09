import { useState, useEffect } from 'react';
import { createService } from '../models/Service.js';
import servicesData from '../data/service.json';
import api from '../api/axiosConfig.js';

// Owns the services array and every create/update/delete/image operation.
// IMPORTANT: edit/delete are still in-memory only, WHEN it is ready swap those for real PUT/DELETE calls once those endpoints exist
export function useServiceCRUD() {
  const [services, setServices] = useState(() => servicesData.map(createService));
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [saveError, setSaveError] = useState(null);

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

  const openAdd    = ()        => { setSaveError(null); setModal({ mode: 'add' }); };
  const openEdit   = (service) => { setSaveError(null); setModal({ mode: 'edit', service }); };
  const closeModal = ()        => setModal(null);

  // payload that the api services.php accepts
  // trims off some client side fields (id, verification_status, is_visible, last_verified_at, etc.) that is on the normal form  but arent part of the write API.
  const buildPayload = (formData) => ({
    name:                formData.name,
    category_id:         formData.category_id,
    address:             formData.address,
    city:                formData.city,
    province:            formData.province,
    phone:               formData.phone,
    email:               formData.email,
    website_url:         formData.website_url,
    google_maps_url:     formData.google_maps_url,
    latitude:            formData.latitude,
    longitude:           formData.longitude,
    description:         formData.description,
    inclusivity_notes:   formData.inclusivity_notes,
    washroom_info:       formData.washroom_info,
    accessibility_notes: formData.accessibility_notes,
    hours:               formData.hours,
    image_url:           formData.image_url,
    tags:                formData.tags, // already an array of tag ids (ServiceFormModal.jsx)
  });

  const handleSave = async (formData) => {
    if (modal.mode === 'add') {
      try {
        const response = await api.post('/services.php', buildPayload(formData));
        const json = response.data;
        if (!json.success) throw new Error(json.message || 'API returned success: false');
        setServices(prev => [...prev, createService(json.data)]);
        closeModal();
      } catch (err) {
        console.error('Failed to create service\n Full Error:', err);
        setSaveError('Could not save the new service — please try again.');
      }
    } else {
      // Still in memory, swap for a real PUT soon
      const normalized = createService(formData);
      setServices(prev => prev.map(s => s.id === modal.service.id ? { ...normalized, id: s.id } : s));
      closeModal();
    }
  };
  
  // Still in memory, swap for a real PUT soon
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
    saveError,
  };
}
