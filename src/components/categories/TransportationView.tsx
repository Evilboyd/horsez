import React, { useState, useEffect, useMemo } from 'react';
import { 
  Truck, 
  MapPin, 
  Navigation, 
  Gauge, 
  Thermometer, 
  ShieldCheck, 
  MessageSquare, 
  DollarSign, 
  Download, 
  FileCheck,
  CheckCircle2,
  Clock,
  Plus,
  Copy,
  ExternalLink,
  ArrowRight,
  Phone,
  Building2,
  Key,
  Info,
  Sparkles,
  Calendar,
  CalendarCheck,
  Check,
  RotateCcw,
  AlertCircle,
  Calculator,
  Sliders,
  RefreshCw,
  Zap,
  Percent,
  Flame,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MOCK_HAULER_JOBS, MOCK_AVAILABLE_DRIVERS } from '../../data/mockData';
import { HaulerJob, HaulAddress, AvailableDriver } from '../../types';
import { OpenSourceMap } from '../common/OpenSourceMap';
import { TransportationLiveMap } from './TransportationLiveMap';
import { useSavedAddress, calculateHaversineDistance } from '../../context/SavedAddressContext';
import { 
  EQUINE_COLLECTIONS, 
  publishToFirestore, 
  subscribeToFirestoreCollection 
} from '../../lib/equineDataService';
import { useAuth } from '../../context/AuthContext';

// Known coordinates for facilities & California equestrian cities
const KNOWN_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Preset Facilities
  'sonoma valley equestrian center': { lat: 38.2910, lng: -122.4580 },
  'santa rosa equine medical & surgical hospital': { lat: 38.4104, lng: -122.7141 },
  'petaluma creek boarding stables': { lat: 38.2120, lng: -122.5830 },
  'murieta equestrian center (sacramento showgrounds)': { lat: 38.4982, lng: -121.0822 },
  'uc davis large animal veterinary clinic': { lat: 38.5305, lng: -121.7615 },
  'uc davis veterinary medical teaching hospital': { lat: 38.5305, lng: -121.7615 },
  'sonoma mountain': { lat: 38.3980, lng: -122.6520 },
  'dry creek valley dressage barn': { lat: 38.6180, lng: -122.8890 },
  'wine country equine ranch & pastures': { lat: 38.2910, lng: -122.4580 },

  // Cities & Regions
  'sonoma': { lat: 38.2919, lng: -122.4580 },
  'santa rosa': { lat: 38.4404, lng: -122.7141 },
  'petaluma': { lat: 38.2324, lng: -122.6367 },
  'davis': { lat: 38.5449, lng: -121.7405 },
  'sacramento': { lat: 38.5816, lng: -121.4944 },
  'rancho murieta': { lat: 38.4982, lng: -121.0822 },
  'healdsburg': { lat: 38.6105, lng: -122.8692 },
  'napa': { lat: 38.2975, lng: -122.2869 },
  'sebastopol': { lat: 38.4021, lng: -122.8239 },
  'rohnert park': { lat: 38.3396, lng: -122.7011 },
  'san rafael': { lat: 37.9735, lng: -122.5311 },
  'novato': { lat: 38.1074, lng: -122.5697 },
  'vacaville': { lat: 38.3566, lng: -121.9877 },
  'fairfield': { lat: 38.2494, lng: -122.0400 },
  'pleasanton': { lat: 37.6624, lng: -121.8747 },
  'woodside': { lat: 37.4299, lng: -122.2539 },
  'livermore': { lat: 37.6819, lng: -121.7680 },
  'oakland': { lat: 37.8044, lng: -122.2712 },
  'san francisco': { lat: 37.7749, lng: -122.4194 },
  'san jose': { lat: 37.3382, lng: -121.8863 },
  'gilroy': { lat: 37.0058, lng: -121.5683 },
  'stockton': { lat: 37.9577, lng: -121.2908 },
  'modesto': { lat: 37.6391, lng: -120.9969 },
  'fresno': { lat: 36.7468, lng: -119.7726 },
  'monterey': { lat: 36.6002, lng: -121.8947 },
  'reno': { lat: 39.5296, lng: -119.8138 }
};

function resolveLocationCoordinates(
  facility: string,
  street: string,
  city: string,
  state: string,
  zip: string
): { lat: number; lng: number } {
  const normFacility = (facility || '').toLowerCase().trim();
  const normCity = (city || '').toLowerCase().trim();
  const normStreet = (street || '').toLowerCase().trim();

  // 1. Direct facility match
  for (const [key, coords] of Object.entries(KNOWN_COORDINATES)) {
    if (normFacility && (normFacility.includes(key) || key.includes(normFacility))) {
      return coords;
    }
  }

  // 2. City match
  for (const [key, coords] of Object.entries(KNOWN_COORDINATES)) {
    if (normCity && (normCity === key || normCity.includes(key) || key.includes(normCity))) {
      return coords;
    }
  }

  // 3. Street keyword match
  if (normStreet.includes('sonoma')) return KNOWN_COORDINATES['sonoma'];
  if (normStreet.includes('adobe') || normStreet.includes('santa rosa')) return KNOWN_COORDINATES['santa rosa'];
  if (normStreet.includes('lakeville') || normStreet.includes('petaluma')) return KNOWN_COORDINATES['petaluma'];
  if (normStreet.includes('garrod') || normStreet.includes('davis')) return KNOWN_COORDINATES['davis'];
  if (normStreet.includes('lone pine') || normStreet.includes('murieta')) return KNOWN_COORDINATES['rancho murieta'];

  // 4. Default fallback in Northern California equestrian hub
  return { lat: 38.3500, lng: -122.6000 };
}

const PRESET_LOCATIONS: { name: string; address: HaulAddress }[] = [
  {
    name: 'Sonoma Valley Equestrian Center',
    address: {
      facilityName: 'Sonoma Valley Equestrian Center',
      street: '1420 Arnold Dr',
      city: 'Sonoma',
      state: 'CA',
      zip: '95476',
      contactName: 'Sarah Evans (Barn Owner)',
      contactPhone: '(707) 555-0142',
      accessInstructions: 'Main barn gate code #4820. Pull past covered arena to turn trailer around.'
    }
  },
  {
    name: 'Santa Rosa Equine Medical & Surgical Hospital',
    address: {
      facilityName: 'Santa Rosa Equine Medical & Surgical Hospital',
      street: '4900 Adobe Rd',
      city: 'Santa Rosa',
      state: 'CA',
      zip: '95404',
      contactName: 'Dr. Mark Davis (Receiving Vet)',
      contactPhone: '(707) 555-0188',
      accessInstructions: 'Back emergency unloading ramp #2. Reception notified of arrival.'
    }
  },
  {
    name: 'Petaluma Creek Boarding Stables',
    address: {
      facilityName: 'Petaluma Creek Boarding Stables',
      street: '2850 Lakeville Hwy',
      city: 'Petaluma',
      state: 'CA',
      zip: '94954',
      contactName: 'Jake Miller (Barn Mgr)',
      contactPhone: '(707) 555-0199',
      accessInstructions: 'Wide double entry gate unlocked 6am-8pm. Load at barn stall row 3.'
    }
  },
  {
    name: 'Murieta Equestrian Center (Sacramento Showgrounds)',
    address: {
      facilityName: 'Murieta Equestrian Center (Sacramento Showgrounds)',
      street: '7200 Lone Pine Dr',
      city: 'Rancho Murieta',
      state: 'CA',
      zip: '95683',
      contactName: 'Stabling Office (Gate 3)',
      contactPhone: '(916) 555-0144',
      accessInstructions: 'Check in with security at Gate 3. Direct stall assignment: Barn C.'
    }
  },
  {
    name: 'UC Davis Large Animal Veterinary Clinic',
    address: {
      facilityName: 'UC Davis Veterinary Medical Teaching Hospital',
      street: '1 Garrod Dr',
      city: 'Davis',
      state: 'CA',
      zip: '95616',
      contactName: 'Emergency Equine Receiving Desk',
      contactPhone: '(530) 752-0290',
      accessInstructions: 'Follow Large Animal Receiving signs to Equine Trailer Chute 1.'
    }
  }
];

export const TransportationView: React.FC = () => {
  const { savedAddress, calculateDistanceMiles, calculateDriveTimeMinutes, getOpenStreetMapDirectionsUrl } = useSavedAddress();
  const { userProfile } = useAuth();
  const [viewMode, setViewMode] = useState<'owner' | 'hauler'>('owner');
  
  // Real-time Firestore Haul Jobs & Carriers State
  const [firestoreJobs, setFirestoreJobs] = useState<HaulerJob[]>([]);
  const [firestoreCarriers, setFirestoreCarriers] = useState<AvailableDriver[]>([]);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState<'active' | 'live-map' | 'request' | 'receipts'>('active');
  const [haulerTab, setHaulerTab] = useState<'list' | 'map'>('list');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bookingConfirmedAlert, setBookingConfirmedAlert] = useState<{ id: string; date: string; pickup: string; dropoff: string } | null>(null);

  // Publish Carrier Rig Modal State
  const [showRegisterRigModal, setShowRegisterRigModal] = useState(false);
  const [carrierName, setCarrierName] = useState(userProfile?.fullName || 'Bay Area Equine Logistics');
  const [carrierPhone, setCarrierPhone] = useState(userProfile?.phone || '(707) 555-0144');
  const [carrierDot, setCarrierDot] = useState('USDOT #391824');
  const [carrierMc, setCarrierMc] = useState('MC-892104');
  const [carrierRigType, setCarrierRigType] = useState('4-Horse Head-to-Head Air-Ride Trailer');
  const [carrierBaseLocation, setCarrierBaseLocation] = useState('Santa Rosa, CA');
  const [carrierRatePerMile, setCarrierRatePerMile] = useState('3.85');
  const [carrierPhoto, setCarrierPhoto] = useState('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800');
  const [isPublishingRig, setIsPublishingRig] = useState(false);
  const [rigPublishMsg, setRigPublishMsg] = useState('');
  const [rigPublishError, setRigPublishError] = useState('');

  // 1. Subscribe to Firestore `haulJobs` in real-time
  useEffect(() => {
    setIsFirebaseLoading(true);
    const unsubscribeJobs = subscribeToFirestoreCollection<HaulerJob>(
      EQUINE_COLLECTIONS.HAUL_JOBS,
      (loadedJobs) => {
        setFirestoreJobs(loadedJobs);
        setIsFirebaseLoading(false);
      },
      (err) => {
        console.warn('Firestore haulJobs subscription warning:', err);
        setIsFirebaseLoading(false);
      }
    );

    const unsubscribeCarriers = subscribeToFirestoreCollection<AvailableDriver>(
      EQUINE_COLLECTIONS.TRANSPORTATION,
      (loadedCarriers) => {
        setFirestoreCarriers(loadedCarriers);
      },
      (err) => {
        console.warn('Firestore transportation subscription warning:', err);
      }
    );

    return () => {
      unsubscribeJobs();
      unsubscribeCarriers();
    };
  }, []);

  // Combined Hauler Jobs (Firestore first)
  const jobs: HaulerJob[] = useMemo(() => {
    const combined = [...firestoreJobs, ...MOCK_HAULER_JOBS];
    const seen = new Set<string>();
    return combined.filter(j => {
      if (seen.has(j.id)) return false;
      seen.add(j.id);
      return true;
    });
  }, [firestoreJobs]);

  // Combined Available Carriers (Firestore first)
  const drivers: AvailableDriver[] = useMemo(() => {
    const combined = [...firestoreCarriers, ...MOCK_AVAILABLE_DRIVERS];
    const seen = new Set<string>();
    return combined.filter(d => {
      if (seen.has(d.id)) return false;
      seen.add(d.id);
      return true;
    });
  }, [firestoreCarriers]);

  // Transport Schedule & Date State
  const tomorrowStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  const [bookingDate, setBookingDate] = useState<string>(tomorrowStr);
  const [pickupTimeSlot, setPickupTimeSlot] = useState('08:00 AM - 10:00 AM');
  const [deliveryDate, setDeliveryDate] = useState<string>(tomorrowStr);
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('01:30 PM - 03:30 PM');
  const [tripPurpose, setTripPurpose] = useState('Clinic / Veterinary Visit');

  // Full Pickup Address state
  const [pickupFacility, setPickupFacility] = useState(savedAddress.facilityName || 'Sonoma Valley Equestrian Center');
  const [pickupStreet, setPickupStreet] = useState(savedAddress.street || '1420 Arnold Dr');
  const [pickupCity, setPickupCity] = useState(savedAddress.city || 'Sonoma');
  const [pickupState, setPickupState] = useState(savedAddress.state || 'CA');
  const [pickupZip, setPickupZip] = useState(savedAddress.zip || '95476');
  const [pickupContactName, setPickupContactName] = useState(savedAddress.contactName || 'Sarah Evans (Owner)');
  const [pickupContactPhone, setPickupContactPhone] = useState(savedAddress.contactPhone || '(707) 555-0142');
  const [pickupAccessNotes, setPickupAccessNotes] = useState(savedAddress.accessInstructions || 'Gate code #4820. Pull past covered arena for wide trailer turnaround.');

  const handleApplySavedBarnPickup = () => {
    setPickupFacility(savedAddress.facilityName);
    setPickupStreet(savedAddress.street);
    setPickupCity(savedAddress.city);
    setPickupState(savedAddress.state);
    setPickupZip(savedAddress.zip);
    setPickupContactName(savedAddress.contactName);
    setPickupContactPhone(savedAddress.contactPhone);
    setPickupAccessNotes(savedAddress.accessInstructions);
  };

  const handleApplySavedBarnDelivery = () => {
    setDeliveryFacility(savedAddress.facilityName);
    setDeliveryStreet(savedAddress.street);
    setDeliveryCity(savedAddress.city);
    setDeliveryState(savedAddress.state);
    setDeliveryZip(savedAddress.zip);
    setDeliveryContactName(savedAddress.contactName);
    setDeliveryContactPhone(savedAddress.contactPhone);
    setDeliveryAccessNotes(savedAddress.accessInstructions);
  };

  // Full Delivery Address state
  const [deliveryFacility, setDeliveryFacility] = useState('Santa Rosa Equine Medical & Surgical Hospital');
  const [deliveryStreet, setDeliveryStreet] = useState('4900 Adobe Rd');
  const [deliveryCity, setDeliveryCity] = useState('Santa Rosa');
  const [deliveryState, setDeliveryState] = useState('CA');
  const [deliveryZip, setDeliveryZip] = useState('95404');
  const [deliveryContactName, setDeliveryContactName] = useState('Dr. Mark Davis (Receiving Vet)');
  const [deliveryContactPhone, setDeliveryContactPhone] = useState('(707) 555-0188');
  const [deliveryAccessNotes, setDeliveryAccessNotes] = useState('Back emergency unloading ramp #2. Clinic reception notified.');

  // Horse & Logistics Parameters
  const [selectedHorseName, setSelectedHorseName] = useState('Lucy (Chestnut Mare, 15.2hh)');
  const [numHorses, setNumHorses] = useState(2);
  const [rigType, setRigType] = useState('2-Horse Slant Load Air-Ride');
  const [hardLoaderRating, setHardLoaderRating] = useState('No, 10/10 Easy Loader');
  const [waterPolicy, setWaterPolicy] = useState('Every 2 hrs + Electrolyte bucket');
  const [specialHandlingNotes, setSpecialHandlingNotes] = useState('Hay net provided; shipping boots on all 4 legs; travel sheet on if under 65°F.');

  // Quote Calculator State & Options
  const [tripType, setTripType] = useState<'one_way' | 'round_trip'>('one_way');
  const [urgencyLevel, setUrgencyLevel] = useState<'standard' | 'priority' | 'emergency'>('standard');
  const [customDistanceOverride, setCustomDistanceOverride] = useState<number | null>(null);
  const [isCalculatingQuote, setIsCalculatingQuote] = useState<boolean>(false);
  const [hasCalculatedQuote, setHasCalculatedQuote] = useState<boolean>(true);
  const [quoteLockedTimestamp, setQuoteLockedTimestamp] = useState<string | null>(null);
  const [isDistanceCustomized, setIsDistanceCustomized] = useState<boolean>(false);

  // Dynamic distance calculation based on resolved coordinates between pickup and dropoff
  const pickupCoords = resolveLocationCoordinates(pickupFacility, pickupStreet, pickupCity, pickupState, pickupZip);
  const deliveryCoords = resolveLocationCoordinates(deliveryFacility, deliveryStreet, deliveryCity, deliveryState, deliveryZip);

  // Road distance with 1.22x winding road factor
  const autoDistanceMiles = Math.max(
    5.0,
    calculateHaversineDistance(pickupCoords.lat, pickupCoords.lng, deliveryCoords.lat, deliveryCoords.lng)
  );
  const effectiveDistanceMiles = isDistanceCustomized && customDistanceOverride !== null
    ? customDistanceOverride 
    : autoDistanceMiles;

  // Rate Breakdown Pricing Components
  const baseHookupFee = 85.0;
  
  // Tiered mileage rate: first 50 miles @ $2.75/mi, 51-150 miles @ $2.40/mi, 150+ @ $2.10/mi
  const mileageCost = effectiveDistanceMiles <= 50 
    ? effectiveDistanceMiles * 2.75 
    : effectiveDistanceMiles <= 150
      ? (50 * 2.75) + ((effectiveDistanceMiles - 50) * 2.40)
      : (50 * 2.75) + (100 * 2.40) + ((effectiveDistanceMiles - 150) * 2.10);

  // Horse passenger fees: 1st horse $120, additional horses $95 each
  const horseCost = 120.0 + ((numHorses - 1) * 95.0);

  // Rig equipment surcharges
  const rigSurcharges: Record<string, number> = {
    '2-Horse Slant Load Air-Ride': 0,
    'Gooseneck 4-Horse Box Stall': 55.0,
    'Straight Load Air-Ride with Ramp': 35.0,
    '6-Horse Commercial Hauler': 80.0
  };
  const rigCost = rigSurcharges[rigType] ?? 0;

  // Multipliers
  const tripMultiplier = tripType === 'round_trip' ? 1.85 : 1.0; // 15% discount on return leg
  const urgencyMultiplier = urgencyLevel === 'emergency' ? 1.30 : (urgencyLevel === 'priority' ? 1.15 : 1.0);
  const fuelAndWelfareSurcharge = 0.05; // 5% regulatory & trailer sanitation charge

  const unscaledSubtotal = baseHookupFee + mileageCost + horseCost + rigCost;
  const calculatedPrice = unscaledSubtotal * tripMultiplier * urgencyMultiplier * (1 + fuelAndWelfareSurcharge);
  const estimatedDriveMinutes = Math.round((effectiveDistanceMiles / 45) * 60 + 20); // 45mph speed limit with trailer + safety buffer

  const [activeHaul] = useState(MOCK_HAULER_JOBS[0]);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLog, setChatLog] = useState<string[]>([
    'Driver: "Lucy and Thunder are loaded safely in stall 1 & 2!"',
    'Driver: "Taking smooth highway 101. Air conditioning set to 68°F."'
  ]);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApplyPresetPickup = (loc: typeof PRESET_LOCATIONS[0]) => {
    setPickupFacility(loc.address.facilityName || loc.name);
    setPickupStreet(loc.address.street);
    setPickupCity(loc.address.city);
    setPickupState(loc.address.state);
    setPickupZip(loc.address.zip);
    setPickupContactName(loc.address.contactName || '');
    setPickupContactPhone(loc.address.contactPhone || '');
    setPickupAccessNotes(loc.address.accessInstructions || '');
  };

  const handleApplyPresetDelivery = (loc: typeof PRESET_LOCATIONS[0]) => {
    setDeliveryFacility(loc.address.facilityName || loc.name);
    setDeliveryStreet(loc.address.street);
    setDeliveryCity(loc.address.city);
    setDeliveryState(loc.address.state);
    setDeliveryZip(loc.address.zip);
    setDeliveryContactName(loc.address.contactName || '');
    setDeliveryContactPhone(loc.address.contactPhone || '');
    setDeliveryAccessNotes(loc.address.accessInstructions || '');
  };

  const handleTriggerGetQuote = () => {
    setIsCalculatingQuote(true);
    setTimeout(() => {
      setIsCalculatingQuote(false);
      setHasCalculatedQuote(true);
      setQuoteLockedTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      confetti({ particleCount: 50, spread: 65, origin: { y: 0.7 } });
    }, 450);
  };

  const handleCreateHaulRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullPickupSummary = `${pickupFacility ? pickupFacility + ', ' : ''}${pickupStreet}, ${pickupCity}, ${pickupState} ${pickupZip}`;
    const fullDeliverySummary = `${deliveryFacility ? deliveryFacility + ', ' : ''}${deliveryStreet}, ${deliveryCity}, ${deliveryState} ${deliveryZip}`;

    const newJobId = `haul-${Date.now()}`;
    const formattedPickupDate = `${bookingDate} • ${pickupTimeSlot}`;
    const formattedDeliveryDate = `${deliveryDate} • ${deliveryTimeSlot}`;

    const newJob: HaulerJob = {
      id: newJobId,
      pickup: fullPickupSummary,
      dropoff: fullDeliverySummary,
      pickupAddress: {
        facilityName: pickupFacility,
        street: pickupStreet,
        city: pickupCity,
        state: pickupState,
        zip: pickupZip,
        contactName: pickupContactName,
        contactPhone: pickupContactPhone,
        accessInstructions: pickupAccessNotes
      },
      deliveryAddress: {
        facilityName: deliveryFacility,
        street: deliveryStreet,
        city: deliveryCity,
        state: deliveryState,
        zip: deliveryZip,
        contactName: deliveryContactName,
        contactPhone: deliveryContactPhone,
        accessInstructions: deliveryAccessNotes
      },
      distanceMiles: Math.round(effectiveDistanceMiles),
      numHorses,
      rigRequirement: rigType,
      status: 'open',
      price: Math.round(calculatedPrice),
      date: bookingDate,
      pickupDate: formattedPickupDate,
      deliveryDate: formattedDeliveryDate,
      haulerName: 'Bay Area Equine Express (USDOT #391824)',
      isFirebase: true,
      publishedAsListing: true
    };

    try {
      await publishToFirestore(EQUINE_COLLECTIONS.HAUL_JOBS, newJob);
    } catch (err) {
      console.warn('Persisted locally if offline:', err);
    }

    setBookingConfirmedAlert({
      id: newJobId,
      date: formattedPickupDate,
      pickup: pickupFacility || pickupStreet,
      dropoff: deliveryFacility || deliveryStreet
    });

    confetti({ particleCount: 80, spread: 75, origin: { y: 0.6 } });
    setActiveTab('active');
  };

  const handlePublishCarrierRig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carrierName.trim() || !carrierPhone.trim()) {
      setRigPublishError('Please enter a carrier / operator name and contact phone.');
      return;
    }

    setIsPublishingRig(true);
    setRigPublishError('');
    setRigPublishMsg('Publishing commercial carrier rig to database...');

    try {
      const newCarrierPayload: Partial<AvailableDriver> = {
        name: carrierName.trim(),
        avatar: carrierPhoto || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800',
        rating: 5.0,
        tripsCompleted: 142,
        dotNumber: carrierDot.trim() || 'USDOT #391824',
        mcNumber: carrierMc.trim() || 'MC-892104',
        rig: carrierRigType.trim() || '4-Horse Air-Ride Slant Load',
        baseLocation: carrierBaseLocation.trim() || 'Santa Rosa, CA',
        phone: carrierPhone.trim(),
        emergencyCertified: true,
        commercialInsuranceLimit: '$1,000,000 Equine Transit Policy',
        cameraTelemetryLive: true,
        availableNow: true,
        status: 'accepting_trips' as const,
        currentLocation: { lat: 38.4404, lng: -122.7141 },
        ratePerMile: Number(carrierRatePerMile) || 3.85,
        isFirebase: true,
        publishedAsListing: true
      };

      await publishToFirestore(
        EQUINE_COLLECTIONS.TRANSPORTATION,
        newCarrierPayload
      );

      setRigPublishMsg('Commercial carrier rig registered successfully!');
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

      setTimeout(() => {
        setShowRegisterRigModal(false);
        setRigPublishMsg('');
      }, 800);

    } catch (err: any) {
      console.error('Failed to register rig:', err);
      setRigPublishError(err?.message || 'Database error occurred. Please try again.');
    } finally {
      setIsPublishingRig(false);
    }
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    setChatLog([...chatLog, `You: "${chatMessage}"`]);
    setChatMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-10 space-y-6">
      {/* Title Header with Mode Toggle */}
      <div className="bg-[#1B4A72] text-white p-4 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-sm">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold uppercase tracking-wide text-white">
              Equine Transportation & Logistics
            </h1>
            <p className="text-xs text-sky-200">
              Verified USDOT/MC# Haulers, Door-to-Door Full Addresses & Live Telemetry
            </p>
          </div>
        </div>

        {/* View Switcher: Owner View vs Hauler Bid Board */}
        <div className="flex items-center bg-white/10 p-1 rounded-xl border border-white/20 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('owner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'owner' ? 'bg-white text-slate-900 shadow' : 'text-sky-100 hover:text-white'
            }`}
          >
            Horse Owner
          </button>
          <button
            onClick={() => setViewMode('hauler')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'hauler' ? 'bg-white text-slate-900 shadow' : 'text-sky-100 hover:text-white'
            }`}
          >
            Hauler Bid Board
          </button>
        </div>
      </div>

      {/* Owner View Mode */}
      {viewMode === 'owner' && (
        <div className="space-y-6">
          {/* Sub Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'active' ? 'bg-teal-700 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Active Haul Telemetry
            </button>
            <button
              onClick={() => setActiveTab('live-map')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'live-map' ? 'bg-blue-600 text-white shadow-sm font-black' : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>🗺️ Live Fleet GPS Map</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>
            <button
              onClick={() => setActiveTab('request')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'request' ? 'bg-teal-700 text-white shadow-sm' : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300 font-bold'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>📅 Book Transport Service</span>
              <span className="bg-amber-200 text-amber-950 text-[9px] px-1.5 py-0.2 rounded font-extrabold">Instant</span>
            </button>
            <button
              onClick={() => setActiveTab('receipts')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'receipts' ? 'bg-teal-700 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Haul Receipts
            </button>

            <button
              onClick={() => setShowRegisterRigModal(true)}
              className="ml-auto bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm hover:scale-[1.02]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Register Carrier Rig</span>
            </button>
          </div>

          {/* Booking Confirmation Toast / Banner */}
          {bookingConfirmedAlert && activeTab === 'active' && (
            <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-lg border border-emerald-500 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-white shrink-0">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider bg-emerald-700 px-2 py-0.5 rounded">
                      Booking Confirmed • Haul #{bookingConfirmedAlert.id}
                    </span>
                    <span className="text-xs text-emerald-100 font-semibold">{bookingConfirmedAlert.date}</span>
                  </div>
                  <p className="text-xs text-emerald-50 mt-1 font-medium">
                    Transport booked from <span className="font-bold text-white">{bookingConfirmedAlert.pickup}</span> to <span className="font-bold text-white">{bookingConfirmedAlert.dropoff}</span>. Verified USDOT Hauler dispatched!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBookingConfirmedAlert(null)}
                className="text-white hover:text-emerald-200 text-xs font-bold px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-all shrink-0 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Active Haul Telemetry View */}
          {activeTab === 'active' && (
            <div className="space-y-6">
              {/* Quick Booking CTA Banner */}
              <div className="bg-gradient-to-r from-teal-800 to-sky-900 text-white p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">Need to schedule another horse transport?</h3>
                    <p className="text-xs text-sky-200">Door-to-door USDOT hauling with date, exact pickup & drop-off locations, and stall air-ride</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('request')}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Transport Service</span>
                </button>
              </div>

              {/* Full Pickup & Delivery Addresses Manifest Banner */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      Current In-Transit Manifest • Haul #{activeHaul.id}
                    </span>
                    <h2 className="text-sm font-black text-slate-900 mt-1">
                      Full Door-to-Door Pickup & Delivery Itinerary
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      USDOT Verified Driver ({activeHaul.haulerName})
                    </span>
                  </div>
                </div>

                {/* 2-Column Full Address Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Origin / Full Pickup Address Card */}
                  <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-700" />
                        1. Origin Pickup Address
                      </span>
                      {activeHaul.pickupDate && (
                        <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-emerald-700" />
                          {activeHaul.pickupDate}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">
                        {activeHaul.pickupAddress?.facilityName || activeHaul.pickup}
                      </h3>
                      <p className="text-xs font-semibold text-slate-700">
                        {activeHaul.pickupAddress?.street || '1420 Arnold Dr'}
                      </p>
                      <p className="text-xs text-slate-600">
                        {activeHaul.pickupAddress ? `${activeHaul.pickupAddress.city}, ${activeHaul.pickupAddress.state} ${activeHaul.pickupAddress.zip}` : 'Sonoma, CA 95476'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-emerald-200/60 space-y-1 text-xs">
                      {activeHaul.pickupAddress?.contactName && (
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="text-slate-500 text-[11px]">On-Site Contact:</span>
                          <span className="font-bold">{activeHaul.pickupAddress.contactName}</span>
                        </div>
                      )}
                      {activeHaul.pickupAddress?.contactPhone && (
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="text-slate-500 text-[11px]">Phone:</span>
                          <a href={`tel:${activeHaul.pickupAddress.contactPhone}`} className="font-bold text-emerald-800 hover:underline flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {activeHaul.pickupAddress.contactPhone}
                          </a>
                        </div>
                      )}
                      {activeHaul.pickupAddress?.accessInstructions && (
                        <div className="mt-1.5 p-2 rounded-lg bg-emerald-100/60 text-emerald-950 text-[11px] flex items-start gap-1.5">
                          <Key className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                          <span><strong>Gate/Access:</strong> {activeHaul.pickupAddress.accessInstructions}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleCopyText(
                        `${activeHaul.pickupAddress?.facilityName || ''}\n${activeHaul.pickupAddress?.street || ''}, ${activeHaul.pickupAddress?.city || ''}, ${activeHaul.pickupAddress?.state || ''} ${activeHaul.pickupAddress?.zip || ''}\nContact: ${activeHaul.pickupAddress?.contactName || ''} (${activeHaul.pickupAddress?.contactPhone || ''})\nGate Access: ${activeHaul.pickupAddress?.accessInstructions || ''}`,
                        'active-pickup'
                      )}
                      className="w-full mt-2 bg-white hover:bg-emerald-100/50 border border-emerald-300 text-emerald-900 font-bold text-[11px] py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedId === 'active-pickup' ? 'Address Copied!' : 'Copy Full Pickup Address'}</span>
                    </button>
                  </div>

                  {/* Destination / Full Delivery Address Card */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-800 bg-slate-200 px-2 py-0.5 rounded flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-700" />
                        2. Destination Delivery Address
                      </span>
                      {activeHaul.deliveryDate && (
                        <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-700" />
                          {activeHaul.deliveryDate}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">
                        {activeHaul.deliveryAddress?.facilityName || activeHaul.dropoff}
                      </h3>
                      <p className="text-xs font-semibold text-slate-700">
                        {activeHaul.deliveryAddress?.street || '4900 Adobe Rd'}
                      </p>
                      <p className="text-xs text-slate-600">
                        {activeHaul.deliveryAddress ? `${activeHaul.deliveryAddress.city}, ${activeHaul.deliveryAddress.state} ${activeHaul.deliveryAddress.zip}` : 'Santa Rosa, CA 95404'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 space-y-1 text-xs">
                      {activeHaul.deliveryAddress?.contactName && (
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="text-slate-500 text-[11px]">Receiving Contact:</span>
                          <span className="font-bold">{activeHaul.deliveryAddress.contactName}</span>
                        </div>
                      )}
                      {activeHaul.deliveryAddress?.contactPhone && (
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="text-slate-500 text-[11px]">Phone:</span>
                          <a href={`tel:${activeHaul.deliveryAddress.contactPhone}`} className="font-bold text-slate-900 hover:underline flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-600" />
                            {activeHaul.deliveryAddress.contactPhone}
                          </a>
                        </div>
                      )}
                      {activeHaul.deliveryAddress?.accessInstructions && (
                        <div className="mt-1.5 p-2 rounded-lg bg-slate-200/70 text-slate-900 text-[11px] flex items-start gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-700 shrink-0 mt-0.5" />
                          <span><strong>Unloading Bay:</strong> {activeHaul.deliveryAddress.accessInstructions}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleCopyText(
                        `${activeHaul.deliveryAddress?.facilityName || ''}\n${activeHaul.deliveryAddress?.street || ''}, ${activeHaul.deliveryAddress?.city || ''}, ${activeHaul.deliveryAddress?.state || ''} ${activeHaul.deliveryAddress?.zip || ''}\nContact: ${activeHaul.deliveryAddress?.contactName || ''} (${activeHaul.deliveryAddress?.contactPhone || ''})\nBay/Instructions: ${activeHaul.deliveryAddress?.accessInstructions || ''}`,
                        'active-delivery'
                      )}
                      className="w-full mt-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-[11px] py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedId === 'active-delivery' ? 'Address Copied!' : 'Copy Full Delivery Address'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Interactive GPS Map & Diagnostics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left Column: Interactive GPS Map & Diagnostics */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <h2 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <Navigation className="w-4 h-4 text-blue-600" />
                        Live Route & Diagnostics
                      </h2>
                      <p className="text-xs text-slate-500">Real-time trailer temperature, speed & suspension telemetry</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveTab('live-map')}
                        className="text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md border border-blue-200 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Full Radar</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        MC# Verified Driver
                      </span>
                    </div>
                  </div>

                  {/* Live GPS Route Map */}
                  <div className="bg-slate-900 rounded-xl overflow-hidden relative h-64 border border-slate-800">
                    <OpenSourceMap
                      center={{ lat: activeHaul.lat || 38.3600, lng: activeHaul.lng || -122.5800 }}
                      zoom={10}
                      height="100%"
                      markers={[
                        {
                          id: 'saved-barn',
                          lat: savedAddress.lat || 38.2919,
                          lng: savedAddress.lng || -122.4580,
                          title: `Saved Barn: ${savedAddress.facilityName}`,
                          subtitle: `${savedAddress.street}, ${savedAddress.city} • Gate: ${savedAddress.accessInstructions}`,
                          badge: 'SAVED BARN',
                          color: '#0d9488',
                          icon: '🏠'
                        },
                        {
                          id: 'pickup-loc',
                          lat: 38.2919,
                          lng: -122.4580,
                          title: `Pickup: ${activeHaul.pickup}`,
                          subtitle: 'Stall 1 & 2 Loading Bay',
                          badge: 'PICKUP',
                          color: '#10b981',
                          icon: '📍'
                        },
                        {
                          id: activeHaul.id,
                          lat: activeHaul.lat || 38.3600,
                          lng: activeHaul.lng || -122.5800,
                          title: `Haul Rig: ${activeHaul.haulerName || 'Mark D.'}`,
                          subtitle: `${activeHaul.pickup} ➔ ${activeHaul.dropoff} • Live Telemetry Active`,
                          badge: 'IN-TRANSIT',
                          color: '#2563eb',
                          icon: '🚛'
                        },
                        {
                          id: 'delivery-loc',
                          lat: 38.4404,
                          lng: -122.7141,
                          title: `Destination: ${activeHaul.dropoff}`,
                          subtitle: 'Receiving Surgical Unloading Ramp',
                          badge: 'DELIVERY',
                          color: '#8b5cf6',
                          icon: '🏥'
                        }
                      ]}
                    />
                  </div>

                  {/* Gauges & Telemetry Meters */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <Thermometer className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Trailer Temp</span>
                      <span className="text-xs font-extrabold text-slate-800">{activeHaul.liveDiagnostics?.temp}</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <Gauge className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Rig Speed</span>
                      <span className="text-xs font-extrabold text-slate-800">{activeHaul.liveDiagnostics?.speed}</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Air-Ride Status</span>
                      <span className="text-xs font-extrabold text-emerald-700">Smooth Cushion</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Hauler Live Chat */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h2 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                        Direct Driver Communication
                      </h2>
                      <span className="text-[11px] font-bold text-slate-500">Lucy & Thunder Safe & Watered</span>
                    </div>

                    {/* Chat Message Box */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 h-52 overflow-y-auto space-y-2 mt-3 text-xs">
                      {chatLog.map((msg, i) => (
                        <div key={i} className={`p-2 rounded-lg ${msg.startsWith('You:') ? 'bg-blue-100 text-blue-900 ml-4' : 'bg-white text-slate-800 mr-4 shadow-sm'}`}>
                          {msg}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask driver for update or photo..."
                      className="flex-1 bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      Send
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Live Fleet GPS Radar Open-Source Map View */}
          {activeTab === 'live-map' && (
            <TransportationLiveMap
              jobs={jobs}
              selectedJobId={activeHaul.id}
            />
          )}

          {/* Book Horse Transport Service Form View */}
          {activeTab === 'request' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 max-w-3xl mx-auto space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 text-teal-700 text-xs font-black uppercase tracking-wider mb-1">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>Door-to-Door Equine Transportation Booking</span>
                </div>
                <h2 className="font-black text-xl text-slate-900 flex items-center gap-2">
                  <span>Book Horse Transport Service</span>
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                    USDOT Verified
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Schedule scheduled or urgent horse transportation with exact dates, full door-to-door pick-up and drop-off addresses, and specialized rig requirements.
                </p>
              </div>

              <form onSubmit={handleCreateHaulRequest} className="space-y-6 text-xs">
                
                {/* 1. Date & Schedule Section */}
                <div className="bg-amber-50/60 rounded-2xl p-4 sm:p-5 border border-amber-200/80 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                        1
                      </div>
                      <h3 className="font-extrabold text-sm text-amber-950 uppercase tracking-wide flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-amber-700" />
                        Transport Date & Schedule
                      </h3>
                    </div>

                    {/* Quick Date Presets */}
                    <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
                      <span className="text-amber-800/80 font-semibold">Quick Date:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const today = new Date().toISOString().split('T')[0];
                          setBookingDate(today);
                          setDeliveryDate(today);
                        }}
                        className="bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded text-[10px] transition-all cursor-pointer shadow-xs"
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          d.setDate(d.getDate() + 1);
                          const str = d.toISOString().split('T')[0];
                          setBookingDate(str);
                          setDeliveryDate(str);
                        }}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-2 py-0.5 rounded text-[10px] transition-all cursor-pointer shadow-xs"
                      >
                        Tomorrow
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          d.setDate(d.getDate() + 3);
                          const str = d.toISOString().split('T')[0];
                          setBookingDate(str);
                          setDeliveryDate(str);
                        }}
                        className="bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded text-[10px] transition-all cursor-pointer shadow-xs"
                      >
                        In 3 Days
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        <span>Pick-Up Date *</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={bookingDate}
                        onChange={(e) => {
                          setBookingDate(e.target.value);
                          if (deliveryDate < e.target.value) {
                            setDeliveryDate(e.target.value);
                          }
                        }}
                        className="w-full bg-white border border-amber-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Preferred Pick-Up Time Slot *</span>
                      </label>
                      <select
                        value={pickupTimeSlot}
                        onChange={(e) => setPickupTimeSlot(e.target.value)}
                        className="w-full bg-white border border-amber-300 rounded-xl p-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      >
                        <option value="06:00 AM - 08:00 AM (Early Morning)">06:00 AM - 08:00 AM (Early Morning)</option>
                        <option value="08:00 AM - 10:00 AM (Morning Standard)">08:00 AM - 10:00 AM (Morning Standard)</option>
                        <option value="10:00 AM - 12:00 PM (Late Morning)">10:00 AM - 12:00 PM (Late Morning)</option>
                        <option value="12:00 PM - 02:00 PM (Midday Express)">12:00 PM - 02:00 PM (Midday Express)</option>
                        <option value="02:00 PM - 05:00 PM (Afternoon)">02:00 PM - 05:00 PM (Afternoon)</option>
                        <option value="05:00 PM - 08:00 PM (Evening Arrival)">05:00 PM - 08:00 PM (Evening Arrival)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1">
                        <CalendarCheck className="w-3.5 h-3.5 text-amber-600" />
                        <span>Estimated Delivery / Arrival Date *</span>
                      </label>
                      <input
                        type="date"
                        required
                        min={bookingDate}
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className="w-full bg-white border border-amber-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Estimated Drop-Off Window *</span>
                      </label>
                      <select
                        value={deliveryTimeSlot}
                        onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                        className="w-full bg-white border border-amber-300 rounded-xl p-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      >
                        <option value="11:30 AM - 01:30 PM (Midday)">11:30 AM - 01:30 PM (Midday)</option>
                        <option value="01:30 PM - 03:30 PM (Afternoon)">01:30 PM - 03:30 PM (Afternoon)</option>
                        <option value="03:30 PM - 06:00 PM (Late Afternoon)">03:30 PM - 06:00 PM (Late Afternoon)</option>
                        <option value="06:00 PM - 09:00 PM (Evening)">06:00 PM - 09:00 PM (Evening)</option>
                        <option value="Next Morning Direct Delivery">Next Morning Direct Delivery</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Purpose of Transport</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        'Clinic / Veterinary Visit',
                        'Horse Show / Competition',
                        'Barn Relocation / Boarding',
                        'Sale / Breeding Transfer'
                      ].map((purpose) => (
                        <button
                          key={purpose}
                          type="button"
                          onClick={() => setTripPurpose(purpose)}
                          className={`p-2 rounded-xl text-left border font-semibold transition-all cursor-pointer ${
                            tripPurpose === purpose
                              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                              : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100/50'
                          }`}
                        >
                          <div className="text-[11px] font-bold">{purpose.split('/')[0]}</div>
                          <div className="text-[9px] opacity-80">{purpose.split('/')[1] || 'Haul'}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Full Pickup Address Section */}
                <div className="bg-emerald-50/50 rounded-2xl p-4 sm:p-5 border border-emerald-200/80 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                        2
                      </div>
                      <h3 className="font-extrabold text-sm text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-700" />
                        Pick-Up Location & Address
                      </h3>
                    </div>

                    {/* Quick fill presets */}
                    <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
                      <span className="text-slate-500 font-semibold">Presets:</span>
                      <button
                        type="button"
                        onClick={handleApplySavedBarnPickup}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-0.5 rounded text-[10px] transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                      >
                        🏠 My Saved Barn
                      </button>
                      {PRESET_LOCATIONS.slice(0, 2).map((loc, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleApplyPresetPickup(loc)}
                          className="bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-2 py-0.5 rounded text-[10px] transition-all cursor-pointer"
                        >
                          {loc.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Pick-Up Facility / Barn Name *</label>
                        <input
                          type="text"
                          required
                          value={pickupFacility}
                          onChange={(e) => setPickupFacility(e.target.value)}
                          placeholder="e.g. Sonoma Valley Equestrian Center"
                          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Street Address *</label>
                        <input
                          type="text"
                          required
                          value={pickupStreet}
                          onChange={(e) => setPickupStreet(e.target.value)}
                          placeholder="e.g. 1420 Arnold Dr"
                          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">City *</label>
                        <input
                          type="text"
                          required
                          value={pickupCity}
                          onChange={(e) => setPickupCity(e.target.value)}
                          placeholder="Sonoma"
                          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">State *</label>
                        <input
                          type="text"
                          required
                          value={pickupState}
                          onChange={(e) => setPickupState(e.target.value)}
                          placeholder="CA"
                          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">ZIP Code *</label>
                        <input
                          type="text"
                          required
                          value={pickupZip}
                          onChange={(e) => setPickupZip(e.target.value)}
                          placeholder="95476"
                          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">On-Site Barn Contact Person</label>
                        <input
                          type="text"
                          value={pickupContactName}
                          onChange={(e) => setPickupContactName(e.target.value)}
                          placeholder="Sarah Evans (Owner)"
                          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Contact Phone Number</label>
                        <input
                          type="tel"
                          value={pickupContactPhone}
                          onChange={(e) => setPickupContactPhone(e.target.value)}
                          placeholder="(707) 555-0142"
                          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Gate Code & Trailer Loading / Turnaround Notes</label>
                      <input
                        type="text"
                        value={pickupAccessNotes}
                        onChange={(e) => setPickupAccessNotes(e.target.value)}
                        placeholder="Gate code #4820. Pull past covered arena to turn large trailer around."
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Full Delivery / Destination Address Section */}
                <div className="bg-sky-50/50 rounded-2xl p-4 sm:p-5 border border-sky-200/80 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-200/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-sky-700 text-white flex items-center justify-center font-bold text-xs">
                        3
                      </div>
                      <h3 className="font-extrabold text-sm text-sky-950 uppercase tracking-wide flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-sky-700" />
                        Drop-Off / Destination Location
                      </h3>
                    </div>

                    {/* Quick fill presets */}
                    <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
                      <span className="text-slate-500 font-semibold">Presets:</span>
                      <button
                        type="button"
                        onClick={handleApplySavedBarnDelivery}
                        className="bg-sky-700 hover:bg-sky-800 text-white font-bold px-2 py-0.5 rounded text-[10px] transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                      >
                        🏠 My Saved Barn
                      </button>
                      {PRESET_LOCATIONS.slice(1, 4).map((loc, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleApplyPresetDelivery(loc)}
                          className="bg-white hover:bg-sky-100 text-sky-900 border border-sky-300 font-bold px-2 py-0.5 rounded text-[10px] transition-all cursor-pointer"
                        >
                          {loc.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Destination Facility / Clinic / Barn Name *</label>
                        <input
                          type="text"
                          required
                          value={deliveryFacility}
                          onChange={(e) => setDeliveryFacility(e.target.value)}
                          placeholder="e.g. Santa Rosa Equine Medical & Surgical"
                          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Destination Street Address *</label>
                        <input
                          type="text"
                          required
                          value={deliveryStreet}
                          onChange={(e) => setDeliveryStreet(e.target.value)}
                          placeholder="e.g. 4900 Adobe Rd"
                          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">City *</label>
                        <input
                          type="text"
                          required
                          value={deliveryCity}
                          onChange={(e) => setDeliveryCity(e.target.value)}
                          placeholder="Santa Rosa"
                          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">State *</label>
                        <input
                          type="text"
                          required
                          value={deliveryState}
                          onChange={(e) => setDeliveryState(e.target.value)}
                          placeholder="CA"
                          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">ZIP Code *</label>
                        <input
                          type="text"
                          required
                          value={deliveryZip}
                          onChange={(e) => setDeliveryZip(e.target.value)}
                          placeholder="95404"
                          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Receiving Contact Name</label>
                        <input
                          type="text"
                          value={deliveryContactName}
                          onChange={(e) => setDeliveryContactName(e.target.value)}
                          placeholder="Dr. Mark Davis (Vet)"
                          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Receiving Phone Number</label>
                        <input
                          type="tel"
                          value={deliveryContactPhone}
                          onChange={(e) => setDeliveryContactPhone(e.target.value)}
                          placeholder="(707) 555-0188"
                          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Unloading Bay / Stall / Gate Instructions</label>
                      <input
                        type="text"
                        value={deliveryAccessNotes}
                        onChange={(e) => setDeliveryAccessNotes(e.target.value)}
                        placeholder="Back emergency unloading ramp #2. Reception notified."
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Horse Specifications & Trailer Logistics */}
                <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
                    <div className="w-6 h-6 rounded-lg bg-slate-700 text-white flex items-center justify-center font-bold text-xs">
                      4
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                      Horse Details & Trailer Rig Requirements
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Primary Horse</label>
                      <select
                        value={selectedHorseName}
                        onChange={(e) => setSelectedHorseName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900"
                      >
                        <option value="Lucy (Chestnut Mare, 15.2hh)">Lucy (Chestnut Mare, 15.2hh)</option>
                        <option value="Thunder (Quarter Horse Gelding, 16.0hh)">Thunder (Quarter Horse Gelding, 16.0hh)</option>
                        <option value="Bella (Warmblood Mare, 16.3hh)">Bella (Warmblood Mare, 16.3hh)</option>
                        <option value="Multiple Horses / Full Stabling">Multiple Horses / Full Stabling</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Number of Horses</label>
                      <select 
                        value={numHorses} 
                        onChange={(e) => setNumHorses(Number(e.target.value))} 
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900"
                      >
                        <option value={1}>1 Horse Stall</option>
                        <option value={2}>2 Horses (Double Slant)</option>
                        <option value={3}>3 Horses</option>
                        <option value={4}>4 Horses (Full Barn Box / Gooseneck)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Trailer Rig Requirement</label>
                      <select 
                        value={rigType} 
                        onChange={(e) => setRigType(e.target.value)} 
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900"
                      >
                        <option value="2-Horse Slant Load Air-Ride">2-Horse Slant Load Air-Ride (Base)</option>
                        <option value="Gooseneck 4-Horse Box Stall">Gooseneck 4-Horse Box Stall (+$55)</option>
                        <option value="Straight Load Air-Ride with Ramp">Straight Load Air-Ride with Ramp (+$35)</option>
                        <option value="6-Horse Commercial Hauler">6-Horse Commercial Hauler (+$80)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Loading Temperament</label>
                      <select 
                        value={hardLoaderRating} 
                        onChange={(e) => setHardLoaderRating(e.target.value)} 
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900"
                      >
                        <option value="No, 10/10 Easy Loader">No, loads easily (10/10)</option>
                        <option value="Yes, 6/10 Needs Patience">Yes, needs extra patience (6/10)</option>
                        <option value="Needs Ramp & Grain">Needs Ramp & Grain treats</option>
                        <option value="Young/Green Horse (First Haul)">Young/Green Horse (First Haul)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Hydration & Water Stop Policy</label>
                      <select 
                        value={waterPolicy} 
                        onChange={(e) => setWaterPolicy(e.target.value)} 
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900"
                      >
                        <option value="Every 2 hrs + Electrolyte bucket">Every 2 hrs + Electrolyte bucket</option>
                        <option value="Every 4 hrs">Every 4 hrs</option>
                        <option value="Direct Express Non-stop">Direct Express Non-stop</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Special Handling & Gear Notes</label>
                      <input
                        type="text"
                        value={specialHandlingNotes}
                        onChange={(e) => setSpecialHandlingNotes(e.target.value)}
                        placeholder="Hay nets, shipping boots, blanket, medication..."
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Health Papers Auto-Sync Confirmation */}
                  <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-center justify-between text-emerald-900">
                    <div className="flex items-center gap-2.5">
                      <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold block">Digital Coggins & Interstate Health Papers</span>
                        <span className="text-[11px] text-emerald-700">Auto-synced from your My Stable digital health vault to USDOT hauler</span>
                      </div>
                    </div>
                    <span className="bg-emerald-200 text-emerald-950 font-extrabold px-2.5 py-1 rounded-md text-[10px] shrink-0">
                      Verified & Attached
                    </span>
                  </div>
                </div>

                {/* 5. 'Get Quote' Equine Transport Cost & Distance Calculator */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                        <Calculator className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                            Equine Transport Quote Calculator
                          </span>
                          <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Live Distance-Based
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                          {pickupCity || 'Origin'} ➔ {deliveryCity || 'Destination'}
                        </h4>
                      </div>
                    </div>

                    {/* Recalculate / Get Quote CTA */}
                    <button
                      type="button"
                      onClick={handleTriggerGetQuote}
                      disabled={isCalculatingQuote}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isCalculatingQuote ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Calculating Distance & Rates...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          <span>Get Quote / Recalculate</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Calculated Route & Distance Telemetry Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Calculated Distance</span>
                      <span className="font-extrabold text-amber-400 text-sm">
                        {effectiveDistanceMiles.toFixed(1)} miles
                      </span>
                      <span className="text-[10px] text-slate-400 block">Winding road factored</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Transit Time</span>
                      <span className="font-extrabold text-white text-sm">
                        ~{Math.floor(estimatedDriveMinutes / 60) > 0 ? `${Math.floor(estimatedDriveMinutes / 60)}h ` : ''}{estimatedDriveMinutes % 60}m
                      </span>
                      <span className="text-[10px] text-slate-400 block">45mph trailer safety speed</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Mileage Tier</span>
                      <span className="font-extrabold text-white text-sm">
                        ${effectiveDistanceMiles <= 50 ? '2.75' : effectiveDistanceMiles <= 150 ? '2.40' : '2.10'} / mi
                      </span>
                      <span className="text-[10px] text-slate-400 block">Commercial USDOT hauler</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Rate Guarantee</span>
                      <span className="font-extrabold text-emerald-400 text-sm flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 48-Hour Lock
                      </span>
                      <span className="text-[10px] text-slate-400 block">No hidden barn fees</span>
                    </div>
                  </div>

                  {/* Calculator Modifiers: Trip Type & Urgency */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {/* Trip Type */}
                    <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 space-y-2">
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                        Route Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setTripType('one_way')}
                          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all text-center ${
                            tripType === 'one_way'
                              ? 'bg-amber-500 text-slate-950 shadow-sm'
                              : 'bg-slate-700/60 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          One-Way Haul
                        </button>
                        <button
                          type="button"
                          onClick={() => setTripType('round_trip')}
                          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all text-center flex flex-col items-center justify-center ${
                            tripType === 'round_trip'
                              ? 'bg-amber-500 text-slate-950 shadow-sm'
                              : 'bg-slate-700/60 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          <span>Round-Trip</span>
                          <span className="text-[9px] font-black text-emerald-950 bg-emerald-300 px-1.5 py-0.2 rounded mt-0.5">
                            Save 15% Return
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Dispatch Urgency */}
                    <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 space-y-2">
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                        Dispatch Priority
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setUrgencyLevel('standard')}
                          className={`py-2 px-1.5 rounded-lg text-[11px] font-bold transition-all text-center ${
                            urgencyLevel === 'standard'
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-700/60 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          Standard
                        </button>
                        <button
                          type="button"
                          onClick={() => setUrgencyLevel('priority')}
                          className={`py-2 px-1.5 rounded-lg text-[11px] font-bold transition-all text-center ${
                            urgencyLevel === 'priority'
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-700/60 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          Priority (+15%)
                        </button>
                        <button
                          type="button"
                          onClick={() => setUrgencyLevel('emergency')}
                          className={`py-2 px-1.5 rounded-lg text-[11px] font-bold transition-all text-center ${
                            urgencyLevel === 'emergency'
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-700/60 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          Urgent (+30%)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Optional Distance Fine-Tuning Toggle */}
                  <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsDistanceCustomized(!isDistanceCustomized)}
                      className="text-amber-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer text-[11px]"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>{isDistanceCustomized ? 'Reset to Auto GPS Distance' : 'Fine-Tune Custom Distance / Detour Miles'}</span>
                    </button>
                    {isDistanceCustomized && (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-300">Custom Miles:</span>
                        <input
                          type="number"
                          min="1"
                          max="1000"
                          value={customDistanceOverride ?? Math.round(autoDistanceMiles)}
                          onChange={(e) => setCustomDistanceOverride(Number(e.target.value))}
                          className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white font-bold text-right text-xs"
                        />
                      </div>
                    )}
                  </div>

                  {/* Itemized Quotation Breakdown Table */}
                  <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 space-y-2 text-xs">
                    <span className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-1.5">
                      Itemized Fare Breakdown
                    </span>

                    <div className="flex items-center justify-between text-slate-300">
                      <span>Base Rig Dispatch & Hitch Safety Inspection</span>
                      <span className="font-mono font-medium">${baseHookupFee.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span>
                        Transport Mileage ({effectiveDistanceMiles.toFixed(1)} mi {tripType === 'round_trip' ? '× 2 ways' : ''})
                      </span>
                      <span className="font-mono font-medium">
                        ${(mileageCost * (tripType === 'round_trip' ? 1.85 : 1.0)).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span>Equine Passenger Fee ({numHorses} Horse{numHorses > 1 ? 's' : ''})</span>
                      <span className="font-mono font-medium">${horseCost.toFixed(2)}</span>
                    </div>

                    {rigCost > 0 && (
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Trailer Rig Option ({rigType})</span>
                        <span className="font-mono font-medium">+${rigCost.toFixed(2)}</span>
                      </div>
                    )}

                    {tripType === 'round_trip' && (
                      <div className="flex items-center justify-between text-emerald-400">
                        <span>Round-Trip Return Leg Discount</span>
                        <span className="font-mono font-medium">-15% On Return</span>
                      </div>
                    )}

                    {urgencyLevel !== 'standard' && (
                      <div className="flex items-center justify-between text-amber-300">
                        <span>Dispatch Priority Surcharge ({urgencyLevel})</span>
                        <span className="font-mono font-medium">
                          +{urgencyLevel === 'emergency' ? '30%' : '15%'}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Fuel Index & Equine Trailer Sanitation (5%)</span>
                      <span className="font-mono font-medium">
                        ${(unscaledSubtotal * tripMultiplier * urgencyMultiplier * fuelAndWelfareSurcharge).toFixed(2)}
                      </span>
                    </div>

                    {/* Total Quote */}
                    <div className="flex items-baseline justify-between border-t border-slate-700/80 pt-2.5 mt-2">
                      <div>
                        <span className="text-sm font-black text-white block">Total Estimated Fare</span>
                        <span className="text-[10px] text-emerald-400">
                          Guaranteed Range: ${Math.round(calculatedPrice * 0.96)} - ${Math.round(calculatedPrice * 1.04)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-black text-amber-400 tracking-tight">
                          ${Math.round(calculatedPrice)}
                        </span>
                        <span className="text-[10px] text-slate-400 block">USD • All-inclusive</span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Action */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm py-4 rounded-xl uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CalendarCheck className="w-5 h-5 text-slate-950" />
                      <span>Confirm & Book Horse Transport (${Math.round(calculatedPrice)} Guaranteed)</span>
                    </button>
                    <p className="text-center text-[11px] text-slate-400 mt-2.5">
                      Instant dispatch to licensed, insured equine haulers with real-time GPS telemetry and stall temperature tracking.
                    </p>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Receipts View */}
          {activeTab === 'receipts' && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="font-extrabold text-xs uppercase tracking-wider text-slate-800">
                    Completed Hauls & Digital Receipts
                  </h2>
                  <p className="text-xs text-slate-500">Official USDOT hauling logs, bill of lading & payments</p>
                </div>
                <span className="text-xs font-bold text-slate-500">1 Completed</span>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900">Haul Receipt #941</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                        Delivered & Verified
                      </span>
                    </div>
                    <span className="font-black text-slate-900 text-sm">$450.00 Paid</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Full Pickup Address</span>
                      <p className="font-bold text-xs text-slate-800">Sonoma Valley Equestrian Center</p>
                      <p className="text-[11px] text-slate-600">1420 Arnold Dr, Sonoma, CA 95476</p>
                      <p className="text-[10px] text-slate-500">Contact: Sarah Evans • (707) 555-0142</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Full Delivery Address</span>
                      <p className="font-bold text-xs text-slate-800">Santa Rosa Equine Medical Clinic</p>
                      <p className="text-[11px] text-slate-600">4900 Adobe Rd, Santa Rosa, CA 95404</p>
                      <p className="text-[10px] text-slate-500">Contact: Dr. Mark Davis • (707) 555-0188</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Driver: Mark D. (Air-Ride Slant) • 2 Horses (Lucy & Thunder)</span>
                    <button 
                      onClick={() => alert('Downloading official digital Bill of Lading & Receipt PDF...')}
                      className="text-teal-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Receipt PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hauler Bid Board View Mode */}
      {viewMode === 'hauler' && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <h2 className="font-extrabold text-xs uppercase tracking-wider text-slate-800">
                Hauler Open Jobs Board & Full Dispatch Addresses
              </h2>
              <p className="text-xs text-slate-500">Commercial load board with complete street addresses, gate codes & facility contacts</p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* List / Map Switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  onClick={() => setHaulerTab('list')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    haulerTab === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📋 Jobs List ({jobs.length})
                </button>
                <button
                  onClick={() => setHaulerTab('map')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    haulerTab === 'map' ? 'bg-blue-600 text-white shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>🗺️ Live Radar Map</span>
                </button>
              </div>
            </div>
          </div>

          {haulerTab === 'map' ? (
            <TransportationLiveMap jobs={jobs} />
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
              <div key={job.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3.5 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">{job.id.toUpperCase()}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      job.status === 'in-transit' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {job.status === 'in-transit' ? 'In-Transit' : 'Open for Bidding'}
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold">{job.date}</span>
                  </div>
                  <span className="font-black text-base text-slate-900">${job.price} Est. Payout</span>
                </div>

                {/* 2-Column Full Address breakdown for Haulers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                  {/* Origin */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        Full Pickup Address
                      </span>
                      <button
                        onClick={() => handleCopyText(
                          `${job.pickupAddress?.facilityName || ''}\n${job.pickupAddress?.street || ''}, ${job.pickupAddress?.city || ''}, ${job.pickupAddress?.state || ''} ${job.pickupAddress?.zip || ''}\nContact: ${job.pickupAddress?.contactName || ''} (${job.pickupAddress?.contactPhone || ''})\nGate: ${job.pickupAddress?.accessInstructions || ''}`,
                          `hauler-pickup-${job.id}`
                        )}
                        className="text-[10px] font-bold text-slate-500 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedId === `hauler-pickup-${job.id}` ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="font-bold text-xs text-slate-900 mt-1">{job.pickupAddress?.facilityName || job.pickup}</p>
                    <p className="text-[11px] font-medium text-slate-700">{job.pickupAddress?.street || '1420 Arnold Dr'}</p>
                    <p className="text-[11px] text-slate-500">
                      {job.pickupAddress ? `${job.pickupAddress.city}, ${job.pickupAddress.state} ${job.pickupAddress.zip}` : 'Sonoma, CA'}
                    </p>
                    {job.pickupAddress?.contactName && (
                      <p className="text-[10px] text-slate-600 pt-1">
                        <strong>Contact:</strong> {job.pickupAddress.contactName} {job.pickupAddress.contactPhone && `• ${job.pickupAddress.contactPhone}`}
                      </p>
                    )}
                    {job.pickupAddress?.accessInstructions && (
                      <p className="text-[10px] text-emerald-900 bg-emerald-50 p-1.5 rounded mt-1">
                        <strong>Gate/Access:</strong> {job.pickupAddress.accessInstructions}
                      </p>
                    )}
                  </div>

                  {/* Destination */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-600" />
                        Full Delivery Address
                      </span>
                      <button
                        onClick={() => handleCopyText(
                          `${job.deliveryAddress?.facilityName || ''}\n${job.deliveryAddress?.street || ''}, ${job.deliveryAddress?.city || ''}, ${job.deliveryAddress?.state || ''} ${job.deliveryAddress?.zip || ''}\nContact: ${job.deliveryAddress?.contactName || ''} (${job.deliveryAddress?.contactPhone || ''})\nInstructions: ${job.deliveryAddress?.accessInstructions || ''}`,
                          `hauler-delivery-${job.id}`
                        )}
                        className="text-[10px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedId === `hauler-delivery-${job.id}` ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="font-bold text-xs text-slate-900 mt-1">{job.deliveryAddress?.facilityName || job.dropoff}</p>
                    <p className="text-[11px] font-medium text-slate-700">{job.deliveryAddress?.street || '4900 Adobe Rd'}</p>
                    <p className="text-[11px] text-slate-500">
                      {job.deliveryAddress ? `${job.deliveryAddress.city}, ${job.deliveryAddress.state} ${job.deliveryAddress.zip}` : 'Santa Rosa, CA'}
                    </p>
                    {job.deliveryAddress?.contactName && (
                      <p className="text-[10px] text-slate-600 pt-1">
                        <strong>Contact:</strong> {job.deliveryAddress.contactName} {job.deliveryAddress.contactPhone && `• ${job.deliveryAddress.contactPhone}`}
                      </p>
                    )}
                    {job.deliveryAddress?.accessInstructions && (
                      <p className="text-[10px] text-slate-800 bg-slate-100 p-1.5 rounded mt-1">
                        <strong>Unloading Notes:</strong> {job.deliveryAddress.accessInstructions}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-slate-600 text-[11px] pt-1">
                  <div className="flex items-center gap-3">
                    <span><strong>Horses:</strong> {job.numHorses}</span>
                    <span><strong>Distance:</strong> {job.distanceMiles} miles</span>
                    <span><strong>Rig:</strong> {job.rigRequirement}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert(`Job ${job.id} claimed instantly for $${job.price}! GPS route generated.`)}
                      className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      Claim Haul (${job.price})
                    </button>
                    <button
                      onClick={() => alert('Custom bid submitted!')}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      Submit Custom Bid
                    </button>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      )}

      {/* 🟢 REGISTER COMMERCIAL CARRIER RIG MODAL */}
      {showRegisterRigModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                    Register Commercial Hauler / Rig Listing
                  </h3>
                  <p className="text-xs text-slate-500">
                    Saves directly to Firebase transportation collection with DOT/MC telemetry
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowRegisterRigModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {rigPublishMsg ? (
              <div className="p-6 text-center space-y-2 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="font-black text-base">{rigPublishMsg}</h4>
                <p className="text-xs text-amber-800">Your commercial trailer and driver credentials are now live for client dispatches.</p>
              </div>
            ) : (
              <form onSubmit={handlePublishCarrierRig} className="space-y-3.5 text-xs">
                {rigPublishError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2 font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{rigPublishError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company / Carrier Name *</label>
                  <input 
                    type="text" 
                    value={carrierName} 
                    onChange={(e) => setCarrierName(e.target.value)}
                    placeholder="E.g., Pacific Coast Equine Express LLC"
                    className="w-full border border-slate-300 p-2.5 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">USDOT Number</label>
                    <input 
                      type="text" 
                      value={carrierDot} 
                      onChange={(e) => setCarrierDot(e.target.value)}
                      placeholder="USDOT #391824"
                      className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">MC / ICC Docket #</label>
                    <input 
                      type="text" 
                      value={carrierMc} 
                      onChange={(e) => setCarrierMc(e.target.value)}
                      placeholder="MC-892104"
                      className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Contact Phone *</label>
                    <input 
                      type="tel" 
                      value={carrierPhone} 
                      onChange={(e) => setCarrierPhone(e.target.value)}
                      placeholder="(707) 555-0144"
                      className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Rate Per Loaded Mile ($)</label>
                    <input 
                      type="number" 
                      step="0.05"
                      value={carrierRatePerMile} 
                      onChange={(e) => setCarrierRatePerMile(e.target.value)}
                      placeholder="3.85"
                      className="w-full border border-slate-300 p-2.5 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trailer Configuration & Rig Type</label>
                  <select 
                    value={carrierRigType}
                    onChange={(e) => setCarrierRigType(e.target.value)}
                    className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 font-medium bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="4-Horse Head-to-Head Air-Ride Trailer">4-Horse Head-to-Head Air-Ride Trailer (Box Stalls)</option>
                    <option value="6-Horse Commercial Air-Ride Van">6-Horse Commercial Air-Ride Van</option>
                    <option value="2-Horse Warmblood Slant Load">2-Horse Warmblood Slant Load with Video Cameras</option>
                    <option value="15-Horse Semi-Transport Tractor">15-Horse Semi-Transport Tractor (Cross-Country)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Home Dispatch Base / City</label>
                  <input 
                    type="text" 
                    value={carrierBaseLocation} 
                    onChange={(e) => setCarrierBaseLocation(e.target.value)}
                    placeholder="Santa Rosa / Sonoma County, CA"
                    className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                {/* Photo Presets */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rig Photo Preset</label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {[
                      { label: 'Air-Ride Gooseneck', url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800' },
                      { label: 'Semi Rig Transporter', url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800' },
                      { label: 'Slant Load Rig', url: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=800' }
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCarrierPhoto(preset.url)}
                        className={`p-1.5 rounded-xl border text-left flex flex-col items-center gap-1 transition-all ${
                          carrierPhoto === preset.url ? 'border-amber-600 ring-2 ring-amber-500/30 bg-amber-50/50' : 'border-slate-200 hover:border-slate-300'
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
                    onClick={() => setShowRegisterRigModal(false)}
                    className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isPublishingRig}
                    className="w-2/3 bg-amber-500 hover:bg-amber-400 text-slate-950 py-3 rounded-xl font-black shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Flame className="w-4 h-4 text-slate-950" />
                    <span>{isPublishingRig ? 'Publishing...' : 'Register & Publish Rig'}</span>
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

