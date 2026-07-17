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
  recommendationStatusFilter = 'new', onChangeRecommendationStatusFilter,
  pendingRecommendationCount = 0,
  onSelectRecommendation,
  onStartReviewRecommendation, onApproveRecommendation, onRejectRecommendation, onDeleteRecommendation,
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
            {pendingRecommendationCount > 0 && (
              <span className="text-[10px] font-bold bg-warning-soft text-warning-text px-1.5 py-0.5 rounded-full">
                {pendingRecommendationCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Status filter — only shown while browsing Suggestions */}
      {isAdmin && activeTab === 'suggestions' && (
        <div className="px-3 pt-3 shrink-0">
          <select
            value={recommendationStatusFilter}
            onChange={e => onChangeRecommendationStatusFilter?.(e.target.value)}
            className="w-full bg-surface-muted border border-divider rounded-lg px-3 py-1.5 text-xs font-medium text-secondary focus:outline-none focus:ring-2 focus:ring-focus-ring/20 focus:border-focus-ring transition-all"
          >
            <option value="new">New</option>
            <option value="reviewing">Reviewing</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
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
                onSelect={onSelectRecommendation}
                onStartReview={onStartReviewRecommendation}
                onApprove={onApproveRecommendation}
                onReject={onRejectRecommendation}
                onDelete={onDeleteRecommendation}
              />
            ))
          ) : (
            <div className="text-center text-faint text-sm py-12">
              <Inbox className="h-8 w-8 mx-auto mb-2 text-disabled" />
              {recommendationStatusFilter === 'new'
                ? 'No pending suggestions right now.'
                : `No ${recommendationStatusFilter} suggestions.`}
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
