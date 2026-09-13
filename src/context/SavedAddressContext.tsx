import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { MOCK_BARN_FACILITY } from '../data/mockData';

export interface SavedAddress {
  facilityName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  fullAddress: string;
  lat: number;
  lng: number;
  gateCode?: string;
  contactName?: string;
  contactPhone?: string;
}

export const PRESET_SAVED_BARNS: SavedAddress[] = [
  {
    facilityName: 'Sonoma Valley Equestrian Stables (Home Barn)',
    street: '4200 Sonoma Mountain Rd',
    city: 'Santa Rosa',
    state: 'CA',
    zip: '95404',
    fullAddress: '4200 Sonoma Mountain Rd, Santa Rosa, CA 95404',
    lat: 38.3980,
    lng: -122.6520,
    gateCode: '#4820',
    contactName: 'Rachel Henderson (Barn Mgr)',
    contactPhone: '(707) 555-0182'
  },
  {
    facilityName: 'Petaluma Creek Boarding Stables',
    street: '2850 Lakeville Hwy',
    city: 'Petaluma',
    state: 'CA',
    zip: '94954',
    fullAddress: '2850 Lakeville Hwy, Petaluma, CA 94954',
    lat: 38.2120,
    lng: -122.5830,
    gateCode: '#1942',
    contactName: 'Jake Miller (Barn Mgr)',
    contactPhone: '(707) 555-0199'
  },
  {
    facilityName: 'Wine Country Equine Ranch & Pastures',
    street: '1420 Arnold Dr',
    city: 'Sonoma',
    state: 'CA',
    zip: '95476',
    fullAddress: '1420 Arnold Dr, Sonoma, CA 95476',
    lat: 38.2910,
    lng: -122.4580,
    gateCode: '#7730',
    contactName: 'Sarah Evans (Owner)',
    contactPhone: '(707) 555-0142'
  },
  {
    facilityName: 'Dry Creek Valley Dressage Barn',
    street: '850 West Dry Creek Rd',
    city: 'Healdsburg',
    state: 'CA',
    zip: '95448',
    fullAddress: '850 West Dry Creek Rd, Healdsburg, CA 95448',
    lat: 38.6180,
    lng: -122.8890,
    gateCode: '#9012',
    contactName: 'Elena Rostova (Head Trainer)',
    contactPhone: '(707) 555-0231'
  }
];

interface SavedAddressContextType {
  savedAddress: SavedAddress;
  activeReference: 'saved_barn' | 'live_gps';
  gpsLocation: { lat: number; lng: number } | null;
  isLocatingGPS: boolean;
  setSavedAddress: (addr: SavedAddress) => void;
  setActiveReference: (ref: 'saved_barn' | 'live_gps') => void;
  locateUserGPS: () => void;
  getReferenceCoords: () => { lat: number; lng: number; label: string; fullAddress: string };
  calculateDistanceMiles: (targetLat: number, targetLng: number) => number;
  calculateDriveTimeMinutes: (targetLat: number, targetLng: number) => number;
  calculateFarmCallFee: (baseFee: number, distanceMiles: number) => number;
  getOpenStreetMapDirectionsUrl: (targetLat: number, targetLng: number, targetLabel?: string) => string;
  getDirectionsUrl: (targetLat: number, targetLng: number, targetLabel?: string) => string;
  getGoogleMapsDirectionsUrl: (targetLat: number, targetLng: number, targetLabel?: string) => string;
}

const SavedAddressContext = createContext<SavedAddressContextType | undefined>(undefined);

// Helper: Haversine distance in miles
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8; // Radius of the Earth in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLine = R * c;
  // Apply a 1.22x realistic rural winding road factor for equine barn access
  return Math.round(straightLine * 1.22 * 10) / 10;
}

export const SavedAddressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile } = useAuth();
  const [savedAddress, setSavedAddressState] = useState<SavedAddress>(PRESET_SAVED_BARNS[0]);
  const [activeReference, setActiveReference] = useState<'saved_barn' | 'live_gps'>('saved_barn');
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);

  // Sync with user's profile if updated
  useEffect(() => {
    if (userProfile?.address || userProfile?.barnName) {
      const full = `${userProfile.address ? userProfile.address + ', ' : ''}${userProfile.city ? userProfile.city + ', ' : ''}${userProfile.state || 'CA'} ${userProfile.zipCode || '95404'}`;
      setSavedAddressState(prev => ({
        ...prev,
        facilityName: userProfile.barnName || prev.facilityName,
        street: userProfile.address || prev.street,
        city: userProfile.city || prev.city,
        state: userProfile.state || prev.state,
        zip: userProfile.zipCode || prev.zip,
        fullAddress: full.trim() || prev.fullAddress
      }));
    }
  }, [userProfile]);

  const locateUserGPS = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setIsLocatingGPS(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
          setIsLocatingGPS(false);
        },
        (err) => {
          console.warn('GPS location request error:', err);
          setIsLocatingGPS(false);
        },
        { enableHighAccuracy: true, timeout: 7000 }
      );
    }
  };

  const getReferenceCoords = () => {
    if (activeReference === 'live_gps' && gpsLocation) {
      return {
        lat: gpsLocation.lat,
        lng: gpsLocation.lng,
        label: 'Your Live GPS Location',
        fullAddress: 'Current Device GPS Coordinates'
      };
    }
    return {
      lat: savedAddress.lat,
      lng: savedAddress.lng,
      label: savedAddress.facilityName || 'Your Saved Barn',
      fullAddress: savedAddress.fullAddress
    };
  };

  const calculateDistanceMiles = (targetLat: number, targetLng: number): number => {
    const origin = getReferenceCoords();
    return calculateHaversineDistance(origin.lat, origin.lng, targetLat, targetLng);
  };

  const calculateDriveTimeMinutes = (targetLat: number, targetLng: number): number => {
    const miles = calculateDistanceMiles(targetLat, targetLng);
    // Average 38 mph rural driving speed with trailer / mobile vet truck + 3 min traffic cushion
    const minutes = Math.round((miles / 38) * 60) + 3;
    return Math.max(3, minutes);
  };

  const calculateFarmCallFee = (baseFee: number, distanceMiles: number): number => {
    // Standard equine ambulatory pricing: base fee + $1.50/mile over 10 miles
    if (distanceMiles <= 10) return baseFee;
    const extraMiles = distanceMiles - 10;
    return Math.round(baseFee + extraMiles * 1.75);
  };

  const getOpenStreetMapDirectionsUrl = (targetLat: number, targetLng: number, targetLabel?: string): string => {
    const origin = getReferenceCoords();
    return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${origin.lat}%2C${origin.lng}%3B${targetLat}%2C${targetLng}#map=12/${targetLat}/${targetLng}`;
  };

  const getDirectionsUrl = (targetLat: number, targetLng: number, targetLabel?: string): string => {
    return getOpenStreetMapDirectionsUrl(targetLat, targetLng, targetLabel);
  };

  const getGoogleMapsDirectionsUrl = (targetLat: number, targetLng: number, targetLabel?: string): string => {
    return getOpenStreetMapDirectionsUrl(targetLat, targetLng, targetLabel);
  };

  const setSavedAddress = (addr: SavedAddress) => {
    setSavedAddressState(addr);
  };

  return (
    <SavedAddressContext.Provider
      value={{
        savedAddress,
        activeReference,
        gpsLocation,
        isLocatingGPS,
        setSavedAddress,
        setActiveReference,
        locateUserGPS,
        getReferenceCoords,
        calculateDistanceMiles,
        calculateDriveTimeMinutes,
        calculateFarmCallFee,
        getOpenStreetMapDirectionsUrl,
        getDirectionsUrl,
        getGoogleMapsDirectionsUrl
      }}
    >
      {children}
    </SavedAddressContext.Provider>
  );
};

export const useSavedAddress = () => {
  const context = useContext(SavedAddressContext);
  if (!context) {
    throw new Error('useSavedAddress must be used within a SavedAddressProvider');
  }
  return context;
};
