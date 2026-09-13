import { EmergencyVetTeam, VetClinic, Appointment, MedicalRecord } from '../types';

export const MOCK_EMERGENCY_VETS: EmergencyVetTeam[] = [
  // California
  {
    id: 'ev-1',
    name: 'Vet Team A (Mobile Intensive Unit)',
    etaMinutes: 6,
    status: 'en-route',
    rating: 4.9,
    verified: true,
    phone: '(707) 555-0199',
    location: 'Santa Rosa Radius, CA',
    state: 'CA',
    lat: 38.4404,
    lng: -122.7141,
    directorySource: 'Mad Barn US Directory'
  },
  {
    id: 'ev-2',
    name: 'Vet Team C (Clinic Emergency Response)',
    etaMinutes: 12,
    status: 'available',
    rating: 4.8,
    verified: true,
    phone: '(707) 555-0144',
    location: 'Santa Rosa North, CA',
    state: 'CA',
    lat: 38.4500,
    lng: -122.7000,
    directorySource: 'Mad Barn US Directory'
  },
  {
    id: 'ev-3',
    name: 'Alamo Pintado 24/7 Field Trauma Unit',
    etaMinutes: 14,
    status: 'available',
    rating: 5.0,
    verified: true,
    phone: '(805) 688-6510',
    location: 'Los Olivos / Santa Ynez Valley, CA',
    state: 'CA',
    lat: 34.6644,
    lng: -120.1163,
    directorySource: 'Mad Barn US Directory'
  },
  {
    id: 'ev-4',
    name: 'Pioneer Equine Critical Response Rig',
    etaMinutes: 16,
    status: 'available',
    rating: 4.92,
    verified: true,
    phone: '(209) 847-5951',
    location: 'Oakdale & Central Valley, CA',
    state: 'CA',
    lat: 37.7669,
    lng: -120.8472,
    directorySource: 'Mad Barn US Directory'
  },
  // Kentucky
  {
    id: 'ev-5',
    name: 'Rood & Riddle 24/7 Colic Surgical Dispatch',
    etaMinutes: 10,
    status: 'available',
    rating: 4.98,
    verified: true,
    phone: '(859) 233-0371',
    location: 'Lexington & Bluegrass Region, KY',
    state: 'KY',
    lat: 38.0837,
    lng: -84.5126,
    directorySource: 'Mad Barn US Directory'
  },
  {
    id: 'ev-6',
    name: 'Hagyard Equine McGee Emergency Rig',
    etaMinutes: 15,
    status: 'en-route',
    rating: 4.95,
    verified: true,
    phone: '(859) 255-8741',
    location: 'Lexington & Paris Corridor, KY',
    state: 'KY',
    lat: 38.1065,
    lng: -84.4988,
    directorySource: 'Mad Barn US Directory'
  },
  // Texas
  {
    id: 'ev-7',
    name: 'Brazos Valley Equine 24/7 ICU & Field Unit',
    etaMinutes: 18,
    status: 'available',
    rating: 4.9,
    verified: true,
    phone: '(936) 825-2197',
    location: 'Navasota & Brazos Valley, TX',
    state: 'TX',
    lat: 30.3874,
    lng: -96.0877,
    directorySource: 'Mad Barn US Directory'
  },
  {
    id: 'ev-8',
    name: 'Weatherford Equine Rapid Response Rig',
    etaMinutes: 12,
    status: 'available',
    rating: 4.88,
    verified: true,
    phone: '(817) 594-9181',
    location: 'Weatherford & DFW West, TX',
    state: 'TX',
    lat: 32.7593,
    lng: -97.7972,
    directorySource: 'Mad Barn US Directory'
  },
  // Florida
  {
    id: 'ev-9',
    name: 'Palm Beach Equine 24/7 Trauma Ambulance',
    etaMinutes: 8,
    status: 'available',
    rating: 4.96,
    verified: true,
    phone: '(561) 793-1599',
    location: 'Wellington & Palm Beach County, FL',
    state: 'FL',
    lat: 26.6534,
    lng: -80.2417,
    directorySource: 'Mad Barn US Directory'
  },
  {
    id: 'ev-10',
    name: 'Ocala Equine Hospital 24/7 Field Rig',
    etaMinutes: 14,
    status: 'en-route',
    rating: 4.91,
    verified: true,
    phone: '(352) 237-6151',
    location: 'Ocala & Marion County, FL',
    state: 'FL',
    lat: 29.2155,
    lng: -82.2570,
    directorySource: 'Mad Barn US Directory'
  },
  // Virginia & Carolinas
  {
    id: 'ev-11',
    name: 'Woodside Equine 24/7 Ambulatory Unit',
    etaMinutes: 20,
    status: 'available',
    rating: 4.89,
    verified: true,
    phone: '(804) 798-3281',
    location: 'Ashland & Richmond Metro, VA',
    state: 'VA',
    lat: 37.7587,
    lng: -77.4811,
    directorySource: 'Mad Barn US Directory'
  },
  {
    id: 'ev-12',
    name: 'Tryon Equine 24/7 Emergency Service',
    etaMinutes: 22,
    status: 'available',
    rating: 4.94,
    verified: true,
    phone: '(828) 292-5456',
    location: 'Columbus & Foothills, NC',
    state: 'NC',
    lat: 35.2532,
    lng: -82.2012,
    directorySource: 'Mad Barn US Directory'
  },
  // Colorado
  {
    id: 'ev-13',
    name: 'Littleton Equine 24/7 Emergency Field Rig',
    etaMinutes: 15,
    status: 'available',
    rating: 4.93,
    verified: true,
    phone: '(303) 794-6359',
    location: 'Littleton & Denver Metro, CO',
    state: 'CO',
    lat: 39.5794,
    lng: -105.0189,
    directorySource: 'Mad Barn US Directory'
  }
];

export const MOCK_ROUTINE_VETS: VetClinic[] = [
  // 1. Rood & Riddle Equine Hospital (Kentucky)
  {
    id: 'vc-rood-riddle',
    name: 'Rood & Riddle Equine Hospital',
    rating: 4.98,
    reviewsCount: 312,
    address: '2150 Georgetown Road, Lexington, KY 40511',
    state: 'KY',
    phone: '(859) 233-0371',
    image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=800',
    photos: [
      'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?auto=format&fit=crop&q=80&w=800'
    ],
    vets: [
      { name: 'Dr. Larry Bramlage, DVM, MS, DACVS', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300', rating: 5.0, specialty: 'Equine Orthopedic Surgery' },
      { name: 'Dr. Bonnie Barr, VMD, DACVIM', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300', rating: 4.9, specialty: 'Internal Medicine & Neonatal ICU' },
      { name: 'Dr. Scott Hopper, DVM, MS, DACVS', avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300', rating: 4.9, specialty: 'Sport Horse Lameness & Surgery' },
      { name: 'Dr. Etta Bradecamp, DVM, DACT, DABVP', avatar: 'https://images.unsplash.com/photo-1594824813566-78a9c336b9c9?auto=format&fit=crop&q=80&w=300', rating: 4.95, specialty: 'Theriogenology & Reproduction' }
    ],
    nextAvailable: 'Tomorrow, 8:30 AM',
    services: ['Colic Surgery', 'Standing MRI', 'Nuclear Scintigraphy', 'Pre-Purchase Exams', 'Stem Cell Therapy', 'Equine Podiatry', 'Advanced Reproduction', 'Coggins Testing'],
    lat: 38.0837,
    lng: -84.5126,
    distanceMiles: 18.5,
    hours: 'Open 24/7 (Emergency & Referral Hospital)',
    isOpen: true,
    is247: true,
    ambulatory: true,
    farmCallFee: 75,
    description: 'Internationally recognized full-service equine referral hospital ("Mayo Clinic for Horses") founded in 1986. Performing over 4,600 surgeries annually with dedicated neonatal intensive care, dynamic video endoscopies, and comprehensive sport horse performance evaluations.',
    directorySource: 'Mad Barn US Directory',
    reviews: [
      {
        id: 'rev-rr-1',
        clinicId: 'vc-rood-riddle',
        authorName: 'Harrison Sterling',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        rating: 5,
        date: '2 days ago',
        comment: 'Dr. Bramlage and the surgical team performed arthroscopic joint surgery on our Grade 1 stakes contender. The care, communication, and digital imaging reports were truly gold-standard.',
        verifiedVisit: true,
        serviceType: 'Orthopedic Surgery & PPE',
        horseName: 'Noble Sovereign',
        helpfulCount: 28
      }
    ]
  },

  // 2. Hagyard Equine Medical Institute (Kentucky)
  {
    id: 'vc-hagyard',
    name: 'Hagyard Equine Medical Institute',
    rating: 4.96,
    reviewsCount: 289,
    address: '4250 Iron Works Pike, Lexington, KY 40511',
    state: 'KY',
    phone: '(859) 255-8741',
    image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=800',
    photos: [
      'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?auto=format&fit=crop&q=80&w=800'
    ],
    vets: [
      { name: 'Dr. Nathan Slovis, DVM, DACVIM, CHT', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300', rating: 5.0, specialty: 'Internal Medicine & Hyperbaric Oxygen' },
      { name: 'Dr. W. True Baker, DVM, DACVS', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300', rating: 4.9, specialty: 'Upper Airway & Orthopedics' },
      { name: 'Dr. Jackie Snyder, DVM', avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=300', rating: 4.9, specialty: 'Theriogenology & Herd Health' }
    ],
    nextAvailable: 'Tomorrow, 9:00 AM',
    services: ['Davidson Surgery Center', 'McGee Medicine Center', 'Hyperbaric Oxygen Chamber', 'Overground Dynamic Endoscopy', 'Thoroughbred PPE', 'Digital Radiography'],
    lat: 38.1065,
    lng: -84.4988,
    distanceMiles: 19.2,
    hours: 'Open 24/7 (Emergency & Hospital)',
    isOpen: true,
    is247: true,
    ambulatory: true,
    farmCallFee: 70,
    description: 'Founded in 1876, Hagyard is the oldest and largest private equine veterinary practice in the world. Features the Davidson Surgery Center, McGee Medicine Center, and a team of 50+ world-class equine veterinarians.',
    directorySource: 'Mad Barn US Directory',
    reviews: []
  },

  // 3. Alamo Pintado Equine Medical Center (California)
  {
    id: 'vc-alamo-pintado',
    name: 'Alamo Pintado Equine Medical Center',
    rating: 4.95,
    reviewsCount: 240,
    address: '2501 Santa Barbara Avenue, Los Olivos, CA 93441',
    state: 'CA',
    phone: '(805) 688-6510',
    image: 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&q=80&w=800',
    photos: [
      'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800'
    ],
    vets: [
      { name: 'Dr. Troy Herthel, DVM, Dip. ACVS-LA', avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300', rating: 5.0, specialty: 'Stem Cell Therapy & Orthopedics' },
      { name: 'Dr. Tyler Stevenson, DVM', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300', rating: 4.9, specialty: 'Sports Medicine & Lameness' },
      { name: 'Dr. Mark Rick, DVM', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300', rating: 4.9, specialty: 'Equine Reproduction & Neonatal' }
    ],
    nextAvailable: 'Today, 2:00 PM',
    services: ['High-Field 1.5T MRI', 'Standing Robotic CT Scan', 'Regenerative Stem Cell Therapy', 'Hyperbaric Oxygen', 'Colic Surgery', 'Ambulatory Farm Calls'],
    lat: 34.6644,
    lng: -120.1163,
    distanceMiles: 12.0,
    hours: 'Open 24/7 Emergency & Full Hospital',
    isOpen: true,
    is247: true,
    ambulatory: true,
    farmCallFee: 65,
    description: 'Premier California equine referral hospital renowned for pioneering stem cell therapy for equine tendons and ligaments. Treats over 3,500 horses annually from Olympic athletes to beloved family companions.',
    directorySource: 'Mad Barn US Directory',
    reviews: []
  },

  // 4. Palm Beach Equine Clinic (Florida)
  {
    id: 'vc-palm-beach',
    name: 'Palm Beach Equine Clinic',
    rating: 4.94,
    reviewsCount: 195,
    address: '13125 Southfields Road, Wellington, FL 33414',
    state: 'FL',
    phone: '(561) 793-1599',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800',
    photos: [
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=800'
    ],
    vets: [
      { name: 'Dr. Scott Swerdlin, DVM', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300', rating: 4.95, specialty: 'President & Sports Medicine' },
      { name: 'Dr. Weston Davis, DVM, DACVS', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300', rating: 4.9, specialty: 'Board-Certified Equine Surgeon' },
      { name: 'Dr. Bryan Dubynsky, DVM', avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300', rating: 4.9, specialty: 'Show Jumper & Dressage Sports Medicine' }
    ],
    nextAvailable: 'Friday, Oct 24',
    services: ['Standing MRI & CT', 'Nuclear Scintigraphy', 'Colic Surgery Suite', 'Sports Medicine & Joint Injections', 'Acupuncture & Chiropractic', 'Ambulatory 24/7'],
    lat: 26.6534,
    lng: -80.2417,
    distanceMiles: 25.0,
    hours: 'Open 24/7 (Official Vets of Wellington International)',
    isOpen: true,
    is247: true,
    ambulatory: true,
    farmCallFee: 75,
    description: 'Official Veterinary Hospital for the Winter Equestrian Festival (WEF) and Global Dressage Festival in Wellington. Features world-leading sports medicine, standing MRI, nuclear scintigraphy, and emergency colic suites.',
    directorySource: 'Mad Barn US Directory',
    reviews: []
  },

  // 5. Brazos Valley Equine Hospitals (Texas)
  {
    id: 'vc-brazos-valley',
    name: 'Brazos Valley Equine Hospitals',
    rating: 4.91,
    reviewsCount: 184,
    address: '6999 Hwy 6, Navasota, TX 77868',
    state: 'TX',
    phone: '(936) 825-2197',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
    photos: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800'
    ],
    vets: [
      { name: 'Dr. Terrell Buchanan, DVM', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300', rating: 4.9, specialty: 'Equine Surgery & Sports Medicine' },
      { name: 'Dr. Benjamin Buchanan, DVM, DACVIM, DACVECC', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300', rating: 5.0, specialty: 'Internal Medicine & Critical Care' }
    ],
    nextAvailable: 'Tomorrow, 10:00 AM',
    services: ['24/7 Colic Surgery', 'Neonatal Intensive Care', 'Equine Reproduction & Embryo Transfer', 'Pre-Purchase Exams', 'Digital Radiology', 'Mobile Field Units'],
    lat: 30.3874,
    lng: -96.0877,
    distanceMiles: 14.3,
    hours: 'Open 24/7 (Emergency & Hospital)',
    isOpen: true,
    is247: true,
    ambulatory: true,
    farmCallFee: 60,
    description: 'Multi-centered Texas equine practice with locations in Navasota, Salado, Cypress, and Waco. Specializing in advanced equine internal medicine, sports performance, and theriogenology.',
    directorySource: 'Mad Barn US Directory',
    reviews: []
  },

  // 6. Littleton Equine Medical Center (Colorado)
  {
    id: 'vc-littleton',
    name: 'Littleton Equine Medical Center',
    rating: 4.93,
    reviewsCount: 167,
    address: '8025 S Santa Fe Dr, Littleton, CO 80120',
    state: 'CO',
    phone: '(303) 794-6359',
    image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=800',
    photos: [
      'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=800'
    ],
    vets: [
      { name: 'Dr. Kelly Tisher, DVM', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300', rating: 4.95, specialty: 'Lameness & Performance Horse Medicine' },
      { name: 'Dr. Chad Marsh, DVM, DACVS', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300', rating: 4.9, specialty: 'Soft Tissue & Orthopedic Surgery' }
    ],
    nextAvailable: 'Thursday, Oct 23',
    services: ['Colic Surgery Suite', 'Lameness Locator Gait Analysis', 'Advanced Ultrasound', 'Wellness Vaccine Packages', 'Shockwave Therapy', 'Equine Dentistry'],
    lat: 39.5794,
    lng: -105.0189,
    distanceMiles: 16.0,
    hours: 'Open 24/7 (Rocky Mountain Referral Center)',
    isOpen: true,
    is247: true,
    ambulatory: true,
    farmCallFee: 65,
    description: 'Serving the Denver metro and Rocky Mountain region since 1950. Comprehensive hospital and field ambulatory practice with board-certified equine surgeons and sports medicine specialists.',
    directorySource: 'Mad Barn US Directory',
    reviews: []
  },

  // 7. Tryon Equine Hospital (North Carolina)
  {
    id: 'vc-tryon',
    name: 'Tryon Equine Hospital',
    rating: 4.95,
    reviewsCount: 154,
    address: '3689 Landrum Rd, Columbus, NC 28722',
    state: 'NC',
    phone: '(828) 894-6065',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
    photos: [
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800'
    ],
    vets: [
      { name: 'Dr. William P. Hay, DVM, DACVS', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300', rating: 5.0, specialty: 'ACVS Board-Certified Equine Surgeon' },
      { name: 'Dr. Rich Metcalf, DVM', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300', rating: 4.9, specialty: 'Sports Medicine & Field Practice' },
      { name: 'Dr. Emilie Setlakwe, DVM, MSc, DACVIM', avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=300', rating: 4.95, specialty: 'Internal Medicine & Neonatal Care' }
    ],
    nextAvailable: 'Tomorrow, 1:00 PM',
    services: ['24/7 Emergency Surgery', 'Standing MRI', 'Pre-Purchase Exams', 'Internal Medicine Isolation Stalls', 'Endoscopy & Gastroscopy', 'Regenerative Joint Therapies'],
    lat: 35.2532,
    lng: -82.2012,
    distanceMiles: 11.5,
    hours: 'Open 24/7 (Emergency Response)',
    isOpen: true,
    is247: true,
    ambulatory: true,
    farmCallFee: 65,
    description: 'Premier regional equine hospital located minutes from Tryon International Equestrian Center (TIEC). Four board-certified surgeons and internists offering top-tier field and surgical services.',
    directorySource: 'Mad Barn US Directory',
    reviews: []
  },

  // 8. Pioneer Equine Hospital (Oakdale, CA)
  {
    id: 'vc-pioneer',
    name: 'Pioneer Equine Hospital',
    rating: 4.92,
    reviewsCount: 146,
    address: '11536 Cleveland Avenue, Oakdale, CA 95361',
    state: 'CA',
    phone: '(209) 847-5951',
    image: 'https://images.unsplash.com/photo-1566251037378-5e04e3bec343?auto=format&fit=crop&q=80&w=800',
    photos: [
      'https://images.unsplash.com/photo-1566251037378-5e04e3bec343?auto=format&fit=crop&q=80&w=800'
    ],
    vets: [
      { name: 'Dr. Brad Britton, DVM', avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300', rating: 4.9, specialty: 'Equine Surgery & Founder' },
      { name: 'Dr. Rob Black, DVM', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300', rating: 4.9, specialty: 'Sports Medicine & Joint Care' }
    ],
    nextAvailable: 'Friday, Oct 24',
    services: ['Surgical Suites', 'Reproductive Care', 'Pre-Purchase Exams', 'Digital Radiography', 'Ultrasound Imaging', '24/7 Emergency Ambulatory'],
    lat: 37.7669,
    lng: -120.8472,
    distanceMiles: 21.0,
    hours: 'Open 8:00 AM - 5:30 PM (24/7 Emergency)',
    isOpen: true,
    is247: true,
    ambulatory: true,
    farmCallFee: 60,
    description: 'Premier Northern and Central California equine medical and surgical hospital founded by Drs. Britton and Black. Full hospital and field practice.',
    directorySource: 'Mad Barn US Directory',
    reviews: []
  },

  // 9. Woodside Equine Clinic (Virginia)
  {
    id: 'vc-woodside',
    name: 'Woodside Equine Clinic',
    rating: 4.9,
    reviewsCount: 128,
    address: '13011 Blanton Road, Ashland, VA 23005',
    state: 'VA',
    phone: '(804) 798-3281',
    image: 'https://images.unsplash.com/photo-1534773728080-33d31da27ae5?auto=format&fit=crop&q=80&w=800',
    photos: [
      'https://images.unsplash.com/photo-1534773728080-33d31da27ae5?auto=format&fit=crop&q=80&w=800'
    ],
    vets: [
      { name: 'Dr. Scott Anderson, DVM', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300', rating: 4.9, specialty: 'Sports Medicine & Lameness' },
      { name: 'Dr. Catherine Côté, DVM', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300', rating: 4.9, specialty: 'Preventive Care & Equine Reproduction' },
      { name: 'Dr. Haley Snell, DVM', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300', rating: 4.85, specialty: 'General Wellness & Dentistry' }
    ],
    nextAvailable: 'Monday, Oct 27',
    services: ['Preventive Wellness Plans', 'Coggins & Health Papers', 'Dentistry PowerFloating', 'Reproduction & Breeding', 'Mobile Field Service', 'Emergency Ambulatory'],
    lat: 37.7587,
    lng: -77.4811,
    distanceMiles: 15.8,
    hours: 'Open 8:00 AM - 5:00 PM (24/7 Emergency)',
    isOpen: true,
    is247: true,
    ambulatory: true,
    farmCallFee: 55,
    description: 'Premier full-service equine veterinary clinic in Central Virginia. Providing comprehensive ambulatory care, in-clinic hospital procedures, sports medicine, and reproductive services.',
    directorySource: 'Mad Barn US Directory',
    reviews: []
  },

  // 10. Weatherford Equine Medical Center (Texas)
  {
    id: 'vc-weatherford',
    name: 'Weatherford Equine Medical Center',
    rating: 4.93,
    reviewsCount: 162,
    address: '8488 US-180, Weatherford, TX 76088',
    state: 'TX',
    phone: '(817) 594-9181',
    image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=800',
    photos: [
      'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=800'
    ],
    vets: [
      { name: 'Dr. Justin High, DVM', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300', rating: 5.0, specialty: 'Cutting & Performance Horse Sports Medicine' },
      { name: 'Dr. Bruce Connally, DVM', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300', rating: 4.9, specialty: 'Equine Lameness & Surgery' }
    ],
    nextAvailable: 'Tomorrow, 9:30 AM',
    services: ['Western Performance Sports Medicine', 'Digital X-Ray & Ultrasound', 'Pre-Purchase Exams', 'Colic Surgery', 'Equine Podiatry', 'Farm Calls'],
    lat: 32.7593,
    lng: -97.7972,
    distanceMiles: 17.4,
    hours: 'Open 8:00 AM - 5:30 PM (24/7 On-Call)',
    isOpen: true,
    is247: true,
    ambulatory: true,
    farmCallFee: 65,
    description: 'Located in the "Cutting Horse Capital of the World", Weatherford Equine specializes in Western performance horse medicine, lameness diagnostics, and surgical intervention.',
    directorySource: 'Mad Barn US Directory',
    reviews: []
  },

  // 11. Mid-Atlantic Equine Medical Center (New Jersey)
  {
    id: 'vc-mid-atlantic',
    name: 'Mid-Atlantic Equine Medical Center',
    rating: 4.94,
    reviewsCount: 140,
    address: '40 Frontage Rd, Ringoes, NJ 08551',
    state: 'NJ',
    phone: '(908) 788-5373',
    image: 'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?auto=format&fit=crop&q=80&w=800',
    photos: ['https://images.unsplash.com/photo-1598974357801-cbca100e65d3?auto=format&fit=crop&q=80&w=800'],
    vets: [
      { name: 'Dr. Rodney Belgrave, DVM, MS, DACVIM', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300', rating: 5.0, specialty: 'Board-Certified Equine Internal Medicine' },
      { name: 'Dr. Janik Gasiorowski, VMD, DACVS', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300', rating: 4.9, specialty: 'Equine Orthopedic Surgery' }
    ],
    nextAvailable: 'Wednesday, Oct 22',
    services: ['Standing MRI', 'Colic Surgery & Critical Care', 'High-Speed Treadmill Endoscopy', 'Neonatal ICU', 'Shockwave Therapy', 'Coggins Testing'],
    lat: 40.4284,
    lng: -74.8632,
    distanceMiles: 28.0,
    hours: 'Open 24/7 Full Emergency Referral Hospital',
    isOpen: true,
    is247: true,
    ambulatory: true,
    farmCallFee: 75,
    description: 'Premier Mid-Atlantic regional equine referral center featuring board-certified specialists in surgery, internal medicine, cardiology, and ophthalmology.',
    directorySource: 'Mad Barn US Directory',
    reviews: []
  },

  // 12. Ocala Equine Hospital (Florida)
  {
    id: 'vc-ocala-equine',
    name: 'Ocala Equine Hospital',
    rating: 4.92,
    reviewsCount: 178,
    address: '10855 NW Hwy 27, Ocala, FL 34482',
    state: 'FL',
    phone: '(352) 237-6151',
    image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=800',
    photos: ['https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=800'],
    vets: [
      { name: 'Dr. John Peloso, DVM, MS, DACVS', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300', rating: 4.95, specialty: 'Thoroughbred Orthopedic Surgery' },
      { name: 'Dr. Bill Russell, DVM', avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300', rating: 4.9, specialty: 'Equine Sports Medicine & Lameness' }
    ],
    nextAvailable: 'Tomorrow, 8:00 AM',
    services: ['Thoroughbred Sales Repository X-Rays', 'Colic Surgery', 'Overground Dynamic Scope', 'Pre-Purchase Exams', 'Ambulatory Farm Calls'],
    lat: 29.2155,
    lng: -82.2570,
    distanceMiles: 19.5,
    hours: 'Open 24/7 (Horse Capital of the World)',
    isOpen: true,
    is247: true,
    ambulatory: true,
    farmCallFee: 65,
    description: 'Located in the Horse Capital of the World, Ocala Equine Hospital is a state-of-the-art surgical and ambulatory center providing care to racehorses, sport horses, and breeding stock.',
    directorySource: 'Mad Barn US Directory',
    reviews: []
  },

  // 13. Riverbend Equine Veterinary Services (Virginia)
  {
    id: 'vc-riverbend',
    name: 'Riverbend Equine Veterinary Services',
    rating: 4.88,
    reviewsCount: 76,
    address: '11384 James Madison Hwy, Gordonsville, VA 22942',
    state: 'VA',
    phone: '(540) 832-2300',
    image: 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&q=80&w=800',
    photos: ['https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&q=80&w=800'],
    vets: [
      { name: 'Dr. Rebecca W. Kramer, DVM', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300', rating: 4.9, specialty: 'General Equine Practice & Acupuncture' },
      { name: 'Dr. Mark H. Foley, DVM', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300', rating: 4.85, specialty: 'Sports Medicine & Dentistry' }
    ],
    nextAvailable: 'Tuesday, Oct 20',
    services: ['Equine Acupuncture', 'Dentistry & Floating', 'Vaccination Clinics', 'Fecal Egg Counts', 'Pre-Purchase Exams', 'Mobile Field Service'],
    lat: 38.1368,
    lng: -78.1883,
    distanceMiles: 14.1,
    hours: 'Open 8:30 AM - 5:00 PM',
    isOpen: true,
    is247: false,
    ambulatory: true,
    farmCallFee: 50,
    description: 'Dedicated ambulatory and integrative equine practice serving Central Virginia and the Piedmont region with personalized wellness and sports medicine.',
    directorySource: 'Mad Barn US Directory',
    reviews: []
  },

  // 14. Stone Horse Veterinary Service (Kansas / Midwest)
  {
    id: 'vc-stone-horse',
    name: 'Stone Horse Veterinary Service',
    rating: 4.92,
    reviewsCount: 82,
    address: '1509 W 6th St, Lawrence, KS 66044',
    state: 'KS',
    phone: '(785) 841-8600',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800',
    photos: ['https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800'],
    vets: [
      { name: 'Dr. Craig B. Ragsdale, DVM', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300', rating: 4.9, specialty: 'General Medicine & Lameness' },
      { name: 'Dr. Amanda Long, DVM', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300', rating: 4.95, specialty: 'Equine Dentistry & Geriatric Care' }
    ],
    nextAvailable: 'Monday, Oct 19',
    services: ['Mobile Lameness Workups', 'PowerFloat Dentistry', 'Field Castrations', 'Coggins Testing', 'Senior Horse Wellness', 'Farm Calls'],
    lat: 38.9717,
    lng: -95.2530,
    distanceMiles: 11.2,
    hours: 'Open 8:00 AM - 5:00 PM',
    isOpen: true,
    is247: false,
    ambulatory: true,
    farmCallFee: 45,
    description: 'High-touch mobile equine veterinary practice providing routine care, lameness evaluations, motorized dentistry, and emergency field services across Eastern Kansas.',
    directorySource: 'Mad Barn US Directory',
    reviews: []
  },

  // 15. Becker Equine (Texas)
  {
    id: 'vc-becker-equine',
    name: 'Becker Equine Veterinary Hospital',
    rating: 4.9,
    reviewsCount: 94,
    address: '11340 FM 2154, Navasota, TX 77868',
    state: 'TX',
    phone: '(936) 825-7800',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
    photos: ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800'],
    vets: [
      { name: 'Dr. Luke Becker, DVM', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300', rating: 4.9, specialty: 'Equine Primary & Emergency Care' },
      { name: 'Dr. Hannah Becker, DVM', avatar: 'https://images.unsplash.com/photo-1594824813566-78a9c336b9c9?auto=format&fit=crop&q=80&w=300', rating: 4.9, specialty: 'Performance Evaluations & Surgery' }
    ],
    nextAvailable: 'Tomorrow, 11:00 AM',
    services: ['Emergency Care', 'Performance Horse Exams', 'Standing Soft Tissue Surgery', 'Reproduction Care', 'Barn Call Services'],
    lat: 30.4120,
    lng: -96.1150,
    distanceMiles: 16.5,
    hours: 'Open 8:00 AM - 5:30 PM (24/7 Emergency)',
    isOpen: true,
    is247: true,
    ambulatory: true,
    farmCallFee: 55,
    description: 'Comprehensive equine veterinary hospital in Navasota, Texas offering emergency care, primary wellness, performance evaluations, and field consulting.',
    directorySource: 'Mad Barn US Directory',
    reviews: []
  },

  // 16. Santa Rosa Equine Hospital (California)
  {
    id: 'vc-1',
    name: 'Santa Rosa Equine Hospital',
    rating: 4.9,
    reviewsCount: 142,
    address: '4200 Sonoma Hwy, Santa Rosa, CA 95409',
    state: 'CA',
    phone: '(707) 538-3900',
    image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=800',
    photos: [
      'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=800'
    ],
    vets: [
      { name: 'Dr. Sarah Evans, DVM', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300', rating: 4.9, specialty: 'Lameness & Surgery' },
      { name: 'Dr. Mark Davis, DVM', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300', rating: 4.8, specialty: 'General Practice & Dentistry' }
    ],
    nextAvailable: 'Tomorrow, 9:00 AM',
    services: ['Coggins Testing', 'Vaccinations', 'Dental Floating', 'Lameness Evaluation', 'Surgical Suite', 'Endoscopy'],
    lat: 38.4520,
    lng: -122.6800,
    distanceMiles: 4.2,
    hours: 'Open 8:00 AM - 5:30 PM',
    isOpen: true,
    is247: true,
    ambulatory: true,
    farmCallFee: 65,
    description: 'Full-service equine surgical center and mobile ambulatory practice serving Sonoma, Napa, and Marin counties. Outfitted with state-of-the-art digital radiology, ultrasound, and standing surgery suites.',
    directorySource: 'Mad Barn US Directory',
    reviews: [
      {
        id: 'rev-101',
        clinicId: 'vc-1',
        authorName: 'Eleanor Vance',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        rating: 5,
        date: '3 days ago',
        comment: 'Dr. Evans saved my gelding during an acute colic scare at 2 AM. Her bedside manner with stressed horses is remarkable. Digital x-rays were uploaded to my horsez vault within 1 hour!',
        verifiedVisit: true,
        serviceType: 'Emergency Colic Triage',
        horseName: 'Thunder',
        helpfulCount: 14
      }
    ]
  },

  // 17. Sonoma Valley Equine Clinic (California)
  {
    id: 'vc-2',
    name: 'Sonoma Valley Equine Clinic',
    rating: 4.8,
    reviewsCount: 98,
    address: '1150 Petaluma Hill Rd, Petaluma, CA 94952',
    state: 'CA',
    phone: '(707) 763-1200',
    image: 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&q=80&w=800',
    photos: [
      'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800'
    ],
    vets: [
      { name: 'Dr. Rebecca Vance, DVM', avatar: 'https://images.unsplash.com/photo-1594824813566-78a9c336b9c9?auto=format&fit=crop&q=80&w=300', rating: 4.8, specialty: 'Reproduction & Foaling' },
      { name: 'Dr. Jason Miller, DVM', avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300', rating: 4.9, specialty: 'Sports Medicine' }
    ],
    nextAvailable: 'Friday, Oct 16',
    services: ['Pre-Purchase Exam', 'Ultrasonic Imaging', 'Barn Call Vaccine Clinics', 'Reproductive Ultrasound', 'Regenerative Therapies'],
    lat: 38.2800,
    lng: -122.5800,
    distanceMiles: 8.7,
    hours: 'Open 7:30 AM - 6:00 PM',
    isOpen: true,
    is247: false,
    ambulatory: true,
    farmCallFee: 50,
    description: 'Specializing in performance horse medicine, routine ambulatory wellness, and equine reproductive care. Offering shared neighborhood barn call days to save on travel fees.',
    directorySource: 'Mad Barn US Directory',
    reviews: [
      {
        id: 'rev-201',
        clinicId: 'vc-2',
        authorName: 'Samantha Bell',
        authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
        rating: 5,
        date: '5 days ago',
        comment: 'Dr. Vance conducted a thorough Pre-Purchase Exam (PPE) with flexions, x-rays, and ultrasound. Her detailed report gave us total confidence in our purchase!',
        verifiedVisit: true,
        serviceType: 'Pre-Purchase Exam',
        horseName: 'Midnight Magic',
        helpfulCount: 11
      }
    ]
  },

  // 18. Wine Country Equine Dental & Wellness (California)
  {
    id: 'vc-3',
    name: 'Wine Country Equine Dental & Wellness',
    rating: 4.95,
    reviewsCount: 84,
    address: '2800 Adobe Rd, Petaluma, CA 94954',
    state: 'CA',
    phone: '(707) 778-8822',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800',
    photos: [
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=800'
    ],
    vets: [
      { name: 'Dr. Amanda Chen, DVM', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300', rating: 5.0, specialty: 'Equine Dentistry & Oral Surgery' }
    ],
    nextAvailable: 'Monday, Oct 19',
    services: ['PowerFloat Dentistry', 'EOTRH Management', 'Wolf Tooth Extractions', 'Sedated Oral Exams', 'Annual Wellness'],
    lat: 38.2450,
    lng: -122.6100,
    distanceMiles: 12.1,
    hours: 'Open 8:00 AM - 5:00 PM',
    isOpen: true,
    is247: false,
    ambulatory: true,
    farmCallFee: 45,
    description: 'Dedicated equine dentistry practice equipped with motorized power floating units, oroscope video imaging, and advanced periodontal therapy tools.',
    directorySource: 'Mad Barn US Directory',
    reviews: []
  },

  // 19. San Luis Rey Equine Hospital (Bonsall, CA)
  {
    id: 'vc-san-luis-rey',
    name: 'San Luis Rey Equine Hospital',
    rating: 4.91,
    reviewsCount: 110,
    address: '4211 Gopher Canyon Rd, Bonsall, CA 92003',
    state: 'CA',
    phone: '(760) 726-9250',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
    photos: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800'],
    vets: [
      { name: 'Dr. Barrie Grant, DVM, DACVS', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300', rating: 4.95, specialty: 'Equine Cervical Spine & Surgery' },
      { name: 'Dr. Korin Potenza, DVM', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300', rating: 4.9, specialty: 'Internal Medicine & Colic ICU' }
    ],
    nextAvailable: 'Thursday, Oct 23',
    services: ['Cervical Stabilization (Wobbler)', 'Colic Surgery', 'Nuclear Scintigraphy', 'High-Speed Treadmill', '24/7 ICU'],
    lat: 33.2842,
    lng: -117.2217,
    distanceMiles: 24.2,
    hours: 'Open 24/7 Full Hospital',
    isOpen: true,
    is247: true,
    ambulatory: true,
    farmCallFee: 70,
    description: 'Renowned Southern California equine hospital known for pioneering cervical spine stabilization surgeries (Wobbler syndrome), bone scans, and 24/7 ICU care.',
    directorySource: 'Mad Barn US Directory',
    reviews: []
  },

  // 20. Pacific Coast Ambulatory Equine Vets (California)
  {
    id: 'vc-4',
    name: 'Pacific Coast Ambulatory Equine Vets',
    rating: 4.7,
    reviewsCount: 61,
    address: '610 Dry Creek Rd, Healdsburg, CA 95448',
    state: 'CA',
    phone: '(707) 433-2199',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
    photos: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800'
    ],
    vets: [
      { name: 'Dr. Timothy Hayes, DVM', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300', rating: 4.7, specialty: 'Field Surgery & Emergency' }
    ],
    nextAvailable: 'Today, 3:00 PM',
    services: ['Field Castrations', 'Coggins Testing', 'Emergency Colic Triage', 'Microchipping', 'Deworming Schedules'],
    lat: 38.6100,
    lng: -122.8700,
    distanceMiles: 16.4,
    hours: 'Open 24/7 (Emergency Ambulatory)',
    isOpen: true,
    is247: true,
    ambulatory: true,
    farmCallFee: 75,
    description: 'Fully equipped 4x4 mobile trucks bringing direct clinic-grade care directly to your pasture or barn aisle. Rapid emergency response throughout Northern California.',
    directorySource: 'Mad Barn US Directory',
    reviews: []
  },

  // 21. Abraham\'s Equine Clinic (Iowa / Midwest)
  {
    id: 'vc-abrahams',
    name: "Abraham's Equine Clinic",
    rating: 4.89,
    reviewsCount: 88,
    address: '4011 42nd St NE, Cedar Rapids, IA 52402',
    state: 'IA',
    phone: '(319) 393-0185',
    image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=800',
    photos: ['https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=800'],
    vets: [
      { name: 'Dr. Charles Abraham, DVM', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300', rating: 4.9, specialty: 'Reproduction & Lameness' },
      { name: 'Dr. Stephanie Abraham, DVM', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300', rating: 4.9, specialty: 'Dentistry & Wellness' }
    ],
    nextAvailable: 'Wednesday, Oct 21',
    services: ['General Equine Health', 'Advanced Diagnostics', 'Embryo Transfer & Breeding', 'Lameness Workups', 'Dentistry', 'Field Ambulatory'],
    lat: 42.0252,
    lng: -91.6421,
    distanceMiles: 20.3,
    hours: 'Open 8:00 AM - 5:00 PM (24/7 On Call)',
    isOpen: true,
    is247: true,
    ambulatory: true,
    farmCallFee: 50,
    description: 'Comprehensive equine medical, surgical, and reproductive facility serving Iowa and the Midwest with hospital and mobile services.',
    directorySource: 'Mad Barn US Directory',
    reviews: []
  },

  // 22. Rood & Riddle Equine Hospital (Saratoga Springs, NY)
  {
    id: 'vc-rood-saratoga',
    name: 'Rood & Riddle Equine Hospital (Saratoga)',
    rating: 4.96,
    reviewsCount: 115,
    address: '63 Henning Road, Saratoga Springs, NY 12866',
    state: 'NY',
    phone: '(518) 583-7273',
    image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=800',
    photos: ['https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=800'],
    vets: [
      { name: 'Dr. Brett Woodie, DVM, MS, DACVS', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300', rating: 4.95, specialty: 'Board-Certified Equine Surgeon' },
      { name: 'Dr. Katherine Garrett, DVM, DACVS', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300', rating: 4.95, specialty: 'Diagnostic Imaging & Surgery' }
    ],
    nextAvailable: 'Tomorrow, 9:00 AM',
    services: ['Surgical Suite', 'Pre-Purchase Exams', 'Diagnostic Imaging', 'Gastroscopy', 'Coggins Testing', '24/7 Emergency'],
    lat: 43.0831,
    lng: -73.7846,
    distanceMiles: 32.0,
    hours: 'Open 24/7 Full Service Hospital',
    isOpen: true,
    is247: true,
    ambulatory: true,
    farmCallFee: 75,
    description: 'Northeastern branch of Rood & Riddle located in historic Saratoga Springs, providing elite veterinary care to thoroughbreds, sport horses, and pleasure horses across New York and New England.',
    directorySource: 'Mad Barn US Directory',
    reviews: []
  }
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    vetName: 'Dr. Larry Bramlage, DVM',
    clinicName: 'Rood & Riddle Equine Hospital',
    date: 'Oct 14, 2026',
    time: '9:00 AM',
    service: 'Coggins Test & Annual Vaccines',
    horseName: 'Thunder',
    verified: true
  },
  {
    id: 'apt-2',
    vetName: 'Dr. Troy Herthel, DVM',
    clinicName: 'Alamo Pintado Equine Medical Center',
    date: 'Oct 20, 2026',
    time: '2:30 PM',
    service: 'Dental Float & Wellness Check',
    horseName: 'Sarafina',
    verified: true
  }
];

export const MOCK_MEDICAL_RECORDS: MedicalRecord[] = [
  {
    id: 'mr-1',
    title: 'Negative Coggins Certificate (EIA)',
    date: 'July 1, 2026',
    verified: true,
    type: 'coggins'
  },
  {
    id: 'mr-2',
    title: 'Interstate Health Inspection Certificate',
    date: 'July 1, 2026',
    verified: true,
    type: 'health-paper'
  },
  {
    id: 'mr-3',
    title: 'Rabies & West Nile Vaccination Record',
    date: 'April 12, 2026',
    verified: true,
    type: 'vaccine'
  }
];
