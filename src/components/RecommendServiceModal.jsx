import React, { useState } from 'react';
import { X, MapPin, Globe, Phone, Mail, FileText, Tag, Building2, Clock, User, Loader2, MessageCircleHeart } from 'lucide-react';
import { DAYS_OF_WEEK, defaultHours, formatPhoneInput, isValidPhoneFormat, isValidEmailFormat, isValidLatitude, isValidLongitude } from '../models/Service.js';

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

const emptySuggestion = () => ({
  name: '', category_id: '',
  phone: '', email: '', website_url: '',
  address: '', city: 'Windsor', province: 'ON',
  latitude: '', longitude: '',
  description: '', inclusivity_notes: '', washroom_info: '',
  by_appointment_only: false, hours: defaultHours(),
  tags: [],
  message: '',
  recommender_name: '', recommender_email: '',
});

// ── Main export ────────────────────────────────────────────────────────────────
// currentUser: optional { name, email } 
// pre-fills YOUR NAME section for a logged-in user without forcing them to retype it
// not logged in user can still submit
export default function RecommendServiceModal({ onSave, onClose, categories, tags, currentUser, submitError, submitting }) {
  const [form, setForm]     = useState(() => ({
    ...emptySuggestion(),
    recommender_name: currentUser?.name ?? '',
    recommender_email: currentUser?.email ?? '',
  }));
  const [errors, setErrors] = useState({});

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: null }));
  };

  const toggleTag = (tagId) =>
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tagId) ? f.tags.filter(id => id !== tagId) : [...f.tags, tagId],
    }));

  const setDayHours = (day, patch) =>
    setForm(f => ({ ...f, hours: { ...f.hours, [day]: { ...f.hours[day], ...patch } } }));

  const copyMondayToWeekdays = () => {
    const mon = form.hours.mon;
    setForm(f => ({
      ...f,
      hours: { ...f.hours, tue: { ...mon }, wed: { ...mon }, thu: { ...mon }, fri: { ...mon } },
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())      e.name        = 'Name is required.';
    if (!form.category_id)      e.category_id = 'Category is required.';
    if (form.phone && !isValidPhoneFormat(form.phone)) e.phone = 'Phone must be in XXX-XXX-XXXX format.';
    if (form.email && !isValidEmailFormat(form.email)) e.email = 'Please enter a valid email address.';
    if (form.recommender_email && !isValidEmailFormat(form.recommender_email)) e.recommender_email = 'Please enter a valid email address.';
    if (form.latitude && !isValidLatitude(form.latitude))     e.latitude  = 'Latitude must be a number between -90 and 90.';
    if (form.longitude && !isValidLongitude(form.longitude))  e.longitude = 'Longitude must be a number between -180 and 180.';
    if (form.latitude && !form.longitude) e.longitude = 'Longitude is required when latitude is set.';
    if (form.longitude && !form.latitude) e.latitude  = 'Latitude is required when longitude is set.';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const ok = await onSave({
      ...form,
      latitude:  form.latitude  !== '' && form.latitude  != null ? parseFloat(form.latitude)  : null,
      longitude: form.longitude !== '' && form.longitude != null ? parseFloat(form.longitude) : null,
    });
    if (ok) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget && !submitting) onClose(); }}
    >
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-divider-subtle">
          <div>
            <h2 className="text-base font-bold text-primary">Suggest a Service</h2>
            <p className="text-[11px] text-faint mt-0.5">
              Know a great 2SLGBTQIA+-friendly service? Let us know — an admin will review it before it goes live.
            </p>
          </div>
          <button onClick={onClose} disabled={submitting}
            className="text-faint hover:text-secondary-strong rounded-lg p-1 hover:bg-surface-subtle transition-colors shrink-0 disabled:opacity-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          <Field label="Service Name *" error={errors.name}>
            <input className={inputCls} placeholder="e.g. Campus Pride Centre"
              value={form.name} onChange={e => set('name', e.target.value)} />
          </Field>

          <Field label="Category *" icon={Building2} error={errors.category_id}>
            <select className={inputCls} value={form.category_id}
              onChange={e => set('category_id', e.target.value)}>
              <option value="">Select a category...</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone" icon={Phone} error={errors.phone}>
              <input className={inputCls} placeholder="519-000-0000" type="tel" inputMode="numeric" maxLength={12}
                value={form.phone} onChange={e => set('phone', formatPhoneInput(e.target.value))} />
            </Field>
            <Field label="Email" icon={Mail} error={errors.email}>
              <input className={inputCls} placeholder="info@example.org" type="email"
                value={form.email} onChange={e => set('email', e.target.value)} />
            </Field>
          </div>

          <Field label="Website" icon={Globe}>
            <input className={inputCls} placeholder="https://example.org"
              value={form.website_url} onChange={e => set('website_url', e.target.value)} />
          </Field>

          <Field label="Street Address" icon={MapPin}
            hint="Leave blank for provincial / national helplines / performers artist.">
            <input className={inputCls} placeholder="123 Main Street"
              value={form.address} onChange={e => set('address', e.target.value)} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="City">
              <input className={inputCls} placeholder="Windsor"
                value={form.city} onChange={e => set('city', e.target.value)} />
            </Field>
            <Field label="Province">
              <input className={inputCls} placeholder="ON"
                value={form.province} onChange={e => set('province', e.target.value)} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude" error={errors.latitude}>
              <input className={inputCls} placeholder="42.3044"
                value={form.latitude} onChange={e => set('latitude', e.target.value)} />
            </Field>
            <Field label="Longitude" error={errors.longitude}>
              <input className={inputCls} placeholder="-83.0660"
                value={form.longitude} onChange={e => set('longitude', e.target.value)} />
            </Field>
          </div>

          <div className="space-y-1 bg-slate-50 border border-slate-100 rounded-lg p-3">
            <p className="text-[11px] font-medium text-slate-500">
              Leave blank for provincial / national helplines / performers artist.
            </p>
            <p className="text-[11px] font-medium text-slate-500">You can find Latitude/Longitude by:</p>
            <ul className="list-disc list-outside ml-4 text-left text-[11px] text-slate-400 space-y-1">
              <li>Searching the location on Google Maps</li>
              <li>Right-clicking the map's red marker pin</li>
              <li>Clicking the coordinates shown at the top of the menu to copy them</li>
            </ul>
          </div>

          <Field label="Description" icon={FileText}>
            <textarea className={`${inputCls} resize-none`} rows={3}
              placeholder="Describe the services offered..."
              value={form.description} onChange={e => set('description', e.target.value)} />
          </Field>

          <Field label="Inclusivity Notes" hint="Who is welcomed, or how the space is inclusive.">
            <textarea className={`${inputCls} resize-none`} rows={2}
              placeholder="e.g. Free of charge for youth 12-29. Anonymous and confidential."
              value={form.inclusivity_notes} onChange={e => set('inclusivity_notes', e.target.value)} />
          </Field>

          <Field label="Washroom Info" hint="Gender-inclusive or accessible washroom availability.">
            <input className={inputCls} placeholder="e.g. Gender-inclusive washroom available."
              value={form.washroom_info} onChange={e => set('washroom_info', e.target.value)} />
          </Field>

          <Field label="Hours of Operation" icon={Clock}
            hint={form.by_appointment_only ? null : "Leave times blank if not applicable."}>
            <label className="flex items-center gap-2 text-sm text-secondary pb-2">
              <input type="checkbox" checked={form.by_appointment_only}
                onChange={e => {
                  const checked = e.target.checked;
                  setForm(f => ({ ...f, by_appointment_only: checked, hours: checked ? defaultHours() : f.hours }));
                }}
                className="rounded border-divider-strong text-accent focus:ring-focus-ring/30" />
              This service is by appointment only (no fixed public hours)
            </label>

            {!form.by_appointment_only && (
              <>
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
              </>
            )}
          </Field>

          <Field label="Tags" icon={Tag} hint="Select any that apply.">
            <div className="flex flex-wrap gap-2 pt-1">
              {tags.map(tag => {
                const checked = form.tags.includes(tag.id);
                return (
                  <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      checked
                        ? 'bg-accent text-white border-accent'
                        : 'bg-surface-raised text-secondary border-divider hover:border-divider-strong'
                    }`}>
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Why do you recommend this?" icon={MessageCircleHeart} hint="Optional — helps our admins review faster.">
            <textarea className={`${inputCls} resize-none`} rows={2}
              placeholder="Tell us a bit about your experience..."
              value={form.message} onChange={e => set('message', e.target.value)} />
          </Field>

          {/* Your info — optional, only really needed so we can follow up on anonymous submissions */}
          <div className="space-y-3 pt-3 border-t border-divider-subtle">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-muted uppercase tracking-wider">
              <User className="h-3.5 w-3.5" /> Your Info (optional)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Your Name">
                <input className={inputCls} placeholder="Jordan"
                  value={form.recommender_name} onChange={e => set('recommender_name', e.target.value)} />
              </Field>
              <Field label="Your Email" error={errors.recommender_email}>
                <input className={inputCls} placeholder="you@example.com" type="email"
                  value={form.recommender_email} onChange={e => set('recommender_email', e.target.value)} />
              </Field>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-divider-subtle space-y-2">
          {submitError && <p className="text-xs text-danger-text">{submitError}</p>}
          <div className="flex gap-2">
            <button onClick={onClose} disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-secondary hover:bg-surface-subtle rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? 'Submitting…' : 'Submit Suggestion'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
