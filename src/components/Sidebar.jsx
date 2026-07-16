import React, { useState } from 'react';
import { MapPin, ListChecks, Inbox } from 'lucide-react';
import ServiceCard from './ServiceCard.jsx';
import RecommendationCard from './RecommendationCard.jsx';

export default function Sidebar({
  filteredServices, selectedService, onSelectService,
  onEdit, onDelete, isAdmin,
  cardRefs, scrollContainerRef,
  onClearFilters,
  // Admin-only "Suggestions" tab
  recommendations = [], recommendationsLoading = false, recommendationActioningId = null,
  onApproveRecommendation, onRejectRecommendation, onDeleteRecommendation,
}) {
  const [activeTab, setActiveTab] = useState('services'); // 'services' | 'suggestions'

  return (
    <aside className="w-full h-full shrink-0 flex flex-col border-r border-divider-page bg-app-bg overflow-hidden">

      {/* Tab switcher — only admins have anything to moderate here */}
      {isAdmin && (
        <div className="flex bg-surface-subtle p-1 m-3 mb-0 rounded-lg shrink-0">
          <button onClick={() => setActiveTab('services')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'services' ? 'bg-surface-raised text-primary shadow-sm' : 'text-muted hover:text-secondary-strong'
            }`}>
            <ListChecks className="h-3.5 w-3.5" /> Services
          </button>
          <button onClick={() => setActiveTab('suggestions')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'suggestions' ? 'bg-surface-raised text-primary shadow-sm' : 'text-muted hover:text-secondary-strong'
            }`}>
            <Inbox className="h-3.5 w-3.5" /> Suggestions
            {recommendations.length > 0 && (
              <span className="text-[10px] font-bold bg-warning-soft text-warning-text px-1.5 py-0.5 rounded-full">
                {recommendations.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Card list */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {activeTab === 'suggestions' && isAdmin ? (
          recommendationsLoading ? (
            <p className="text-center text-faint text-sm py-12">Loading suggestions…</p>
          ) : recommendations.length > 0 ? (
            recommendations.map(rec => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                busy={recommendationActioningId === rec.id}
                onApprove={onApproveRecommendation}
                onReject={onRejectRecommendation}
                onDelete={onDeleteRecommendation}
              />
            ))
          ) : (
            <div className="text-center text-faint text-sm py-12">
              <Inbox className="h-8 w-8 mx-auto mb-2 text-disabled" />
              No pending suggestions right now.
            </div>
          )
        ) : filteredServices.length > 0 ? (
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
          <div className="text-center text-faint text-sm py-12">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-disabled" />
            No services match your filters.
            <br />
            <button onClick={onClearFilters}
              className="mt-2 text-accent-text text-xs underline">
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
