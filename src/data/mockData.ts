import { 
  CategoryInfo, 
  UserHorse,
  BarnChore,
  StableHealthEvent,
  BarnFacilityInfo
} from '../types';

// Re-export modular categories datasets
export * from './vetsData';
export * from './farriersData';
export * from './transportData';
export * from './trainersData';
export * from './feedLodgingData';
export * from './marketplaceData';

export const APP_CATEGORIES: CategoryInfo[] = [
  {
    id: 'emergency-vet',
    name: 'EMERGENCY VET',
    subtitle: 'Immediate critical dispatch, tele-triage',
    iconName: 'Ambulance',
    color: 'bg-red-50 text-red-700 border-red-200',
    badge: '24/7 Dispatch'
  },
  {
    id: 'vets',
    name: 'Vets (Routine Care)',
    subtitle: 'Vaccines, Triage, Clinic Bookings',
    iconName: 'Stethoscope',
    color: 'bg-teal-50 text-teal-700 border-teal-200'
  },
  {
    id: 'farriers',
    name: 'Farriers',
    subtitle: 'Trims, Shoeing, Emergency Fixes',
    iconName: 'Horseshoe',
    color: 'bg-slate-50 text-slate-800 border-slate-200'
  },
  {
    id: 'transportation',
    name: 'Transportation',
    subtitle: 'Local/Cross-Country, Uber-Style Dispatch',
    iconName: 'Truck',
    color: 'bg-blue-50 text-blue-800 border-blue-200'
  },
  {
    id: 'trainers',
    name: 'Trainers',
    subtitle: 'Freelance Lessons, Behavior, Exercise Rides',
    iconName: 'UserCheck',
    color: 'bg-purple-50 text-purple-800 border-purple-200',
    badge: 'Swipe & Match'
  },
  {
    id: 'feed-supplies',
    name: 'Feed & Supplies',
    subtitle: 'On-Demand Delivery & Subscriptions',
    iconName: 'FeedBag',
    color: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    id: 'lodging',
    name: 'Lodging (Bed & Bale)',
    subtitle: 'Horse Motels, RV Pads & Guest Rooms',
    iconName: 'Home',
    color: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  },
  {
    id: 'buy-sell',
    name: 'Buying & Selling',
    subtitle: 'Marketplace for Horses, Tack, Trailers & Gear',
    iconName: 'Tag',
    color: 'bg-orange-50 text-orange-800 border-orange-200'
  }
];

export const MOCK_USER_HORSES: UserHorse[] = [
  {
    id: 'horse-1',
    name: 'Thunder',
    breed: 'Quarter Horse Gelding',
    age: 8,
    color: 'Chestnut',
    cogginsVerified: true,
    vaccinesCurrent: true,
    photoUrl: 'https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?auto=format&fit=crop&q=80&w=800',
    stallNumber: 'Stall #12 (Main Barn)',
    heightHands: 16.1,
    weightLbs: 1180,
    microchipNumber: '985141002938471',
    discipline: 'Hunter/Jumper & Trail',
    registrationNumber: 'AQHA-5829104',
    specialNeeds: 'Left front bell boots on turnout. Sensitive stomach.',
    feedSchedule: {
      morningHay: '2 flakes Orchard Grass',
      morningGrain: '2.5 lbs Purina Strategy GX',
      eveningHay: '2 flakes Timothy Blend',
      eveningGrain: '2.5 lbs Purina Strategy GX',
      supplements: ['SmartPak SmartDigest Ultra', 'Electrolyte Pellets', 'Omega-3 Horseshine']
    },
    turnoutGroup: 'North Pasture (7:00 AM - 1:00 PM)',
    blanketWeight: 'Medium (200g)'
  },
  {
    id: 'horse-2',
    name: 'Sarafina',
    breed: 'Dutch Warmblood Mare',
    age: 6,
    color: 'Bay',
    cogginsVerified: true,
    vaccinesCurrent: true,
    photoUrl: 'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?auto=format&fit=crop&q=80&w=800',
    stallNumber: 'Stall #14 (Main Barn)',
    heightHands: 16.3,
    weightLbs: 1250,
    microchipNumber: '985141007719284',
    discipline: 'Dressage & Equitation',
    registrationNumber: 'KWPN-20180492',
    specialNeeds: 'Fly sheet in summer. Soak alfalfa cubes 15 mins prior to feed.',
    feedSchedule: {
      morningHay: '2 flakes Alfalfa / Timothy Mix',
      morningGrain: '3.0 lbs Triple Crown Complete',
      eveningHay: '2.5 flakes Orchard Grass',
      eveningGrain: '3.0 lbs Triple Crown Complete',
      supplements: ['SmartFlex Senior Herb-Free', 'Biotin 100 Hoof Formula', 'Magnesium Relax']
    },
    turnoutGroup: 'East Paddock (1:00 PM - 5:30 PM)',
    blanketWeight: 'Sheet'
  },
  {
    id: 'horse-3',
    name: 'Blue Moon',
    breed: 'Irish Sport Horse Gelding',
    age: 5,
    color: 'Dapple Gray',
    cogginsVerified: true,
    vaccinesCurrent: false,
    photoUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800',
    stallNumber: 'Stall #08 (Annex Wing)',
    heightHands: 17.0,
    weightLbs: 1320,
    microchipNumber: '985141009182374',
    discipline: 'Cross Country & Eventing',
    registrationNumber: 'USEF-5491028',
    specialNeeds: 'Routine spring booster shots due next week.',
    feedSchedule: {
      morningHay: '2 flakes Mountain Timothy',
      morningGrain: '2.0 lbs Nutrena ProForce Fuel',
      eveningHay: '2 flakes Mountain Timothy',
      eveningGrain: '2.0 lbs Nutrena ProForce Fuel',
      supplements: ['Joint Protect Plus', 'Daily Vitamin Mineral Pellets']
    },
    turnoutGroup: 'Hillside Arena Turnout (8:00 AM - 12:00 PM)',
    blanketWeight: 'Medium (200g)'
  }
];

export const MOCK_BARN_CHORES: BarnChore[] = [
  {
    id: 'chore-1',
    title: 'Morning Hay & Grain Feed Rations',
    timeSlot: 'Morning (6:30 AM)',
    category: 'feed',
    horseName: 'All Barn Horses',
    completed: true,
    completedAt: '6:42 AM',
    notes: 'Thunder, Sarafina & Blue Moon fed according to feed charts.'
  },
  {
    id: 'chore-2',
    title: 'Morning Turnout to Pastures (North & East)',
    timeSlot: 'Morning (6:30 AM)',
    category: 'turnout',
    horseName: 'Thunder & Blue Moon',
    completed: true,
    completedAt: '7:15 AM',
    notes: 'Thunder wearing left bell boots.'
  },
  {
    id: 'chore-3',
    title: 'Administer Morning Joint & Ulcer Supplements',
    timeSlot: 'Morning (6:30 AM)',
    category: 'medication',
    horseName: 'Thunder',
    completed: true,
    completedAt: '6:50 AM',
    notes: 'SmartDigest Ultra mixed into mash.'
  },
  {
    id: 'chore-4',
    title: 'Noon Stall Mucking, Fresh Pine Shavings & Water Bucket Scrub',
    timeSlot: 'Afternoon (12:00 PM)',
    category: 'mucking',
    horseName: 'Stalls #08, #12, #14',
    completed: false,
    notes: 'Add 2 bags fresh low-dust pine shavings per stall.'
  },
  {
    id: 'chore-5',
    title: 'Pasture Rotation & Sarafina Afternoon Turnout',
    timeSlot: 'Afternoon (12:00 PM)',
    category: 'turnout',
    horseName: 'Sarafina',
    completed: false,
    notes: 'Bring Thunder in from North Pasture; turn out Sarafina in East Paddock.'
  },
  {
    id: 'chore-6',
    title: 'Evening Hay Flakes & Concentrates Feeding',
    timeSlot: 'Evening (5:30 PM)',
    category: 'feed',
    horseName: 'All Horses',
    completed: false,
    notes: 'Check automatic waterers flow rate.'
  },
  {
    id: 'chore-7',
    title: 'Night Check, Temperature Check & Blanketing Adjustments',
    timeSlot: 'Night Check (9:00 PM)',
    category: 'blanket',
    horseName: 'All Horses',
    completed: false,
    notes: 'Expected low 46°F tonight; verify 200g blankets buckled securely.'
  }
];

export const MOCK_STABLE_EVENTS: StableHealthEvent[] = [
  {
    id: 'event-1',
    horseName: 'Thunder',
    type: 'farrier',
    title: 'Hot Shoeing & 4-Wheel Reset',
    lastDoneDate: '2026-07-08',
    nextDueDate: '2026-08-19',
    providerName: 'Jack Crawford, CJF',
    status: 'due_soon',
    notes: 'Check front left breakover angle and fit aluminum eventing shoes.'
  },
  {
    id: 'event-2',
    horseName: 'Sarafina',
    type: 'farrier',
    title: 'Natural Balance Barefoot Trim',
    lastDoneDate: '2026-07-14',
    nextDueDate: '2026-08-25',
    providerName: 'Elena Rostova, Farrier',
    status: 'upcoming',
    notes: 'Regular 6-week maintenance cycle.'
  },
  {
    id: 'event-3',
    horseName: 'Blue Moon',
    type: 'vaccine',
    title: 'Core 5-Way Annual Booster & West Nile',
    lastDoneDate: '2025-08-10',
    nextDueDate: '2026-08-15',
    providerName: 'Dr. Sarah Evans, DVM',
    status: 'due_soon',
    notes: 'Schedule ambulatory farm call before upcoming hunter pace.'
  },
  {
    id: 'event-4',
    horseName: 'Thunder',
    type: 'coggins',
    title: 'Annual EIA Coggins Test & Digital Health Cert (CVI)',
    lastDoneDate: '2025-10-12',
    nextDueDate: '2026-10-12',
    providerName: 'North Bay Equine Veterinary Hospital',
    status: 'upcoming',
    notes: 'Synched with Google Drive Vault for show grounds check-in.'
  },
  {
    id: 'event-5',
    horseName: 'All Barn',
    type: 'deworming',
    title: 'Fecal Egg Count (FEC) & Targeted Deworming Rotation',
    lastDoneDate: '2026-05-20',
    nextDueDate: '2026-09-01',
    providerName: 'Sonoma Equine Wellness',
    status: 'upcoming',
    notes: 'Ivermectin / Praziquantel paste rotation.'
  }
];

export const MOCK_BARN_FACILITY: BarnFacilityInfo = {
  name: 'Sonoma Valley Equestrian Stables',
  address: '4200 Sonoma Mountain Rd, Santa Rosa, CA 95404',
  totalStalls: 18,
  occupiedStalls: 14,
  managerName: 'Rachel Henderson',
  managerPhone: '(707) 555-0182',
  emergencyClinic: 'North Bay Equine Trauma Center',
  emergencyPhone: '(408) 504-2185',
  pastureCount: 6,
  arenaStatus: 'Open - Groomed',
  weatherAlert: 'Sunny 74°F • Low 46°F tonight • Ideal riding conditions'
};
