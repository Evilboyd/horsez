import { HaulerJob, AvailableDriver, SuggestedRoute } from '../types';

export const MOCK_AVAILABLE_DRIVERS: AvailableDriver[] = [
  {
    id: 'driver-1',
    name: 'Mark Donovan',
    companyName: 'North Bay Equine Express',
    rating: 4.95,
    reviewsCount: 142,
    phone: '(707) 555-0142',
    baseLocation: 'Sonoma & Santa Rosa Corridor',
    rigType: '4-Horse Slant Air-Ride Gooseneck',
    capacityStalls: 4,
    availableStalls: 2,
    usdotNumber: 'USDOT-3920194',
    isInsured: true,
    status: 'standby',
    lat: 38.3050,
    lng: -122.4700,
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256',
    ratePerMile: 2.60,
    emergencyResponseTime: '15 mins',
    specialties: ['Air-Ride Suspension', 'Live Cabin Video Feed', 'Equine CPR Certified', 'Post-Op Layups']
  },
  {
    id: 'driver-2',
    name: 'Elena Rostova',
    companyName: 'NorCal Horse Transport & Layover',
    rating: 5.0,
    reviewsCount: 98,
    phone: '(707) 555-0288',
    baseLocation: 'Santa Rosa / Sebastopol',
    rigType: '2-Horse Straight Load Ramp Air-Ride',
    capacityStalls: 2,
    availableStalls: 1,
    usdotNumber: 'USDOT-4091823',
    isInsured: true,
    status: 'accepting_trips',
    lat: 38.4520,
    lng: -122.7250,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
    ratePerMile: 2.75,
    emergencyResponseTime: '20 mins',
    specialties: ['Gentle Loading Specialist', 'Sling / Post-Surgical Care', 'Oversized Warmbloods']
  },
  {
    id: 'driver-3',
    name: 'Cody Jenkins',
    companyName: 'Sierra Valley Long-Haul Logistics',
    rating: 4.88,
    reviewsCount: 215,
    phone: '(916) 555-0377',
    baseLocation: 'Sacramento / Davis / Vacaville',
    rigType: '6-Horse Commercial Air-Ride Box Stall',
    capacityStalls: 6,
    availableStalls: 4,
    usdotNumber: 'USDOT-2849102',
    isInsured: true,
    status: 'standby',
    lat: 38.5449,
    lng: -121.7405,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
    ratePerMile: 2.30,
    emergencyResponseTime: '30 mins',
    specialties: ['Interstate CVI Paperwork', 'Show Circuit Charters', 'Stallion Partitions']
  },
  {
    id: 'driver-4',
    name: 'Sarah Jennings',
    companyName: 'Coastline Equine Transit',
    rating: 4.92,
    reviewsCount: 164,
    phone: '(415) 555-0499',
    baseLocation: 'Petaluma / Marin County',
    rigType: '3-Horse Slant Air-Ride with Video Monitor',
    capacityStalls: 3,
    availableStalls: 2,
    usdotNumber: 'USDOT-3104928',
    isInsured: true,
    status: 'standby',
    lat: 38.2324,
    lng: -122.6367,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256',
    ratePerMile: 2.50,
    emergencyResponseTime: '25 mins',
    specialties: ['Coastal Highway Certified', 'Trailer Temperature Automation', 'Electrolyte Stations']
  },
  {
    id: 'driver-5',
    name: 'Marcus Vance',
    companyName: 'Wine Country Rig & Haul Co.',
    rating: 4.90,
    reviewsCount: 86,
    phone: '(707) 555-0612',
    baseLocation: 'Napa Valley / Calistoga',
    rigType: '2-Horse Bumper Pull Air-Ride Warmblood Size',
    capacityStalls: 2,
    availableStalls: 2,
    usdotNumber: 'USDOT-3891024',
    isInsured: true,
    status: 'accepting_trips',
    lat: 38.3000,
    lng: -122.2900,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
    ratePerMile: 2.80,
    emergencyResponseTime: '15 mins',
    specialties: ['Private VIP Single Horse Hauls', 'Night Check Runs', 'Emergency Vet Triage']
  }
];

export const MOCK_SUGGESTED_ROUTES: SuggestedRoute[] = [
  {
    id: 'route-vet-corridor',
    title: 'Wine Country to UC Davis Emergency Medical Corridor',
    corridor: 'Hwy 12 ➔ I-80 E Direct Vet Express',
    distanceMiles: 72,
    estDriveTime: '1h 35m',
    color: '#10b981', // Emerald
    dashArray: '8, 8',
    description: 'Designated continuous-flow equine medical transit corridor with low-vibration asphalt and emergency layover access.',
    safetyScore: '99% Smooth Grade Rating',
    recommendedRig: 'Air-Ride Box Stall / Trauma Sling Rig',
    waterIntervalHours: 2,
    coordinates: [
      [38.2919, -122.4580], // Sonoma Equestrian
      [38.2975, -122.2869], // Napa Valley Junction
      [38.2494, -122.0400], // Fairfield Green Valley
      [38.3566, -121.9877], // Vacaville Rest Oasis
      [38.5305, -121.7615]  // UC Davis Vet Hospital
    ],
    waypoints: [
      {
        id: 'wp-1',
        name: 'Sonoma Valley Dispatch Hub',
        lat: 38.2919,
        lng: -122.4580,
        type: 'origin',
        notes: 'Level rubberized loading dock'
      },
      {
        id: 'wp-2',
        name: 'Green Valley Rest & Water Checkpoint',
        lat: 38.2494,
        lng: -122.0400,
        type: 'water_stop',
        notes: 'Fresh mountain water spigots & electrolyte buckets'
      },
      {
        id: 'wp-3',
        name: 'Vacaville Emergency Vet Layover',
        lat: 38.3566,
        lng: -121.9877,
        type: 'vet_triage',
        notes: '24/7 on-call triage stall'
      },
      {
        id: 'wp-4',
        name: 'UC Davis Large Animal Hospital Unloading Bay',
        lat: 38.5305,
        lng: -121.7615,
        type: 'destination',
        notes: 'Direct ramp 1 with hydraulic hoist'
      }
    ]
  },
  {
    id: 'route-murieta-show',
    title: 'Petaluma to Rancho Murieta Championship Show Corridor',
    corridor: 'Hwy 37 ➔ Hwy 12 ➔ Hwy 16 Show Circuit',
    distanceMiles: 88,
    estDriveTime: '1h 55m',
    color: '#8b5cf6', // Purple
    dashArray: '6, 6',
    description: 'Optimized commercial show horse transit route avoiding heavy commuter gridlock, featuring wide-radius turns.',
    safetyScore: '97% Show-Trailer Certified',
    recommendedRig: '4-6 Horse Commercial Gooseneck',
    waterIntervalHours: 2.5,
    coordinates: [
      [38.2324, -122.6367], // Petaluma Stables
      [38.1041, -122.2566], // Vallejo Bypass
      [38.2190, -122.1380], // Cordelia Staging Chute
      [38.4800, -121.4200], // Sacramento South Corridor
      [38.4982, -121.0822]  // Rancho Murieta Showgrounds
    ],
    waypoints: [
      {
        id: 'wp-5',
        name: 'Petaluma Horse Park Origin',
        lat: 38.2324,
        lng: -122.6367,
        type: 'origin',
        notes: 'Wide turnaround loop'
      },
      {
        id: 'wp-6',
        name: 'Cordelia Equine Staging & Hydration Pad',
        lat: 38.2190,
        lng: -122.1380,
        type: 'water_stop',
        notes: 'Shaded stalls & 100-gal fresh water tank'
      },
      {
        id: 'wp-7',
        name: 'Rancho Murieta Equestrian Gate 3',
        lat: 38.4982,
        lng: -121.0822,
        type: 'destination',
        notes: 'Digital Coggins check-in kiosk'
      }
    ]
  },
  {
    id: 'route-coastal-pacific',
    title: 'Pacific Coast Equestrian Highway Corridor (Healdsburg ➔ Woodside)',
    corridor: 'Hwy 101 S ➔ I-280 Peninsula Route',
    distanceMiles: 96,
    estDriveTime: '2h 10m',
    color: '#0284c7', // Sky Blue
    dashArray: '10, 6',
    description: 'Maritime climate-moderated coastal corridor maintaining trailer stall temperatures below 70°F year-round.',
    safetyScore: '98% Air-Ride Comfort Rating',
    recommendedRig: '2-4 Horse Slant / Box Stall Air-Ride',
    waterIntervalHours: 2,
    coordinates: [
      [38.6105, -122.8692], // Healdsburg Warmbloods
      [38.4404, -122.7141], // Santa Rosa Fairgrounds
      [38.1074, -122.5697], // Novato Marin Rest
      [37.7749, -122.4194], // San Francisco Commercial Truck Bypass
      [37.4299, -122.2539]  // Woodside Horse Park
    ],
    waypoints: [
      {
        id: 'wp-8',
        name: 'Healdsburg Dry Creek Origin',
        lat: 38.6105,
        lng: -122.8692,
        type: 'origin',
        notes: 'Quarantine cleared pickup'
      },
      {
        id: 'wp-9',
        name: 'Novato North Bay Staging Oasis',
        lat: 38.1074,
        lng: -122.5697,
        type: 'rest_oasis',
        notes: '2-acre grassy walking turnout & wash bays'
      },
      {
        id: 'wp-10',
        name: 'The Horse Park at Woodside',
        lat: 37.4299,
        lng: -122.2539,
        type: 'destination',
        notes: 'Covered unloading ramp & check-in'
      }
    ]
  },
  {
    id: 'route-valley-transit',
    title: 'Northern Valley Cross-County Trans-Transit (Calistoga ➔ Elk Grove)',
    corridor: 'Hwy 29 ➔ Hwy 12 ➔ Hwy 99 Show Route',
    distanceMiles: 94,
    estDriveTime: '2h 05m',
    color: '#f59e0b', // Amber
    dashArray: '5, 5',
    description: 'Scenic low-traffic country transit route connecting North Bay vineyards to Sacramento Valley show grounds.',
    safetyScore: '96% Calm Transit Rating',
    recommendedRig: 'Oversized Warmblood Air-Ride',
    waterIntervalHours: 2,
    coordinates: [
      [38.5800, -122.5800], // Calistoga Pines
      [38.5050, -122.4700], // St. Helena Horse Haven
      [38.2975, -122.2869], // Napa Valley
      [38.2494, -122.0400], // Fairfield
      [38.4088, -121.3716]  // Elk Grove Brookside Show Park
    ],
    waypoints: [
      {
        id: 'wp-11',
        name: 'Calistoga Pines Stables Origin',
        lat: 38.5800,
        lng: -122.5800,
        type: 'origin',
        notes: 'Wide arena turnaround'
      },
      {
        id: 'wp-12',
        name: 'St. Helena Horse Motel Rest Bay',
        lat: 38.5050,
        lng: -122.4700,
        type: 'water_stop',
        notes: 'Water bucket filling & leg wraps inspection'
      },
      {
        id: 'wp-13',
        name: 'Brookside Equestrian Show Park Unloading',
        lat: 38.4088,
        lng: -121.3716,
        type: 'destination',
        notes: 'Jumper Barn stabling check-in'
      }
    ]
  }
];

export const MOCK_HAULER_JOBS: HaulerJob[] = [
  {
    id: 'haul-941',
    pickup: 'Sonoma Valley Equestrian, Sonoma, CA',
    dropoff: 'Santa Rosa Equine Clinic, Santa Rosa, CA',
    pickupAddress: {
      facilityName: 'Sonoma Valley Equestrian Center',
      street: '1420 Arnold Dr',
      city: 'Sonoma',
      state: 'CA',
      zip: '95476',
      contactName: 'Sarah Evans (Barn Owner)',
      contactPhone: '(707) 555-0142',
      accessInstructions: 'Main barn gate code #4820. Pull past covered arena to turn trailer around.'
    },
    deliveryAddress: {
      facilityName: 'Santa Rosa Equine Medical & Surgical Hospital',
      street: '4900 Adobe Rd',
      city: 'Santa Rosa',
      state: 'CA',
      zip: '95404',
      contactName: 'Dr. Mark Davis (Receiving Vet)',
      contactPhone: '(707) 555-0188',
      accessInstructions: 'Back emergency unloading ramp #2. Reception notified of arrival.'
    },
    distanceMiles: 18,
    numHorses: 2,
    rigRequirement: '2-Horse Slant Load Air-Ride',
    status: 'in-transit',
    price: 450,
    haulerName: 'Mark D. (Verified Pro)',
    haulerRating: 4.9,
    date: 'Today',
    pickupDate: 'Today • 8:30 AM',
    deliveryDate: 'Today • 9:45 AM (Est)',
    liveDiagnostics: {
      temp: '68°F (Controlled AC)',
      speed: '55 mph (Smooth)',
      suspension: 'Optimal Air-Ride Cushioning'
    },
    lat: 38.3600,
    lng: -122.5800
  },
  {
    id: 'haul-942',
    pickup: 'Petaluma Creek Stables, Petaluma, CA',
    dropoff: 'Murieta Equestrian Center, Rancho Murieta, CA',
    pickupAddress: {
      facilityName: 'Petaluma Creek Boarding Stables',
      street: '2850 Lakeville Hwy',
      city: 'Petaluma',
      state: 'CA',
      zip: '94954',
      contactName: 'Jake Miller (Barn Manager)',
      contactPhone: '(707) 555-0199',
      accessInstructions: 'Wide double entry gate unlocked 6:00 AM - 8:00 PM. Load at barn stall row 3.'
    },
    deliveryAddress: {
      facilityName: 'Murieta Equestrian Center (Sacramento Showgrounds)',
      street: '7200 Lone Pine Dr',
      city: 'Rancho Murieta',
      state: 'CA',
      zip: '95683',
      contactName: 'Stabling Office (Gate 3)',
      contactPhone: '(916) 555-0144',
      accessInstructions: 'Check in with security at Gate 3. Direct stall assignment: Barn C, Stall #18.'
    },
    distanceMiles: 85,
    numHorses: 1,
    rigRequirement: 'Gooseneck 4-Horse Slant',
    status: 'open',
    price: 320,
    date: 'Oct 18, 2026',
    pickupDate: 'Oct 18 • 7:00 AM',
    deliveryDate: 'Oct 18 • 10:30 AM',
    lat: 38.2324,
    lng: -122.6367
  },
  {
    id: 'haul-943',
    pickup: 'Sonoma Horse Park, Petaluma, CA',
    dropoff: 'Woodside Horse Park, Woodside, CA',
    pickupAddress: {
      facilityName: 'Sonoma Horse Park (Barn Area)',
      street: '7600 Lakeville Hwy',
      city: 'Petaluma',
      state: 'CA',
      zip: '94954',
      contactName: 'Coach Amanda Cole',
      contactPhone: '(707) 555-0320',
      accessInstructions: 'Load out from Stabling Isle 4 near wash racks.'
    },
    deliveryAddress: {
      facilityName: 'The Horse Park at Woodside',
      street: '3674 Sand Hill Rd',
      city: 'Woodside',
      state: 'CA',
      zip: '94062',
      contactName: 'Barn Manager Dave',
      contactPhone: '(650) 555-0199',
      accessInstructions: 'Main trailer parking and turn-around loop.'
    },
    distanceMiles: 74,
    numHorses: 3,
    rigRequirement: 'Air-Ride 4-Horse Commercial Rig',
    status: 'open',
    price: 580,
    date: 'Oct 22, 2026',
    pickupDate: 'Oct 22 • 6:30 AM',
    deliveryDate: 'Oct 22 • 9:00 AM',
    lat: 38.2100,
    lng: -122.6100
  },
  {
    id: 'haul-944',
    pickup: 'Oak Creek Ranch, Sebastopol, CA',
    dropoff: 'UC Davis Large Animal Hospital, Davis, CA',
    pickupAddress: {
      facilityName: 'Oak Creek Sport Horses',
      street: '5400 Mill Station Rd',
      city: 'Sebastopol',
      state: 'CA',
      zip: '95472',
      contactName: 'Rachel Green',
      contactPhone: '(707) 555-0811',
      accessInstructions: 'Urgent medical transfer. Wide turnaround driveway.'
    },
    deliveryAddress: {
      facilityName: 'UC Davis Veterinary Medical Teaching Hospital',
      street: '1 Garrod Dr',
      city: 'Davis',
      state: 'CA',
      zip: '95616',
      contactName: 'Emergency Vet Desk',
      contactPhone: '(530) 752-0290',
      accessInstructions: 'Direct emergency unloading bay 1 with rubberized ramp.'
    },
    distanceMiles: 78,
    numHorses: 1,
    rigRequirement: 'Box Stall Conversion / Air-Ride Suspension',
    status: 'open',
    price: 650,
    date: 'Oct 16, 2026',
    pickupDate: 'Oct 16 • 11:00 AM',
    deliveryDate: 'Oct 16 • 1:15 PM',
    lat: 38.4011,
    lng: -122.8231
  },
  {
    id: 'haul-945',
    pickup: 'Napa Valley Equestrian, St. Helena, CA',
    dropoff: 'Thermal Desert International Horse Park, Thermal, CA',
    pickupAddress: {
      facilityName: 'Silverado Equestrian Estate',
      street: '1100 Meadowood Ln',
      city: 'St. Helena',
      state: 'CA',
      zip: '94574',
      contactName: 'Hunter Morgan',
      contactPhone: '(707) 555-0944',
      accessInstructions: 'Security code at main entry gate. 15-horse commercial loading bay.'
    },
    deliveryAddress: {
      facilityName: 'Desert International Horse Park',
      street: '85-555 Airport Blvd',
      city: 'Thermal',
      state: 'CA',
      zip: '92274',
      contactName: 'DIHP Show Stabling Office',
      contactPhone: '(760) 555-0182',
      accessInstructions: 'Check in at South Guard Gate with digital Coggins + CVI.'
    },
    distanceMiles: 520,
    numHorses: 4,
    rigRequirement: '15-Horse Semi Air-Ride with Camera Feed',
    status: 'open',
    price: 2400,
    date: 'Nov 02, 2026',
    pickupDate: 'Nov 02 • 5:00 AM',
    deliveryDate: 'Nov 02 • 4:30 PM',
    lat: 38.5050,
    lng: -122.4700
  },
  {
    id: 'haul-946',
    pickup: 'Marin Trail Stables, Novato, CA',
    dropoff: 'Point Reyes National Seashore Trailhead, Bear Valley, CA',
    pickupAddress: {
      facilityName: 'Marin Trail Boarding Barn',
      street: '420 San Marin Dr',
      city: 'Novato',
      state: 'CA',
      zip: '94945',
      contactName: 'Cynthia Vance',
      contactPhone: '(415) 555-0488',
      accessInstructions: 'Easy pull through loop in front of arena.'
    },
    deliveryAddress: {
      facilityName: 'Bear Valley Visitor Center Trailhead Parking',
      street: '1 Bear Valley Rd',
      city: 'Point Reyes Station',
      state: 'CA',
      zip: '94956',
      contactName: 'Trail Ride Group Lead Cynthia',
      contactPhone: '(415) 555-0488',
      accessInstructions: 'Designated horse trailer parking lot on right side.'
    },
    distanceMiles: 22,
    numHorses: 2,
    rigRequirement: '2-Horse Straight Load or Slant Bumper Pull',
    status: 'open',
    price: 260,
    date: 'Oct 24, 2026',
    pickupDate: 'Oct 24 • 8:00 AM',
    deliveryDate: 'Oct 24 • 9:00 AM',
    lat: 38.1074,
    lng: -122.5697
  },
  {
    id: 'haul-947',
    pickup: 'Redwood Valley Warmbloods, Healdsburg, CA',
    dropoff: 'San Francisco International Airport (SFO Cargo Equine), CA',
    pickupAddress: {
      facilityName: 'Redwood Warmblood Breeding Farm',
      street: '8800 West Dry Creek Rd',
      city: 'Healdsburg',
      state: 'CA',
      zip: '95448',
      contactName: 'Klaus Meier',
      contactPhone: '(707) 555-0633',
      accessInstructions: 'Export Quarantine Barn with full PPE paperwork signed.'
    },
    deliveryAddress: {
      facilityName: 'SFO International Livestock Export Terminal',
      street: 'Plot 4, Cargo Rd',
      city: 'San Francisco',
      state: 'CA',
      zip: '94128',
      contactName: 'USDA APHIS Port Veterinarian',
      contactPhone: '(650) 555-0819',
      accessInstructions: 'Pass port security check with original USDA export stamp.'
    },
    distanceMiles: 92,
    numHorses: 2,
    rigRequirement: 'USDA Certified Air-Ride Transport Rig',
    status: 'open',
    price: 750,
    date: 'Oct 29, 2026',
    pickupDate: 'Oct 29 • 6:00 AM',
    deliveryDate: 'Oct 29 • 8:45 AM',
    lat: 38.6105,
    lng: -122.8692
  },
  {
    id: 'haul-948',
    pickup: 'Green Valley Ranch, Fairfield, CA',
    dropoff: 'Petaluma Riding & Driving Club, Petaluma, CA',
    pickupAddress: {
      facilityName: 'Green Valley Quarter Horses',
      street: '3400 Green Valley Rd',
      city: 'Fairfield',
      state: 'CA',
      zip: '94534',
      contactName: 'Dustin Cooper',
      contactPhone: '(707) 555-0722',
      accessInstructions: 'Pull straight past barn to lower pasture loading chute.'
    },
    deliveryAddress: {
      facilityName: 'Petaluma Riding & Driving Club Grounds',
      street: '1825 D St',
      city: 'Petaluma',
      state: 'CA',
      zip: '94952',
      contactName: 'Show Manager Lisa',
      contactPhone: '(707) 555-0377',
      accessInstructions: 'Main arena day-stabling row B.'
    },
    distanceMiles: 41,
    numHorses: 2,
    rigRequirement: '3-Horse Slant Gooseneck',
    status: 'open',
    price: 340,
    date: 'Oct 25, 2026',
    pickupDate: 'Oct 25 • 7:30 AM',
    deliveryDate: 'Oct 25 • 8:45 AM',
    lat: 38.2500,
    lng: -122.0600
  },
  {
    id: 'haul-949',
    pickup: 'Kenwood Hilltop Stables, Kenwood, CA',
    dropoff: 'Rancho Murieta Arena, Rancho Murieta, CA',
    pickupAddress: {
      facilityName: 'Hilltop Equestrian Kenwood',
      street: '8900 Sonoma Hwy',
      city: 'Kenwood',
      state: 'CA',
      zip: '95452',
      contactName: 'Victoria Sterling',
      contactPhone: '(707) 555-0899',
      accessInstructions: 'Gate phone call upon arrival. Paved wide turnaround.'
    },
    deliveryAddress: {
      facilityName: 'Rancho Murieta Cutting Event Barn',
      street: '7200 Lone Pine Dr',
      city: 'Rancho Murieta',
      state: 'CA',
      zip: '95683',
      contactName: 'Event Check-In Desk',
      contactPhone: '(916) 555-0233',
      accessInstructions: 'Barn A Stall 5 & 6 reservation.'
    },
    distanceMiles: 88,
    numHorses: 2,
    rigRequirement: '4-Horse Slant Air-Ride with Video Monitor',
    status: 'open',
    price: 490,
    date: 'Nov 05, 2026',
    pickupDate: 'Nov 05 • 6:30 AM',
    deliveryDate: 'Nov 05 • 9:15 AM',
    lat: 38.4100,
    lng: -122.5400
  },
  {
    id: 'haul-950',
    pickup: 'Calistoga Pines Stables, Calistoga, CA',
    dropoff: 'Brookside Equestrian Park, Elk Grove, CA',
    pickupAddress: {
      facilityName: 'Calistoga Pines Sport Horse Training',
      street: '2100 Tubbs Ln',
      city: 'Calistoga',
      state: 'CA',
      zip: '94515',
      contactName: 'Brian Davies',
      contactPhone: '(707) 555-0912',
      accessInstructions: 'Drive past main residence directly to the mare motel.'
    },
    deliveryAddress: {
      facilityName: 'Brookside Equestrian Show Park',
      street: '11120 Bradley Ranch Rd',
      city: 'Elk Grove',
      state: 'CA',
      zip: '95624',
      contactName: 'Stall Manager Tyler',
      contactPhone: '(916) 555-0955',
      accessInstructions: 'North gate entrance, follow signs to Jumper Barn.'
    },
    distanceMiles: 95,
    numHorses: 1,
    rigRequirement: 'Oversized Warmblood Stall / Video Feed',
    status: 'open',
    price: 410,
    date: 'Nov 12, 2026',
    pickupDate: 'Nov 12 • 7:00 AM',
    deliveryDate: 'Nov 12 • 9:45 AM',
    lat: 38.5800,
    lng: -122.5800
  }
];
