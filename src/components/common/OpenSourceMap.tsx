import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, 
  Layers, 
  Navigation, 
  ExternalLink, 
  Crosshair, 
  Home, 
  Route as RouteIcon, 
  Clock, 
  ChevronDown, 
  Compass,
  Sparkles,
  Info,
  Globe
} from 'lucide-react';
import { useSavedAddress, PRESET_SAVED_BARNS, SavedAddress } from '../../context/SavedAddressContext';
import { SuggestedRoute } from '../../types';

export interface MapMarkerItem {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: string;
  color?: string;
  selected?: boolean;
  onClick?: () => void;
  details?: React.ReactNode;
  phone?: string;
  address?: string;
  serviceRadiusMiles?: number;
}

export interface OpenSourceMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarkerItem[];
  selectedMarkerId?: string | null;
  onMarkerSelect?: (id: string) => void;
  height?: string;
  className?: string;
  mapTypeId?: 'roadmap' | 'satellite' | 'terrain' | 'osm';
  showUserMarker?: boolean;
  showRouteToSelected?: boolean;
  showServiceRadius?: boolean;
  serviceCategoryTitle?: string;
  routes?: SuggestedRoute[];
  selectedRouteId?: string | null;
  onRouteSelect?: (route: SuggestedRoute) => void;
  showRoutes?: boolean;
  children?: React.ReactNode;
}

// Controller to auto center/fit bounds when markers, center, or selected item changes
function MapController({ 
  center, 
  zoom,
  selectedCoord,
  userCoord,
  fitAllBounds
}: { 
  center?: { lat: number; lng: number }; 
  zoom?: number;
  selectedCoord?: { lat: number; lng: number } | null;
  userCoord?: { lat: number; lng: number } | null;
  fitAllBounds?: { minLat: number; maxLat: number; minLng: number; maxLng: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (fitAllBounds) {
      map.fitBounds([
        [fitAllBounds.minLat, fitAllBounds.minLng],
        [fitAllBounds.maxLat, fitAllBounds.maxLng]
      ], { padding: [40, 40], maxZoom: 14, animate: true });
    } else if (selectedCoord && userCoord) {
      // Fit both user barn and selected provider
      map.fitBounds([
        [Math.min(userCoord.lat, selectedCoord.lat) - 0.02, Math.min(userCoord.lng, selectedCoord.lng) - 0.02],
        [Math.max(userCoord.lat, selectedCoord.lat) + 0.02, Math.max(userCoord.lng, selectedCoord.lng) + 0.02]
      ], { padding: [30, 30], maxZoom: 13, animate: true });
    } else if (center && zoom) {
      map.setView([center.lat, center.lng], zoom, { animate: true });
    }
  }, [center?.lat, center?.lng, zoom, selectedCoord?.lat, selectedCoord?.lng, userCoord?.lat, userCoord?.lng, fitAllBounds, map]);

  return null;
}

// Create custom open-source HTML div marker
export const createCustomMarkerIcon = (
  iconText: string, 
  color: string, 
  isSelected: boolean,
  isUserHome: boolean = false
) => {
  const bg = isUserHome ? '#d97706' : color || (isSelected ? '#0284c7' : '#0f766e');
  const size = isUserHome ? 40 : (isSelected ? 38 : 32);
  const border = isUserHome ? '3px solid #fef3c7' : (isSelected ? '3px solid #ffffff' : '2px solid #ffffff');
  const shadow = isUserHome 
    ? '0 0 0 4px rgba(217, 119, 6, 0.35), 0 10px 25px -5px rgba(0, 0, 0, 0.5)' 
    : (isSelected ? '0 0 0 4px rgba(2, 132, 199, 0.3), 0 10px 25px -5px rgba(0, 0, 0, 0.5)' : '0 4px 12px rgba(0, 0, 0, 0.3)');

  return L.divIcon({
    className: 'custom-osm-marker-pin',
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: transform 0.2s ease;">
        <div style="
          background-color: ${bg};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: ${border};
          box-shadow: ${shadow};
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: ${isUserHome ? '18px' : (isSelected ? '16px' : '14px')};
          font-weight: 900;
          transition: all 0.2s ease-in-out;
        ">
          ${iconText || '🐴'}
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid ${bg};
          margin-top: -1px;
        "></div>
      </div>
    `,
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    popupAnchor: [0, -(size + 6)]
  });
};

export const OpenSourceMap: React.FC<OpenSourceMapProps> = ({
  center,
  zoom = 11,
  markers = [],
  selectedMarkerId,
  onMarkerSelect,
  height = '100%',
  className = '',
  mapTypeId = 'roadmap',
  showUserMarker = true,
  showRouteToSelected = true,
  showServiceRadius = true,
  serviceCategoryTitle,
  routes = [],
  selectedRouteId,
  onRouteSelect,
  showRoutes = true,
  children
}) => {
  const { 
    savedAddress, 
    setSavedAddress, 
    activeReference, 
    setActiveReference, 
    gpsLocation,
    locateUserGPS,
    getReferenceCoords, 
    calculateDistanceMiles, 
    calculateDriveTimeMinutes,
    getOpenStreetMapDirectionsUrl
  } = useSavedAddress();

  const [activeTileType, setActiveTileType] = useState<'roadmap' | 'osm' | 'terrain' | 'satellite'>(
    mapTypeId === 'satellite' ? 'satellite' : (mapTypeId === 'terrain' ? 'terrain' : (mapTypeId === 'osm' ? 'osm' : 'roadmap'))
  );

  useEffect(() => {
    if (mapTypeId) {
      setActiveTileType(
        mapTypeId === 'satellite' ? 'satellite' : (mapTypeId === 'terrain' ? 'terrain' : (mapTypeId === 'osm' ? 'osm' : 'roadmap'))
      );
    }
  }, [mapTypeId]);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [showLayerDropdown, setShowLayerDropdown] = useState(false);
  const [fitBoundsTrigger, setFitBoundsTrigger] = useState<{ minLat: number; maxLat: number; minLng: number; maxLng: number } | null>(null);

  const refCoords = getReferenceCoords();

  // Find the currently selected marker
  const selectedMarker = useMemo(() => {
    return markers.find(m => m.id === selectedMarkerId) || null;
  }, [markers, selectedMarkerId]);

  // Relative calculations to user's saved location
  const relativeDistance = useMemo(() => {
    if (!selectedMarker) return null;
    return calculateDistanceMiles(selectedMarker.lat, selectedMarker.lng);
  }, [selectedMarker, calculateDistanceMiles]);

  const relativeDriveTime = useMemo(() => {
    if (!selectedMarker) return null;
    return calculateDriveTimeMinutes(selectedMarker.lat, selectedMarker.lng);
  }, [selectedMarker, calculateDriveTimeMinutes]);

  // Default center calculation
  const mapCenter = center || { lat: refCoords.lat, lng: refCoords.lng };

  // 100% Open Source OpenStreetMap & Public Domain Tile Layers
  const tileUrls = {
    roadmap: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  };

  const attributions = {
    roadmap: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    osm: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors (ODbL)',
    terrain: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | Style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    satellite: 'Tiles &copy; Esri &mdash; Open Public Imagery'
  };

  // Quick zoom action to fit all markers + user barn
  const handleFitAll = () => {
    const allLats = [refCoords.lat, ...markers.map(m => m.lat)];
    const allLngs = [refCoords.lng, ...markers.map(m => m.lng)];
    if (allLats.length > 0) {
      setFitBoundsTrigger({
        minLat: Math.min(...allLats) - 0.03,
        maxLat: Math.max(...allLats) + 0.03,
        minLng: Math.min(...allLngs) - 0.03,
        maxLng: Math.max(...allLngs) + 0.03
      });
      // Reset trigger after animation
      setTimeout(() => setFitBoundsTrigger(null), 1000);
    }
  };

  return (
    <div className={`relative w-full h-full min-h-[300px] rounded-2xl overflow-hidden shadow-md border border-slate-200/90 ${className}`} style={{ height }}>
      
      {/* Top Floating Relative Saved Address Banner */}
      <div className="absolute top-3 left-3 z-[1000] max-w-[85%] sm:max-w-md bg-white/95 backdrop-blur-md p-2 sm:p-2.5 rounded-xl shadow-lg border border-slate-200/90 text-slate-800 text-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
              <Home className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                  {activeReference === 'live_gps' ? 'Live GPS Origin' : 'Your Saved Barn'}
                </span>
              </div>
              <p className="font-bold text-slate-900 truncate text-[11px]">
                {refCoords.label}
              </p>
              <p className="text-[10px] text-slate-500 truncate hidden sm:block">
                {refCoords.fullAddress}
              </p>
            </div>
          </div>

          <div className="relative shrink-0">
            <button
              onClick={() => setShowAddressDropdown(!showAddressDropdown)}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-slate-300"
              title="Change reference barn address"
            >
              <span>Change</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showAddressDropdown && (
              <div className="absolute top-full right-0 mt-1.5 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in">
                <div className="px-3 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Select Reference Address
                </div>
                
                {PRESET_SAVED_BARNS.map((barn, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSavedAddress(barn);
                      setActiveReference('saved_barn');
                      setShowAddressDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-amber-50 transition-colors flex flex-col ${
                      savedAddress.facilityName === barn.facilityName && activeReference === 'saved_barn' ? 'bg-amber-50 font-bold text-amber-900' : 'text-slate-700'
                    }`}
                  >
                    <span className="text-[11px] font-bold">{barn.facilityName}</span>
                    <span className="text-[9px] text-slate-400 truncate">{barn.fullAddress}</span>
                  </button>
                ))}

                <div className="border-t border-slate-100 my-1"></div>

                <button
                  onClick={() => {
                    locateUserGPS();
                    setActiveReference('live_gps');
                    setShowAddressDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-sky-50 transition-colors flex items-center gap-1.5 text-[11px] ${
                    activeReference === 'live_gps' ? 'bg-sky-50 font-bold text-sky-900' : 'text-slate-700'
                  }`}
                >
                  <Crosshair className="w-3.5 h-3.5 text-sky-600" />
                  <span>Use Live Device GPS Coordinates</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Selected Provider Relative Distance Banner (if a provider is clicked) */}
        {selectedMarker && relativeDistance !== null && (
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 bg-teal-50/80 -mx-1 -mb-1 p-2 rounded-lg">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="font-extrabold text-teal-950 truncate">
                  {selectedMarker.title}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[10px] font-bold text-teal-800">
                <span className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded shadow-2xs border border-teal-200">
                  <RouteIcon className="w-3 h-3 text-teal-600" />
                  <span>{relativeDistance} mi from barn</span>
                </span>
                <span className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded shadow-2xs border border-teal-200">
                  <Clock className="w-3 h-3 text-emerald-600" />
                  <span>~{relativeDriveTime} mins drive</span>
                </span>
              </div>
            </div>

            <a
              href={getOpenStreetMapDirectionsUrl(selectedMarker.lat, selectedMarker.lng, selectedMarker.title)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-teal-700 hover:bg-teal-800 text-white text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors shadow-sm shrink-0"
              title="Open OpenStreetMap Driving Directions in new tab"
            >
              <span>OSM Route</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Floating Map Action Controls Bar (Top Right) */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-lg border border-slate-200 text-slate-800">
        <div className="relative">
          <button
            onClick={() => setShowLayerDropdown(!showLayerDropdown)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-100 text-slate-700 transition-all cursor-pointer"
            title="Choose Open-Source Map Style"
          >
            <Layers className="w-3.5 h-3.5 text-teal-600" />
            <span className="capitalize">{activeTileType}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showLayerDropdown && (
            <div className="absolute top-full right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 text-xs animate-in fade-in">
              <button
                onClick={() => { setActiveTileType('roadmap'); setShowLayerDropdown(false); }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between text-[11px] font-bold ${activeTileType === 'roadmap' ? 'bg-teal-50 text-teal-900' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                <span>🎨 Voyager Map</span>
                {activeTileType === 'roadmap' && <span>✓</span>}
              </button>
              <button
                onClick={() => { setActiveTileType('osm'); setShowLayerDropdown(false); }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between text-[11px] font-bold ${activeTileType === 'osm' ? 'bg-teal-50 text-teal-900' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                <span>🗺️ OpenStreetMap</span>
                {activeTileType === 'osm' && <span>✓</span>}
              </button>
              <button
                onClick={() => { setActiveTileType('terrain'); setShowLayerDropdown(false); }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between text-[11px] font-bold ${activeTileType === 'terrain' ? 'bg-teal-50 text-teal-900' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                <span>⛰️ Topo / Trails</span>
                {activeTileType === 'terrain' && <span>✓</span>}
              </button>
              <button
                onClick={() => { setActiveTileType('satellite'); setShowLayerDropdown(false); }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between text-[11px] font-bold ${activeTileType === 'satellite' ? 'bg-teal-50 text-teal-900' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                <span>🛰️ Satellite Imagery</span>
                {activeTileType === 'satellite' && <span>✓</span>}
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleFitAll}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-100 text-slate-700 transition-all cursor-pointer border-t border-slate-100"
          title="Fit all providers and your barn in view"
        >
          <Compass className="w-3.5 h-3.5 text-amber-500" />
          <span>Fit All</span>
        </button>
      </div>

      {/* Interactive Map Component */}
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={zoom}
        style={{ width: '100%', height: '100%', minHeight: '300px', zIndex: 1 }}
        zoomControl={false}
      >
        <MapController 
          center={mapCenter} 
          zoom={zoom} 
          selectedCoord={selectedMarker ? { lat: selectedMarker.lat, lng: selectedMarker.lng } : null}
          userCoord={showUserMarker ? { lat: refCoords.lat, lng: refCoords.lng } : null}
          fitAllBounds={fitBoundsTrigger}
        />

        <TileLayer
          url={tileUrls[activeTileType]}
          attribution={attributions[activeTileType]}
          maxZoom={19}
        />

        {/* User's Saved Address / Home Barn Pin */}
        {showUserMarker && (
          <>
            <Marker
              position={[refCoords.lat, refCoords.lng]}
              icon={createCustomMarkerIcon('🏠', '#d97706', false, true)}
              zIndexOffset={1000}
            >
              <Popup className="custom-osm-popup">
                <div className="p-1.5 max-w-xs font-sans">
                  <div className="flex items-center gap-1.5 font-black text-xs text-amber-900">
                    <span>🏠 {refCoords.label}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                    {refCoords.fullAddress}
                  </div>
                  <span className="inline-block mt-1 bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded border border-amber-200">
                    YOUR SAVED REFERENCE LOCATION
                  </span>
                </div>
              </Popup>
            </Marker>

            {/* Radius ring around saved barn */}
            <Circle
              center={[refCoords.lat, refCoords.lng]}
              radius={8000} // ~5 miles radius
              pathOptions={{
                color: '#d97706',
                fillColor: '#f59e0b',
                fillOpacity: 0.04,
                weight: 1.5,
                dashArray: '4, 6'
              }}
            />
          </>
        )}

        {/* Dynamic Route Polyline between User Barn and Selected Provider */}
        {showRouteToSelected && selectedMarker && (
          <Polyline
            positions={[
              [refCoords.lat, refCoords.lng],
              [selectedMarker.lat, selectedMarker.lng]
            ]}
            pathOptions={{
              color: '#0d9488',
              weight: 4,
              opacity: 0.85,
              dashArray: '6, 8',
              lineCap: 'round'
            }}
          />
        )}

        {/* Service Provider Markers */}
        {markers.map((m) => {
          const isSelected = m.id === selectedMarkerId;
          const dist = calculateDistanceMiles(m.lat, m.lng);
          const time = calculateDriveTimeMinutes(m.lat, m.lng);
          const customIcon = createCustomMarkerIcon(m.icon || '🐴', m.color || '', isSelected);

          return (
            <React.Fragment key={m.id}>
              {/* Optional Service Radius Circle if provided */}
              {showServiceRadius && m.serviceRadiusMiles && (
                <Circle
                  center={[m.lat, m.lng]}
                  radius={m.serviceRadiusMiles * 1609.34} // Convert miles to meters
                  pathOptions={{
                    color: m.color || '#0d9488',
                    fillColor: m.color || '#0d9488',
                    fillOpacity: isSelected ? 0.12 : 0.04,
                    weight: isSelected ? 2 : 1,
                    dashArray: '3, 6'
                  }}
                />
              )}

              <Marker
                position={[m.lat, m.lng]}
                icon={customIcon}
                eventHandlers={{
                  click: () => {
                    if (onMarkerSelect) onMarkerSelect(m.id);
                    if (m.onClick) m.onClick();
                  }
                }}
              >
                <Popup className="custom-osm-popup">
                  <div className="p-1 max-w-xs font-sans">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-xs text-slate-900">{m.title}</span>
                      {m.badge && (
                        <span className="bg-teal-100 text-teal-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                          {m.badge}
                        </span>
                      )}
                    </div>
                    {m.subtitle && (
                      <div className="text-[11px] text-slate-600 font-medium mt-0.5">{m.subtitle}</div>
                    )}
                    
                    {/* Relative distance tag */}
                    <div className="mt-1.5 p-1 bg-amber-50/80 rounded border border-amber-200/70 text-[10px] font-bold text-amber-900 flex items-center justify-between">
                      <span>📍 {dist} mi from your barn</span>
                      <span>~{time} min drive</span>
                    </div>

                    {m.phone && (
                      <div className="text-[10px] text-slate-500 font-semibold mt-1">
                        📞 {m.phone}
                      </div>
                    )}

                    <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between">
                      <a
                        href={getOpenStreetMapDirectionsUrl(m.lat, m.lng, m.title)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-extrabold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                      >
                        <span>OpenStreetMap Routing</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    {m.details}
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}

        {/* Suggested Equine Highway Routes and Waypoints */}
        {showRoutes && routes && routes.map((route) => {
          const isSelected = route.id === selectedRouteId;
          return (
            <React.Fragment key={route.id}>
              {/* Route Polyline Track */}
              <Polyline
                positions={route.coordinates}
                pathOptions={{
                  color: route.color,
                  weight: isSelected ? 6 : 4,
                  opacity: isSelected ? 0.95 : 0.75,
                  dashArray: isSelected ? undefined : route.dashArray,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
                eventHandlers={{
                  click: () => onRouteSelect?.(route)
                }}
              />

              {/* Waypoints along route */}
              {route.waypoints.map((wp) => {
                const icon = wp.type === 'water_stop' 
                  ? '💧' 
                  : (wp.type === 'vet_triage' 
                    ? '🏥' 
                    : (wp.type === 'rest_oasis' 
                      ? '🌿' 
                      : (wp.type === 'origin' ? '📍' : '🏁')));
                const color = wp.type === 'water_stop' 
                  ? '#0284c7' 
                  : (wp.type === 'vet_triage' 
                    ? '#ef4444' 
                    : (wp.type === 'rest_oasis' 
                      ? '#10b981' 
                      : (wp.type === 'origin' ? '#059669' : '#7c3aed')));
                const wpIcon = createCustomMarkerIcon(icon, color, isSelected);

                return (
                  <Marker
                    key={wp.id}
                    position={[wp.lat, wp.lng]}
                    icon={wpIcon}
                    eventHandlers={{
                      click: () => onRouteSelect?.(route)
                    }}
                  >
                    <Popup className="custom-osm-popup">
                      <div className="p-1.5 max-w-xs font-sans">
                        <div className="flex items-center justify-between gap-1.5 font-black text-xs text-slate-900">
                          <span>{icon} {wp.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[9px] font-extrabold uppercase bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded">
                            {wp.type.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold">
                            {route.distanceMiles} mi route
                          </span>
                        </div>
                        {wp.notes && (
                          <div className="text-[11px] text-slate-700 mt-1.5 p-1.5 bg-slate-50 rounded-lg border border-slate-200">
                            {wp.notes}
                          </div>
                        )}
                        <div className="mt-1.5 text-[10px] text-purple-700 font-bold">
                          Corridor: {route.title}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </React.Fragment>
          );
        })}

        {children}
      </MapContainer>

      {/* Floating OpenStreetMap Brand Badge (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg border border-slate-700 flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <Globe className="w-3 h-3 text-teal-400" />
        <span>OpenStreetMap • 100% Open Source Geo Engine</span>
      </div>
    </div>
  );
};
