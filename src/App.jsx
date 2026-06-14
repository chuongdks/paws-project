import React from 'react';
import { useServiceDirectory } from './hook/useServiceDirectory.jsx';
import LeafletTestMap from './components/LeafletTestMap.jsx';
import { Search, MapPin, Phone, Globe, ExternalLink, SlidersHorizontal } from 'lucide-react';

export default function App() {
  const {
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    inclusivityFilter,
    setInclusivityFilter,
    filteredServices
  } = useServiceDirectory();

  // Helper calculation to build external Google Map link pointers cleanly
  const buildGoogleMapsLink = (address) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      {/* Structural Top Header Banner */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Community Services Directory</h1>
            <p className="text-sm text-slate-500 mt-0.5">Windsor-Essex 2SLGBTQIA+ local program index and crisis pipelines.</p>
          </div>
          <div className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full self-start md:self-center border border-blue-100">
            Active Records: {filteredServices.length}
          </div>
        </div>
      </header>

      {/* Main Container Control Center Frame */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Filter Selection Panel Widget Block */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-700 font-medium border-b border-slate-100 pb-3">
            <SlidersHorizontal className="h-4 w-4 text-blue-600" />
            <h2>Refine and Filter Listings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Direct Search Text Input element */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Keywords</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by center names, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* 2. Format Operations Category Filtering Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Access Model</label>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                {['All', 'In-Person', 'Virtual/Helpline'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setCategoryFilter(type)}
                    className={`flex-1 text-center py-1.5 text-xs font-medium rounded-md transition-all ${
                      categoryFilter === type ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {type === 'Virtual/Helpline' ? 'Helplines' : type}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Inclusivity Core Focus Filter Parameter Dropdowns */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Demographic / Core Focus</label>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                {['All', 'Youth Focus', 'Senior Focus', 'Family/Ally Focus'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setInclusivityFilter(tag)}
                    className={`flex-1 text-center py-1.5 text-[11px] font-medium rounded-md transition-all whitespace-nowrap ${
                      inclusivityFilter === tag ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tag.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Directory Listing Grid Deck Layout Cards */}
        <section>
          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <article key={service.Name} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-900 text-base leading-tight tracking-tight">{service.Name}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">{service.Description}</p>
                    
                    <div className="space-y-1.5 pt-2 border-t border-slate-50 text-slate-500 text-xs">
                      {service.Location ? (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                          <span className="line-clamp-2">{service.Location}</span>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2 text-purple-600 font-medium">
                          <Globe className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          <span>Provincial/National Digital Pipeline</span>
                        </div>
                      )}
                      
                      {service.Phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{service.Phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Area Row Blocks */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
                    {service.Website ? (
                      <a
                        href={service.Website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        Visit Website
                      </a>
                    ) : (
                      <div />
                    )}

                    {service.Location && (
                      <a
                        href={buildGoogleMapsLink(service.Location)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
                      >
                        <ExternalLink className="h-3 w-3 text-slate-500" />
                        Open Map
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 text-sm">
              No service agencies match your active filtering parameters. Try adjusting your query choices.
            </div>
          )}
        </section>

        {/* Leaflet Sandbox Integration Testing Frame */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Embedded Spatial Map Prototype</h2>
            <p className="text-xs text-slate-500">Live dynamic preview map sandbox powered by Leaflet + OpenStreetMap</p>
          </div>
          <LeafletTestMap services={filteredServices} />
        </section>

      </main>
    </div>
  );
}