import React, { useState, useEffect, useMemo } from 'react';
import { 
  Stethoscope, 
  Calendar, 
  MapPin, 
  Video, 
  ShieldCheck, 
  FileText, 
  Plus, 
  CheckCircle2, 
  Search, 
  Clock, 
  FolderOpen, 
  Phone, 
  Navigation, 
  Star, 
  Layers, 
  Crosshair, 
  Share2, 
  Bookmark, 
  ChevronRight, 
  X, 
  SlidersHorizontal, 
  Car, 
  Award, 
  ExternalLink, 
  Check, 
  AlertCircle, 
  ThumbsUp, 
  PenTool, 
  MessageSquare, 
  ShieldAlert, 
  Heart,
  Sparkles,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFavorites } from '../../context/FavoritesContext';
import { MOCK_ROUTINE_VETS, MOCK_APPOINTMENTS, MOCK_MEDICAL_RECORDS, MOCK_USER_HORSES } from '../../data/mockData';
import { VetClinic, ClinicReview } from '../../types';
import { OpenSourceMap } from '../common/OpenSourceMap';
import { StarRating } from '../common/StarRating';
import { EmergencyVetView } from './EmergencyVetView';
import { useSavedAddress } from '../../context/SavedAddressContext';
import { 
  EQUINE_COLLECTIONS, 
  publishToFirestore, 
  subscribeToFirestoreCollection, 
  geocodeEquineLocation 
} from '../../lib/equineDataService';
import { useAuth } from '../../context/AuthContext';

export const getClinicCategoryDetails = (clinic: VetClinic) => {
  const isEmergency = clinic.is247 || clinic.services.some(s => s.toLowerCase().includes('emergency'));
  const isMobile = clinic.ambulatory || clinic.name.toLowerCase().includes('ambulatory');
  
  if (isEmergency) {
    return {
      type: 'emergency' as const,
      label: 'Emergency 24/7',
      color: '#e11d48', // Rose 600
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      icon: '🚨'
    };
  }
  if (isMobile) {
    return {
      type: 'mobile' as const,
      label: 'Mobile Ambulatory',
      color: '#0d9488', // Teal 600
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
      icon: '🚐'
    };
  }
  return {
    type: 'full-service' as const,
    label: 'Full Service Hospital',
    color: '#0284c7', // Sky 600
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    icon: '🏥'
  };
};

interface RoutineVetViewProps {
  initialTab?: 'clinics' | 'emergency';
}

export const RoutineVetView: React.FC<RoutineVetViewProps> = ({ initialTab = 'clinics' }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { userProfile } = useAuth();
  const { 
    savedAddress, 
    calculateDistanceMiles, 
    calculateDriveTimeMinutes, 
    calculateFarmCallFee,
    getOpenStreetMapDirectionsUrl,
    getReferenceCoords
  } = useSavedAddress();
  const [activeVetTab, setActiveVetTab] = useState<'clinics' | 'emergency'>(initialTab);
  
  // Navigation & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [mapFilter, setMapFilter] = useState<'all' | 'emergency' | 'mobile' | 'full-service'>('all');
  
  // Real-time Firestore & Combined Clinics State
  const [firestoreVets, setFirestoreVets] = useState<VetClinic[]>([]);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState<boolean>(true);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');

  // Publish Practice Modal State
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [pubName, setPubName] = useState('');
  const [pubPhone, setPubPhone] = useState(userProfile?.phone || '');
  const [pubEmergencyPhone, setPubEmergencyPhone] = useState('');
  const [pubStreet, setPubStreet] = useState('');
  const [pubCity, setPubCity] = useState('Santa Rosa');
  const [pubState, setPubState] = useState('CA');
  const [pubZip, setPubZip] = useState('95404');
  const [pubIs247, setPubIs247] = useState(false);
  const [pubAmbulatory, setPubAmbulatory] = useState(true);
  const [pubServices, setPubServices] = useState('Routine Exams, Vaccines, Dental Floating, Coggins, Lameness Workup');
  const [pubDoctorName, setPubDoctorName] = useState(userProfile?.fullName || 'Dr. Alex Morgan, DVM');
  const [pubImage, setPubImage] = useState('https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?auto=format&fit=crop&q=80&w=800');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatusMsg, setPublishStatusMsg] = useState('');
  const [publishError, setPublishError] = useState('');

  const [localReviewsByClinic, setLocalReviewsByClinic] = useState<Record<string, ClinicReview[]>>({});

  // 1. Universal Real-Time Subscription to Firestore `veterinarians`
  useEffect(() => {
    setIsFirebaseLoading(true);
    const unsubscribe = subscribeToFirestoreCollection<VetClinic>(
      EQUINE_COLLECTIONS.VETERINARIANS,
      (loadedVets) => {
        setFirestoreVets(loadedVets);
        setIsFirebaseLoading(false);
      },
      (error) => {
        console.warn('Firestore veterinarians sync warning:', error);
        setIsFirebaseLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // 2. Combine Firestore vets + Mock directory entries (Firestore listings appear first)
  const clinics: VetClinic[] = useMemo(() => {
    const combined = [...firestoreVets, ...MOCK_ROUTINE_VETS];
    const seen = new Set<string>();
    return combined
      .filter(c => {
        if (seen.has(c.id)) return false;
        seen.add(c.id);
        return true;
      })
      .map(c => {
        const addedReviews = localReviewsByClinic[c.id];
        if (!addedReviews || addedReviews.length === 0) return c;
        const existingReviews = c.reviews || [];
        const mergedReviews = [...addedReviews, ...existingReviews];
        const totalStars = mergedReviews.reduce((sum, r) => sum + r.rating, 0);
        return {
          ...c,
          reviews: mergedReviews,
          reviewsCount: mergedReviews.length,
          rating: Number((totalStars / mergedReviews.length).toFixed(1))
        };
      });
  }, [firestoreVets, localReviewsByClinic]);

  // State Centers for interactive map auto-centering
  const STATE_CENTERS: Record<string, { lat: number; lng: number; zoom: number }> = {
    'ALL': { lat: 39.50, lng: -98.35, zoom: 4 },
    'KY': { lat: 38.0837, lng: -84.5126, zoom: 11 },
    'CA': { lat: 37.5000, lng: -121.5000, zoom: 7 },
    'TX': { lat: 31.0000, lng: -97.5000, zoom: 7 },
    'FL': { lat: 28.0000, lng: -81.5000, zoom: 7 },
    'VA': { lat: 37.7587, lng: -77.4811, zoom: 9 },
    'NC': { lat: 35.2532, lng: -82.2012, zoom: 10 },
    'CO': { lat: 39.5794, lng: -105.0189, zoom: 9 },
    'NJ': { lat: 40.4284, lng: -74.8632, zoom: 10 },
    'NY': { lat: 43.0831, lng: -73.7846, zoom: 10 },
    'KS': { lat: 38.9717, lng: -95.2530, zoom: 10 },
    'IA': { lat: 42.0252, lng: -91.6421, zoom: 10 }
  };

  const handleSelectState = (stateCode: string) => {
    setSelectedState(stateCode);
    if (STATE_CENTERS[stateCode]) {
      setMapCenter({ lat: STATE_CENTERS[stateCode].lat, lng: STATE_CENTERS[stateCode].lng });
      setMapZoom(STATE_CENTERS[stateCode].zoom);
    }
  };

  // Map Center, Zoom & Geolocation Auto-Zoom State
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 38.4404, lng: -122.7141 });
  const [mapZoom, setMapZoom] = useState<number>(11);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string>('Santa Rosa, CA');

  const locateUser = (autoZoom = true) => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setIsLocating(true);
      setLocationStatus('Acquiring location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userPos);
          if (autoZoom) {
            setMapCenter(userPos);
            setMapZoom(13); // Zoom to local discovery level
          }
          setLocationStatus('Auto-zoomed to your current GPS location');
          setIsLocating(false);
        },
        (error) => {
          console.warn('Geolocation request omitted or failed:', error.message);
          setLocationStatus('Default location (Santa Rosa, CA)');
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    }
  };

  // Automatically request geolocation on load to zoom to current user location
  useEffect(() => {
    locateUser(true);
  }, []);

  // When a clinic is selected, center map on that clinic
  useEffect(() => {
    if (selectedClinic) {
      setMapCenter({ lat: selectedClinic.lat, lng: selectedClinic.lng });
      setMapZoom(13);
    }
  }, [selectedClinicId]);

  const selectedClinic = clinics.find(c => c.id === selectedClinicId) || null;

  // Modals & Drawers
  const [showBookModal, setShowBookModal] = useState(false);
  const [showDirectionsModal, setShowDirectionsModal] = useState(false);
  const [showAppointmentsModal, setShowAppointmentsModal] = useState(false);
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [savedClinics, setSavedClinics] = useState<string[]>(['vc-1']);

  // Review System State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewAuthor, setReviewAuthor] = useState('You (Local Horse Owner)');
  const [reviewService, setReviewService] = useState('Coggins & Annual Vaccines');
  const [reviewHorse, setReviewHorse] = useState(MOCK_USER_HORSES[0].name);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewFilterRating, setReviewFilterRating] = useState<number | 'all'>('all');
  const [reviewSortBy, setReviewSortBy] = useState<'recent' | 'highest' | 'helpful'>('recent');
  const [votedHelpful, setVotedHelpful] = useState<string[]>([]);

  // Appointment Form State
  const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS);
  const [bookingDate, setBookingDate] = useState('2026-10-25');
  const [bookingTime, setBookingTime] = useState('09:30 AM');
  const [bookingService, setBookingService] = useState('Coggins Test & Annual Vaccines');
  const [bookingHorse, setBookingHorse] = useState(MOCK_USER_HORSES[0].name);
  const [bookingType, setBookingType] = useState<'farm-call' | 'in-clinic'>('farm-call');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Filter Clinics
  const filteredClinics = clinics.filter(clinic => {
    // State Filter
    if (selectedState !== 'ALL' && clinic.state !== selectedState) {
      return false;
    }

    const matchesSearch = searchQuery === '' || 
      clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clinic.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (clinic.state && clinic.state.toLowerCase().includes(searchQuery.toLowerCase())) ||
      clinic.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      clinic.vets.some(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Map View Filter Panel Check
    if (mapFilter === 'emergency') {
      if (!clinic.is247 && !clinic.services.some(s => s.toLowerCase().includes('emergency'))) return false;
    } else if (mapFilter === 'mobile') {
      if (!clinic.ambulatory && !clinic.name.toLowerCase().includes('ambulatory')) return false;
    } else if (mapFilter === 'full-service') {
      const isFullService = clinic.services.some(s => 
        s.toLowerCase().includes('surgical') || 
        s.toLowerCase().includes('suite') || 
        s.toLowerCase().includes('hospital') ||
        s.toLowerCase().includes('endoscopy') ||
        s.toLowerCase().includes('imaging')
      ) || clinic.name.toLowerCase().includes('hospital') || clinic.name.toLowerCase().includes('clinic');
      if (!isFullService) return false;
    }

    if (activeCategory === 'open') return clinic.isOpen;
    if (activeCategory === '247') return clinic.is247;
    if (activeCategory === 'mobile') return clinic.ambulatory;
    if (activeCategory === 'dental') return clinic.services.some(s => s.toLowerCase().includes('dental') || s.toLowerCase().includes('float'));
    if (activeCategory === 'coggins') return clinic.services.some(s => s.toLowerCase().includes('coggins') || s.toLowerCase().includes('vaccin'));
    if (activeCategory === 'ppe') return clinic.services.some(s => s.toLowerCase().includes('pre-purchase') || s.toLowerCase().includes('exam'));

    return true;
  });

  const toggleSaveClinic = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const clinic = clinics.find(c => c.id === id);
    if (clinic) {
      toggleFavorite({
        id: clinic.id,
        category: 'vets',
        title: clinic.name,
        subtitle: clinic.address,
        rating: clinic.rating,
        image: clinic.image,
        location: clinic.address
      });
    }
    setSavedClinics(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClinic) return;

    const newApt = {
      id: `apt-${Date.now()}`,
      vetName: selectedClinic.vets[0]?.name || 'Equine Specialist',
      clinicName: selectedClinic.name,
      date: bookingDate,
      time: bookingTime,
      service: `${bookingService} (${bookingType === 'farm-call' ? 'Farm Call' : 'In-Clinic'})`,
      horseName: bookingHorse,
      verified: true
    };

    setAppointments([newApt, ...appointments]);
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setShowBookModal(false);
    }, 1500);
  };

  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClinic) return;

    const newReview: ClinicReview = {
      id: `rev-${Date.now()}`,
      clinicId: selectedClinic.id,
      authorName: reviewAuthor || 'Local Rider',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      rating: reviewRating,
      date: 'Just now',
      comment: reviewComment || 'Great equine medical team and very thorough!',
      verifiedVisit: true,
      serviceType: reviewService,
      horseName: reviewHorse,
      helpfulCount: 0
    };

    setLocalReviewsByClinic(prev => ({
      ...prev,
      [selectedClinic.id]: [newReview, ...(prev[selectedClinic.id] || [])]
    }));

    setReviewSuccess(true);
    setTimeout(() => {
      setReviewSuccess(false);
      setShowReviewModal(false);
      setReviewComment('');
      setReviewRating(5);
    }, 1200);
  };

  const handlePublishClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubName.trim() || !pubPhone.trim()) {
      setPublishError('Please enter a clinic name and contact phone number.');
      return;
    }

    setIsPublishing(true);
    setPublishError('');
    setPublishStatusMsg('Publishing veterinary clinic to Firebase database...');

    try {
      const fullAddress = `${pubStreet ? pubStreet + ', ' : ''}${pubCity}, ${pubState} ${pubZip}`;
      const geocoded = geocodeEquineLocation(pubCity, pubState, pubStreet || pubName);

      const servicesArray = pubServices
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const newClinicPayload = {
        name: pubName.trim(),
        rating: 5.0,
        reviewsCount: 1,
        address: fullAddress,
        city: pubCity.trim(),
        state: pubState.trim().toUpperCase(),
        zipCode: pubZip.trim(),
        phone: pubPhone.trim(),
        emergencyPhone: pubEmergencyPhone.trim() || undefined,
        image: pubImage || 'https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?auto=format&fit=crop&q=80&w=800',
        photos: [pubImage || 'https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?auto=format&fit=crop&q=80&w=800'],
        vets: [
          {
            name: pubDoctorName.trim() || 'Equine Specialist',
            avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
            rating: 5.0,
            specialty: pubIs247 ? 'Critical Care & Surgery' : 'Equine Sports Medicine & Wellness'
          }
        ],
        nextAvailable: 'Today • On-Call',
        services: servicesArray.length > 0 ? servicesArray : ['Routine Exams', 'Vaccines', 'Dental Floating'],
        lat: geocoded.lat,
        lng: geocoded.lng,
        distanceMiles: 5.0,
        hours: pubIs247 ? 'Open 24/7 Emergency' : 'Mon-Fri 8:00 AM - 5:00 PM',
        isOpen: true,
        is247: pubIs247,
        ambulatory: pubAmbulatory,
        farmCallFee: pubAmbulatory ? 85 : undefined,
        description: `Verified equine veterinary facility in ${pubCity}, ${pubState}. Ambulatory truck dispatch and routine equine health care.`,
        directorySource: 'Published Member Practice',
        publishedAsListing: true,
        isFirebase: true
      };

      const result = await publishToFirestore(
        EQUINE_COLLECTIONS.VETERINARIANS,
        newClinicPayload
      );

      setPublishStatusMsg('Practice published successfully to Firebase database!');
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      
      setSelectedClinicId(result.id);
      setMapCenter({ lat: geocoded.lat, lng: geocoded.lng });
      setMapZoom(13);

      setTimeout(() => {
        setShowPublishModal(false);
        setPubName('');
        setPubStreet('');
        setPublishStatusMsg('');
      }, 800);

    } catch (err: any) {
      console.error('Failed to publish clinic:', err);
      setPublishError(err?.message || 'Database write error. Please verify network and try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleToggleHelpful = (reviewId: string) => {
    const alreadyVoted = votedHelpful.includes(reviewId);
    setVotedHelpful(prev => alreadyVoted ? prev.filter(id => id !== reviewId) : [...prev, reviewId]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-85px)] bg-slate-100 overflow-hidden select-none font-sans">
      
      {/* 🟢 TOP UNIFIED VET CATEGORY MODE SELECTOR BAR */}
      <div className="bg-[#0b2f4f] border-b border-white/10 px-3 py-2 flex items-center justify-between text-xs shrink-0 z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveVetTab('clinics')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
              activeVetTab === 'clinics'
                ? 'bg-teal-500 text-slate-950 shadow-md'
                : 'bg-white/10 text-sky-100 hover:bg-white/20'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Veterinarians & Routine Care</span>
          </button>

          <button
            onClick={() => setActiveVetTab('emergency')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
              activeVetTab === 'emergency'
                ? 'bg-red-600 text-white font-black shadow-md animate-pulse'
                : 'bg-red-950/80 text-red-200 border border-red-500/40 hover:bg-red-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-300" />
            <span>24/7 Emergency Vet Dispatch</span>
            <span className="bg-white text-red-700 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase ml-0.5">
              Urgent
            </span>
          </button>
        </div>

        <span className="hidden md:inline-block text-[11px] text-teal-300 font-medium">
          Santa Rosa & Sonoma Radius
        </span>
      </div>

      {activeVetTab === 'emergency' ? (
        <div className="flex-1 overflow-y-auto">
          <EmergencyVetView />
        </div>
      ) : (
        <>
          {/* 🟢 TOP GOOGLE MAPS FLOATING SEARCH & ACTION HEADER */}
          <div className="bg-white border-b border-slate-200 shadow-sm z-30 px-3 py-2.5 flex flex-col gap-2 shrink-0">
        <div className="flex items-center gap-2">
          
          {/* Main Google Maps Search Box */}
          <div className="flex-1 relative flex items-center bg-slate-100 hover:bg-slate-200/70 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-500 border border-slate-200 rounded-full transition-all px-3.5 py-2 shadow-inner">
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
            <input 
              type="text"
              placeholder="Search equine veterinarians, 'Dental', 'Coggins', or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

            {/* Quick Action Pills: My Appointments, Vault, Tele-Vet, and Publish Listing */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setShowPublishModal(true)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-[11px] px-3 py-2 rounded-full flex items-center gap-1.5 transition-all shadow-sm hover:scale-[1.02] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Publish Practice</span>
              </button>

              <button
                onClick={() => setShowAppointmentsModal(true)}
                className="relative bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-extrabold text-[11px] px-3 py-2 rounded-full flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span className="hidden sm:inline">Appointments</span>
                <span className="bg-teal-700 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {appointments.length}
                </span>
              </button>

            <button
              onClick={() => setShowVaultModal(true)}
              className="bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold text-[11px] px-3 py-2 rounded-full flex items-center gap-1.5 transition-colors"
            >
              <FolderOpen className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden md:inline">Coggins & Vault</span>
            </button>

            <button
              onClick={() => alert('Launching horsez Tele-Vet Video Room... Connect with an available vet in 15 mins.')}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] px-3 py-2 rounded-full flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Video className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden lg:inline">Tele-Vet</span>
            </button>

            {/* View Mode Selector (Split / List / Map) */}
            <div className="hidden md:flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200">
              <button
                onClick={() => setViewMode('split')}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-full transition-all ${
                  viewMode === 'split' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Split
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-full transition-all ${
                  viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-full transition-all ${
                  viewMode === 'map' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Map
              </button>
            </div>
          </div>
        </div>

        {/* US State Selector Bar (Mad Barn US Directory Hubs) */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 border-b border-slate-100 text-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1 mr-1">
            <span className="text-sm">🇺🇸</span> State:
          </span>
          {[
            { id: 'ALL', label: 'All US States', count: clinics.length },
            { id: 'KY', label: 'Kentucky (KY)', count: clinics.filter(c => c.state === 'KY').length },
            { id: 'CA', label: 'California (CA)', count: clinics.filter(c => c.state === 'CA').length },
            { id: 'TX', label: 'Texas (TX)', count: clinics.filter(c => c.state === 'TX').length },
            { id: 'FL', label: 'Florida (FL)', count: clinics.filter(c => c.state === 'FL').length },
            { id: 'VA', label: 'Virginia (VA)', count: clinics.filter(c => c.state === 'VA').length },
            { id: 'NC', label: 'North Carolina (NC)', count: clinics.filter(c => c.state === 'NC').length },
            { id: 'CO', label: 'Colorado (CO)', count: clinics.filter(c => c.state === 'CO').length },
            { id: 'NJ', label: 'New Jersey (NJ)', count: clinics.filter(c => c.state === 'NJ').length },
            { id: 'NY', label: 'New York (NY)', count: clinics.filter(c => c.state === 'NY').length },
            { id: 'KS', label: 'Kansas (KS)', count: clinics.filter(c => c.state === 'KS').length },
            { id: 'IA', label: 'Iowa (IA)', count: clinics.filter(c => c.state === 'IA').length },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => handleSelectState(st.id)}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold shrink-0 transition-colors flex items-center gap-1 ${
                selectedState === st.id
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{st.label}</span>
              <span className={`text-[9px] px-1 rounded ${selectedState === st.id ? 'bg-sky-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {st.count}
              </span>
            </button>
          ))}
        </div>

        {/* Category Pill Filters (Google Maps Horizontal Filter Bar) */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 text-xs">
          <button
            onClick={() => setActiveCategory('open')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition-colors border flex items-center gap-1 ${
              activeCategory === 'open' 
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm' 
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            Open Now
          </button>

          <button
            onClick={() => setActiveCategory('247')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition-colors border flex items-center gap-1 ${
              activeCategory === '247' 
                ? 'bg-red-700 text-white border-red-700 shadow-sm' 
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-3 h-3" />
            24/7 Emergency
          </button>

          <button
            onClick={() => setActiveCategory('mobile')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition-colors border flex items-center gap-1 ${
              activeCategory === 'mobile' 
                ? 'bg-teal-700 text-white border-teal-700 shadow-sm' 
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Car className="w-3 h-3" />
            Ambulatory / Mobile Farm Calls
          </button>

          <button
            onClick={() => setActiveCategory('dental')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition-colors border ${
              activeCategory === 'dental' 
                ? 'bg-indigo-700 text-white border-indigo-700 shadow-sm' 
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            Dental Floating
          </button>

          <button
            onClick={() => setActiveCategory('coggins')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition-colors border ${
              activeCategory === 'coggins' 
                ? 'bg-teal-700 text-white border-teal-700 shadow-sm' 
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            Coggins & Vaccines
          </button>

          <button
            onClick={() => setActiveCategory('ppe')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition-colors border ${
              activeCategory === 'ppe' 
                ? 'bg-purple-700 text-white border-purple-700 shadow-sm' 
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            Pre-Purchase Exams
          </button>

          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition-colors border ${
              activeCategory === 'all' 
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            All Listings ({filteredClinics.length})
          </button>
        </div>
      </div>

      {/* 🔴 MAIN CONTAINER: GOOGLE MAPS SPLIT VIEW (LEFT: LIST / PLACE SHEET, RIGHT: INTERACTIVE MAP) */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* 1. LEFT SIDEBAR PANEL (SEARCH RESULTS & PLACE DETAILS) */}
        <div className={`w-full md:w-[410px] lg:w-[450px] bg-white border-r border-slate-200 flex flex-col h-full z-20 shrink-0 transition-all ${
          viewMode === 'map' ? 'hidden' : 'flex'
        }`}>
          
          {/* A. If a Clinic is Selected -> Display Google Maps Place Details Card */}
          {selectedClinic ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col bg-white">
              
              {/* Cover Image Header with Back Button */}
              <div className="relative h-48 bg-slate-900 group shrink-0">
                <img 
                  src={selectedClinic.image} 
                  alt={selectedClinic.name} 
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                <button 
                  onClick={() => setSelectedClinicId(null)}
                  className="absolute top-3 left-3 bg-white/90 hover:bg-white text-slate-800 p-2 rounded-full shadow-lg transition-transform hover:scale-105"
                  title="Back to search results"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <button 
                    onClick={(e) => toggleSaveClinic(selectedClinic.id, e)}
                    className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg text-slate-700 hover:text-amber-500 transition-colors"
                  >
                    <Bookmark className={`w-4 h-4 ${savedClinics.includes(selectedClinic.id) ? 'fill-amber-500 text-amber-500' : ''}`} />
                  </button>
                  <button 
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href);
                      alert('Clinic link copied to clipboard!');
                    }}
                    className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg text-slate-700 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                      {selectedClinic.isOpen ? 'OPEN NOW' : 'CLOSED'}
                    </span>
                    {selectedClinic.is247 && (
                      <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                        24/7 EMERGENCY
                      </span>
                    )}
                    {selectedClinic.ambulatory && (
                      <span className="bg-teal-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                        MOBILE FARM CALL
                      </span>
                    )}
                  </div>
                  <h1 className="text-lg font-black leading-snug drop-shadow-sm">{selectedClinic.name}</h1>
                </div>
              </div>

              {/* Place Card Main Section */}
              <div className="p-4 space-y-4 border-b border-slate-100">
                {/* Rating & Distance */}
                <div className="flex items-center justify-between text-xs">
                  <button 
                    onClick={() => {
                      const el = document.getElementById('reviews-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex items-center gap-1.5 hover:opacity-80 transition-opacity text-left cursor-pointer group"
                  >
                    <StarRating
                      rating={selectedClinic.rating}
                      showScore
                      showCount
                      reviewCount={selectedClinic.reviewsCount || selectedClinic.reviews?.length || 0}
                      size="sm"
                      scoreClass="font-black text-slate-900 text-sm"
                      countClass="text-sky-600 font-bold underline group-hover:text-sky-700 text-xs"
                    />
                  </button>
                  {(() => {
                    const relativeDist = calculateDistanceMiles(selectedClinic.lat, selectedClinic.lng);
                    const driveTime = calculateDriveTimeMinutes(selectedClinic.lat, selectedClinic.lng);
                    return (
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="font-extrabold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full text-xs">
                          {relativeDist} mi from saved barn
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">
                          ~{driveTime} min drive • ({savedAddress.facilityName})
                        </span>
                      </div>
                    );
                  })()}
                </div>

                {/* GOOGLE MAPS ACTION BUTTONS ROW */}
                <div className="grid grid-cols-4 gap-2 text-center pt-1">
                  <button
                    onClick={() => setShowDirectionsModal(true)}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white shadow transition-transform active:scale-95"
                  >
                    <Navigation className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-bold uppercase">Directions</span>
                  </button>

                  <button
                    onClick={() => setShowBookModal(true)}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow transition-transform active:scale-95"
                  >
                    <Calendar className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-bold uppercase">Book Visit</span>
                  </button>

                  <a
                    href={`tel:${selectedClinic.phone || '7075550199'}`}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                  >
                    <Phone className="w-5 h-5 mb-1 text-teal-600" />
                    <span className="text-[10px] font-bold uppercase">Call</span>
                  </a>

                  <button
                    onClick={() => alert(`Messaging ${selectedClinic.name} reception desk...`)}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                  >
                    <Stethoscope className="w-5 h-5 mb-1 text-sky-600" />
                    <span className="text-[10px] font-bold uppercase">Triage</span>
                  </button>
                </div>
              </div>

              {/* Details & Overview Tab Content */}
              <div className="p-4 space-y-4 text-xs">
                
                {/* Description */}
                <p className="text-slate-600 leading-relaxed font-normal">
                  {selectedClinic.description}
                </p>

                {/* Key Place Info */}
                <div className="space-y-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex items-start gap-2 text-slate-700">
                    <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">{selectedClinic.address}</p>
                      <p className="text-[10px] text-slate-500">Sonoma County Service Radius</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900">{selectedClinic.hours}</span>
                      <span className="text-[10px] text-slate-500 ml-2">(Next Available: {selectedClinic.nextAvailable})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700">
                    <Car className="w-4 h-4 text-teal-600 shrink-0" />
                    <span className="font-medium">Standard Farm Call Fee: <strong className="text-slate-900">${selectedClinic.farmCallFee || 50}</strong></span>
                  </div>
                </div>

                {/* Doctors / Vets on Staff */}
                <div className="space-y-2">
                  <h3 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500">
                    Veterinarians On Staff
                  </h3>
                  <div className="space-y-2">
                    {selectedClinic.vets.map((vet, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                        <div className="flex items-center gap-2.5">
                          <img src={vet.avatar} alt={vet.name} className="w-9 h-9 rounded-full object-cover border border-slate-300" />
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-slate-800 text-xs">{vet.name}</span>
                              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                            </div>
                            <p className="text-[10px] text-slate-500">{vet.specialty}</p>
                          </div>
                        </div>
                        <StarRating rating={vet.rating} showScore size="xs" scoreClass="text-[10px] font-extrabold text-amber-800" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Offered Services */}
                <div className="space-y-2">
                  <h3 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500">
                    Equine Services Offered
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedClinic.services.map((srv, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 font-bold text-[10px] px-2.5 py-1 rounded-lg border border-slate-200">
                        ✓ {srv}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 🌟 REVIEWS & RATINGS SECTION */}
                {(() => {
                  const currentReviews = selectedClinic.reviews || [];
                  const filteredReviews = currentReviews.filter(r => {
                    if (reviewFilterRating === 'all') return true;
                    return r.rating === reviewFilterRating;
                  }).sort((a, b) => {
                    if (reviewSortBy === 'highest') return b.rating - a.rating;
                    if (reviewSortBy === 'helpful') return (b.helpfulCount || 0) - (a.helpfulCount || 0);
                    return 0;
                  });

                  const ratingCounts = {
                    5: currentReviews.filter(r => r.rating === 5).length,
                    4: currentReviews.filter(r => r.rating === 4).length,
                    3: currentReviews.filter(r => r.rating === 3).length,
                    2: currentReviews.filter(r => r.rating === 2).length,
                    1: currentReviews.filter(r => r.rating === 1).length,
                  };

                  return (
                    <div id="reviews-section" className="space-y-3.5 pt-4 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span>Client Reviews & Feedback</span>
                          </h3>
                          <p className="text-[10px] text-slate-500">Verified horse owners & local trainers</p>
                        </div>

                        <button
                          onClick={() => setShowReviewModal(true)}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          <PenTool className="w-3.5 h-3.5 text-amber-600" />
                          <span>Write Review</span>
                        </button>
                      </div>

                      {/* Rating Summary Card */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center gap-4">
                        <div className="text-center px-2 border-r border-slate-200 shrink-0">
                          <div className="text-3xl font-black text-slate-900">{selectedClinic.rating}</div>
                          <div className="my-1">
                            <StarRating rating={selectedClinic.rating} size="sm" />
                          </div>
                          <div className="text-[10px] font-bold text-slate-500">
                            {selectedClinic.reviewsCount || currentReviews.length} Total
                          </div>
                        </div>

                        {/* Star Distribution Progress Bars */}
                        <div className="flex-1 space-y-1 text-[10px] font-bold text-slate-600">
                          {[5, 4, 3, 2, 1].map((stars) => {
                            const count = ratingCounts[stars as keyof typeof ratingCounts] || 0;
                            const pct = currentReviews.length ? Math.round((count / currentReviews.length) * 100) : 0;
                            return (
                              <div key={stars} className="flex items-center gap-2">
                                <span className="w-3 text-right">{stars}★</span>
                                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-amber-400 rounded-full transition-all duration-500" 
                                    style={{ width: `${pct}%` }} 
                                  />
                                </div>
                                <span className="w-6 text-slate-400 text-right">{pct}%</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Filter & Sort Bar */}
                      <div className="flex items-center justify-between text-[11px] gap-2">
                        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
                          <button
                            onClick={() => setReviewFilterRating('all')}
                            className={`px-2.5 py-0.5 rounded-full font-bold transition-colors cursor-pointer ${
                              reviewFilterRating === 'all' 
                                ? 'bg-slate-900 text-white' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            All ({currentReviews.length})
                          </button>
                          {[5, 4, 3].map(num => (
                            <button
                              key={num}
                              onClick={() => setReviewFilterRating(num)}
                              className={`px-2.5 py-0.5 rounded-full font-bold transition-colors flex items-center gap-0.5 cursor-pointer ${
                                reviewFilterRating === num 
                                  ? 'bg-amber-500 text-white' 
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              <span>{num}</span>
                              <Star className="w-2.5 h-2.5 fill-current" />
                            </button>
                          ))}
                        </div>

                        <select
                          value={reviewSortBy}
                          onChange={(e) => setReviewSortBy(e.target.value as any)}
                          className="bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold px-2 py-1 text-slate-700 cursor-pointer"
                        >
                          <option value="recent">Most Recent</option>
                          <option value="highest">Highest Rating</option>
                          <option value="helpful">Most Helpful</option>
                        </select>
                      </div>

                      {/* Review List */}
                      <div className="space-y-2.5">
                        {filteredReviews.length === 0 ? (
                          <div className="p-4 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            No reviews match your selected filter.
                          </div>
                        ) : (
                          filteredReviews.map((rev) => {
                            const isVoted = votedHelpful.includes(rev.id);
                            return (
                              <div key={rev.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2 text-xs hover:border-slate-300 transition-all">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-2.5">
                                    <img 
                                      src={rev.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'} 
                                      alt={rev.authorName} 
                                      className="w-8 h-8 rounded-full object-cover border border-slate-300"
                                    />
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-extrabold text-slate-900 text-xs">{rev.authorName}</span>
                                        {rev.verifiedVisit && (
                                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                                            <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                                            Verified Patient
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium mt-0.5">
                                        <span>{rev.date}</span>
                                        {rev.serviceType && <span>• {rev.serviceType}</span>}
                                        {rev.horseName && <span>• Horse: {rev.horseName}</span>}
                                      </div>
                                    </div>
                                  </div>

                                  <StarRating rating={rev.rating} size="xs" />
                                </div>

                                <p className="text-slate-700 leading-relaxed font-normal text-[11px]">
                                  "{rev.comment}"
                                </p>

                                <div className="flex items-center justify-between pt-1 text-[10px] border-t border-slate-200/60">
                                  <button
                                    onClick={() => handleToggleHelpful(rev.id)}
                                    className={`flex items-center gap-1 font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                                      isVoted 
                                        ? 'bg-sky-100 text-sky-800 border border-sky-300' 
                                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/70'
                                    }`}
                                  >
                                    <ThumbsUp className={`w-3 h-3 ${isVoted ? 'fill-sky-600 text-sky-600' : ''}`} />
                                    <span>Helpful ({rev.helpfulCount || 0})</span>
                                  </button>

                                  <span className="text-slate-400 text-[9px]">Posted via horsez</span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Book Visit Button CTA */}
                <button
                  onClick={() => setShowBookModal(true)}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-[0.99] cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Appointment with {selectedClinic.name}</span>
                </button>

              </div>
            </div>
          ) : (
            
            /* B. Search Results List View (Google Maps List Style) */
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3 bg-slate-50">
              <div className="flex items-center justify-between text-xs px-1 text-slate-500 font-bold">
                <span>{filteredClinics.length} Veterinarians Found</span>
                <span className="text-[11px] text-slate-400">Sorted by proximity</span>
              </div>

              {filteredClinics.map((clinic) => {
                const isSaved = savedClinics.includes(clinic.id);
                return (
                  <div
                    key={clinic.id}
                    onClick={() => setSelectedClinicId(clinic.id)}
                    className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-sky-400 rounded-2xl p-3 shadow-xs transition-all cursor-pointer group flex gap-3 relative"
                  >
                    {/* Thumbnail Image */}
                    <div className="relative w-28 h-28 rounded-xl overflow-hidden shrink-0 bg-slate-200">
                      <img 
                        src={clinic.image} 
                        alt={clinic.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {clinic.is247 && (
                        <span className="absolute top-1 left-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                          24/7
                        </span>
                      )}
                    </div>

                    {/* Clinic Card Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="font-extrabold text-xs text-slate-900 group-hover:text-sky-600 transition-colors truncate">
                            {clinic.name}
                          </h3>
                          <button 
                            onClick={(e) => toggleSaveClinic(clinic.id, e)} 
                            className="text-slate-300 hover:text-amber-500 p-0.5"
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
                          </button>
                        </div>

                        {/* Rating, State & Directory Tag */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] mt-0.5">
                          <StarRating
                            rating={clinic.rating}
                            showScore
                            showCount
                            reviewCount={clinic.reviewsCount || 80}
                            size="xs"
                            scoreClass="font-black text-slate-800 text-[11px]"
                            countClass="text-slate-400 text-[10px]"
                          />
                          {clinic.state && (
                            <span className="bg-slate-100 text-slate-700 font-extrabold text-[9px] px-1.5 py-0.5 rounded border border-slate-200">
                              {clinic.state}
                            </span>
                          )}
                          <span className="bg-teal-50 text-teal-800 font-bold text-[9px] px-1.5 py-0.5 rounded border border-teal-200 flex items-center gap-0.5">
                            <ShieldCheck className="w-2.5 h-2.5 text-teal-600" />
                            Mad Barn Listed
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-500 truncate mt-1">
                          {clinic.address}
                        </p>

                        <div className="flex items-center gap-1 mt-1 text-[10px]">
                          <span className={`font-bold ${clinic.isOpen ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {clinic.isOpen ? 'Open' : 'Closed'}
                          </span>
                          <span className="text-slate-400">• {clinic.hours}</span>
                        </div>
                      </div>

                      {/* Quick Action Badges */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 mt-2 text-[10px]">
                        <span className="font-medium text-slate-500">
                          Next: <strong className="text-slate-800">{clinic.nextAvailable}</strong>
                        </span>
                        
                        <span className="text-sky-600 group-hover:translate-x-0.5 transition-transform font-bold flex items-center gap-0.5">
                          View Place <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. RIGHT PANEL: INTERACTIVE OPENSTREETMAP CANVAS */}
        <div className={`flex-1 relative bg-slate-200 overflow-hidden ${
          viewMode === 'list' ? 'hidden' : 'block'
        }`}>
          <OpenSourceMap
            center={mapCenter}
            zoom={mapZoom}
            height="100%"
            mapTypeId={mapType}
            selectedMarkerId={selectedClinicId}
            onMarkerSelect={(id) => setSelectedClinicId(id)}
            markers={filteredClinics.map(clinic => {
              const categoryInfo = getClinicCategoryDetails(clinic);
              const isSelected = clinic.id === selectedClinicId;
              return {
                id: clinic.id,
                lat: clinic.lat,
                lng: clinic.lng,
                title: clinic.name,
                subtitle: `${clinic.address} • Farm Call: $${clinic.farmCallFee || 50}`,
                badge: `${categoryInfo.label.toUpperCase()} • ${clinic.isOpen ? 'OPEN NOW' : 'CLOSED'}`,
                color: isSelected ? '#d97706' : categoryInfo.color,
                icon: categoryInfo.icon,
                phone: clinic.phone,
                address: clinic.address,
                serviceRadiusMiles: clinic.ambulatory ? 25 : undefined,
                onClick: () => setSelectedClinicId(clinic.id)
              };
            })}
          />

          {/* Map View Filter Floating Panel (Top Left Overlay) */}
          <div className="absolute top-3 left-3 z-20 max-w-[calc(100%-4rem)] sm:max-w-md">
            <div className="bg-white/95 backdrop-blur-md p-2 sm:p-2.5 rounded-2xl shadow-xl border border-slate-200/90 text-slate-800 space-y-1.5">
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-1.5 font-extrabold text-[11px] sm:text-xs text-slate-900">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>Map Filter:</span>
                </div>
                {mapFilter !== 'all' && (
                  <button
                    onClick={() => setMapFilter('all')}
                    className="text-[10px] font-bold text-sky-600 hover:text-sky-800 transition-colors cursor-pointer"
                  >
                    Reset Filter
                  </button>
                )}
              </div>

              {/* Filter Buttons */}
              <div className="grid grid-cols-3 gap-1 text-[10px] sm:text-[11px] font-extrabold">
                <button
                  onClick={() => setMapFilter(mapFilter === 'emergency' ? 'all' : 'emergency')}
                  className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    mapFilter === 'emergency'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                  title="Show Emergency 24/7 Vets only"
                >
                  <ShieldAlert className={`w-3.5 h-3.5 shrink-0 ${mapFilter === 'emergency' ? 'text-white' : 'text-rose-600'}`} />
                  <span className="truncate">Emergency Only</span>
                </button>

                <button
                  onClick={() => setMapFilter(mapFilter === 'mobile' ? 'all' : 'mobile')}
                  className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    mapFilter === 'mobile'
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                  title="Show Mobile Ambulatory Vets only"
                >
                  <Car className={`w-3.5 h-3.5 shrink-0 ${mapFilter === 'mobile' ? 'text-white' : 'text-teal-600'}`} />
                  <span className="truncate">Mobile Vets</span>
                </button>

                <button
                  onClick={() => setMapFilter(mapFilter === 'full-service' ? 'all' : 'full-service')}
                  className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    mapFilter === 'full-service'
                      ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                  title="Show Full Service Surgical Hospitals & Clinics"
                >
                  <Stethoscope className={`w-3.5 h-3.5 shrink-0 ${mapFilter === 'full-service' ? 'text-white' : 'text-teal-700'}`} />
                  <span className="truncate">Full Service Clinics</span>
                </button>
              </div>

              {/* Status Bar */}
              <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-slate-500 font-medium px-1 pt-1 border-t border-slate-100">
                <span>Showing <strong>{filteredClinics.length}</strong> {mapFilter === 'all' ? 'total' : mapFilter} veterinarians</span>
                {mapFilter !== 'all' && (
                  <span className="text-emerald-600 font-extrabold flex items-center gap-0.5">
                    <Check className="w-3 h-3 text-emerald-600" /> Filtered
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Map Controls Floating Overlay (Top Right: Map Layers, Recenter) */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
            {/* Layer Switcher & Recenter */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden flex flex-col text-slate-700">
              <button
                onClick={() => setMapType(mapType === 'roadmap' ? 'satellite' : 'roadmap')}
                className="p-2.5 hover:bg-slate-100 transition-colors border-b border-slate-100 cursor-pointer"
                title="Toggle Satellite / Roadmap"
              >
                <Layers className="w-4 h-4 text-slate-700" />
              </button>
              <button
                onClick={() => {
                  if (userLocation) {
                    setMapCenter(userLocation);
                    setMapZoom(13);
                  } else {
                    locateUser(true);
                  }
                }}
                className={`p-2.5 hover:bg-slate-100 transition-colors cursor-pointer ${isLocating ? 'animate-spin text-sky-500' : ''}`}
                title="Zoom to My Current GPS Location"
              >
                <Crosshair className={`w-4 h-4 ${userLocation ? 'text-blue-600' : 'text-sky-600'}`} />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden flex flex-col font-black text-slate-700">
              <button 
                onClick={() => setMapZoom(prev => Math.min(prev + 1, 18))} 
                className="p-2 hover:bg-slate-100 border-b text-sm font-bold cursor-pointer"
                title="Zoom In"
              >
                +
              </button>
              <button 
                onClick={() => setMapZoom(prev => Math.max(prev - 1, 3))} 
                className="p-2 hover:bg-slate-100 text-sm font-bold cursor-pointer"
                title="Zoom Out"
              >
                -
              </button>
            </div>
          </div>

          {/* Map Marker Color Legend Floating Overlay (Bottom Left) */}
          <div className="absolute bottom-3 left-3 z-20 max-w-[calc(100%-1.5rem)] sm:max-w-xs">
            <div className="bg-white/95 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl shadow-2xl border border-slate-200/90 text-slate-800 space-y-2">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                <div className="flex items-center gap-1.5 font-black text-xs text-slate-900">
                  <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Map Legend</span>
                </div>
                <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-full">
                  Color Coded
                </span>
              </div>

              <div className="space-y-1.5 text-[11px] font-bold">
                {/* Emergency Legend Item */}
                <button
                  onClick={() => setMapFilter(mapFilter === 'emergency' ? 'all' : 'emergency')}
                  className={`w-full flex items-center justify-between gap-2 p-1.5 rounded-xl border transition-all cursor-pointer ${
                    mapFilter === 'emergency'
                      ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-400'
                      : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100'
                  }`}
                  title="Filter by Emergency 24/7 Vets"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-xs">
                      🚨
                    </span>
                    <span className="text-slate-800 font-extrabold">Emergency 24/7</span>
                  </div>
                  <span className="text-[10px] text-rose-700 font-black bg-rose-100/90 px-1.5 py-0.5 rounded-md border border-rose-200/80">
                    Red Pin
                  </span>
                </button>

                {/* Mobile Legend Item */}
                <button
                  onClick={() => setMapFilter(mapFilter === 'mobile' ? 'all' : 'mobile')}
                  className={`w-full flex items-center justify-between gap-2 p-1.5 rounded-xl border transition-all cursor-pointer ${
                    mapFilter === 'mobile'
                      ? 'bg-teal-50 border-teal-300 ring-1 ring-teal-400'
                      : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100'
                  }`}
                  title="Filter by Mobile Ambulatory Vets"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-xs">
                      🚐
                    </span>
                    <span className="text-slate-800 font-extrabold">Mobile Ambulatory</span>
                  </div>
                  <span className="text-[10px] text-teal-700 font-black bg-teal-100/90 px-1.5 py-0.5 rounded-md border border-teal-200/80">
                    Teal Pin
                  </span>
                </button>

                {/* Full Service Legend Item */}
                <button
                  onClick={() => setMapFilter(mapFilter === 'full-service' ? 'all' : 'full-service')}
                  className={`w-full flex items-center justify-between gap-2 p-1.5 rounded-xl border transition-all cursor-pointer ${
                    mapFilter === 'full-service'
                      ? 'bg-sky-50 border-sky-300 ring-1 ring-sky-400'
                      : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100'
                  }`}
                  title="Filter by Full Service Hospitals"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-xs">
                      🏥
                    </span>
                    <span className="text-slate-800 font-extrabold">Full Service Hospital</span>
                  </div>
                  <span className="text-[10px] text-sky-700 font-black bg-sky-100/90 px-1.5 py-0.5 rounded-md border border-sky-200/80">
                    Blue Pin
                  </span>
                </button>

                {/* Selected Pin & Location Indicators */}
                <div className="pt-1.5 border-t border-slate-100 space-y-1 text-[10px] text-slate-500 font-semibold">
                  <div className="flex items-center justify-between gap-2 px-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white shadow-xs inline-block" />
                      <span>Selected: <strong>Amber Pin</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 border border-white shadow-xs inline-block" />
                      <span>Barn: <strong>Blue Pin</strong></span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-[9.5px] text-slate-600 font-bold bg-slate-100/80 px-2 py-1 rounded-lg">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${userLocation ? 'bg-sky-500 animate-pulse' : 'bg-emerald-500'}`} />
                    <span className="truncate">{locationStatus}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 🧭 GOOGLE MAPS DIRECTIONS & TURN-BY-TURN MODAL */}
      {showDirectionsModal && selectedClinic && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="bg-sky-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-sky-200" />
                <div>
                  <h3 className="font-extrabold text-sm">Directions to {selectedClinic.name}</h3>
                  <p className="text-[11px] text-sky-100">From Your Barn (Santa Rosa, CA)</p>
                </div>
              </div>
              <button onClick={() => setShowDirectionsModal(false)} className="text-white/80 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Route Stats */}
            <div className="p-4 bg-sky-50 border-b border-sky-100 flex items-center justify-between text-xs font-bold text-sky-900">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-sky-600" />
                <span>12 min (4.2 miles) via CA-12 E</span>
              </div>
              <span className="bg-sky-200 text-sky-900 text-[10px] px-2 py-0.5 rounded">Fastest Route</span>
            </div>

            {/* Turn-by-Turn Directions List */}
            <div className="p-4 overflow-y-auto space-y-3 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">1</div>
                <div>
                  <p className="font-bold text-slate-900">Head southeast on Petaluma Hill Rd toward Pressley Rd</p>
                  <p className="text-[10px] text-slate-400">1.2 miles</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">2</div>
                <div>
                  <p className="font-bold text-slate-900">Turn left onto Sonoma Hwy (CA-12 E)</p>
                  <p className="text-[10px] text-slate-400">2.6 miles</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">3</div>
                <div>
                  <p className="font-bold text-slate-900">Destination will be on the right: {selectedClinic.address}</p>
                  <p className="text-[10px] text-emerald-600 font-bold">Arrive at {selectedClinic.name}</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex gap-2 bg-slate-50">
              <a
                href={selectedClinic.lat && selectedClinic.lng ? getOpenStreetMapDirectionsUrl(selectedClinic.lat, selectedClinic.lng, selectedClinic.name) : `https://www.openstreetmap.org/search?query=${encodeURIComponent(selectedClinic.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs py-2.5 rounded-xl shadow flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open in OpenStreetMap Navigation</span>
              </a>
            </div>

          </div>
        </div>
      )}

      {/* 📅 APPOINTMENT BOOKING MODAL */}
      {showBookModal && selectedClinic && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4">
            
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Book Appointment</h3>
                <p className="text-[11px] text-teal-700 font-bold">{selectedClinic.name}</p>
              </div>
              <button onClick={() => setShowBookModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            {bookingSuccess ? (
              <div className="p-6 text-center space-y-2 text-emerald-800">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="font-black text-base">Appointment Booked!</h4>
                <p className="text-xs text-slate-600">Confirmation sent to your horsez account & clinic desk.</p>
              </div>
            ) : (
              <form onSubmit={handleBookAppointment} className="space-y-3 text-xs">
                
                {/* Visit Type: Farm Call vs In-Clinic */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Appointment Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBookingType('farm-call')}
                      className={`p-2 rounded-xl font-bold border text-[11px] flex items-center justify-center gap-1.5 transition-colors ${
                        bookingType === 'farm-call' 
                          ? 'bg-teal-50 border-teal-500 text-teal-900' 
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <Car className="w-3.5 h-3.5 text-teal-600" />
                      <span>Farm Call (${selectedClinic.farmCallFee})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingType('in-clinic')}
                      className={`p-2 rounded-xl font-bold border text-[11px] flex items-center justify-center gap-1.5 transition-colors ${
                        bookingType === 'in-clinic' 
                          ? 'bg-teal-50 border-teal-500 text-teal-900' 
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                      <span>Haul-In to Clinic</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Service</label>
                  <select 
                    value={bookingService} 
                    onChange={(e) => setBookingService(e.target.value)}
                    className="w-full border border-slate-300 p-2.5 rounded-xl font-medium text-slate-800 bg-white"
                  >
                    <option value="Coggins Test & Annual Vaccines">Coggins Test & Annual Vaccines ($185)</option>
                    <option value="Dental Floating & PowerFloat Sedation">Dental Floating & Sedation ($220)</option>
                    <option value="Lameness Evaluation & Digital X-Ray">Lameness Evaluation & X-Rays ($350)</option>
                    <option value="Pre-Purchase Exam (Full Protocol)">Pre-Purchase Exam (PPE) ($650)</option>
                    <option value="Reproductive Ultrasound Check">Reproductive Ultrasound ($140)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Select Horse</label>
                    <select 
                      value={bookingHorse} 
                      onChange={(e) => setBookingHorse(e.target.value)}
                      className="w-full border border-slate-300 p-2.5 rounded-xl font-medium text-slate-800 bg-white"
                    >
                      {MOCK_USER_HORSES.map(h => (
                        <option key={h.id} value={h.name}>{h.name} ({h.breed})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Preferred Date</label>
                    <input 
                      type="date" 
                      value={bookingDate} 
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full border border-slate-300 p-2 rounded-xl font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Notes for Veterinarian</label>
                  <textarea 
                    placeholder="E.g., Horse is sensitive on right hind, needs Coggins for upcoming show..."
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    rows={2}
                    className="w-full border border-slate-300 p-2 rounded-xl text-slate-800 text-xs"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setShowBookModal(false)}
                    className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="w-2/3 bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl font-extrabold shadow-md"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* 📅 MY SCHEDULED APPOINTMENTS DRAWER */}
      {showAppointmentsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                <h3 className="font-extrabold text-sm text-slate-900">Upcoming Scheduled Appointments</h3>
              </div>
              <button onClick={() => setShowAppointmentsModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="space-y-3">
              {appointments.map((apt) => (
                <div 
                  key={apt.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      <Stethoscope className="w-5 h-5 text-teal-700" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-slate-900">{apt.vetName}</span>
                        {apt.verified && <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />}
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">{apt.clinicName}</p>
                      <p className="text-[11px] text-teal-700 font-bold mt-1">{apt.service} • Horse: {apt.horseName}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="bg-slate-900 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-md">
                      {apt.date}
                    </span>
                    <p className="text-[10px] text-slate-500 font-bold mt-1">{apt.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setShowAppointmentsModal(false);
                setShowBookModal(true);
              }}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Book Another Vet Appointment</span>
            </button>
          </div>
        </div>
      )}

      {/* 📑 COGGINS & MEDICAL VAULT MODAL */}
      {showVaultModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-sky-600" />
                <h3 className="font-extrabold text-sm text-slate-900">Medical Records & Coggins Vault</h3>
              </div>
              <button onClick={() => setShowVaultModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="space-y-2">
              {MOCK_MEDICAL_RECORDS.map((rec) => (
                <div key={rec.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-sky-600" />
                    <div>
                      <p className="font-bold text-slate-800">{rec.title}</p>
                      <p className="text-[10px] text-slate-500">Issued: {rec.date}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs text-slate-800 flex items-center justify-between">
              <span>Sync papers directly to your haulers & shows</span>
              <button 
                onClick={() => alert('Documents synced to horsez Vault cloud!')}
                className="bg-teal-700 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg shadow"
              >
                Sync All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✍️ WRITE A REVIEW MODAL */}
      {showReviewModal && selectedClinic && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Write a Review</h3>
                <p className="text-[11px] text-amber-700 font-bold">{selectedClinic.name}</p>
              </div>
              <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
            </div>

            {reviewSuccess ? (
              <div className="p-6 text-center space-y-2 text-emerald-800">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="font-black text-base">Review Posted!</h4>
                <p className="text-xs text-slate-600">Thank you for sharing your experience with local horse owners on horsez.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateReview} className="space-y-3.5 text-xs">
                
                {/* Interactive Star Selection */}
                <div className="text-center bg-amber-50/70 border border-amber-200 p-3.5 rounded-2xl">
                  <label className="block font-bold text-slate-800 mb-1">Overall Rating</label>
                  <div className="flex justify-center items-center my-1.5">
                    <StarRating
                      rating={reviewRating}
                      interactive
                      size="lg"
                      onRatingChange={(r) => setReviewRating(r)}
                      hoverRating={hoverRating}
                      onHover={(h) => setHoverRating(h)}
                    />
                  </div>
                  <span className="text-[11px] font-black text-amber-900">
                    {reviewRating === 5 && '5/5 • Outstanding Equine Care!'}
                    {reviewRating === 4 && '4/5 • Very Good Service'}
                    {reviewRating === 3 && '3/5 • Average Experience'}
                    {reviewRating === 2 && '2/5 • Needs Improvement'}
                    {reviewRating === 1 && '1/5 • Unsatisfactory'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Your Name / Title</label>
                    <input 
                      type="text" 
                      value={reviewAuthor}
                      onChange={(e) => setReviewAuthor(e.target.value)}
                      placeholder="E.g., Sarah M. (Santa Rosa)"
                      className="w-full border border-slate-300 p-2 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Horse Name (Optional)</label>
                    <input 
                      type="text" 
                      value={reviewHorse}
                      onChange={(e) => setReviewHorse(e.target.value)}
                      placeholder="E.g., Thunder"
                      className="w-full border border-slate-300 p-2 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Service Received</label>
                  <select 
                    value={reviewService}
                    onChange={(e) => setReviewService(e.target.value)}
                    className="w-full border border-slate-300 p-2 rounded-xl text-slate-800 font-medium bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  >
                    <option value="Coggins & Annual Vaccines">Coggins & Annual Vaccines</option>
                    <option value="Dental Floating & PowerFloat">Dental Floating & PowerFloat</option>
                    <option value="Emergency Colic Triage">Emergency Colic Triage</option>
                    <option value="Pre-Purchase Exam">Pre-Purchase Exam</option>
                    <option value="Lameness Evaluation & X-Rays">Lameness Evaluation & X-Rays</option>
                    <option value="Reproductive Care">Reproductive Care</option>
                    <option value="General Pasture Wellness">General Pasture Wellness</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Your Review & Feedback</label>
                  <textarea 
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share details about punctuality, vet bedside manner, equipment cleanliness, or farm call service..."
                    rows={3}
                    className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 text-xs font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    required
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setShowReviewModal(false)}
                    className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="w-2/3 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl font-extrabold shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <PenTool className="w-4 h-4" />
                    <span>Post Review</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 🟢 PUBLISH VET PRACTICE / AMBULATORY CLINIC MODAL */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                    Publish Veterinary Clinic / Ambulatory Listing
                  </h3>
                  <p className="text-xs text-slate-500">
                    Saves directly to Firebase database with live map coordinates
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
              <div className="p-6 text-center space-y-2 bg-teal-50 rounded-2xl border border-teal-200 text-teal-900">
                <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto animate-bounce" />
                <h4 className="font-black text-base">{publishStatusMsg}</h4>
                <p className="text-xs text-teal-700">Your practice is now publicly discoverable and plotted on the interactive map.</p>
              </div>
            ) : (
              <form onSubmit={handlePublishClinic} className="space-y-3.5 text-xs">
                {publishError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2 font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{publishError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Clinic or Practice Name *</label>
                  <input 
                    type="text" 
                    value={pubName} 
                    onChange={(e) => setPubName(e.target.value)}
                    placeholder="E.g., North Bay Equine Hospital & Surgery"
                    className="w-full border border-slate-300 p-2.5 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lead Veterinarian / DVM Name</label>
                  <input 
                    type="text" 
                    value={pubDoctorName} 
                    onChange={(e) => setPubDoctorName(e.target.value)}
                    placeholder="E.g., Dr. Eleanor Vance, DVM, DACVS"
                    className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Primary Phone *</label>
                    <input 
                      type="tel" 
                      value={pubPhone} 
                      onChange={(e) => setPubPhone(e.target.value)}
                      placeholder="(707) 555-0199"
                      className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">24/7 Emergency Line</label>
                    <input 
                      type="tel" 
                      value={pubEmergencyPhone} 
                      onChange={(e) => setPubEmergencyPhone(e.target.value)}
                      placeholder="(707) 555-9111"
                      className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-3 sm:col-span-1">
                    <label className="block font-bold text-slate-700 mb-1">Street Address</label>
                    <input 
                      type="text" 
                      value={pubStreet} 
                      onChange={(e) => setPubStreet(e.target.value)}
                      placeholder="1200 Valley Ford Rd"
                      className="w-full border border-slate-300 p-2 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">City</label>
                    <input 
                      type="text" 
                      value={pubCity} 
                      onChange={(e) => setPubCity(e.target.value)}
                      placeholder="Petaluma"
                      className="w-full border border-slate-300 p-2 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">State & Zip</label>
                    <div className="flex gap-1">
                      <input 
                        type="text" 
                        value={pubState} 
                        onChange={(e) => setPubState(e.target.value.toUpperCase())}
                        maxLength={2}
                        className="w-12 border border-slate-300 p-2 rounded-xl text-center font-bold text-slate-800"
                        required
                      />
                      <input 
                        type="text" 
                        value={pubZip} 
                        onChange={(e) => setPubZip(e.target.value)}
                        placeholder="94952"
                        className="flex-1 border border-slate-300 p-2 rounded-xl text-slate-800 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Capabilities & Toggles */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={pubIs247} 
                      onChange={(e) => setPubIs247(e.target.checked)}
                      className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span className="font-extrabold text-slate-800">24/7 Emergency Facility</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={pubAmbulatory} 
                      onChange={(e) => setPubAmbulatory(e.target.checked)}
                      className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span className="font-extrabold text-slate-800">Ambulatory / Farm Calls</span>
                  </label>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Services & Specialties (comma-separated)</label>
                  <input 
                    type="text" 
                    value={pubServices} 
                    onChange={(e) => setPubServices(e.target.value)}
                    placeholder="Routine Exams, Vaccines, Dental Floating, Coggins, Lameness Workup, Surgery"
                    className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                {/* Image Presets */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Practice Photo</label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {[
                      { label: 'Hospital Facility', url: 'https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?auto=format&fit=crop&q=80&w=800' },
                      { label: 'Equine Exam', url: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=800' },
                      { label: 'Barn & Arena', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800' }
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPubImage(preset.url)}
                        className={`p-1.5 rounded-xl border text-left flex flex-col items-center gap-1 transition-all ${
                          pubImage === preset.url ? 'border-teal-600 ring-2 ring-teal-500/30 bg-teal-50/50' : 'border-slate-200 hover:border-slate-300'
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
                    className="w-2/3 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-black shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Flame className="w-4 h-4 text-amber-300" />
                    <span>{isPublishing ? 'Publishing...' : 'Publish to Database'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
        </>
      )}

    </div>
  );
};
