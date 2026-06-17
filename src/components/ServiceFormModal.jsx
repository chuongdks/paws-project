import React, { useState, useEffect } from 'react';
import { X, MapPin, Globe, Phone, Mail, FileText, Tag, Building } from 'lucide-react';
import { CATEGORIES, ASSIGNABLE_TAGS, emptyService } from '../models/Service.js';

const VERIFICATION_OPTIONS = ['needs verification', 'verified', 'rejected', 'archived'];

function Field({ label, icon: Icon, error, children }) {
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
        {Icon && <Icon className="h-3.5 w-3.5" />} {label}
      </label>
      {children}
      {hint  && <p className="text-[11px] text-slate-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputCls = `w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2
  text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20
  focus:border-blue-500 transition-all`;

export default function ServiceFormModal({ mode, initial, onSave, onClose }) {
  const [form, setForm]     = useState(emptyService());
  const [errors, setErrors] = useState({});

  // Populate form when editing an existing service
  useEffect(() => {
    setForm(initial ? { ...emptyService(), ...initial } : emptyService());
    setErrors({});
  }, [initial]);

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: null }));
  };

  const toggleTag = (tag) => {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.Name.trim())                          e.Name = 'Name is required.';
    if (!form.category_id)                          e.category_id = 'Category is required.';
    if (form.lat  && isNaN(parseFloat(form.lat)))   e.lat  = 'Must be a valid number.';
    if (form.lng  && isNaN(parseFloat(form.lng)))   e.lng  = 'Must be a valid number.';
    if (form.lat && !form.lng)                      e.lng = 'Longitude is required when latitude is set.';
    if (form.lng && !form.lat)                      e.lat = 'Latitude is required when longitude is set.';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    onSave({
      ...form,
      category_id: Number(form.category_id),
      lat: form.lat !== '' ? parseFloat(form.lat) : null,
      lng: form.lng !== '' ? parseFloat(form.lng) : null,
    });
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal panel */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">
            {mode === 'edit' ? 'Edit Service' : 'Add New Service'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 rounded-lg p-1 hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* ── Basic info ── */}
          <Field label="Name *" error={errors.Name}>
            <input
              className={inputCls}
              placeholder="e.g. Campus Pride Centre"
              value={form.Name}
              onChange={e => set('Name', e.target.value)}
            />
          </Field>

          <Field label="Category *" icon={Building2} error={errors.category_id}>
            <select 
              className={inputCls} 
              value={form.category_id ?? ''}
              onChange={e => set('category_id', e.target.value)}>

              <option value="">Select a category...</option>

              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}

            </select>
          </Field>

          {/* ── Contact ── */}
          <Field label="Website" icon={Globe}>
            <input
              className={inputCls}
              placeholder="https://example.org"
              value={form.Website}
              onChange={e => set('Website', e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone" icon={Phone}>
              <input className={inputCls} placeholder="519-000-0000"
                value={form.phone} onChange={e => set('phone', e.target.value)} />
            </Field>
            <Field label="Email" icon={Mail}>
              <input className={inputCls} placeholder="info@example.org"
                value={form.email} onChange={e => set('email', e.target.value)} />
            </Field>
          </div>

          {/* ── Location ── */}
          <Field label="Street Address" icon={MapPin}
            hint="Leave blank for provincial / national helplines.">
            <input className={inputCls} placeholder="123 Main Street"
              value={form.address ?? ''} onChange={e => set('address', e.target.value)} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="City">
              <input className={inputCls} placeholder="Windsor"
                value={form.city ?? ''} onChange={e => set('city', e.target.value)} />
            </Field>
            <Field label="Province">
              <input className={inputCls} placeholder="ON"
                value={form.province ?? 'ON'} onChange={e => set('province', e.target.value)} />
            </Field>
          </div>

          {/* Coordinates — side by side */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude" error={errors.lat}>
              <input
                className={inputCls}
                placeholder="42.3044"
                value={form.lat}
                onChange={e => set('lat', e.target.value)}
              />
            </Field>
            <Field label="Longitude" error={errors.lng}>
              <input
                className={inputCls}
                placeholder="-83.0660"
                value={form.lng}
                onChange={e => set('lng', e.target.value)}
              />
            </Field>
          </div>
          <p className="text-[11px] text-slate-400 -mt-3">
            Coordinates place the pin on the map. Leave blank for helplines.
            {/* Future: auto-geocode from Location */}
          </p>

          {/* ── Details ── */}
          <Field label="Description" icon={FileText}>
            <textarea
              className={`${inputCls} resize-none`}
              rows={3}
              placeholder="Describe the services offered..."
              value={form.Description}
              onChange={e => set('Description', e.target.value)}
            />
          </Field>

          <Field label="Inclusivity Notes"
            hint="Specific notes about who is welcomed or how the space is inclusive.">
            <textarea className={`${inputCls} resize-none`} rows={2}
              placeholder="e.g. Free of charge for youth 12-29. Anonymous and confidential."
              value={form.inclusivity_notes} onChange={e => set('inclusivity_notes', e.target.value)} />
          </Field>

          <Field label="Washroom Info"
            hint="Gender-inclusive or accessible washroom availability.">
            <input className={inputCls} placeholder="e.g. Gender-inclusive washroom available."
              value={form.washroom_info} onChange={e => set('washroom_info', e.target.value)} />
          </Field>

          {/* ── Verification status ── */}
          <Field label="Verification Status">
            <select className={inputCls} value={form.verification_status}
              onChange={e => set('verification_status', e.target.value)}>
              {VERIFICATION_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>

          {/* ── PAWS Tags ── */}
          <Field label="PAWS Tags" icon={Tag}
            hint="Select all that apply. 'Verified by PAWS' should only be set after review.">
            <div className="flex flex-wrap gap-2 pt-1">
              {ASSIGNABLE_TAGS.map(tag => {
                const checked = form.tags.includes(tag);
                return (
                  <button key={tag} type="button" onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      checked
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                    }`}>
                    {tag}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400">
            Changes are in-memory only until connected to a backend.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {mode === 'edit' ? 'Save Changes' : 'Add Service'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
