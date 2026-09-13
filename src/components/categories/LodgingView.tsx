import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home, 
  MapPin, 
  Calendar, 
  Star, 
  ShieldCheck, 
  CheckCircle2, 
  Wifi, 
  Zap, 
  DollarSign, 
  Filter,
  Check,
  Plus,
  X,
  Flame,
  AlertCircle,
  Car
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MOCK_LODGING_PROPERTIES } from '../../data/mockData';
import { LodgingProperty } from '../../types';
import { OpenSourceMap } from '../common/OpenSourceMap';
import { 
  EQUINE_COLLECTIONS, 
  publishToFirestore, 
  subscribeToFirestoreCollection,
  geocodeEquineLocation 
} from '../../lib/equineDataService';
import { useAuth } from '../../context/AuthContext';

export const LodgingView: React.FC = () => {
  const { userProfile } = useAuth();
  
  // Real-time Firestore Lodging State
  const [firestoreProperties, setFirestoreProperties] = useState<LodgingProperty[]>([]);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState<boolean>(true);

  // Selected Property for Map & Booking
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('lodging-1');
  const [dates, setDates] = useState('July 4 - July 6, 2026');
  const [rigSizeFilter, setRigSizeFilter] = useState('all');
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  // Publish Lodging Modal State
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('Petaluma / Sonoma County, CA');
  const [newNightlyPrice, setNewNightlyPrice] = useState('85');
  const [newStalls, setNewStalls] = useState('4');
  const [newMaxRig, setNewMaxRig] = useState('45');
  const [newAmenities, setNewAmenities] = useState<string[]>([
    'Covered 12x12 Stall', 
    'Turnout Paddock', 
    '50A RV Electric & Water Hookup', 
    'Round Pen Access'
  ]);
  const [newPhoto, setNewPhoto] = useState('https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=800');
  const [newCogginsReq, setNewCogginsReq] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatusMsg, setPublishStatusMsg] = useState('');
  const [publishError, setPublishError] = useState('');

  // 1. Universal Real-time Firestore Subscription
  useEffect(() => {
    setIsFirebaseLoading(true);
    const unsubscribe = subscribeToFirestoreCollection<LodgingProperty>(
      EQUINE_COLLECTIONS.LODGING,
      (loaded) => {
        setFirestoreProperties(loaded);
        setIsFirebaseLoading(false);
      },
      (err) => {
        console.warn('Firestore lodging subscription warning:', err);
        setIsFirebaseLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // 2. Combine Firestore + Mock Lodging
  const properties: LodgingProperty[] = useMemo(() => {
    const combined = [...firestoreProperties, ...MOCK_LODGING_PROPERTIES];
    const seen = new Set<string>();
    return combined.filter(p => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }, [firestoreProperties]);

  const selectedProperty = useMemo(() => {
    return properties.find(p => p.id === selectedPropertyId) || properties[0] || MOCK_LODGING_PROPERTIES[0];
  }, [properties, selectedPropertyId]);

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      if (rigSizeFilter === '30' && p.maxRigLengthFeet < 30) return false;
      if (rigSizeFilter === '40' && p.maxRigLengthFeet < 40) return false;
      if (rigSizeFilter === '50' && p.maxRigLengthFeet < 50) return false;
      return true;
    });
  }, [properties, rigSizeFilter]);

  const handleBookStay = (p: LodgingProperty) => {
    setBookingSuccess(p.title);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handlePublishLodging = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newLocation.trim()) {
      setPublishError('Please enter a property title and location.');
      return;
    }

    setIsPublishing(true);
    setPublishError('');
    setPublishStatusMsg('Publishing Horse Motel listing to Firebase database...');

    try {
      const coords = geocodeEquineLocation(newLocation);

      const payload: Partial<LodgingProperty> = {
        title: newTitle.trim(),
        location: newLocation.trim(),
        nightlyPrice: Number(newNightlyPrice) || 85,
        rating: 5.0,
        image: newPhoto || 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=800',
        stallsAvailable: Number(newStalls) || 4,
        maxRigLengthFeet: Number(newMaxRig) || 45,
        cogginsRequired: newCogginsReq,
        amenities: newAmenities,
        status: 'available',
        lat: coords.lat,
        lng: coords.lng,
        isFirebase: true,
        publishedAsListing: true
      };

      const docRef = await publishToFirestore(
        EQUINE_COLLECTIONS.LODGING,
        payload
      );

      if (docRef?.id) {
        setSelectedPropertyId(docRef.id);
      }

      setPublishStatusMsg('Horse Motel property published successfully!');
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

      setTimeout(() => {
        setShowPublishModal(false);
        setNewTitle('');
        setPublishStatusMsg('');
      }, 800);

    } catch (err: any) {
      console.error('Failed to publish lodging property:', err);
      setPublishError(err?.message || 'Database error occurred. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-10 space-y-6">
      {/* Title Header */}
      <div className="bg-[#1B4A72] text-white p-4 sm:p-5 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-md">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black uppercase tracking-wide text-white">
                BED & BALE LODGING (PRICELINE-STYLE)
              </h1>
              <span className="bg-emerald-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                {properties.length} Stays
              </span>
            </div>
            <p className="text-xs text-sky-200 mt-0.5">
              Horse motels, covered stalls, turnout paddocks & 50A RV pads
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowPublishModal(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Publish Horse Motel / Stay</span>
          </button>
        </div>
      </div>

      {/* Booking Success Alert */}
      {bookingSuccess && (
        <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between border-2 border-emerald-400 animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-white shrink-0" />
            <div>
              <h3 className="font-extrabold text-sm uppercase">STAY BOOKED CONFIRMED!</h3>
              <p className="text-xs text-emerald-100">
                Reservation for <span className="font-bold text-white">{bookingSuccess}</span> ({dates}) confirmed. Gate code & stall assigned!
              </p>
            </div>
          </div>
          <button 
            onClick={() => setBookingSuccess(null)}
            className="bg-white text-emerald-900 font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer hover:bg-emerald-50 shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter & Search Bar (Priceline Style) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="font-extrabold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-emerald-600" />
            Lodging Search Criteria
          </span>
          <span className="text-[11px] text-slate-500 font-bold">Sonoma & Northern California Radius</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Stay Dates</label>
            <input 
              type="text" 
              value={dates} 
              onChange={(e) => setDates(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Max Trailer Rig Size</label>
            <select 
              value={rigSizeFilter} 
              onChange={(e) => setRigSizeFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Trailer Sizes</option>
              <option value="30">30'+ Gooseneck / Bumper Pull</option>
              <option value="40">40'+ Living Quarters RV Rig</option>
              <option value="50">50'+ Semi / Commercial Van</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Equine Stall Feature</label>
            <select className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option>Covered Box Stall + Turnout</option>
              <option>Pasture Paddock Only</option>
              <option>Indoor Arena Stall + Wash Rack</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid: Map Pins View + Property Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Map Preview */}
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-800 relative h-96">
            <OpenSourceMap
              center={{ lat: selectedProperty.lat || 38.4404, lng: selectedProperty.lng || -122.7141 }}
              zoom={10}
              height="100%"
              selectedMarkerId={selectedProperty.id}
              onMarkerSelect={(id) => {
                setSelectedPropertyId(id);
              }}
              markers={filteredProperties.map(p => ({
                id: p.id,
                lat: p.lat || 38.4404,
                lng: p.lng || -122.7141,
                title: p.title,
                subtitle: `${p.location} • $${p.nightlyPrice}/night`,
                badge: p.status.toUpperCase(),
                color: selectedProperty.id === p.id ? '#059669' : '#0284c7',
                icon: '🏡',
                onClick: () => setSelectedPropertyId(p.id)
              }))}
            />
          </div>
        </div>

        {/* Right: Property Cards List */}
        <div className="space-y-4">
          {filteredProperties.map((p) => (
            <div 
              key={p.id}
              onClick={() => setSelectedPropertyId(p.id)}
              className={`bg-white rounded-2xl p-4 shadow-sm border transition-all cursor-pointer space-y-3 ${
                selectedProperty.id === p.id ? 'border-emerald-500 ring-2 ring-emerald-400/30 shadow-md' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="relative h-44 rounded-xl overflow-hidden bg-slate-100">
                <img 
                  src={p.image} 
                  alt={p.title} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                  loading="lazy"
                />
                <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{p.rating}</span>
                </span>
                {p.isFirebase && (
                  <span className="absolute top-2 left-16 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow flex items-center gap-0.5">
                    <Flame className="w-2.5 h-2.5 text-amber-300 fill-amber-300" /> Firebase
                  </span>
                )}
                <span className="absolute top-2 right-2 bg-emerald-600 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow">
                  ${p.nightlyPrice}/night
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-slate-900">{p.title}</h3>
                  {p.cogginsRequired && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Coggins Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">{p.location} • Stalls Available: {p.stallsAvailable}</p>
              </div>

              <div className="flex flex-wrap gap-1">
                {p.amenities.map(a => (
                  <span key={a} className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded">
                    {a}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700">
                  Max Rig Size: {p.maxRigLengthFeet}ft Trailer
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBookStay(p);
                  }}
                  disabled={p.status === 'booked'}
                  className={`font-extrabold text-xs px-4 py-2 rounded-xl transition-colors shadow cursor-pointer ${
                    p.status === 'booked' 
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {p.status === 'booked' ? 'Fully Booked' : 'Book Stay Now'}
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* 🟢 PUBLISH HORSE MOTEL / LODGING MODAL */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                    Publish Horse Motel / Overnight Stay
                  </h3>
                  <p className="text-xs text-slate-500">
                    Saves directly to Firebase lodging collection with map GPS coordinates
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowPublishModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {publishStatusMsg ? (
              <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="font-black text-base">{publishStatusMsg}</h4>
                <p className="text-xs text-emerald-800">Your horse lodging facility is live on the interactive GPS map and booking calendar.</p>
              </div>
            ) : (
              <form onSubmit={handlePublishLodging} className="space-y-3.5 text-xs">
                {publishError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2 font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{publishError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ranch / Property Name *</label>
                  <input 
                    type="text" 
                    value={newTitle} 
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="E.g., Sonoma Valley Equine Oasis & RV Hookups"
                    className="w-full border border-slate-300 p-2.5 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location / Address *</label>
                  <input 
                    type="text" 
                    value={newLocation} 
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Petaluma, CA or 1420 Arnold Dr, Sonoma, CA"
                    className="w-full border border-slate-300 p-2.5 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nightly Rate ($)</label>
                    <input 
                      type="number" 
                      value={newNightlyPrice} 
                      onChange={(e) => setNewNightlyPrice(e.target.value)}
                      placeholder="85"
                      className="w-full border border-slate-300 p-2.5 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Stalls Available</label>
                    <input 
                      type="number" 
                      value={newStalls} 
                      onChange={(e) => setNewStalls(e.target.value)}
                      placeholder="4"
                      className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Max Rig Length</label>
                    <input 
                      type="number" 
                      value={newMaxRig} 
                      onChange={(e) => setNewMaxRig(e.target.value)}
                      placeholder="45"
                      className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Amenities Checkboxes */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amenities Included</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Covered 12x12 Stall',
                      'Turnout Paddock',
                      '50A RV Electric & Water Hookup',
                      'Round Pen Access',
                      'Hot Water Wash Rack',
                      'Covered Riding Arena',
                      'Gated Security'
                    ].map(amenity => (
                      <label key={amenity} className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={newAmenities.includes(amenity)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewAmenities([...newAmenities, amenity]);
                            } else {
                              setNewAmenities(newAmenities.filter(a => a !== amenity));
                            }
                          }}
                          className="w-3.5 h-3.5 accent-emerald-600 rounded"
                        />
                        <span>{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                    <input
                      type="checkbox"
                      checked={newCogginsReq}
                      onChange={(e) => setNewCogginsReq(e.target.checked)}
                      className="w-4 h-4 accent-emerald-600 rounded"
                    />
                    <span className="font-bold text-emerald-950">Require Negative Coggins & Health Certificate within 30 Days</span>
                  </label>
                </div>

                {/* Photo Presets */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lodging Photo Preset</label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {[
                      { label: 'Barn & Paddock', url: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=800' },
                      { label: 'Equestrian Estate', url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=800' },
                      { label: 'Covered Stalls', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800' }
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setNewPhoto(preset.url)}
                        className={`p-1.5 rounded-xl border text-left flex flex-col items-center gap-1 transition-all ${
                          newPhoto === preset.url ? 'border-emerald-600 ring-2 ring-emerald-500/30 bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <img src={preset.url} alt={preset.label} className="w-full h-12 object-cover rounded-lg" />
                        <span className="text-[10px] font-bold text-slate-700">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setShowPublishModal(false)}
                    className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isPublishing}
                    className="w-2/3 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-black shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Flame className="w-4 h-4 text-amber-300" />
                    <span>{isPublishing ? 'Publishing...' : 'Publish Horse Stay'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
