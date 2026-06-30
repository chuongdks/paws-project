import React from 'react';
import { MapPin } from 'lucide-react';
import ServiceCard from './ServiceCard.jsx';

export default function Sidebar({
  filteredServices, selectedService, onSelectService,
  onEdit, onDelete, isAdmin,
  cardRefs, scrollContainerRef,
  onClearFilters,
}) {
  return (
    <aside className="w-full h-full shrink-0 flex flex-col border-r border-slate-200 bg-slate-50 overflow-hidden">

      {/* Card list */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredServices.length > 0 ? (
          filteredServices.map(service => (
            <div key={service.id} ref={el => { cardRefs.current[service.id] = el; }}>
              <ServiceCard
                service={service}
                isSelected={selectedService?.id === service.id}
                onClick={() => onSelectService(service)}
                onEdit={onEdit}
                onDelete={onDelete}
                isAdmin={isAdmin}
              />
            </div>
          ))
        ) : (
          /* Spans the empty message across all available columns when no filters match */
          <div className="text-center text-slate-400 text-sm py-12">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-slate-300" />
            No services match your filters.
            <br />
            <button onClick={onClearFilters}
              className="mt-2 text-blue-600 text-xs underline">
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
