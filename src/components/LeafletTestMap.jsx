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

// Coordinate mappings for spatial entries
const geoMap = {
  "Campus Pride Centre": [42.3044, -83.0660],
  "Five Fourteen": [42.2858, -83.0722],
  "Metropolitan Community Church": [42.3115, -82.9992],
  "OK2BME Counselling": [42.3013, -83.0132],
  "Pozitive Pathways": [42.3141, -83.0396],
  "QConnect Plus": [42.3175, -82.9984],
  "Qlink Windsor-Essex": [42.3175, -82.9984],
  "Qlink Youth Drop In": [42.3175, -82.9984],
  "Run For Rocky": [42.2341, -83.0078],
  "Transwellness Ontario": [42.3041, -83.0089],
  "Windsor-Essex Pride Fest": [42.3175, -82.9984],
  "Windsor Pride Community": [42.3013, -83.0132],
  "Windsor Youth Centre GSA": [42.3170, -83.0195]
};

export default function LeafletTestMap({ services }) {
  return (
    <div className="w-full h-96 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
      <MapContainer center={centerOfWindsor} zoom={12} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {services.map((service) => {
          const position = geoMap[service.Name];
          if (!position) return null; // Exclude virtual helplines with no coordinate entries

          return (
            <Marker key={service.Name} position={position}>
              <Popup>
                <div className="text-gray-900">
                  <strong className="block text-sm">{service.Name}</strong>
                  <span className="text-xs text-gray-500 block mt-0.5">{service.Phone || "No Phone Info"}</span>
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
          );
        })}
      </MapContainer>
    </div>
  );
}