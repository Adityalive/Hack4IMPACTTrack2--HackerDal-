// ─── HelpMap.jsx ──────────────────────────────────────────────────────────────
// Leaflet.js map showing nearest cyber crime police stations in Odisha
// Install: npm install leaflet react-leaflet
// ──────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { HELP_LOCATIONS, MARKER_COLORS } from '../data/mockHelpLocations';

// Fix Leaflet default icon broken in Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom colored markers
const makeIcon = (color) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      background:${color};border:3px solid white;
      transform:rotate(-45deg);
      box-shadow:0 2px 8px rgba(0,0,0,0.4);
    "></div>`,
    iconSize:   [28, 28],
    iconAnchor: [14, 28],
    popupAnchor:[0, -30],
  });

// Component to fly to user location
function FlyToUser({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, 11, { duration: 1.5 });
  }, [coords, map]);
  return null;
}

export default function HelpMap({ onBack }) {
  const [userCoords, setUserCoords]   = useState(null);
  const [locError,   setLocError]     = useState(null);
  const [nearest,    setNearest]      = useState(null);
  const [selected,   setSelected]     = useState(null);

  // ── Get user location ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocError('Geolocation not supported. Showing Odisha overview.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserCoords(coords);

        // Find nearest police station
        const policeOnly = HELP_LOCATIONS.filter(l => l.type === 'police');
        const sorted = policeOnly
          .map(loc => ({
            ...loc,
            dist: Math.hypot(loc.lat - coords[0], loc.lng - coords[1]),
          }))
          .sort((a, b) => a.dist - b.dist);

        setNearest(sorted[0]);
        setSelected(sorted[0].id);
      },
      () => setLocError('Location access denied. Showing Odisha overview.')
    );
  }, []);

  const DEFAULT_CENTER = [20.2961, 85.8245]; // Bhubaneswar
  const center = userCoords || DEFAULT_CENTER;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* ── Top Bar ── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-900 border-b border-gray-800">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white text-sm px-3 py-1 rounded border border-gray-700"
        >
          ←
        </button>
        <div>
          <h2 className="font-semibold text-white text-sm">Nearest Cyber Help</h2>
          <p className="text-xs text-gray-500">Odisha Cyber Crime Stations</p>
        </div>
      </div>

      {/* ── Nearest Station Banner ── */}
      {nearest && (
        <div className="mx-4 mt-3 bg-blue-950 border border-blue-700 rounded-xl p-3 flex items-start justify-between">
          <div>
            <p className="text-blue-300 text-xs font-bold uppercase tracking-wider">
              Nearest Station
            </p>
            <p className="text-white text-sm font-semibold mt-0.5">{nearest.name}</p>
            <p className="text-gray-400 text-xs mt-0.5">{nearest.address}</p>
          </div>
          <a
            href={`tel:${nearest.phone}`}
            className="ml-3 flex-shrink-0 bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-3 py-2 rounded-lg"
          >
            📞 Call
          </a>
        </div>
      )}

      {locError && (
        <p className="mx-4 mt-2 text-yellow-500 text-xs">{locError}</p>
      )}

      {/* ── Map ── */}
      <div className="flex-1 mx-4 mt-3 mb-3 rounded-2xl overflow-hidden border border-gray-800" style={{ minHeight: '340px' }}>
        <MapContainer
          center={center}
          zoom={7}
          style={{ width: '100%', height: '100%', minHeight: '340px' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {userCoords && (
            <>
              <FlyToUser coords={userCoords} />
              <Marker
                position={userCoords}
                icon={L.divIcon({
                  className: '',
                  html: `<div style="
                    width:16px;height:16px;border-radius:50%;
                    background:#3b82f6;border:3px solid white;
                    box-shadow:0 0 0 4px rgba(59,130,246,0.3);
                  "></div>`,
                  iconSize:   [16, 16],
                  iconAnchor: [8, 8],
                })}
              >
                <Popup><b>Your Location</b></Popup>
              </Marker>
            </>
          )}

          {HELP_LOCATIONS.map(loc => (
            <Marker
              key={loc.id}
              position={[loc.lat, loc.lng]}
              icon={makeIcon(MARKER_COLORS[loc.type])}
            >
              <Popup>
                <div style={{ minWidth: '180px' }}>
                  <b style={{ fontSize: '13px' }}>{loc.name}</b>
                  <p style={{ fontSize: '11px', color: '#555', margin: '4px 0' }}>{loc.address}</p>
                  <p style={{ fontSize: '11px', color: '#555', margin: '2px 0' }}>⏰ {loc.hours}</p>
                  <a
                    href={`tel:${loc.phone}`}
                    style={{
                      display: 'block', marginTop: '6px', padding: '4px 8px',
                      background: '#16a34a', color: 'white', borderRadius: '6px',
                      textAlign: 'center', fontSize: '12px', fontWeight: 'bold',
                      textDecoration: 'none',
                    }}
                  >
                    📞 {loc.phone}
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* ── Station List ── */}
      <div className="px-4 pb-4">
        <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">All Stations</p>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {HELP_LOCATIONS.filter(l => l.type === 'police').map(loc => (
            <div
              key={loc.id}
              onClick={() => setSelected(loc.id)}
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all
                ${selected === loc.id
                  ? 'bg-blue-950 border-blue-600'
                  : 'bg-gray-900 border-gray-800'}`}
            >
              <div>
                <p className="text-white text-sm font-semibold">{loc.name}</p>
                <p className="text-gray-500 text-xs">{loc.address}</p>
              </div>
              <a
                href={`tel:${loc.phone}`}
                onClick={e => e.stopPropagation()}
                className="ml-3 flex-shrink-0 text-green-400 text-xs border border-green-800 px-2 py-1 rounded-lg"
              >
                📞
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* ── National Helpline ── */}
      <div className="px-4 pb-6">
        <a
          href="tel:1930"
          className="block w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black text-lg rounded-2xl text-center"
        >
          📞 National Cyber Crime Helpline: 1930
        </a>
      </div>

    </div>
  );
}