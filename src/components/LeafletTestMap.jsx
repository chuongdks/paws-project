import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const centerOfWindsor = [42.3149, -83.0364];

// Resolves a known issue where leaflet default icons fail to resolve paths inside bundlers like Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});


export default function LeafletTestMap({ services }) {
    // Only render services that have valid coordinates
  const mappableServices = services.filter(s => s.lat != null && s.lng != null);
  
  return (
    <div className="w-full h-96 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
      <MapContainer center={centerOfWindsor} zoom={12} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mappableServices.map((service) => (
          <Marker key={service.Name} position={[service.lat, service.lng]}>
            <Popup>
              <div className="text-gray-900">
                <strong className="block text-sm">{service.Name}</strong>
                <span className="text-xs text-gray-500 block mt-0.5">
                  {service.Phone || 'No phone info'}
                </span>
                <a 
                  href={service.Website} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xs text-blue-600 underline block mt-1"
                >
                  Open Website
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}