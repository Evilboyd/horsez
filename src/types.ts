export type CategoryId = 
  | 'my-stable'
  | 'emergency-vet'
  | 'vets'
  | 'farriers'
  | 'transportation'
  | 'trainers'
  | 'feed-supplies'
  | 'lodging'
  | 'buy-sell'
  | 'contact';

export interface ContactTicket {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  equineRole: string;
  inquiryCategory: 'general' | 'emergency-dispatch' | 'provider-listing' | 'orders-billing' | 'transport-help' | 'technical';
  urgency: 'normal' | 'high' | 'urgent';
  subject: string;
  message: string;
  horseName?: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  userId?: string;
}

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  subtitle: string;
  iconName: string;
  color: string;
  badge?: string;
}

// Favorite Item Types
export type FavoriteCategory = 'vets' | 'trainers' | 'farriers' | 'lodging' | 'buy-sell' | 'transportation' | 'feed-supplies';

export interface FavoriteItem {
  id: string;
  category: FavoriteCategory;
  title: string;
  subtitle?: string;
  rating?: number;
  image?: string;
  price?: string | number;
  location?: string;
  addedAt: string;
}

// Push Notification System Types
export type NotificationType = 'availability' | 'urgent_update' | 'dispatch_alert' | 'general';

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  providerId?: string;
  providerName: string;
  category: FavoriteCategory | 'general';
  type: NotificationType;
  timestamp: string;
  read: boolean;
  targetCategory?: CategoryId;
  urgency?: 'urgent' | 'normal';
}

// Emergency Vet Types
export interface EmergencyVetTeam {
  id: string;
  name: string;
  etaMinutes: number;
  status: 'available' | 'en-route' | 'busy';
  rating: number;
  verified: boolean;
  phone: string;
  location: string;
  lat: number;
  lng: number;
  state?: string;
  directorySource?: string;
}

export interface TriageResult {
  urgency: 'CODE RED' | 'URGENT CARE' | 'ROUTINE';
  assessment: string;
  recommendations: string[];
  aiPowered?: boolean;
}

export interface ClinicReview {
  id: string;
  clinicId: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  date: string;
  comment: string;
  verifiedVisit?: boolean;
  serviceType?: string;
  horseName?: string;
  helpfulCount?: number;
}

// Routine Vet Types
export interface VetClinic {
  id: string;
  name: string;
  rating: number;
  reviewsCount?: number;
  address: string;
  state?: string;
  phone?: string;
  image: string;
  photos?: string[];
  vets: { name: string; avatar: string; rating: number; specialty: string }[];
  nextAvailable: string;
  services: string[];
  lat: number;
  lng: number;
  distanceMiles?: number;
  hours?: string;
  isOpen?: boolean;
  is247?: boolean;
  ambulatory?: boolean;
  farmCallFee?: number;
  description?: string;
  directorySource?: string;
  reviews?: ClinicReview[];
  isFirebase?: boolean;
  publishedAsListing?: boolean;
  authorId?: string;
  authorEmail?: string;
  createdAt?: string;
}

export interface Appointment {
  id: string;
  vetName: string;
  clinicName: string;
  date: string;
  time: string;
  service: string;
  horseName: string;
  verified: boolean;
}

export interface MedicalRecord {
  id: string;
  title: string;
  date: string;
  verified: boolean;
  type: 'coggins' | 'vaccine' | 'health-paper' | 'surgery';
  documentUrl?: string;
}

// Farrier Types
export interface Farrier {
  id: string;
  name: string;
  rating: number;
  reviewsCount?: number;
  location: string;
  address?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  verified: boolean;
  mcNumber?: string;
  avatar: string;
  specialties: string[];
  instantResponse: boolean;
  priceEstimate: string;
  lat?: number;
  lng?: number;
  bio?: string;
  createdAt?: string;
  isFirebase?: boolean;
  publishedAsListing?: boolean;
  listingStatus?: 'active' | 'pending' | 'draft';
  sellerId?: string;
  authorEmail?: string;
}

export interface HoofLogEntry {
  id: string;
  date: string;
  horseName: string;
  notes: string;
  beforePhoto: string;
  afterPhoto: string;
}

// Transportation Types
export interface HaulAddress {
  facilityName?: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  contactName?: string;
  contactPhone?: string;
  accessInstructions?: string;
}

export interface HaulerJob {
  id: string;
  pickup: string;
  dropoff: string;
  pickupAddress?: HaulAddress;
  deliveryAddress?: HaulAddress;
  distanceMiles: number;
  numHorses: number;
  rigRequirement: string;
  status: 'open' | 'claimed' | 'in-transit' | 'completed';
  price: number;
  haulerName?: string;
  haulerRating?: number;
  date: string;
  pickupDate?: string;
  deliveryDate?: string;
  liveDiagnostics?: {
    temp: string;
    speed: string;
    suspension: string;
  };
  lat?: number;
  lng?: number;
  isFirebase?: boolean;
  publishedAsListing?: boolean;
  authorId?: string;
  authorEmail?: string;
  createdAt?: string;
}

export interface AvailableDriver {
  id: string;
  name: string;
  companyName?: string;
  rating: number;
  reviewsCount?: number;
  tripsCompleted?: number;
  phone: string;
  email?: string;
  baseLocation: string;
  rigType?: string;
  rig?: string;
  dotNumber?: string;
  mcNumber?: string;
  capacityStalls?: number;
  availableStalls?: number;
  usdotNumber?: string;
  isInsured?: boolean;
  emergencyCertified?: boolean;
  commercialInsuranceLimit?: string;
  cameraTelemetryLive?: boolean;
  availableNow?: boolean;
  status: 'standby' | 'dispatched' | 'accepting_trips';
  lat?: number;
  lng?: number;
  currentLocation?: { lat: number; lng: number };
  avatar?: string;
  ratePerMile: number;
  emergencyResponseTime?: string;
  specialties?: string[];
  isFirebase?: boolean;
  publishedAsListing?: boolean;
  authorId?: string;
  authorEmail?: string;
  createdAt?: string;
}

export interface SuggestedRouteWaypoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'origin' | 'destination' | 'water_stop' | 'vet_triage' | 'rest_oasis';
  notes?: string;
}

export interface SuggestedRoute {
  id: string;
  title: string;
  corridor: string;
  distanceMiles: number;
  estDriveTime: string;
  color: string;
  dashArray?: string;
  description: string;
  safetyScore: string;
  recommendedRig: string;
  waterIntervalHours: number;
  coordinates: [number, number][];
  waypoints: SuggestedRouteWaypoint[];
}

// Trainer Types (Directory & Dispatch)
export interface TrainerProfile {
  id: string;
  name: string;
  avatar: string;
  heroPhoto: string;
  images?: string[];
  rating: number;
  mcNumber?: string;
  disciplines: string[];
  certifications: string[];
  hourlyRate: number;
  bio: string;
  videoUrl?: string;
  location: string;
  address?: string;
  phone?: string;
  email?: string;
  distanceMiles: number;
  waiverVerified: boolean;
  services: string[];
  lat?: number;
  lng?: number;
  featured?: boolean;
  isFirebase?: boolean;
  createdAt?: string;
}

// Feed & Supplies Types
export interface FeedProduct {
  id: string;
  title: string;
  category: 'hay' | 'grain' | 'supplements' | 'tack';
  price: number;
  weight?: string;
  image: string;
  rating: number;
  description: string;
  inStock: boolean;
  subscriptionAvailable: boolean;
  vendor?: string;
  vendorName?: string;
  vendorLocation?: string;
  unit?: string;
  bulkDiscount?: string;
  subscribeDiscountPercent?: number;
  isFirebase?: boolean;
  publishedAsListing?: boolean;
  authorId?: string;
  authorEmail?: string;
  createdAt?: string;
}

export interface CartItem {
  product: FeedProduct;
  quantity: number;
  isSubscription?: boolean;
  intervalWeeks?: number;
}

export type FeedPaymentMethod = 
  | 'credit_card' 
  | 'apple_pay' 
  | 'google_pay' 
  | 'farm_credit_line' 
  | 'cod_check' 
  | 'zelle_venmo';

export interface FeedOrderItem {
  productId: string;
  title: string;
  category: string;
  price: number;
  quantity: number;
  unit?: string;
  weight?: string;
  image?: string;
  isSubscription?: boolean;
}

export interface FeedOrder {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  barnName?: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryZip: string;
  gateCode?: string;
  dropLocation: 'ground_drop' | 'squeeze_stack' | 'hayloft_stack' | 'stall_front';
  dropLocationLabel: string;
  deliveryDate: string;
  deliveryTimeSlot: string;
  items: FeedOrderItem[];
  subtotal: number;
  bulkDiscount: number;
  subscriptionDiscount: number;
  deliveryFee: number;
  unloadFee: number;
  promoDiscount: number;
  promoCode?: string;
  tax: number;
  total: number;
  paymentMethod: FeedPaymentMethod;
  paymentStatus: 'paid' | 'authorized' | 'pending_cod' | 'invoiced_net30';
  orderStatus: 'confirmed' | 'packing' | 'dispatched' | 'delivered';
  trackingNumber: string;
  specialInstructions?: string;
  createdAt: string;
}

// Lodging (Bed & Bale) Types
export interface LodgingProperty {
  id: string;
  title: string;
  location: string;
  address?: string;
  image: string;
  nightlyPrice: number;
  rating: number;
  stallsAvailable: number;
  stallTypes: string[];
  rvHookups: boolean;
  guestCabin: boolean;
  maxRigLengthFeet: number;
  amenities: string[];
  cogginsRequired: boolean;
  mcVerifiedHaulers: boolean;
  status: 'available' | '1-left' | 'booked';
  lat: number;
  lng: number;
  isFirebase?: boolean;
  publishedAsListing?: boolean;
  hostName?: string;
  phone?: string;
  authorId?: string;
  authorEmail?: string;
  createdAt?: string;
}

// Buy & Sell Marketplace Types
export interface MarketplaceListing {
  id: string;
  title: string;
  category: 'horses' | 'tack' | 'trailers' | 'gear' | 'apparel';
  price: number;
  breed?: string;
  ageYears?: number;
  discipline?: string;
  temperamentScore?: number; // 1-10
  location: string;
  address?: string;
  images: string[];
  sellerName: string;
  sellerAvatar: string;
  sellerRating: number;
  sellerVerified: boolean;
  sellerPhone?: string;
  sellerEmail?: string;
  condition?: string;
  description: string;
  createdAt: string;
  featured?: boolean;
  isFirebase?: boolean;
  authorId?: string;
  sellerId?: string;
}

export interface MarketplaceInquiry {
  id: string;
  listingId: string;
  listingTitle: string;
  listingCategory?: string;
  listingPrice?: number;
  sellerName: string;
  sellerEmail?: string;
  buyerId?: string;
  buyerName: string;
  buyerEmail?: string;
  buyerPhone?: string;
  offerAmount?: number;
  message: string;
  status: 'pending' | 'accepted' | 'declined' | 'replied';
  createdAt: string;
  isFirebase?: boolean;
}

export interface MarketplaceEscrow {
  id: string;
  escrowNumber: string;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  depositAmount: number;
  buyerId?: string;
  buyerName: string;
  buyerEmail?: string;
  buyerPhone?: string;
  sellerName: string;
  ppeInspectionDays: number;
  escrowStatus: 'deposit_held' | 'ppe_pending' | 'released' | 'refunded';
  termsAgreed: boolean;
  createdAt: string;
  isFirebase?: boolean;
}

export interface FeedBulkQuote {
  id: string;
  userId?: string;
  barnName: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  tons: number;
  variety: string;
  location: string;
  notes?: string;
  status: 'submitted' | 'quoting' | 'dispatched';
  createdAt: string;
  isFirebase?: boolean;
}

// User Profile & Database Types
export interface UserProfileData {
  uid: string;
  email: string;
  fullName: string;
  phone?: string;
  equineRole: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  location: string;
  primaryDiscipline: string;
  numberOfHorses: number;
  barnName?: string;
  createdAt: string;
}

export interface FirestoreHorseRecord {
  id?: string;
  userId: string;
  name: string;
  breed: string;
  age: number;
  discipline: string;
  stabledAt: string;
  cogginsDate?: string;
  createdAt: string;
}

// User Horse Record
export interface UserHorse {
  id: string;
  name: string;
  breed: string;
  age: number;
  color: string;
  cogginsVerified: boolean;
  vaccinesCurrent: boolean;
  photoUrl: string;
  stallNumber?: string;
  heightHands?: number;
  weightLbs?: number;
  microchipNumber?: string;
  discipline?: string;
  registrationNumber?: string;
  specialNeeds?: string;
  feedSchedule?: {
    morningHay: string;
    morningGrain: string;
    eveningHay: string;
    eveningGrain: string;
    supplements: string[];
  };
  turnoutGroup?: string;
  blanketWeight?: 'Sheet' | 'Medium (200g)' | 'Heavy (350g)' | 'None';
}

export interface BarnChore {
  id: string;
  title: string;
  timeSlot: 'Morning (6:30 AM)' | 'Afternoon (12:00 PM)' | 'Evening (5:30 PM)' | 'Night Check (9:00 PM)';
  category: 'feed' | 'turnout' | 'medication' | 'mucking' | 'blanket' | 'exercise';
  horseName?: string;
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

export interface StableHealthEvent {
  id: string;
  horseName: string;
  type: 'farrier' | 'vaccine' | 'dental' | 'coggins' | 'deworming' | 'vet_check';
  title: string;
  lastDoneDate: string;
  nextDueDate: string;
  providerName: string;
  status: 'upcoming' | 'due_soon' | 'overdue' | 'completed';
  notes?: string;
}

export interface BarnFacilityInfo {
  name: string;
  address: string;
  totalStalls: number;
  occupiedStalls: number;
  managerName: string;
  managerPhone: string;
  emergencyClinic: string;
  emergencyPhone: string;
  pastureCount: number;
  arenaStatus: 'Open - Groomed' | 'Open - Footing Dry' | 'Reserved for Lessons' | 'Closed for Rake';
  weatherAlert?: string;
}

