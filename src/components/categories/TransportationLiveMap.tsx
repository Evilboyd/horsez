import React, { useState, useEffect, useMemo } from 'react';
import {
  Truck,
  MapPin,
  Navigation,
  Gauge,
  Thermometer,
  ShieldCheck,
  Phone,
  Clock,
  ExternalLink,
  Layers,
  Sparkles,
  Compass,
  AlertTriangle,
  Radio,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Globe,
  ChevronDown,
  ChevronUp,
  Check,
  Droplets,
  Route as RouteIcon,
  UserCheck,
  DollarSign,
  X,
  Award,
  Info
} from 'lucide-react';
import { HaulerJob, HaulAddress, AvailableDriver, SuggestedRoute } from '../../types';
import { MOCK_AVAILABLE_DRIVERS, MOCK_SUGGESTED_ROUTES } from '../../data/transportData';
import { useSavedAddress } from '../../context/SavedAddressContext';
import { OpenSourceMap, MapMarkerItem } from '../common/OpenSourceMap';

export interface TransportationLiveMapProps {
  jobs: HaulerJob[];
  selectedJobId?: string;
  onSelectJob?: (job: HaulerJob) => void;
  className?: string;
}

export const TransportationLiveMap: React.FC<TransportationLiveMapProps> = ({
  jobs,
  selectedJobId,
  onSelectJob,
  className = ''
}) => {
  const { savedAddress, calculateDistanceMiles, calculateDriveTimeMinutes, getOpenStreetMapDirectionsUrl } = useSavedAddress();
  
  const [selectedHaul, setSelectedHaul] = useState<HaulerJob | null>(() => {
    const found = jobs.find(j => j.id === selectedJobId);
    return found || jobs[0] || null;
  });

  // Layer Visibility State for Legend
  const [showActiveTransports, setShowActiveTransports] = useState<boolean>(true);
  const [showAvailableDrivers, setShowAvailableDrivers] = useState<boolean>(true);
  const [showSuggestedRoutes, setShowSuggestedRoutes] = useState<boolean>(true);
  const [isLegendExpanded, setIsLegendExpanded] = useState<boolean>(true);

  // Selected Entities
  const [selectedDriver, setSelectedDriver] = useState<AvailableDriver | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<SuggestedRoute | null>(null);
  const [activeContactDriver, setActiveContactDriver] = useState<AvailableDriver | null>(null);
  const [dispatchConfirmedDriver, setDispatchConfirmedDriver] = useState<AvailableDriver | null>(null);

  const [filterMode, setFilterMode] = useState<'all' | 'in-transit' | 'open' | 'urgent'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMapType, setActiveMapType] = useState<'roadmap' | 'osm' | 'terrain' | 'satellite'>('roadmap');

  // Sync external selectedJobId
  useEffect(() => {
    if (selectedJobId) {
      const found = jobs.find(j => j.id === selectedJobId);
      if (found) {
        setSelectedHaul(found);
        setSelectedDriver(null);
        setSelectedRoute(null);
      }
    }
  }, [selectedJobId, jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter(j => {
      if (filterMode === 'in-transit' && j.status !== 'in-transit') return false;
      if (filterMode === 'open' && j.status !== 'open') return false;
      if (filterMode === 'urgent' && !j.pickup.toLowerCase().includes('clinic') && !j.pickup.toLowerCase().includes('hospital') && !j.dropoff.toLowerCase().includes('hospital') && !j.dropoff.toLowerCase().includes('clinic')) return false;
      
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          j.pickup.toLowerCase().includes(q) ||
          j.dropoff.toLowerCase().includes(q) ||
          (j.haulerName && j.haulerName.toLowerCase().includes(q)) ||
          j.rigRequirement.toLowerCase().includes(q) ||
          j.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [jobs, filterMode, searchQuery]);

  const centerCoord = useMemo(() => {
    if (selectedRoute && selectedRoute.coordinates.length > 0) {
      const midIndex = Math.floor(selectedRoute.coordinates.length / 2);
      return { lat: selectedRoute.coordinates[midIndex][0], lng: selectedRoute.coordinates[midIndex][1] };
    }
    if (selectedDriver) {
      return { lat: selectedDriver.lat, lng: selectedDriver.lng };
    }
    if (selectedHaul?.lat && selectedHaul?.lng) {
      return { lat: selectedHaul.lat, lng: selectedHaul.lng };
    }
    return { lat: 38.3600, lng: -122.5800 };
  }, [selectedHaul, selectedDriver, selectedRoute]);

  const handleSelectJob = (job: HaulerJob) => {
    setSelectedHaul(job);
    setSelectedDriver(null);
    setSelectedRoute(null);
    if (onSelectJob) onSelectJob(job);
  };

  const handleSelectDriver = (driver: AvailableDriver) => {
    setSelectedDriver(driver);
    setSelectedRoute(null);
  };

  const handleSelectRoute = (route: SuggestedRoute) => {
    setSelectedRoute(route);
    setSelectedDriver(null);
  };

  // Convert visible layers into map markers
  const mapMarkers = useMemo<MapMarkerItem[]>(() => {
    const markers: MapMarkerItem[] = [];

    // 1. User's Saved Barn Marker
    if (savedAddress?.lat && savedAddress?.lng) {
      markers.push({
        id: 'saved-barn-loc',
        lat: savedAddress.lat,
        lng: savedAddress.lng,
        title: `Your Saved Barn: ${savedAddress.facilityName || 'Barn'}`,
        subtitle: `${savedAddress.street}, ${savedAddress.city}`,
        badge: 'SAVED BARN',
        icon: '🏠',
        color: '#d97706'
      });
    }

    // 2. Active Transports Layer Markers
    if (showActiveTransports) {
      filteredJobs.forEach(j => {
        const isSelected = j.id === selectedHaul?.id && !selectedDriver && !selectedRoute;
        if (j.lat && j.lng) {
          markers.push({
            id: j.id,
            lat: j.lat,
            lng: j.lng,
            title: `Haul Rig ${j.id.toUpperCase()}: ${j.haulerName || 'USDOT Hauler'}`,
            subtitle: `${j.pickup} ➔ ${j.dropoff}`,
            badge: j.status === 'in-transit' ? 'LIVE IN-TRANSIT' : 'ASSIGNED RIG',
            icon: '🚛',
            color: j.status === 'in-transit' ? '#0284c7' : '#0d9488',
            selected: isSelected,
            onClick: () => handleSelectJob(j),
            details: (
              <div className="mt-1 pt-1 border-t border-slate-100 text-[10px] space-y-1">
                <div className="flex items-center justify-between text-slate-700 font-bold">
                  <span>Speed: {j.liveDiagnostics?.speed || '55 mph'}</span>
                  <span>Temp: {j.liveDiagnostics?.temp || '68°F'}</span>
                </div>
                <div className="text-teal-700 font-bold">
                  Rig: {j.rigRequirement}
                </div>
              </div>
            )
          });
        }

        // If selected haul, add origin and destination markers
        if (isSelected) {
          const pickupLat = (j.lat || 38.36) - 0.05;
          const pickupLng = (j.lng || -122.58) + 0.06;
          markers.push({
            id: `pickup-${j.id}`,
            lat: pickupLat,
            lng: pickupLng,
            title: `Pickup Origin: ${j.pickupAddress?.facilityName || j.pickup}`,
            subtitle: j.pickupAddress?.street || 'Origin Gate',
            badge: 'PICKUP ORIGIN',
            icon: '📍',
            color: '#10b981'
          });

          const destLat = (j.lat || 38.36) + 0.06;
          const destLng = (j.lng || -122.58) - 0.07;
          markers.push({
            id: `delivery-${j.id}`,
            lat: destLat,
            lng: destLng,
            title: `Destination: ${j.deliveryAddress?.facilityName || j.dropoff}`,
            subtitle: j.deliveryAddress?.street || 'Destination Unloading Bay',
            badge: 'DELIVERY DESTINATION',
            icon: '🏥',
            color: '#8b5cf6'
          });
        }
      });
    }

    // 3. Available Drivers Layer Markers
    if (showAvailableDrivers) {
      MOCK_AVAILABLE_DRIVERS.forEach(driver => {
        const isSelected = selectedDriver?.id === driver.id;
        const distFromBarn = savedAddress?.lat && savedAddress?.lng 
          ? calculateDistanceMiles(driver.lat, driver.lng)
          : null;

        markers.push({
          id: `driver-${driver.id}`,
          lat: driver.lat,
          lng: driver.lng,
          title: `Available Driver: ${driver.name}`,
          subtitle: `${driver.companyName} • ${driver.rigType}`,
          badge: `${driver.availableStalls} STALLS OPEN`,
          icon: '🤠',
          color: '#10b981',
          selected: isSelected,
          onClick: () => handleSelectDriver(driver),
          phone: driver.phone,
          address: driver.baseLocation,
          details: (
            <div className="mt-2 pt-1.5 border-t border-slate-100 text-xs space-y-1.5 font-sans">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">
                  ★ {driver.rating} ({driver.reviewsCount} reviews)
                </span>
                <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                  {driver.usdotNumber}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium">
                {driver.rigType} • ${driver.ratePerMile.toFixed(2)}/mi
              </p>
              {distFromBarn !== null && (
                <div className="text-[10px] font-bold text-slate-500">
                  Standby: {driver.emergencyResponseTime} away ({distFromBarn} mi from barn)
                </div>
              )}
            </div>
          )
        });
      });
    }

    return markers;
  }, [
    showActiveTransports,
    showAvailableDrivers,
    filteredJobs,
    selectedHaul,
    selectedDriver,
    selectedRoute,
    savedAddress,
    calculateDistanceMiles
  ]);

  // Total active layer count
  const activeLayerCount = (showActiveTransports ? 1 : 0) + (showAvailableDrivers ? 1 : 0) + (showSuggestedRoutes ? 1 : 0);

  // Quick Preset Handlers
  const handleShowAll = () => {
    setShowActiveTransports(true);
    setShowAvailableDrivers(true);
    setShowSuggestedRoutes(true);
  };

  const handleShowOnlyActive = () => {
    setShowActiveTransports(true);
    setShowAvailableDrivers(false);
    setShowSuggestedRoutes(false);
  };

  const handleShowOnlyDrivers = () => {
    setShowActiveTransports(false);
    setShowAvailableDrivers(true);
    setShowSuggestedRoutes(false);
  };

  const handleShowOnlyRoutes = () => {
    setShowActiveTransports(false);
    setShowAvailableDrivers(false);
    setShowSuggestedRoutes(true);
  };

  return (
    <div className={`space-y-4 font-sans ${className}`}>
      {/* Live Map Control Header */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-md">
            <Navigation className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>Live Equine Transport GPS & Route Radar</span>
              </h2>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                Live Telemetry Feed
              </span>
              <span className="bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Globe className="w-3 h-3 text-teal-600" />
                OpenStreetMap
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-layer real-time mapping for active transports, available USDOT drivers, and recommended equine transit corridors
            </p>
          </div>
        </div>

        {/* Quick Legend Layer Summary Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setShowActiveTransports(!showActiveTransports)}
            className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              showActiveTransports
                ? 'bg-sky-50 text-sky-800 border-sky-300 font-extrabold shadow-2xs'
                : 'bg-slate-100 text-slate-500 border-slate-200 opacity-60'
            }`}
            title="Toggle Active Transports Layer"
          >
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
            <span>Active Transports ({filteredJobs.length})</span>
            {showActiveTransports && <Check className="w-3 h-3 text-sky-600" />}
          </button>

          <button
            onClick={() => setShowAvailableDrivers(!showAvailableDrivers)}
            className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              showAvailableDrivers
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold shadow-2xs'
                : 'bg-slate-100 text-slate-500 border-slate-200 opacity-60'
            }`}
            title="Toggle Available Drivers Layer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Available Drivers ({MOCK_AVAILABLE_DRIVERS.length})</span>
            {showAvailableDrivers && <Check className="w-3 h-3 text-emerald-600" />}
          </button>

          <button
            onClick={() => setShowSuggestedRoutes(!showSuggestedRoutes)}
            className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              showSuggestedRoutes
                ? 'bg-purple-50 text-purple-800 border-purple-300 font-extrabold shadow-2xs'
                : 'bg-slate-100 text-slate-500 border-slate-200 opacity-60'
            }`}
            title="Toggle Suggested Routes Layer"
          >
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            <span>Suggested Routes ({MOCK_SUGGESTED_ROUTES.length})</span>
            {showSuggestedRoutes && <Check className="w-3 h-3 text-purple-600" />}
          </button>
        </div>
      </div>

      {/* Main 2-Column Layout: Filter & Details Panel (Left) + Interactive Map with Legend Overlay (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Side: Active Transport List, Drivers, Routes & Filters (4 Columns) */}
        <div className="lg:col-span-4 space-y-3">
          
          {/* Quick Filter Switcher */}
          <div className="bg-white p-3 rounded-2xl shadow-xs border border-slate-200 space-y-2.5">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search haulers, cities, routes, rigs..."
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-1.5 pl-8 pr-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-bold scrollbar-none">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                  filterMode === 'all' ? 'bg-teal-700 text-white font-extrabold shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Jobs ({jobs.length})
              </button>
              <button
                onClick={() => setFilterMode('in-transit')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                  filterMode === 'in-transit' ? 'bg-teal-700 text-white font-extrabold shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                🚚 In-Transit
              </button>
              <button
                onClick={() => setFilterMode('urgent')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                  filterMode === 'urgent' ? 'bg-teal-700 text-white font-extrabold shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                🏥 Vet Clinics
              </button>
              <button
                onClick={() => setFilterMode('open')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                  filterMode === 'open' ? 'bg-teal-700 text-white font-extrabold shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                📋 Open
              </button>
            </div>
          </div>

          {/* Selected Suggested Route Card */}
          {selectedRoute && (
            <div className="bg-gradient-to-br from-purple-900 to-indigo-950 text-white p-4 rounded-2xl shadow-md border border-purple-800 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-purple-800/80 pb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <RouteIcon className="w-3.5 h-3.5 text-purple-400" />
                  Suggested Route Corridor
                </span>
                <button
                  onClick={() => setSelectedRoute(null)}
                  className="text-purple-300 hover:text-white text-xs font-bold cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-white">{selectedRoute.title}</h3>
                <p className="text-xs text-purple-200 mt-0.5">{selectedRoute.corridor}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-purple-800/50 p-2 rounded-xl border border-purple-700/50">
                  <span className="text-[9px] uppercase font-bold text-purple-300 block">Distance & Time</span>
                  <span className="font-black text-amber-300">{selectedRoute.distanceMiles} mi • {selectedRoute.estDriveTime}</span>
                </div>
                <div className="bg-purple-800/50 p-2 rounded-xl border border-purple-700/50">
                  <span className="text-[9px] uppercase font-bold text-purple-300 block">Safety Grade</span>
                  <span className="font-black text-emerald-300">{selectedRoute.safetyScore}</span>
                </div>
              </div>

              <div className="bg-purple-800/30 p-2.5 rounded-xl border border-purple-700/40 text-[11px] space-y-1 text-purple-100">
                <p><strong>Recommended Rig:</strong> {selectedRoute.recommendedRig}</p>
                <p><strong>Hydration Interval:</strong> Every {selectedRoute.waterIntervalHours} hours</p>
                <p className="text-purple-200/90 text-[10px] mt-1">{selectedRoute.description}</p>
              </div>

              {/* Waypoint Checkpoints */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 block">
                  Route Checkpoints & Rest Staging ({selectedRoute.waypoints.length})
                </span>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {selectedRoute.waypoints.map((wp, idx) => (
                    <div key={wp.id} className="bg-purple-950/70 p-2 rounded-lg border border-purple-800/60 flex items-start gap-2 text-[11px]">
                      <span className="font-extrabold text-purple-300 shrink-0">{idx + 1}.</span>
                      <div>
                        <div className="font-bold text-white flex items-center gap-1">
                          <span>{wp.name}</span>
                        </div>
                        {wp.notes && <p className="text-[10px] text-purple-300 mt-0.5">{wp.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Selected Available Driver Card */}
          {selectedDriver && (
            <div className="bg-gradient-to-br from-emerald-950 to-teal-950 text-white p-4 rounded-2xl shadow-md border border-emerald-800 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-emerald-800/80 pb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Available Standby Driver
                </span>
                <button
                  onClick={() => setSelectedDriver(null)}
                  className="text-emerald-300 hover:text-white text-xs font-bold cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                {selectedDriver.avatar ? (
                  <img
                    src={selectedDriver.avatar}
                    alt={selectedDriver.name}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-400/80 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-emerald-800 flex items-center justify-center font-bold text-lg">
                    {selectedDriver.name[0]}
                  </div>
                )}
                <div>
                  <h3 className="font-extrabold text-sm text-white">{selectedDriver.name}</h3>
                  <p className="text-xs text-emerald-200 font-semibold">{selectedDriver.companyName}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                    <span className="text-amber-300 font-extrabold">★ {selectedDriver.rating} ({selectedDriver.reviewsCount})</span>
                    <span className="text-emerald-300 font-bold bg-emerald-900/80 px-1.5 py-0.2 rounded">{selectedDriver.usdotNumber}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-emerald-900/50 p-2 rounded-xl border border-emerald-700/50">
                  <span className="text-[9px] uppercase font-bold text-emerald-300 block">Available Stalls</span>
                  <span className="font-black text-white">{selectedDriver.availableStalls} of {selectedDriver.capacityStalls} Stalls Open</span>
                </div>
                <div className="bg-emerald-900/50 p-2 rounded-xl border border-emerald-700/50">
                  <span className="text-[9px] uppercase font-bold text-emerald-300 block">Estimated Rate</span>
                  <span className="font-black text-amber-300">${selectedDriver.ratePerMile.toFixed(2)} / mile</span>
                </div>
              </div>

              <div className="text-[11px] text-emerald-100 space-y-1 bg-emerald-900/30 p-2 rounded-xl border border-emerald-800/40">
                <p><strong>Trailer Rig:</strong> {selectedDriver.rigType}</p>
                <p><strong>Base Area:</strong> {selectedDriver.baseLocation}</p>
                <p><strong>Standby Dispatch:</strong> {selectedDriver.emergencyResponseTime || 'Ready within 20 mins'}</p>
              </div>

              <div className="flex gap-2 pt-1">
                <a
                  href={`tel:${selectedDriver.phone}`}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-2 rounded-xl transition-all shadow text-center flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {selectedDriver.phone}</span>
                </a>
                <button
                  onClick={() => {
                    setActiveContactDriver(selectedDriver);
                    setDispatchConfirmedDriver(selectedDriver);
                  }}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-3 py-2 rounded-xl transition-all shadow flex items-center gap-1 cursor-pointer"
                >
                  <span>Dispatch</span>
                </button>
              </div>
            </div>
          )}

          {/* Rigs / Haul Cards List */}
          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            <div className="flex items-center justify-between text-[11px] font-black text-slate-500 uppercase px-1">
              <span>Active Transports ({filteredJobs.length})</span>
              <span className="text-teal-700 font-bold">Select for Telemetry</span>
            </div>

            {filteredJobs.map(job => {
              const isSelected = selectedHaul?.id === job.id && !selectedDriver && !selectedRoute;
              const distFromBarn = job.lat && job.lng ? calculateDistanceMiles(job.lat, job.lng) : null;
              
              return (
                <div
                  key={job.id}
                  onClick={() => handleSelectJob(job)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-teal-50/90 border-teal-400 shadow-sm ring-1 ring-teal-300'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-black text-slate-900 uppercase flex items-center gap-1.5">
                      <Truck className={`w-3.5 h-3.5 ${isSelected ? 'text-teal-700' : 'text-slate-500'}`} />
                      <span>{job.id.toUpperCase()}</span>
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                      job.status === 'in-transit' 
                        ? 'bg-teal-700 text-white shadow-2xs' 
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {job.status === 'in-transit' ? '● LIVE' : 'ASSIGNED'}
                    </span>
                  </div>

                  <p className="font-bold text-slate-900 text-xs truncate">
                    {job.pickupAddress?.facilityName || job.pickup.split(',')[0]}
                  </p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate mt-0.5">
                    <span>➔ {job.deliveryAddress?.facilityName || job.dropoff.split(',')[0]}</span>
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600 font-medium">
                    <span>{job.haulerName || 'Mark D. (Pro)'} • {job.numHorses} Horses</span>
                    {distFromBarn !== null && (
                      <span className="font-bold text-teal-800 bg-teal-100/70 px-1.5 py-0.5 rounded">
                        {distFromBarn} mi away
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Haul Live Telemetry Widget */}
          {selectedHaul && !selectedDriver && !selectedRoute && (
            <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-md border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-400 flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-teal-400" />
                  Telemetry • {selectedHaul.id.toUpperCase()}
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Air-Ride Normal
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-800/80 p-2 rounded-xl">
                  <span className="text-[9px] uppercase font-extrabold text-slate-400 block">Cabin / Stall Temp</span>
                  <span className="font-black text-sm text-amber-400 flex items-center gap-1 mt-0.5">
                    <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                    {selectedHaul.liveDiagnostics?.temp || '68°F AC'}
                  </span>
                </div>
                <div className="bg-slate-800/80 p-2 rounded-xl">
                  <span className="text-[9px] uppercase font-extrabold text-slate-400 block">Rig Speed</span>
                  <span className="font-black text-sm text-teal-400 flex items-center gap-1 mt-0.5">
                    <Gauge className="w-3.5 h-3.5 text-teal-400" />
                    {selectedHaul.liveDiagnostics?.speed || '55 mph'}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-300 space-y-1 pt-1">
                <p><strong>Driver:</strong> {selectedHaul.haulerName || 'Mark D. (USDOT Verified)'}</p>
                <p><strong>Rig:</strong> {selectedHaul.rigRequirement}</p>
                <p><strong>ETA:</strong> {selectedHaul.deliveryDate || 'Within 45 mins'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Interactive OpenStreetMap Component with Custom Legend Overlay (8 Columns) */}
        <div className="lg:col-span-8 bg-slate-900 rounded-2xl overflow-hidden relative min-h-[580px] h-full border border-slate-800 shadow-md flex flex-col">
          
          <OpenSourceMap
            center={centerCoord}
            zoom={selectedRoute ? 9 : 10}
            height="100%"
            markers={mapMarkers}
            selectedMarkerId={selectedDriver ? `driver-${selectedDriver.id}` : selectedHaul?.id}
            onMarkerSelect={(id) => {
              if (id.startsWith('driver-')) {
                const rawDriverId = id.replace('driver-', '');
                const foundDriver = MOCK_AVAILABLE_DRIVERS.find(d => d.id === rawDriverId);
                if (foundDriver) handleSelectDriver(foundDriver);
              } else {
                const found = jobs.find(j => j.id === id);
                if (found) handleSelectJob(found);
              }
            }}
            routes={MOCK_SUGGESTED_ROUTES}
            selectedRouteId={selectedRoute?.id}
            onRouteSelect={handleSelectRoute}
            showRoutes={showSuggestedRoutes}
            mapTypeId={activeMapType}
          />

          {/* ========================================================================= */}
          {/* CUSTOM INTERACTIVE MAP LEGEND OVERLAY (TOP RIGHT OF MAP)                */}
          {/* ========================================================================= */}
          <div 
            id="transportation-map-legend-overlay"
            className="absolute top-3 right-3 sm:right-4 z-[1000] max-w-[340px] sm:max-w-xs w-full transition-all duration-200"
          >
            <div className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/90 shadow-2xl rounded-2xl overflow-hidden">
              {/* Legend Card Header */}
              <div className="p-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span>Map Legend</span>
                      <span className="text-[9px] font-black bg-teal-500/20 text-teal-300 border border-teal-500/30 px-1.5 py-0.2 rounded-full">
                        {activeLayerCount}/3 Active
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-400">Toggle Layer Visibility</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsLegendExpanded(!isLegendExpanded)}
                    className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title={isLegendExpanded ? 'Collapse Legend' : 'Expand Legend'}
                  >
                    {isLegendExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Collapsible Content */}
              {isLegendExpanded && (
                <div className="p-3 space-y-3 text-xs">
                  {/* Quick Preset Buttons */}
                  <div className="grid grid-cols-4 gap-1 text-[10px] font-bold">
                    <button
                      onClick={handleShowAll}
                      className={`py-1 px-1 rounded-lg text-center transition-all cursor-pointer ${
                        activeLayerCount === 3
                          ? 'bg-teal-600 text-white font-extrabold shadow-xs'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      All Layers
                    </button>
                    <button
                      onClick={handleShowOnlyActive}
                      className={`py-1 px-1 rounded-lg text-center transition-all cursor-pointer ${
                        showActiveTransports && !showAvailableDrivers && !showSuggestedRoutes
                          ? 'bg-sky-600 text-white font-extrabold shadow-xs'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Active
                    </button>
                    <button
                      onClick={handleShowOnlyDrivers}
                      className={`py-1 px-1 rounded-lg text-center transition-all cursor-pointer ${
                        !showActiveTransports && showAvailableDrivers && !showSuggestedRoutes
                          ? 'bg-emerald-600 text-white font-extrabold shadow-xs'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Drivers
                    </button>
                    <button
                      onClick={handleShowOnlyRoutes}
                      className={`py-1 px-1 rounded-lg text-center transition-all cursor-pointer ${
                        !showActiveTransports && !showAvailableDrivers && showSuggestedRoutes
                          ? 'bg-purple-600 text-white font-extrabold shadow-xs'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Routes
                    </button>
                  </div>

                  {/* 3 Dedicated Interactive Layer Toggles */}
                  <div className="space-y-2 border-t border-slate-800 pt-2.5">
                    {/* 1. Active Transports Toggle */}
                    <div
                      onClick={() => setShowActiveTransports(!showActiveTransports)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                        showActiveTransports
                          ? 'bg-sky-950/60 border-sky-600/70 text-white'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-400 opacity-65 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm ${
                          showActiveTransports ? 'bg-sky-600 text-white shadow-xs' : 'bg-slate-700 text-slate-400'
                        }`}>
                          🚛
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-xs">Active Transports</span>
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-sky-900/80 text-sky-200">
                              {filteredJobs.length} Rigs
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">Live GPS & Cabin Telemetry</p>
                        </div>
                      </div>

                      {/* Custom Toggle Switch */}
                      <div className={`w-8 h-4 rounded-full p-0.5 transition-colors shrink-0 ${
                        showActiveTransports ? 'bg-sky-500' : 'bg-slate-700'
                      }`}>
                        <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                          showActiveTransports ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </div>
                    </div>

                    {/* 2. Available Drivers Toggle */}
                    <div
                      onClick={() => setShowAvailableDrivers(!showAvailableDrivers)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                        showAvailableDrivers
                          ? 'bg-emerald-950/60 border-emerald-600/70 text-white'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-400 opacity-65 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm ${
                          showAvailableDrivers ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-700 text-slate-400'
                        }`}>
                          🤠
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-xs">Available Drivers</span>
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-900/80 text-emerald-200">
                              {MOCK_AVAILABLE_DRIVERS.length} Standby
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">USDOT Standby & Stalls Open</p>
                        </div>
                      </div>

                      {/* Custom Toggle Switch */}
                      <div className={`w-8 h-4 rounded-full p-0.5 transition-colors shrink-0 ${
                        showAvailableDrivers ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}>
                        <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                          showAvailableDrivers ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </div>
                    </div>

                    {/* 3. Suggested Routes Toggle */}
                    <div
                      onClick={() => setShowSuggestedRoutes(!showSuggestedRoutes)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                        showSuggestedRoutes
                          ? 'bg-purple-950/60 border-purple-600/70 text-white'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-400 opacity-65 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm ${
                          showSuggestedRoutes ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-700 text-slate-400'
                        }`}>
                          🛣️
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-xs">Suggested Routes</span>
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-purple-900/80 text-purple-200">
                              {MOCK_SUGGESTED_ROUTES.length} Corridors
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">Equine Highways & Water Stops</p>
                        </div>
                      </div>

                      {/* Custom Toggle Switch */}
                      <div className={`w-8 h-4 rounded-full p-0.5 transition-colors shrink-0 ${
                        showSuggestedRoutes ? 'bg-purple-500' : 'bg-slate-700'
                      }`}>
                        <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                          showSuggestedRoutes ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </div>
                    </div>
                  </div>

                  {/* Interactive Route Quick-Selector List when Suggested Routes is enabled */}
                  {showSuggestedRoutes && (
                    <div className="space-y-1.5 border-t border-slate-800 pt-2.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 block">
                        Equine Highway Corridors
                      </span>
                      <div className="space-y-1">
                        {MOCK_SUGGESTED_ROUTES.map(route => {
                          const isSelected = selectedRoute?.id === route.id;
                          return (
                            <button
                              key={route.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectRoute(route);
                              }}
                              className={`w-full text-left p-1.5 rounded-lg text-[11px] transition-all flex items-center justify-between gap-1.5 cursor-pointer ${
                                isSelected
                                  ? 'bg-purple-800/80 text-white font-extrabold ring-1 ring-purple-400'
                                  : 'bg-slate-800/50 hover:bg-slate-800 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: route.color }}
                                />
                                <span className="truncate">{route.title.split('(')[0].replace('Corridor', '')}</span>
                              </div>
                              <span className="text-[9px] font-bold text-slate-400 shrink-0">
                                {route.distanceMiles}mi
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Available Drivers Quick-Selector List when Available Drivers is enabled */}
                  {showAvailableDrivers && (
                    <div className="space-y-1.5 border-t border-slate-800 pt-2.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 block">
                        Verified Standby Drivers
                      </span>
                      <div className="space-y-1">
                        {MOCK_AVAILABLE_DRIVERS.map(driver => {
                          const isSelected = selectedDriver?.id === driver.id;
                          return (
                            <button
                              key={driver.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectDriver(driver);
                              }}
                              className={`w-full text-left p-1.5 rounded-lg text-[11px] transition-all flex items-center justify-between gap-1.5 cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-800/80 text-white font-extrabold ring-1 ring-emerald-400'
                                  : 'bg-slate-800/50 hover:bg-slate-800 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="text-xs">🤠</span>
                                <span className="truncate">{driver.name}</span>
                              </div>
                              <span className="text-[9px] font-bold text-emerald-300 shrink-0 bg-emerald-950 px-1 rounded">
                                {driver.availableStalls} Stalls Open
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Floating Bottom Status Bar on Map */}
          <div className="absolute bottom-3 left-3 right-3 z-[1000] bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-700 text-white flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              {selectedRoute ? (
                <span className="font-bold text-slate-200 truncate">
                  Corridor Selected: <strong className="text-purple-300">{selectedRoute.title}</strong> ({selectedRoute.distanceMiles} mi • {selectedRoute.estDriveTime})
                </span>
              ) : selectedDriver ? (
                <span className="font-bold text-slate-200 truncate">
                  Driver Standby: <strong className="text-emerald-300">{selectedDriver.name}</strong> • {selectedDriver.companyName} ({selectedDriver.availableStalls} stalls available)
                </span>
              ) : (
                <span className="font-bold text-slate-200 truncate">
                  Tracking: <strong className="text-white">{selectedHaul?.pickupAddress?.facilityName || selectedHaul?.pickup}</strong> ➔ <strong className="text-white">{selectedHaul?.deliveryAddress?.facilityName || selectedHaul?.dropoff}</strong>
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 shrink-0">
              <span>{mapMarkers.length} visible map markers</span>
              <span className="text-teal-400 font-bold">Open-Source Leaflet & OSM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Instant Dispatch Confirmation Modal */}
      {dispatchConfirmedDriver && (
        <div className="fixed inset-0 z-[2000] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-teal-800 font-extrabold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Driver Contacted & Dispatched</span>
              </div>
              <button
                onClick={() => setDispatchConfirmedDriver(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-2 space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto text-2xl font-black">
                🤠
              </div>
              <h3 className="font-extrabold text-base text-slate-900">
                Dispatch Request Sent to {dispatchConfirmedDriver.name}
              </h3>
              <p className="text-xs text-slate-600">
                {dispatchConfirmedDriver.companyName} has received your barn location and trip specs.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-700">
              <div className="flex justify-between font-bold">
                <span>Driver Direct Line:</span>
                <span className="text-emerald-700">{dispatchConfirmedDriver.phone}</span>
              </div>
              <div className="flex justify-between">
                <span>USDOT Certification:</span>
                <span className="font-mono font-bold text-slate-800">{dispatchConfirmedDriver.usdotNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Trailer Specs:</span>
                <span className="font-bold text-slate-800">{dispatchConfirmedDriver.rigType}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Response Time:</span>
                <span className="font-bold text-emerald-700">{dispatchConfirmedDriver.emergencyResponseTime}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <a
                href={`tel:${dispatchConfirmedDriver.phone}`}
                className="flex-1 bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all text-center flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Driver Now</span>
              </a>
              <button
                onClick={() => setDispatchConfirmedDriver(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportationLiveMap;
