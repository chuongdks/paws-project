import React, { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

const centerOfWindsor = [42.3149, -83.0364];

// Resolves a known issue where leaflet default icons fail to resolve paths inside bundlers like Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Blue default marker
const defaultIcon = L.icon({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize:    [25, 41],
  iconAnchor:  [12, 41],
  popupAnchor: [1, -34],
  shadowSize:  [41, 41],
});

// Red marker for the selected service
const selectedIcon = L.icon({
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconUrl:       'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize:    [25, 41],
  iconAnchor:  [12, 41],
  popupAnchor: [1, -34],
  shadowSize:  [41, 41],
});

// ── Flies to selectedService and opens its popup  ──────────────────
function MapController({ selectedService, markerRefs }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedService?.lat || !selectedService?.lng) return;
    map.flyTo([selectedService.lat, selectedService.lng], 15, { duration: 0.7 });

    // Open the matching marker popup after the fly animation settles
    const timer = setTimeout(() => {
      markerRefs.current[selectedService.Name]?.openPopup();
    }, 850);

    return () => clearTimeout(timer);
  }, [selectedService]);

  return null;
}

// ── "Near Me" control rendered inside the Leaflet UI layer ────────────────────
function NearMeButton() {
  const map = useMap();

  const handleClick = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => map.flyTo([coords.latitude, coords.longitude], 14, { duration: 1 }),
      () => alert('Location access was denied or unavailable.')
    );
  };

  return (
    <div className="leaflet-top leaflet-right" style={{ marginTop: 80 }}>
      <div className="leaflet-control leaflet-bar">
        <button
          onClick={handleClick}
          title="Fly to my location"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 12px', background: '#fff',
            border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, color: '#1d4ed8',
          }}
        >
          📍 Near Me
        </button>
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
export default function LeafletTestMap({ services, selectedService, onSelectService }) {
  // Only render services that have valid coordinates
  const markerRefs = useRef({});
  const mappableServices = services.filter(s => s.lat != null && s.lng != null);
  
  return (
    // h-full fills whatever height the parent panel gives it
    <div className="w-full h-full">
      <MapContainer center={centerOfWindsor} zoom={12} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController selectedService={selectedService} markerRefs={markerRefs} />
        <NearMeButton />

        {mappableServices.map((service) => {
          const isSelected = selectedService?.Name === service.Name;
          return (
            <Marker
              key={service.Name}
              position={[service.lat, service.lng]}
              icon={isSelected ? selectedIcon : defaultIcon}
              ref={(ref) => { markerRefs.current[service.Name] = ref; }}
              eventHandlers={{ click: () => onSelectService(service) }}
            >
              <Popup>
                <div className="text-gray-900 space-y-1" style={{ minWidth: 180 }}>
                  <strong className="block text-sm leading-tight">{service.Name}</strong>
                  {service.Phone && (
                    <span className="text-xs text-gray-500 block">{service.Phone}</span>
                  )}
                  {service.Location && (
                    <span className="text-xs text-gray-400 block leading-snug">{service.Location}</span>
                  )}
                  {service.Website && (
                    <a
                      href={service.Website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 underline block pt-1"
                    >
                      Open Website ↗
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}