import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  MapPin, 
  Calendar, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Plus, 
  Clock, 
  Check, 
  Upload, 
  RefreshCw, 
  Heart,
  Search,
  Database,
  Phone,
  DollarSign,
  Award,
  Sparkles,
  Zap,
  Image as ImageIcon,
  ChevronDown,
  Navigation,
  SlidersHorizontal,
  X,
  Globe,
  Layers,
  Map as MapIcon
} from 'lucide-react';
import { TwoHorseshoesIcon } from '../common/TwoHorseshoesIcon';
import confetti from 'canvas-confetti';
import { MOCK_FARRIERS, MOCK_HOOF_LOGS, MOCK_USER_HORSES } from '../../data/mockData';
import { Farrier } from '../../types';
import { OpenSourceMap } from '../common/OpenSourceMap';
import { StarRating } from '../common/StarRating';
import { useFavorites } from '../../context/FavoritesContext';
import { useSavedAddress } from '../../context/SavedAddressContext';
import { db, auth, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';

const US_STATES = [
  { code: 'CA', name: 'California' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'TX', name: 'Texas' },
  { code: 'FL', name: 'Florida' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'OR', name: 'Oregon' },
  { code: 'CO', name: 'Colorado' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'OH', name: 'Ohio' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'GA', name: 'Georgia' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'MO', name: 'Missouri' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NV', name: 'Nevada' },
  { code: 'UT', name: 'Utah' },
  { code: 'WY', name: 'Wyoming' }
];

const PRESET_AVATARS = [
  {
    label: 'Master Journeyman',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'
  },
  {
    label: 'Female Specialist',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400'
  },
  {
    label: 'Sport Horse Forge',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400'
  },
  {
    label: 'Performance Anvil',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400'
  },
  {
    label: 'Biomechanical Rehab',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400'
  },
  {
    label: 'Equine Craftsman',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400'
  }
];

const COMMON_SPECIALTIES = [
  'Therapeutic Shoeing',
  'Hot Shoeing',
  'Barefoot Trimming',
  'Thrown Shoe Emergency',
  'Hunter/Jumper Aluminum',
  'Dressage Biomechanics',
  'Western Reining Slides',
  'Glue-On Composite Shoes',
  'Foal Hoof Conformation',
  'White Line Rehab',
  'Bar Shoes & Pads',
  'Cold Shoeing'
];

export const FarrierView: React.FC = () => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { calculateDistanceMiles } = useSavedAddress();
  
  // Real-time Firestore Farriers State
  const [firestoreFarriers, setFirestoreFarriers] = useState<Farrier[]>([]);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'published' | 'emergency' | 'therapeutic' | 'barefoot' | 'sport'>('all');
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');

  // Directory UI State
  const [numHorses, setNumHorses] = useState(1);
  const [selectedFarrier, setSelectedFarrier] = useState<Farrier>(MOCK_FARRIERS[0]);
  const [hoofLogs, setHoofLogs] = useState(MOCK_HOOF_LOGS);
  const [syncToCalendar, setSyncToCalendar] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  // New Hoof Log State
  const [newNote, setNewNote] = useState('');
  const [beforeImg] = useState('https://images.unsplash.com/photo-1598974357801-cbca100e65d3?auto=format&fit=crop&q=80&w=400');
  const [afterImg] = useState('https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=400');

  // Form State for Adding New Farrier to Firebase
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formStreet, setFormStreet] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('CA');
  const [formZip, setFormZip] = useState('');
  const [formPriceEstimate, setFormPriceEstimate] = useState('$185 / Full Set');
  const [formMcNumber, setFormMcNumber] = useState('CJF #104820');
  const [formAvatar, setFormAvatar] = useState(PRESET_AVATARS[0].url);
  const [formSpecialties, setFormSpecialties] = useState<string[]>([
    'Therapeutic Shoeing',
    'Hot Shoeing',
    'Thrown Shoe Emergency'
  ]);
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [formInstantResponse, setFormInstantResponse] = useState(true);
  const [formBio, setFormBio] = useState('AFA Certified Journeyman Farrier providing mobile hot forge shoeing and emergency thrown shoe triage.');

  // Form Submission & Status State
  const [isSavingFarrier, setIsSavingFarrier] = useState(false);
  const [saveStatusMsg, setSaveStatusMsg] = useState('');
  const [formErrorMessage, setFormErrorMessage] = useState('');
  const [lastSavedFarrierName, setLastSavedFarrierName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const directorySectionRef = useRef<HTMLDivElement>(null);

  // 1. Subscribe to Firebase Firestore `farriers` collection in real time
  useEffect(() => {
    setIsFirebaseLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, 'farriers'),
      (snapshot) => {
        const loaded: Farrier[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          loaded.push({
            id: doc.id,
            name: data.name || 'Farrier',
            rating: data.rating || 5.0,
            reviewsCount: data.reviewsCount || 1,
            location: data.location || [data.city, data.state].filter(Boolean).join(', ') || 'California',
            address: data.address || `${data.street || ''}, ${data.city || ''}, ${data.state || ''} ${data.zipCode || ''}`.trim(),
            street: data.street || '',
            city: data.city || '',
            state: data.state || 'CA',
            zipCode: data.zipCode || '',
            phone: data.phone || '',
            verified: data.verified !== undefined ? data.verified : true,
            mcNumber: data.mcNumber || '',
            avatar: data.avatar || PRESET_AVATARS[0].url,
            specialties: Array.isArray(data.specialties) ? data.specialties : ['Therapeutic Shoeing'],
            instantResponse: !!data.instantResponse,
            priceEstimate: data.priceEstimate || '$180 / Full Set',
            lat: data.lat || 38.4404 + (Math.random() - 0.5) * 0.1,
            lng: data.lng || -122.7141 + (Math.random() - 0.5) * 0.1,
            bio: data.bio || '',
            createdAt: data.createdAt || new Date().toISOString(),
            isFirebase: true,
            publishedAsListing: data.publishedAsListing !== undefined ? !!data.publishedAsListing : true,
            listingStatus: (data.listingStatus as 'active' | 'pending' | 'draft') || 'active',
            sellerId: data.sellerId || '',
            authorEmail: data.authorEmail || ''
          });
        });
        setFirestoreFarriers(loaded);
        setIsFirebaseLoading(false);
      },
      (error) => {
        console.error('Error listening to Firestore farriers:', error);
        setIsFirebaseLoading(false);
        try {
          handleFirestoreError(error, OperationType.LIST, 'farriers');
        } catch (e) {
          // Logged error
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Combine Mock Farriers + Firestore Farriers (avoiding duplicates)
  const allFarriers: Farrier[] = useMemo(() => {
    const combined = [...firestoreFarriers, ...MOCK_FARRIERS];
    // De-duplicate by ID just in case
    const seen = new Set<string>();
    return combined.filter(f => {
      if (seen.has(f.id)) return false;
      seen.add(f.id);
      return true;
    });
  }, [firestoreFarriers]);

  // 3. Search & Filter logic (Searchable across Name, Address, City, State, ZIP, Specialty, MC#, Bio)
  const filteredFarriers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return allFarriers.filter(f => {
      // Filter by tag
      if (selectedFilter === 'published' && !f.isFirebase && !f.publishedAsListing) return false;
      if (selectedFilter === 'emergency' && !f.instantResponse) return false;
      if (selectedFilter === 'therapeutic' && !f.specialties.some(s => s.toLowerCase().includes('therapeutic') || s.toLowerCase().includes('rehab'))) return false;
      if (selectedFilter === 'barefoot' && !f.specialties.some(s => s.toLowerCase().includes('barefoot') || s.toLowerCase().includes('trim'))) return false;
      if (selectedFilter === 'sport' && !f.specialties.some(s => s.toLowerCase().includes('hunter') || s.toLowerCase().includes('dressage') || s.toLowerCase().includes('slide') || s.toLowerCase().includes('event'))) return false;

      // Filter by search query
      if (!q) return true;

      const matchName = f.name.toLowerCase().includes(q);
      const matchLocation = f.location.toLowerCase().includes(q);
      const matchAddress = (f.address || '').toLowerCase().includes(q);
      const matchCity = (f.city || '').toLowerCase().includes(q);
      const matchState = (f.state || '').toLowerCase().includes(q);
      const matchZip = (f.zipCode || '').toLowerCase().includes(q);
      const matchPhone = (f.phone || '').toLowerCase().includes(q);
      const matchMC = (f.mcNumber || '').toLowerCase().includes(q);
      const matchBio = (f.bio || '').toLowerCase().includes(q);
      const matchSpecialty = f.specialties.some(s => s.toLowerCase().includes(q));

      return (
        matchName || 
        matchLocation || 
        matchAddress || 
        matchCity || 
        matchState || 
        matchZip || 
        matchPhone || 
        matchMC || 
        matchBio || 
        matchSpecialty
      );
    });
  }, [allFarriers, searchQuery, selectedFilter]);

  // Keep selectedFarrier valid
  useEffect(() => {
    if (!filteredFarriers.some(f => f.id === selectedFarrier.id)) {
      if (filteredFarriers.length > 0) {
        setSelectedFarrier(filteredFarriers[0]);
      }
    }
  }, [filteredFarriers, selectedFarrier]);

  const handleBookFarrier = (isEmergency: boolean, farrierOverride?: Farrier) => {
    const target = farrierOverride || selectedFarrier;
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 }
    });
    alert(
      isEmergency
        ? `EMERGENCY DISPATCH: Thrown shoe request sent to ${target.name}! Estimated arrival: 30 minutes.`
        : `Routine trim appointment request submitted for ${numHorses} horse(s) with ${target.name}!`
    );
  };

  const handleAddHoofLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry = {
      id: `hl-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      horseName: MOCK_USER_HORSES[0].name,
      notes: newNote || 'Routine reset & angle balancing completed.',
      beforePhoto: beforeImg,
      afterPhoto: afterImg
    };
    setHoofLogs([newEntry, ...hoofLogs]);
    setShowLogModal(false);
    setNewNote('');
  };

  // Specialty toggle helper
  const handleToggleSpecialty = (spec: string) => {
    if (formSpecialties.includes(spec)) {
      if (formSpecialties.length > 1) {
        setFormSpecialties(formSpecialties.filter(s => s !== spec));
      }
    } else {
      setFormSpecialties([...formSpecialties, spec]);
    }
  };

  const handleAddCustomSpecialty = () => {
    const trimmed = customSpecialty.trim();
    if (trimmed && !formSpecialties.includes(trimmed)) {
      setFormSpecialties([...formSpecialties, trimmed]);
      setCustomSpecialty('');
    }
  };

  // Image Upload File Handler
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setFormAvatar(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Auto-Fill Helper for Quick Testing
  const handleFillPresetFarrier = (presetType: 'journeyman' | 'barefoot' | 'sport' | 'emergency') => {
    if (presetType === 'journeyman') {
      setFormName('Harrison Bradley, CJF');
      setFormPhone('(707) 555-0819');
      setFormStreet('3400 Calistoga Rd');
      setFormCity('Santa Rosa');
      setFormState('CA');
      setFormZip('95404');
      setFormPriceEstimate('$190 / Full Hot Forge Set');
      setFormMcNumber('CJF #99214');
      setFormAvatar(PRESET_AVATARS[0].url);
      setFormSpecialties(['Therapeutic Shoeing', 'Hot Shoeing', 'Bar Shoes & Pads', 'Thrown Shoe Emergency']);
      setFormInstantResponse(true);
      setFormBio('Master CJF specialized in aluminum show packages and therapeutic hoof balance.');
    } else if (presetType === 'barefoot') {
      setFormName('Sierra Morgan, AFA Trimmer');
      setFormPhone('(707) 555-0932');
      setFormStreet('1200 Occidental Rd');
      setFormCity('Sebastopol');
      setFormState('CA');
      setFormZip('95472');
      setFormPriceEstimate('$85 / Natural Barefoot Trim');
      setFormMcNumber('AFA #77312');
      setFormAvatar(PRESET_AVATARS[1].url);
      setFormSpecialties(['Barefoot Trimming', 'Natural Balance Barefoot', 'White Line Rehab', 'EasyCare Boot Fitting']);
      setFormInstantResponse(false);
      setFormBio('Holistic barefoot rehabilitation and gentle handling for sensitive or young horses.');
    } else if (presetType === 'sport') {
      setFormName('Colton Reynolds, DipWCF');
      setFormPhone('(415) 555-0371');
      setFormStreet('850 Point Reyes-Petaluma Rd');
      setFormCity('Petaluma');
      setFormState('CA');
      setFormZip('94952');
      setFormPriceEstimate('$230 / Grand Prix Sport Package');
      setFormMcNumber('DipWCF #44180');
      setFormAvatar(PRESET_AVATARS[2].url);
      setFormSpecialties(['Hunter/Jumper Aluminum', 'Dressage Biomechanics', 'Glue-On Composite Shoes', 'Hot Shoeing']);
      setFormInstantResponse(true);
      setFormBio('Official show farrier for West Coast Hunter/Jumper circuits and elite sport horses.');
    } else {
      setFormName('Redwood Rapid Farrier Triage');
      setFormPhone('(707) 555-0911');
      setFormStreet('4900 Sonoma Highway');
      setFormCity('Sonoma');
      setFormState('CA');
      setFormZip('95476');
      setFormPriceEstimate('$160 / Emergency Thrown Shoe');
      setFormMcNumber('MC #88190');
      setFormAvatar(PRESET_AVATARS[3].url);
      setFormSpecialties(['Thrown Shoe Emergency', 'Hot Shoeing', 'Therapeutic Shoeing']);
      setFormInstantResponse(true);
      setFormBio('24/7 on-call emergency mobile unit for fast trackside and barnside hoof repairs.');
    }
  };

  // Submit Farrier to Firestore Database
  const handleAddFarrierToFirebase = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrorMessage('');
    setSaveStatusMsg('');

    if (!formName.trim()) {
      setFormErrorMessage('Please enter the Farrier or Business Name.');
      return;
    }
    if (!formStreet.trim() || !formCity.trim() || !formZip.trim()) {
      setFormErrorMessage('Please enter complete street address, city, state, and ZIP code.');
      return;
    }
    if (!formAvatar.trim()) {
      setFormErrorMessage('Please provide a photo or select a picture preset.');
      return;
    }

    setIsSavingFarrier(true);
    setSaveStatusMsg('Publishing farrier service listing to Firebase Firestore...');

    try {
      const fullAddressStr = `${formStreet.trim()}, ${formCity.trim()}, ${formState.trim()} ${formZip.trim()}`;
      const locationStr = `${formCity.trim()}, ${formState.trim()}`;

      // Approximate coordinates based on CA wine country base with subtle variation
      const baseLat = 38.4404 + (Math.random() - 0.5) * 0.15;
      const baseLng = -122.7141 + (Math.random() - 0.5) * 0.15;

      const newFarrierData = {
        name: formName.trim(),
        phone: formPhone.trim(),
        address: fullAddressStr,
        street: formStreet.trim(),
        city: formCity.trim(),
        state: formState.trim(),
        zipCode: formZip.trim(),
        location: locationStr,
        avatar: formAvatar.trim(),
        priceEstimate: formPriceEstimate.trim() || '$185 / Full Set',
        mcNumber: formMcNumber.trim() || 'Certified Farrier',
        specialties: formSpecialties.length > 0 ? formSpecialties : ['Therapeutic Shoeing', 'Hot Shoeing'],
        instantResponse: formInstantResponse,
        rating: 5.0,
        reviewsCount: 1,
        verified: true,
        lat: baseLat,
        lng: baseLng,
        bio: formBio.trim(),
        publishedAsListing: true,
        isListing: true,
        listingStatus: 'active' as const,
        sellerId: auth.currentUser?.uid || 'community-member',
        authorEmail: auth.currentUser?.email || '',
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'farriers'), newFarrierData);

      const createdFarrierObject: Farrier = {
        id: docRef.id,
        ...newFarrierData,
        listingStatus: 'active',
        isFirebase: true,
        publishedAsListing: true
      };

      // Update local state and selection immediately
      setSelectedFarrier(createdFarrierObject);
      setLastSavedFarrierName(formName.trim());
      setSaveStatusMsg('✅ Successfully published listing to Firebase Firestore! Live on interactive map & directory.');
      setShowPublishModal(false);

      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 }
      });

      // Clear form fields
      setFormName('');
      setFormPhone('');
      setFormStreet('');
      setFormCity('');
      setFormZip('');
      setFormBio('');

      // Auto-scroll to directory to see new searchable farrier
      setTimeout(() => {
        directorySectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 400);

    } catch (err: any) {
      console.error('Error saving farrier to Firestore:', err);
      try {
        handleFirestoreError(err, OperationType.WRITE, 'farriers');
      } catch (e: any) {
        setFormErrorMessage(e.message || err.message || 'Failed to publish listing to Firebase. Please check connection.');
      }
      setSaveStatusMsg('');
    } finally {
      setIsSavingFarrier(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-10 space-y-6">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#1B4A72] via-[#205886] to-[#1B4A72] text-white p-5 rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-sm">
            <TwoHorseshoesIcon className="w-7 h-7 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black uppercase tracking-wide text-white">
                FARRIER DISPATCH & HOOF CARE
              </h1>
              <span className="bg-teal-400/20 border border-teal-400/40 text-teal-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Database className="w-3 h-3 text-teal-300" />
                <span>Firestore Live</span>
              </span>
            </div>
            <p className="text-xs text-sky-200 mt-0.5">
              Certified farriers, emergency thrown shoe dispatch, and searchable database directory
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="text-right">
            <span className="text-[11px] text-sky-200 block font-medium">Database Farriers</span>
            <span className="text-xs font-black text-amber-300">
              {allFarriers.length} Profiles ({firestoreFarriers.length} in Firebase)
            </span>
          </div>
          <button
            onClick={() => setShowPublishModal(true)}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black px-3 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-slate-950" />
            <span>Publish Listing</span>
            <Sparkles className="w-3 h-3 text-amber-900" />
          </button>
        </div>
      </div>

      {/* Main Triage Options: Thrown Shoe vs Routine Trim */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => handleBookFarrier(true)}
          className="bg-red-50 hover:bg-red-100/80 border-2 border-red-300 rounded-2xl p-4 shadow-sm text-left flex items-start gap-3 transition-all group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
            <AlertCircle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-red-700 uppercase tracking-tight">
                EMERGENCY: Fix Thrown Shoe
              </span>
            </div>
            <p className="text-xs text-red-900/80 mt-1">
              Request an immediate on-demand response for a single thrown shoe fix before turnout or show.
            </p>
            <span className="inline-block mt-2 bg-red-600 text-white font-bold text-[10px] px-3 py-1 rounded-lg">
              Dispatch Urgent Farrier →
            </span>
          </div>
        </button>

        <button
          onClick={() => handleBookFarrier(false)}
          className="bg-slate-50 hover:bg-slate-100 border-2 border-slate-300 rounded-2xl p-4 shadow-sm text-left flex items-start gap-3 transition-all group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900 uppercase tracking-tight">
                Routine Trim & Reset
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Schedule routine hoof maintenance care for 1-4 horses on a 6-week recurring cycle.
            </p>
            <span className="inline-block mt-2 bg-slate-800 text-white font-bold text-[10px] px-3 py-1 rounded-lg">
              Schedule Routine Trim →
            </span>
          </div>
        </button>
      </div>

      {/* Directory Search & Filter Bar */}
      <div ref={directorySectionRef} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search farriers by name, full address, city, state, zip, specialty (e.g. 'Santa Rosa', 'Barefoot')..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-9 py-2 text-xs text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <span className="text-[11px] text-slate-400 font-medium">Horses:</span>
            <select
              value={numHorses}
              onChange={(e) => setNumHorses(Number(e.target.value))}
              className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 6].map(n => (
                <option key={n} value={n}>{n} {n === 1 ? 'Horse' : 'Horses'}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Filter Tag Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" />
            Filters:
          </span>
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Farriers ({allFarriers.length})
          </button>
          <button
            onClick={() => setSelectedFilter('published')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              selectedFilter === 'published'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>🔥 Published Listings ({firestoreFarriers.length})</span>
          </button>
          <button
            onClick={() => setSelectedFilter('emergency')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              selectedFilter === 'emergency'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>Emergency Dispatch</span>
          </button>
          <button
            onClick={() => setSelectedFilter('therapeutic')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
              selectedFilter === 'therapeutic'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
            }`}
          >
            Therapeutic & Rehab
          </button>
          <button
            onClick={() => setSelectedFilter('barefoot')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
              selectedFilter === 'barefoot'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Barefoot Trimming
          </button>
          <button
            onClick={() => setSelectedFilter('sport')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
              selectedFilter === 'sport'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            Hunter / Dressage / Sport
          </button>
        </div>
      </div>

      {/* Grid: Farrier List + Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Farrier Cards */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-extrabold text-xs uppercase tracking-wider text-slate-800">
                Verified Farrier Directory
              </h2>
              <p className="text-[11px] text-slate-500">
                {filteredFarriers.length} farrier{filteredFarriers.length === 1 ? '' : 's'} matching search
              </p>
            </div>
            
            {firestoreFarriers.length > 0 && (
              <span className="text-[10px] font-extrabold bg-teal-50 border border-teal-200 text-teal-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Database className="w-3 h-3 text-teal-600" />
                <span>{firestoreFarriers.length} from Firestore</span>
              </span>
            )}
          </div>

          {filteredFarriers.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
              <Search className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No farriers found matching "{searchQuery}"</p>
              <p className="text-[11px] text-slate-500">
                Try searching for a different city, ZIP code, or specialty, or add a new farrier below.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedFilter('all'); }}
                className="mt-2 text-xs font-bold text-teal-700 hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {filteredFarriers.map((f) => (
                <div
                  key={f.id}
                  onClick={() => setSelectedFarrier(f)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    selectedFarrier.id === f.id
                      ? 'bg-slate-50 border-teal-500 shadow-md ring-2 ring-teal-500/20'
                      : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <img 
                        src={f.avatar} 
                        alt={f.name} 
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs" 
                      />
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-xs text-slate-900">{f.name}</span>
                          {f.verified && <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
                          {(f.isFirebase || f.publishedAsListing) && (
                            <span className="bg-emerald-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-0.5 shadow-xs">
                              <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                              <span>Published Listing</span>
                            </span>
                          )}
                        </div>

                        {/* Location / Full Address */}
                        <div className="flex items-center gap-1 text-[11px] text-slate-600 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px] sm:max-w-[240px]">
                            {f.address || f.location}
                          </span>
                        </div>

                        {f.phone && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                            <Phone className="w-2.5 h-2.5 text-slate-400" />
                            <span>{f.phone}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <StarRating 
                            rating={f.rating} 
                            showScore 
                            showCount 
                            reviewCount={f.reviewsCount || 42} 
                            size="xs" 
                            scoreClass="font-black text-slate-800 text-[11px]"
                            countClass="text-slate-400 text-[10px]"
                          />
                          <span className="text-[10px] text-slate-300">•</span>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            {calculateDistanceMiles(f.lat || 38.44, f.lng || -122.71)} mi from barn
                          </span>
                          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                            {f.priceEstimate}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite({
                            id: f.id,
                            category: 'farrier',
                            title: f.name,
                            subtitle: `${f.location} • ${f.specialties.join(', ')}`,
                            rating: f.rating,
                            image: f.avatar,
                            location: f.address || f.location
                          });
                        }}
                        className={`p-1.5 rounded-full border transition-colors cursor-pointer ${
                          isFavorite(f.id)
                            ? 'bg-rose-50 border-rose-300 text-rose-600'
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-rose-500'
                        }`}
                        title={isFavorite(f.id) ? 'Remove from favorites' : 'Save to favorites'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFavorite(f.id) ? 'fill-current' : ''}`} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookFarrier(false, f);
                        }}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] px-2.5 py-1.5 rounded-xl transition-colors shadow-xs cursor-pointer"
                      >
                        Request
                      </button>
                    </div>
                  </div>

                  {/* Bio or Specialties */}
                  {f.bio && (
                    <p className="text-[11px] text-slate-600 italic bg-slate-100/70 p-2 rounded-xl mt-2 border border-slate-200/60 line-clamp-2">
                      "{f.bio}"
                    </p>
                  )}

                  <div className="mt-2 flex flex-wrap gap-1">
                    {f.instantResponse && (
                      <span className="bg-red-50 text-red-700 border border-red-200 text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Zap className="w-2.5 h-2.5 text-red-600" />
                        <span>24/7 Dispatch</span>
                      </span>
                    )}
                    {f.specialties.map(s => (
                      <span key={s} className="bg-slate-100 text-slate-700 text-[9px] font-semibold px-2 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: OpenSource Map & Appointment Schedule */}
        <div className="space-y-4">
          {/* Map View Header & Satellite / Street Toggle Controls */}
          <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div>
              <div className="flex items-center gap-1.5">
                <MapIcon className="w-4 h-4 text-teal-600" />
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800">
                  Farrier Service Area Map
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Switch between street routes and satellite terrain imagery
              </p>
            </div>

            {/* Satellite / Street View Toggle Button Group */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-stretch sm:self-auto justify-center">
              <button
                type="button"
                onClick={() => setMapType('roadmap')}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  mapType === 'roadmap'
                    ? 'bg-white text-teal-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
                title="Switch to Street / Roadmap View (OpenStreetMap Voyager)"
              >
                <Layers className={`w-3.5 h-3.5 ${mapType === 'roadmap' ? 'text-teal-600' : 'text-slate-400'}`} />
                <span>Street View</span>
              </button>

              <button
                type="button"
                onClick={() => setMapType('satellite')}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  mapType === 'satellite'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
                title="Switch to Satellite Imagery View (Esri World Imagery)"
              >
                <Globe className={`w-3.5 h-3.5 ${mapType === 'satellite' ? 'text-amber-300' : 'text-slate-400'}`} />
                <span>Satellite View</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-800 relative h-80">
            {/* Quick Floating View Mode Toggle on Map Overlay */}
            <div className="absolute top-14 right-3 z-[1001] hidden sm:block">
              <button
                type="button"
                onClick={() => setMapType(prev => prev === 'roadmap' ? 'satellite' : 'roadmap')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl shadow-lg border text-xs font-extrabold transition-all backdrop-blur-md cursor-pointer ${
                  mapType === 'satellite'
                    ? 'bg-slate-900/90 text-white border-amber-400/50 hover:bg-slate-900'
                    : 'bg-white/95 text-slate-800 border-slate-200 hover:bg-white'
                }`}
                title={`Currently in ${mapType === 'satellite' ? 'Satellite' : 'Street'} mode. Click to switch.`}
              >
                {mapType === 'satellite' ? (
                  <>
                    <Globe className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                    <span>🛰️ Satellite Active</span>
                  </>
                ) : (
                  <>
                    <Layers className="w-3.5 h-3.5 text-teal-600" />
                    <span>🗺️ Street Active</span>
                  </>
                )}
              </button>
            </div>

            <OpenSourceMap
              center={{ lat: selectedFarrier.lat || 38.4404, lng: selectedFarrier.lng || -122.7141 }}
              zoom={11}
              height="100%"
              mapTypeId={mapType}
              selectedMarkerId={selectedFarrier.id}
              onMarkerSelect={(id) => {
                const f = allFarriers.find(item => item.id === id);
                if (f) setSelectedFarrier(f);
              }}
              markers={filteredFarriers.map(f => ({
                id: f.id,
                lat: f.lat || 38.4404,
                lng: f.lng || -122.7141,
                title: f.name,
                subtitle: `${f.address || f.location} • ${f.priceEstimate}`,
                badge: (f.isFirebase || f.publishedAsListing) ? '🔥 PUBLISHED LISTING' : (f.verified ? 'VERIFIED' : undefined),
                color: (f.isFirebase || f.publishedAsListing) ? '#059669' : (selectedFarrier.id === f.id ? '#0d9488' : '#0284c7'),
                icon: '🔨',
                onClick: () => setSelectedFarrier(f)
              }))}
            />
          </div>

          {/* Selected Farrier Quick Snapshot */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Selected Farrier Dispatch
              </span>
              <span className="text-xs font-black text-teal-700">
                {selectedFarrier.priceEstimate}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <img 
                src={selectedFarrier.avatar} 
                alt={selectedFarrier.name} 
                className="w-10 h-10 rounded-xl object-cover border border-slate-300"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="font-extrabold text-xs text-slate-900 truncate">{selectedFarrier.name}</p>
                  {(selectedFarrier.isFirebase || selectedFarrier.publishedAsListing) && (
                    <span className="bg-emerald-600 text-white text-[8px] font-black uppercase px-1.5 py-0.2 rounded flex items-center gap-0.5">
                      <span>🔥 Published</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate">{selectedFarrier.address || selectedFarrier.location}</p>
              </div>
              <button
                onClick={() => handleBookFarrier(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-black text-[10px] px-3 py-1.5 rounded-xl shadow-xs shrink-0 cursor-pointer"
              >
                Urgent Shoe Dispatch
              </button>
            </div>
          </div>

          {/* Calendar Sync Control */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600 shrink-0" />
              <div>
                <p className="font-bold text-xs text-slate-800">Next Farrier Appointment</p>
                <p className="text-[11px] text-slate-500">6-Week Recurrent Cycle (Jan 12, 2026)</p>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-[11px] font-bold text-slate-600">Sync Google Calendar</span>
              <input
                type="checkbox"
                checked={syncToCalendar}
                onChange={(e) => setSyncToCalendar(e.target.checked)}
                className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

      </div>

      {/* Hoof History & Before/After Photo Logs */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Camera className="w-4 h-4 text-slate-700" />
              Hoof History & Photo Logs
            </h2>
            <p className="text-xs text-slate-500">Track angle evolution, heel expansion & shoeing notes with date-stamped photos</p>
          </div>

          <button
            onClick={() => setShowLogModal(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Hoof Photos</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hoofLogs.map((log) => (
            <div key={log.id} className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>{log.horseName} • Hoof Care Log</span>
                <span className="text-[10px] text-slate-500">{log.date}</span>
              </div>

              <p className="text-xs text-slate-600 italic">"{log.notes}"</p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">Before Trim</span>
                  <img src={log.beforePhoto} alt="Before" className="w-full h-24 object-cover rounded-lg border border-slate-200" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">After Trim / Reset</span>
                  <img src={log.afterPhoto} alt="After" className="w-full h-24 object-cover rounded-lg border border-slate-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PUBLISH LISTING FORM SECTION (WITH REAL-TIME FIREBASE SYNC) */}
      {/* ========================================================================= */}
      <div id="add-farrier-section" className="bg-white rounded-3xl p-5 sm:p-7 shadow-lg border border-slate-200 space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black shadow-sm">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Publish Farrier Listing to Firebase
                </h2>
                <span className="bg-emerald-100 text-emerald-900 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Database className="w-3 h-3 text-emerald-700" />
                  <span>Saves to Firebase Firestore</span>
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Publish a certified farrier service listing with full address, pricing, picture, and specialties to make it live across all devices
              </p>
            </div>
          </div>

          {/* Quick Auto-Fill Demo Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">⚡ Fill Demo:</span>
            <button
              type="button"
              onClick={() => handleFillPresetFarrier('journeyman')}
              className="bg-slate-100 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 text-[11px] font-bold py-1 px-2.5 rounded-xl transition-colors cursor-pointer"
            >
              🔨 Journeyman
            </button>
            <button
              type="button"
              onClick={() => handleFillPresetFarrier('barefoot')}
              className="bg-slate-100 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 text-[11px] font-bold py-1 px-2.5 rounded-xl transition-colors cursor-pointer"
            >
              🌿 Barefoot
            </button>
            <button
              type="button"
              onClick={() => handleFillPresetFarrier('sport')}
              className="bg-slate-100 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 text-[11px] font-bold py-1 px-2.5 rounded-xl transition-colors cursor-pointer"
            >
              🏆 Sport Horse
            </button>
          </div>
        </div>

        {/* Feedback Notifications */}
        {saveStatusMsg && (
          <div className="p-3.5 bg-teal-50 border border-teal-300 text-teal-950 rounded-2xl text-xs font-black flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{saveStatusMsg}</span>
          </div>
        )}

        {formErrorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-300 text-rose-900 rounded-2xl text-xs font-black flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{formErrorMessage}</span>
          </div>
        )}

        <form onSubmit={handleAddFarrierToFirebase} className="space-y-5">
          
          {/* 1. Basic Info: Name, Phone, Pricing & MC# */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                Farrier Name / Business Name *
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Harrison Bradley, CJF"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                Contact Phone
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="(707) 555-0819"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                Price Estimate / Rate
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formPriceEstimate}
                  onChange={(e) => setFormPriceEstimate(e.target.value)}
                  placeholder="$185 / Full Set"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          {/* 2. FULL ADDRESS FIELDS (Street, City, State, ZIP) */}
          <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-2xl space-y-3">
            <div className="flex items-center gap-1.5 text-slate-800 font-extrabold text-xs">
              <MapPin className="w-4 h-4 text-teal-600" />
              <span>Full Farrier Address & Service Base *</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Street Address */}
              <div className="sm:col-span-6">
                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={formStreet}
                  onChange={(e) => setFormStreet(e.target.value)}
                  placeholder="e.g. 3400 Calistoga Rd"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>

              {/* City */}
              <div className="sm:col-span-3">
                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  placeholder="Santa Rosa"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>

              {/* State */}
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                  State *
                </label>
                <select
                  value={formState}
                  onChange={(e) => setFormState(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none cursor-pointer"
                  required
                >
                  {US_STATES.map((st) => (
                    <option key={st.code} value={st.code}>
                      {st.code} ({st.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* ZIP */}
              <div className="sm:col-span-1">
                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                  ZIP *
                </label>
                <input
                  type="text"
                  value={formZip}
                  onChange={(e) => setFormZip(e.target.value)}
                  placeholder="95404"
                  maxLength={10}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2 py-2 text-xs text-slate-800 font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* 3. FARRIER PICTURE SELECTION & PREVIEW */}
          <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-800 font-extrabold text-xs">
                <ImageIcon className="w-4 h-4 text-teal-600" />
                <span>Farrier Picture / Avatar *</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Select preset, custom URL, or upload photo</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              
              {/* Picture Live Preview Card */}
              <div className="md:col-span-4 flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-slate-200 shadow-xs text-center space-y-2">
                <div className="relative group">
                  <img
                    src={formAvatar || PRESET_AVATARS[0].url}
                    alt="Farrier Preview"
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-teal-500 shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PRESET_AVATARS[0].url;
                    }}
                  />
                  <div className="absolute -bottom-1 -right-1 bg-teal-600 text-white rounded-full p-1 shadow-xs">
                    <Check className="w-3 h-3" />
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-800 block">Photo Preview</span>
                  <span className="text-[9px] text-slate-400">Ready for Firebase Storage</span>
                </div>
              </div>

              {/* Photo Input Controls */}
              <div className="md:col-span-8 space-y-3">
                {/* Preset Avatars Selector */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1.5">
                    Choose from Verified Presets:
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {PRESET_AVATARS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormAvatar(preset.url)}
                        className={`relative rounded-xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer ${
                          formAvatar === preset.url
                            ? 'border-teal-500 ring-2 ring-teal-500/20 scale-105'
                            : 'border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100'
                        }`}
                        title={preset.label}
                      >
                        <img src={preset.url} alt={preset.label} className="w-full h-12 rounded-lg object-cover" />
                        <span className="text-[8px] font-bold block text-slate-700 truncate mt-0.5 text-center">
                          {preset.label.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Photo URL & Upload Button */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <div className="relative flex-1 w-full">
                    <input
                      type="url"
                      value={formAvatar}
                      onChange={(e) => setFormAvatar(e.target.value)}
                      placeholder="Paste image URL (https://...)"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Specialties Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-extrabold text-slate-700">
                Hoofcare Specialties & Disciplines
              </label>
              <span className="text-[10px] text-teal-700 font-bold">
                {formSpecialties.length} selected
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {COMMON_SPECIALTIES.map((spec) => {
                const isSelected = formSpecialties.includes(spec);
                return (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => handleToggleSpecialty(spec)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{spec}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Specialty Adder */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={customSpecialty}
                onChange={(e) => setCustomSpecialty(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomSpecialty(); } }}
                placeholder="Add custom specialty (e.g. 'Laminitis Relief Trim')..."
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none flex-1 max-w-xs"
              />
              <button
                type="button"
                onClick={handleAddCustomSpecialty}
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          {/* 5. Additional Details: Certification, Emergency Response Toggle, Bio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                Certification / MC # / AFA Accreditation
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formMcNumber}
                  onChange={(e) => setFormMcNumber(e.target.value)}
                  placeholder="CJF #104820 or AFA Member"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <Award className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50/70 border border-red-200 rounded-2xl">
              <div>
                <span className="font-extrabold text-xs text-red-900 block flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-red-600" />
                  Emergency 24/7 Dispatch Availability
                </span>
                <span className="text-[10px] text-red-700">Available for immediate thrown shoe triage</span>
              </div>
              <input
                type="checkbox"
                checked={formInstantResponse}
                onChange={(e) => setFormInstantResponse(e.target.checked)}
                className="w-5 h-5 accent-red-600 rounded cursor-pointer shrink-0"
              />
            </div>
          </div>

          {/* Bio / Experience Description */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
              Farrier Bio / Experience / Service Radius Description
            </label>
            <textarea
              value={formBio}
              onChange={(e) => setFormBio(e.target.value)}
              rows={2}
              placeholder="e.g. Certified farrier serving Sonoma, Marin, and Napa counties with fully equipped mobile forge..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSavingFarrier}
            className="w-full bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-600 hover:from-emerald-700 hover:to-teal-800 text-white font-black py-3.5 rounded-2xl shadow-md transition-all hover:scale-[1.005] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs sm:text-sm"
          >
            {isSavingFarrier ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Publishing to Firestore Database Collection (/farriers)...</span>
              </>
            ) : (
              <>
                <Database className="w-4 h-4" />
                <span>🚀 Publish Farrier Listing to Firebase</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </>
            )}
          </button>

          {lastSavedFarrierName && (
            <p className="text-center text-[11px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 py-1.5 rounded-xl">
              ✓ Successfully published <strong>{lastSavedFarrierName}</strong> to Firebase! Now visible and searchable as a listing.
            </p>
          )}

        </form>

      </div>

      {/* Quick Publish Listing Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black shadow-xs">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Publish Farrier Listing to Firebase</h3>
                  <p className="text-[11px] text-slate-500">Live synchronization with Firestore database</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPublishModal(false)} 
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Auto-fill buttons */}
            <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">⚡ Fill Demo:</span>
              <button
                type="button"
                onClick={() => handleFillPresetFarrier('journeyman')}
                className="bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 text-[10px] font-bold py-1 px-2 rounded-lg transition-colors cursor-pointer"
              >
                🔨 Journeyman
              </button>
              <button
                type="button"
                onClick={() => handleFillPresetFarrier('barefoot')}
                className="bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 text-[10px] font-bold py-1 px-2 rounded-lg transition-colors cursor-pointer"
              >
                🌿 Barefoot
              </button>
              <button
                type="button"
                onClick={() => handleFillPresetFarrier('sport')}
                className="bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 text-[10px] font-bold py-1 px-2 rounded-lg transition-colors cursor-pointer"
              >
                🏆 Sport Horse
              </button>
            </div>

            <form onSubmit={handleAddFarrierToFirebase} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">Farrier Name *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Harrison Bradley, CJF"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="(707) 555-0819"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">Street Address *</label>
                  <input
                    type="text"
                    value={formStreet}
                    onChange={(e) => setFormStreet(e.target.value)}
                    placeholder="e.g. 4820 Redwood Highway"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="e.g. Petaluma"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">State *</label>
                  <select
                    value={formState}
                    onChange={(e) => setFormState(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:bg-white focus:ring-2 focus:ring-teal-500"
                  >
                    {US_STATES.map(s => (
                      <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">ZIP Code *</label>
                  <input
                    type="text"
                    value={formZip}
                    onChange={(e) => setFormZip(e.target.value)}
                    placeholder="94952"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">Price / Set</label>
                  <input
                    type="text"
                    value={formPriceEstimate}
                    onChange={(e) => setFormPriceEstimate(e.target.value)}
                    placeholder="$185 / Full Set"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingFarrier}
                  className="w-2/3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white py-3 rounded-xl font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingFarrier ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                  <span>Publish Listing to Firebase</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Hoof Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-extrabold text-sm text-slate-800">Upload Hoof Photo & Notes</h3>
              <button onClick={() => setShowLogModal(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleAddHoofLog} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Farrier Notes / Hoof Diagnosis</label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="e.g. Balanced heel angles, applied quarter clips to right front hoof..."
                  className="w-full border p-2 rounded-lg font-medium"
                  rows={3}
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="w-1/2 bg-slate-100 text-slate-700 py-2 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-xl font-bold cursor-pointer"
                >
                  Save Hoof Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
