import React from 'react';
import { MapPin, Phone, Globe, ExternalLink, Pencil, Trash2, CalendarClock } from 'lucide-react';
import { getCategoryName, fullAddress, buildGoogleMapsLink, hasHours, isOpenNow, isAppointmentOnly } from '../models/Service.js';
import VerificationBadge from './VerificationBadge.jsx';

// ── Sidebar card ───────────────────────────────────────────────────────────────
export default function ServiceCard({ service, isSelected, onClick, onEdit, onDelete, isAdmin }) {
  return (
    <article onClick={onClick}
      className={`rounded-xl border p-4 cursor-pointer transition-all space-y-2.5 group ${
        isSelected
          ? 'border-accent bg-accent-soft/60 ring-2 ring-accent-ring'
          : 'border-divider bg-surface hover:border-divider-strong hover:shadow-sm'
      }`}>

      {/* Name */}
      <h3 className="font-semibold text-primary text-sm leading-snug">
        {service.name}
      </h3>

      {/* Category + verification + Hours of Operation*/}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-semibold text-muted bg-surface-subtle px-2 py-0.5 rounded-full">
          {getCategoryName(service.category_id)}
        </span>
        <VerificationBadge status={service.verification_status} size="sm" />
        {isAppointmentOnly(service) ? (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 text-warning-text bg-warning-soft">
            <CalendarClock className="h-3 w-3" /> By Appointment
          </span>
        ) : hasHours(service) && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            isOpenNow(service) ? 'text-success-text bg-success-soft' : 'text-faint bg-surface-subtle'
          }`}>
            {isOpenNow(service) ? 'Open now' : 'Closed now'}
          </span>
        )}
      </div>

      {/* PAWS tags */}
      {service.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {service.tags.map(tag => (
            <span key={tag.id ?? tag.name} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent-soft text-accent-text border border-accent-border">
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Location or no-fixed-location (helplines, performers, mobile services, etc.) */}
      {fullAddress(service) ? (
        <div className="flex items-start gap-1.5 text-xs text-muted">
          <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-faint" />
          <span className="line-clamp-2 leading-snug">{fullAddress(service)}</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-xs font-medium text-admin-text">
          <Globe className="h-3.5 w-3.5 shrink-0" />
          <span>No Fixed Location</span>
        </div>
      )}

      {/* Phone */}
      {service.phone && (
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <Phone className="h-3.5 w-3.5 shrink-0 text-faint" />
          <span>{service.phone}</span>
        </div>
      )}

      {/* Inclusivity notes */}
      {service.inclusivity_notes && (
        <p className="text-[15px] text-faint italic leading-snug line-clamp-2">
          {service.inclusivity_notes}
        </p>
      )}

      {/* Action row */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-divider-subtle"
        onClick={e => e.stopPropagation()}>
        {/* Links for Direction, Website,... */}
        <div className="flex items-center gap-3">
          {service.website_url && (
            <a href={service.website_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent-text hover:underline">
              <Globe className="h-3 w-3" /> Website
            </a>
          )}
          {fullAddress(service) && (
            <a href={buildGoogleMapsLink(service)} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted hover:text-secondary-strong">
              <ExternalLink className="h-3 w-3" /> Google Map Direction
            </a>
          )}
        </div>
        {/* Admin privilage: Edit Buttons for the Service */}
        {isAdmin && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button onClick={() => onEdit(service)} title="Edit"
              className="p-1.5 rounded-md text-faint hover:text-accent-text hover:bg-accent-soft transition-colors">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => onDelete(service)} title="Delete"
              className="p-1.5 rounded-md text-faint hover:text-danger-text hover:bg-danger-soft transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
