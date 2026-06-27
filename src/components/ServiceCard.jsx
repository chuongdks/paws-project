import React from 'react';
import { MapPin, Phone, Globe, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { getCategoryName, fullAddress, buildGoogleMapsLink } from '../models/Service.js';
import VerificationBadge from './VerificationBadge.jsx';

// ── Sidebar card ───────────────────────────────────────────────────────────────
export default function ServiceCard({ service, isSelected, onClick, onEdit, onDelete, isAdmin }) {
  return (
    <article onClick={onClick}
      className={`rounded-xl border p-4 cursor-pointer transition-all space-y-2.5 group ${
        isSelected
          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
      }`}>

      {/* Name */}
      <h3 className="font-semibold text-slate-900 text-sm leading-snug">
        {service.name}
      </h3>

      {/* Category + verification */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
          {getCategoryName(service.category_id)}
        </span>
        <VerificationBadge status={service.verification_status} size="sm" />
      </div>

      {/* PAWS tags */}
      {service.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {service.tags.map(tag => (
            <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Location or helpline */}
      {fullAddress(service) ? (
        <div className="flex items-start gap-1.5 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-slate-400" />
          <span className="line-clamp-2 leading-snug">{fullAddress(service)}</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-xs font-medium text-purple-600">
          <Globe className="h-3.5 w-3.5 shrink-0" />
          <span>Provincial / National Helpline</span>
        </div>
      )}

      {/* Phone */}
      {service.phone && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span>{service.phone}</span>
        </div>
      )}

      {/* Inclusivity notes */}
      {service.inclusivity_notes && (
        <p className="text-[11px] text-slate-400 italic leading-snug line-clamp-2">
          {service.inclusivity_notes}
        </p>
      )}

      {/* Action row */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100"
        onClick={e => e.stopPropagation()}>
        {/* Links for Direction, Website,... */}
        <div className="flex items-center gap-3">
          {service.website_url && (
            <a href={service.website_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
              <Globe className="h-3 w-3" /> Website
            </a>
          )}
          {fullAddress(service) && (
            <a href={buildGoogleMapsLink(service)} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700">
              <ExternalLink className="h-3 w-3" /> Directions
            </a>
          )}
        </div>
        {/* Admin privilage: Edit Buttons for the Service */}
        {isAdmin && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button onClick={() => onEdit(service)} title="Edit"
              className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => onDelete(service)} title="Delete"
              className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
