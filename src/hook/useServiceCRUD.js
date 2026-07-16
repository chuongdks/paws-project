import { useState, useEffect } from 'react';
import { createService } from '../models/Service.js';
import servicesData from '../data/service.json';
import api from '../api/axiosConfig.js';

// Owns the services array and every create/update/delete/image operation.
// WARNING: photo updates are still in-memory only, since the backend has no image storage endpoint yet. We have GET/POST/PUT/DELETE ready
export function useServiceCRUD() {
  const [services, setServices] = useState(() => servicesData.map(createService));
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving]       = useState(false);

  // approving a recommended service creates listing server side and the list needs to be updated without a page reload.
  const loadServices = async () => {
    setLoading(true);
    try {
      const response = await api.get('/services.php');
      const json = response.data;
      if (!json.success) throw new Error(json.message || 'API returned success: false');
      setServices(json.data.map(createService));
      setError(null);
    } catch (err) {
      // use the classic service.json offline mode
      console.error('Failed to load services from the API, falling back to local data\n Full Error:', err);
      setServices(servicesData.map(createService));
      setError('Could not reach the live directory — showing sample data instead.');
    } finally {
      setLoading(false);
    }
  };

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
  const [deleteTarget, setDeleteTargetRaw] = useState(null); // service pending deletion confirmation

  const openAdd    = ()        => { setSaveError(null); setModal({ mode: 'add' }); };
  const openEdit   = (service) => { setSaveError(null); setModal({ mode: 'edit', service }); };
  const closeModal = ()        => setModal(null);
  const setDeleteTarget = (service) => { setDeleteError(null); setDeleteTargetRaw(service); };

  // Builds the exact payload shape services.php accepts — trims off client-only fields 
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
    by_appointment_only: formData.by_appointment_only,
    image_url:           formData.image_url,
    tags:                formData.tags, // already an array of tag ids (ServiceFormModal.jsx)
    verification_status: formData.verification_status, // only ever changeable via the admin-only field in ServiceFormModal
  });

  const handleSave = async (formData) => {
    setSaving(true);
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
      } finally {
        setSaving(false);
      }
    } else {
      try {
        const payload = { id: modal.service.id, ...buildPayload(formData) };
        const response = await api.put('/services.php', payload);
        const json = response.data;
        if (!json.success) throw new Error(json.message || 'API returned success: false');
        setServices(prev => prev.map(s => s.id === modal.service.id ? createService(json.data) : s));
        closeModal();
      } catch (err) {
        console.error('Failed to update service\n Full Error:', err);
        setSaveError('Could not save changes to this service — please try again.');
      } finally {
        setSaving(false);
      }
    }
  };

  const [deleteError, setDeleteError] = useState(null);
  const [deleting, setDeleting]       = useState(false);

  const handleDelete = async (service) => {
    setDeleting(true);
    try {
      // delete() takes a config object, not a body directly 
      // { data } is how a request body gets attached to a DELETE
      const response = await api.delete('/services.php', { data: { id: service.id } });
      const json = response.data;
      if (!json.success) throw new Error(json.message || 'API returned success: false');
      // Soft delete server-side (is_visible = 0), the row still exists in the DB, it just won't come back from GET /services.php anymore. Mirror that locally.
      setServices(prev => prev.filter(s => s.id !== service.id));
      setDeleteError(null);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete service\n Full Error:', err);
      setDeleteError('Could not delete this service — please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Updates a service's photo in-memory (temporary, until DB supports images)
  const handleUpdateImage = (id, dataUrl) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, image_url: dataUrl } : s));
  };

  return {
    services, loading, error,
    refetchServices: loadServices,
    modal, openAdd, openEdit, closeModal,
    deleteTarget, setDeleteTarget,
    handleSave, handleDelete, handleUpdateImage,
    saveError, saving,
    deleteError, deleting,
  };
}
