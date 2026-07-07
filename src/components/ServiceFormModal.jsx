import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Globe, Phone, Mail, FileText, Tag, Building2, Image as ImageIcon, Clock, Loader2 } from 'lucide-react';
import { CATEGORIES, ASSIGNABLE_TAGS, DAYS_OF_WEEK, emptyService } from '../models/Service.js';

const VERIFICATION_OPTIONS = ['needs verification', 'verified', 'rejected', 'archived'];

function Field({ label, icon: Icon, hint, error, children }) {
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-secondary uppercase tracking-wider">
        {Icon && <Icon className="h-3.5 w-3.5" />} {label}
      </label>
      {children}
      {hint  && <p className="text-[11px] text-faint">{hint}</p>}
      {error && <p className="text-xs text-danger-text">{error}</p>}
    </div>
  );
}

const inputCls = `w-full bg-surface-muted border border-divider rounded-lg px-3 py-2
  text-sm text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring/20
  focus:border-focus-ring transition-all`;

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

  const toggleTag = (tag) =>
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
    }));

  // Patches a single day's hours, e.g. setDayHours('mon', { open: '09:00' })
  const setDayHours = (day, patch) =>
    setForm(f => ({ ...f, hours: { ...f.hours, [day]: { ...f.hours[day], ...patch } } }));

  // Convenience: most listings share the same weekday hours, so let Monday fill Tue–Fri
  const copyMondayToWeekdays = () => {
    const mon = form.hours.mon;
    setForm(f => ({
      ...f,
      hours: { ...f.hours, tue: { ...mon }, wed: { ...mon }, thu: { ...mon }, fri: { ...mon } },
    }));
  };

  const fileInputRef = useRef(null);
  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set('image_url', reader.result);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())                          e.name        = 'Name is required.';
    if (!form.category_id)                          e.category_id = 'Category is required.';
    if (form.latitude  && isNaN(parseFloat(form.latitude)))   e.latitude  = 'Must be a valid number.';
    if (form.longitude  && isNaN(parseFloat(form.longitude)))   e.longitude  = 'Must be a valid number.';
    if (form.latitude && !form.longitude)                      e.longitude = 'Longitude is required when latitude is set.';
    if (form.longitude && !form.latitude)                      e.latitude = 'Latitude is required when longitude is set.';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({
      ...form,
      category_id: Number(form.category_id),
      latitude: form.latitude !== '' && form.latitude != null ? parseFloat(form.latitude) : null,
      longitude: form.longitude !== '' && form.longitude != null ? parseFloat(form.longitude) : null,
    });
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal panel */}
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-divider-subtle">
          <h2 className="text-base font-bold text-primary">
            {mode === 'edit' ? 'Edit Service' : 'Add New Service'}
          </h2>
          <button onClick={onClose}
            className="text-faint hover:text-secondary-strong rounded-lg p-1 hover:bg-surface-subtle transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* ── Basic info ── */}
          <Field label="Photo" icon={ImageIcon} hint="Optional. Stored in-memory only for now.">
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 rounded-lg bg-surface-subtle overflow-hidden border border-divider shrink-0 flex items-center justify-center">
                {form.image_url ? (
                  <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-disabled" />
                )}
              </div>
              <label className="cursor-pointer text-xs font-semibold text-accent-text hover:underline">
                {form.image_url ? 'Change photo' : 'Upload photo'}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
              </label>
            </div>
          </Field>

          <Field label="Name *" error={errors.name}>
            <input className={inputCls} placeholder="e.g. Campus Pride Centre"
              value={form.name} onChange={e => set('name', e.target.value)} />
          </Field>

          <Field label="Category *" icon={Building2} error={errors.category_id}>
            <select className={inputCls} value={form.category_id ?? ''}
              onChange={e => set('category_id', e.target.value)}>
              <option value="">Select a category...</option>
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>

          {/* ── Contact ── */}
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

          <Field label="Website" icon={Globe}>
            <input className={inputCls} placeholder="https://example.org"
              value={form.website_url} onChange={e => set('website_url', e.target.value)} />
          </Field>

          {/* ── Location ── */}
          <Field label="Street Address" icon={MapPin}
            hint="Leave blank for provincial / national helplines / performers artist.">
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
            <Field label="Latitude" error={errors.latitude}>
              <input className={inputCls} placeholder="42.3044"
                value={form.latitude ?? ''} onChange={e => set('latitude', e.target.value)} />
            </Field>
            <Field label="Longitude" error={errors.longitude}>
              <input className={inputCls} placeholder="-83.0660"
                value={form.longitude ?? ''} onChange={e => set('longitude', e.target.value)} />
            </Field>
          </div>
          
          <div className="space-y-1 bg-slate-50 border border-slate-100 rounded-lg p-3">
            <p className="text-[11px] font-medium text-slate-500">
              Leave blank for  provincial / national helplines / performers artist
            </p>
            <p className="text-[11px] font-medium text-slate-500">
               You can find your Latitude and Longitude by:
            </p>
            <ul className="list-disc list-outside ml-4 text-left text-[11px] text-slate-400 space-y-1">
              <li>Searching your location on Google Maps</li>
              <li>Right-clicking on the map's red marker pin</li>
              <li>Clicking the coordinates shown at the top of the menu to copy them</li>
            </ul>
          </div>

          {/* ── Details ── */}
          <Field label="Description" icon={FileText}>
            <textarea className={`${inputCls} resize-none`} rows={3}
              placeholder="Describe the services offered..."
              value={form.description} onChange={e => set('description', e.target.value)} />
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

          {/* ── Hours of Operation ── */}
          <Field label="Hours of Operation" icon={Clock}
            hint="Leave times blank if not applicable. Checking 'Closed' will mark the entire day as unavailable.">
            <div className="space-y-1.5">
              {DAYS_OF_WEEK.map(({ key, short }) => {
                const day = form.hours[key];
                return (
                  <div key={key} className="flex items-center gap-2">
                    <span className="w-8 text-xs font-semibold text-muted shrink-0">{short}</span>

                    <label className="flex items-center gap-1.5 text-xs text-muted shrink-0 w-16">
                      <input type="checkbox" checked={day.closed}
                        onChange={e => setDayHours(key, { closed: e.target.checked })}
                        className="rounded border-divider-strong text-accent focus:ring-focus-ring/30" />
                      Closed
                    </label>

                    {day.closed ? (
                      <span className="flex-1 text-xs text-disabled italic">—</span>
                    ) : (
                      <>
                        <input type="time" value={day.open}
                          onChange={e => setDayHours(key, { open: e.target.value })}
                          className={`${inputCls} py-1.5 flex-1`} />
                        <span className="text-disabled text-xs shrink-0">–</span>
                        <input type="time" value={day.close}
                          onChange={e => setDayHours(key, { close: e.target.value })}
                          className={`${inputCls} py-1.5 flex-1`} />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            <button type="button" onClick={copyMondayToWeekdays}
              className="text-[11px] font-semibold text-accent-text hover:underline pt-0.5">
              Copy Monday's hours to Tue–Fri
            </button>
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
                        ? 'bg-accent text-white border-accent'
                        : 'bg-surface-raised text-secondary border-divider hover:border-divider-strong'
                    }`}>
                    {tag}
                  </button>
                );
              })}
            </div>
          </Field>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-divider-subtle space-y-2">
            <p className="text-[11px] text-faint">
              Changes are in-memory only until connected to the backend API. NOOR PLZ ADD BACK END SOON
            </p>
            <div className="flex gap-2">
              <button onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-secondary hover:bg-surface-subtle rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Cancel
              </button>
              <button onClick={handleSubmit}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                {mode === 'edit' ? 'Save Changes' : 'Add Service'}
              </button>
          </div>
        </div>

      </div>
    </div>
  );
}

