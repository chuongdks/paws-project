import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Globe, Phone, Mail, FileText, Tag, Building2, Image as ImageIcon, Clock, Loader2 } from 'lucide-react';
import { DAYS_OF_WEEK, emptyService, defaultHours, formatPhoneInput, isValidPhoneFormat, isValidEmailFormat, isValidLatitude, isValidLongitude } from '../models/Service.js';
import { useModalA11y } from '../hook/useModalA11y.js';
// import api from '../api/axiosConfig.js'; // no longer needed now that photos are pasted-in URLs, not uploaded files

const VERIFICATION_OPTIONS = ['needs verification', 'verified', 'rejected', 'archived'];

// ── Photo handling switched from local file upload to a pasted image URL ───────
// Reason: hosting costs scale with stored images once the directory grows
// Store url link to the image instead

// Mirrors the backend's own checks in upload-image.php 
// const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
// const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ── Field length limits ─────────────────────────────────────────────────────
// Character-only fields (single-line inputs) use LIMITS + the native
// maxLength attribute. Free-text fields use WORD_LIMITS as the primary rule,
// but also carry a CHAR_LIMITS ceiling
const LIMITS = {
  name:    50,   // characters
  address: 100,  // characters
};

const WORD_LIMITS = {
  description:       100,
  inclusivity_notes: 60,
  washroom_info:     40,
};

const CHAR_LIMITS = {
  description:       750,  // ~100 words at a generous average word length
  inclusivity_notes: 450,
  washroom_info:     300,
};

// Counts words (whitespace-separated, ignoring empty strings)
const countWords = (text) => (text?.trim() ? text.trim().split(/\s+/).length : 0);

// Enforces both a hard character ceiling and a word-count ceiling, called on
// every keystroke so it's impossible to type past either limit.
const limitText = (text, maxWords, maxChars) => {
  // 1. Hard character cap first — closes the "one giant word" loophole
  //    regardless of how the word-splitting below behaves.
  let clipped = text.length > maxChars ? text.slice(0, maxChars) : text;

  // 2. Word cap — rebuild by re-joining only the first maxWords non-empty
  //    words, preserving trailing whitespace so typing doesn't feel jumpy.
  if (countWords(clipped) > maxWords) {
    const words = clipped.split(/\s+/);
    let count = 0;
    let result = '';
    for (const w of words) {
      if (w === '') { result += ' '; continue; }
      count += 1;
      if (count > maxWords) break;
      result += (result && !result.endsWith(' ') ? ' ' : '') + w;
    }
    clipped = result;
  }

  return clipped;
};

// simple image url checker
const isLikelyImageUrl = (url) => /^https?:\/\/.+/i.test(url.trim());

function Field({ label, icon: Icon, hint, error, required, children }) {
  // Auto-derive a stable id from the label text 
  const fieldId = 'field-' + label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const hintId  = hint  ? `${fieldId}-hint`  : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  // Only clone onto a single, real element child (the common case: one
  // <input>/<select>/<textarea>). Fields with multiple/complex children
  // (Hours of Operation, Tags, Photo) are not touched
  const child = React.isValidElement(children)
    ? React.cloneElement(children, {
        id: children.props.id ?? fieldId,
        'aria-describedby': children.props['aria-describedby'] ?? describedBy,
      })
    : children;

  return (
    <div className="space-y-1">
      <label htmlFor={fieldId} className="flex items-center gap-1.5 text-xs font-semibold text-secondary uppercase tracking-wider">
        {Icon && <Icon className="h-3.5 w-3.5" />} {label}
        {required && <span className="text-danger-text font-bold text-base leading-none">*</span>}
      </label>
      {child}
      {hint  && <p id={hintId} className="text-[11px] text-faint">{hint}</p>}
      {error && <p id={errorId} className="text-xs text-danger-text">{error}</p>}
    </div>
  );
}

const inputCls = `w-full bg-surface-muted border border-divider rounded-lg px-3 py-2
  text-sm text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring/20
  focus:border-focus-ring transition-all`;

export default function ServiceFormModal({ mode, initial, onSave, onClose, categories, tags, isAdmin, saveError, saving }) {
  const [form, setForm]     = useState(emptyService());
  const [errors, setErrors] = useState({});
  const initialSnapshotRef  = useRef(JSON.stringify(emptyService()));

  // ── Honeypot ─────────────────────────────────────────────────────────────
  // A decoy field, invisible to real people, that only a bot filling in every input it finds would ever populate. 
  const [hpWebsite, setHpWebsite] = useState('');

  // Populate form when editing an existing service. `initial.tags` comes in as [{ id, name }] (see Service.js normalizeTags)
  //  the form itself works with plain tag ids, so convert here. Legacy/offline tags with no real id (id:null) get matched up by name against the live `tags` list as a bridge.
  useEffect(() => {
    let seeded;
    if (initial) {
      const tagIds = (initial.tags ?? [])
        .map(t => t.id ?? tags.find(live => live.name === t.name)?.id ?? null)
        .filter(id => id != null);
      seeded = { ...emptyService(), ...initial, tags: tagIds };
    } else {
      seeded = emptyService();
    }
    setForm(seeded);
    initialSnapshotRef.current = JSON.stringify(seeded); // baseline for the dirty-check below
    setErrors({});
    setImagePreviewFailed(false);
  }, [initial, tags]);

  // True once the form differs from whatever it was seeded with 
  const isDirty = JSON.stringify(form) !== initialSnapshotRef.current;
  const panelRef = useModalA11y(onClose, true, !isDirty);

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: null }));
  };

  // Same as `set`, but clamps free-text fields to their word + character limits as the person types
  const setWordLimited = (field, value) => set(field, limitText(value, WORD_LIMITS[field], CHAR_LIMITS[field]));

  // form.tags is an array of tag ids
  const toggleTag = (tagId) =>
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tagId) ? f.tags.filter(id => id !== tagId) : [...f.tags, tagId],
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

  // ── Photo URL state ──────────────────────────────────────────────────────
  const [imageUrlError, setImageUrlError] = useState(null);
  const [imagePreviewFailed, setImagePreviewFailed] = useState(false);

  const handleImageUrlChange = (value) => {
    set('image_url', value);
    setImagePreviewFailed(false);
    if (value.trim() && !isLikelyImageUrl(value)) {
      setImageUrlError('Please enter a valid http(s) URL.');
    } else {
      setImageUrlError(null);
    }
  };

  // ── OLD: local file upload (commented out — kept for reference / rollback) ──
  // const fileInputRef = useRef(null);
  // const [uploadingImage, setUploadingImage] = useState(false);
  // const [imageError, setImageError] = useState(null);
  //
  // const handleImageFile = async (e) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;
  //   setImageError(null);
  //
  //   // Same checks the backend enforces (see upload-image.php) — catches the
  //   // obvious cases instantly instead of waiting on a failed round trip.
  //   if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
  //     setImageError('Only JPG, PNG, and WebP images are allowed.');
  //     e.target.value = '';
  //     return;
  //   }
  //   if (file.size > MAX_IMAGE_BYTES) {
  //     setImageError('Image must be 5 MB or smaller.');
  //     e.target.value = '';
  //     return;
  //   }
  //
  //   setUploadingImage(true);
  //   try {
  //     const body = new FormData();
  //     body.append('image', file);
  //     // NOTE: don't set a Content-Type header here
  //     const response = await api.post('/upload-image.php', body, {
  //       headers: { 'Content-Type': 'multipart/form-data' },
  //     });
  //     const json = response.data;
  //     if (!json.success) throw new Error(json.message || 'Upload failed.');
  //     set('image_url', json.data.image_url);
  //   } catch (err) {
  //     console.error('Failed to upload image:', err);
  //     setImageError(err.response?.data?.message || err.message || 'Could not upload image — please try again.');
  //   } finally {
  //     setUploadingImage(false);
  //     e.target.value = ''; // lets the same file be re-selected later if needed
  //   }
  // };

  const validate = () => {
    const e = {};
    if (!form.name.trim())                          e.name        = 'Name is required.';
    if (!form.category_id)                          e.category_id = 'Category is required.';
    if (form.phone && !isValidPhoneFormat(form.phone)) e.phone     = 'Phone must be in XXX-XXX-XXXX format.';
    if (form.email && !isValidEmailFormat(form.email)) e.email     = 'Please enter a valid email address.';
    if (form.latitude  && !isValidLatitude(form.latitude))    e.latitude  = 'Latitude must be a number between -90 and 90.';
    if (form.longitude && !isValidLongitude(form.longitude))  e.longitude = 'Longitude must be a number between -180 and 180.';
    if (form.latitude && !form.longitude)                      e.longitude = 'Longitude is required when latitude is set.';
    if (form.longitude && !form.latitude)                      e.latitude = 'Latitude is required when longitude is set.';
    if (form.image_url && !isLikelyImageUrl(form.image_url))  e.image_url = 'Please enter a valid http(s) URL.';
    return e;
  };

  const handleSubmit = () => {
    // Bot check first, before touching real validation or the network.
    if (hpWebsite.trim() !== '') {
      onClose();
      return;
    }

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
      onMouseDown={e => { if (e.target === e.currentTarget && !isDirty) onClose(); }} // prevent accidental closing if clicking outside the modal
    >
      {/* Modal panel */}
      <div ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="service-form-title"
        className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden outline-none">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-divider-subtle">
          <h2 id="service-form-title" className="text-base font-bold text-primary">
            {mode === 'edit' ? 'Edit Service' : 'Add New Service'}
          </h2>
          <button onClick={onClose}
            className="text-faint hover:text-secondary-strong rounded-lg p-1 hover:bg-surface-subtle transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Honeypot Trap
            Positioned off-screen (not display:none/visibility:hidden, which some bots specifically know to skip) */}
          <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
            <label htmlFor="svc-hp-website">Leave this field blank</label>
            <input
              id="svc-hp-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={hpWebsite}
              onChange={e => setHpWebsite(e.target.value)}
            />
          </div>

          {/* ── Basic info ── */}
          {/* ── Photo URL field ── */}
          <Field label="Photo URL" icon={ImageIcon}
            hint="Optional. Paste a link to an image already hosted somewhere (e.g. Imgur, Google Drive share link, your own website)."
            error={imageUrlError || (imagePreviewFailed ? 'Could not load an image from that URL.' : null) || errors.image_url}>
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 rounded-lg bg-surface-subtle overflow-hidden border border-divider shrink-0 flex items-center justify-center">
                {form.image_url && !imagePreviewFailed ? (
                  <img src={form.image_url} alt="" className="w-full h-full object-cover"
                    onError={() => setImagePreviewFailed(true)} />
                ) : (
                  <ImageIcon className="h-6 w-6 text-disabled" />
                )}
              </div>
              <input className={inputCls} placeholder="https://example.com/photo.jpg"
                value={form.image_url ?? ''}
                onChange={e => handleImageUrlChange(e.target.value)} />
            </div>
          </Field>

          {/* ── OLD: local file upload field (commented out — kept for reference / rollback) ──
          <Field label="Photo" icon={ImageIcon}
            hint={uploadingImage ? null : 'Optional. JPG, PNG, or WebP — up to 5 MB.'}
            error={imageError}>
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 rounded-lg bg-surface-subtle overflow-hidden border border-divider shrink-0 flex items-center justify-center">
                {uploadingImage ? (
                  <Loader2 className="h-5 w-5 text-faint animate-spin" />
                ) : form.image_url ? (
                  <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-disabled" />
                )}
              </div>
              <label className={`text-xs font-semibold text-accent-text ${uploadingImage ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:underline'}`}>
                {uploadingImage ? 'Uploading…' : form.image_url ? 'Change photo' : 'Upload photo'}
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                  className="hidden" disabled={uploadingImage} onChange={handleImageFile} />
              </label>
            </div>
          </Field>
          */}

          <Field label="Name" required error={errors.name}
            hint={`${form.name.length}/${LIMITS.name} characters`}>
            <input className={inputCls} placeholder="e.g. Campus Pride Centre"
              maxLength={LIMITS.name}
              value={form.name} onChange={e => set('name', e.target.value)} />
          </Field>

          <Field label="Category" required icon={Building2} error={errors.category_id}>
            <select className={inputCls} value={form.category_id ?? ''}
              onChange={e => set('category_id', e.target.value)}>
              <option value="">Select a category...</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>

          {/* ── Contact ── */}
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

          {/* ── Location ── */}
          <Field label="Street Address" icon={MapPin} error={errors.address}
            hint={`Leave blank for provincial / national helplines / performers artist. (${(form.address ?? '').length}/${LIMITS.address} characters)`}>
            <input className={inputCls} placeholder="123 Main Street"
              maxLength={LIMITS.address}
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
          <Field label="Description (Optional)" icon={FileText}
            hint={`${countWords(form.description)}/${WORD_LIMITS.description} words · ${form.description.length}/${CHAR_LIMITS.description} characters`}>
            <textarea className={`${inputCls} resize-none`} rows={3}
              placeholder="Describe the services offered..."
              value={form.description} onChange={e => setWordLimited('description', e.target.value)} />
          </Field>

          <Field label="Inclusivity Notes (Optional)"
            hint={`Specific notes about who is welcomed or how the space is inclusive. (${countWords(form.inclusivity_notes)}/${WORD_LIMITS.inclusivity_notes} words · ${form.inclusivity_notes.length}/${CHAR_LIMITS.inclusivity_notes} characters)`}>
            <textarea className={`${inputCls} resize-none`} rows={2}
              placeholder="e.g. Free of charge for youth 12-29. Anonymous and confidential."
              value={form.inclusivity_notes} onChange={e => setWordLimited('inclusivity_notes', e.target.value)} />
          </Field>

          <Field label="Washroom Info (Optional)"
            hint={`Gender-inclusive or accessible washroom availability. (${countWords(form.washroom_info)}/${WORD_LIMITS.washroom_info} words · ${form.washroom_info.length}/${CHAR_LIMITS.washroom_info} characters)`}>
            <input className={inputCls} placeholder="e.g. Gender-inclusive washroom available."
              value={form.washroom_info} onChange={e => setWordLimited('washroom_info', e.target.value)} />
          </Field>

          {/* ── Hours of Operation ── */}
          <Field label="Hours of Operation" icon={Clock}
            hint={form.by_appointment_only ? null : "Leave times blank if not applicable. Checking 'Closed' will mark the entire day as unavailable."}>
            <label className="flex items-center gap-2 text-sm text-secondary pb-2">
              <input type="checkbox" checked={form.by_appointment_only}
                onChange={e => {
                  const checked = e.target.checked;
                  // clear hours if the 'by_appointment_only' option is checked
                  setForm(f => ({
                    ...f,
                    by_appointment_only: checked,
                    hours: checked ? defaultHours() : f.hours,
                  }));
                }}
                className="rounded border-divider-strong text-accent focus:ring-focus-ring/30" />
              This service is by appointment only (no fixed public hours)
            </label>

            {form.by_appointment_only ? (
              <p className="text-xs text-faint italic">
                Hours are hidden since this service is marked appointment-only.
              </p>
            ) : (
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

          {/* ── Verification status ── */}
          {/* Only admins can set verification status, and only when editing —
              new services always start as 'needs verification' server-side. */}
          {mode === 'edit' && isAdmin && (
            <Field label="Verification Status">
              <select className={inputCls} value={form.verification_status}
                onChange={e => set('verification_status', e.target.value)}>
                {VERIFICATION_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
          )}

          {/* ── PAWS Tags ── */}
          <Field label="PAWS Tags" icon={Tag}
            hint="Select all that apply. 'Verified by PAWS' should only be set after review.">
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

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-divider-subtle space-y-2">
            {saveError && <p className="text-xs text-danger-text">{saveError}</p>}
            <div className="flex gap-2">
              <button onClick={onClose} disabled={saving}
                className="px-4 py-2 text-sm font-medium text-secondary hover:bg-surface-subtle rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Add Service'}
              </button>
          </div>
        </div>

      </div>
    </div>
  );
}
