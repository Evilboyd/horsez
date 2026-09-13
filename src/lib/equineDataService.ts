import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  Unsubscribe,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';

/**
 * Universal Equine Firestore Collection Identifiers
 */
export const EQUINE_COLLECTIONS = {
  MARKETPLACE: 'marketplaceListings',
  MARKETPLACE_INQUIRIES: 'marketplaceInquiries',
  MARKETPLACE_ESCROW: 'marketplaceEscrow',
  FARRIERS: 'farriers',
  VETERINARIANS: 'veterinarians',
  TRAINERS: 'trainers',
  TRANSPORTATION: 'transportationListings',
  HAUL_JOBS: 'haulJobs',
  FEED_SUPPLIES: 'feedSupplies',
  FEED_ORDERS: 'feedOrders',
  FEED_BULK_QUOTES: 'feedBulkQuotes',
  LODGING: 'lodgingListings',
  USER_HORSES: 'userHorses',
  SUPPORT_TICKETS: 'supportTickets'
} as const;

export type EquineCollectionKey = keyof typeof EQUINE_COLLECTIONS;
export type EquineCollectionName = typeof EQUINE_COLLECTIONS[EquineCollectionKey];

/**
 * Standard Coordinates Directory for Northern California and Major Equine Hubs
 */
export const KNOWN_EQUINE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'santa rosa': { lat: 38.4404, lng: -122.7141 },
  'petaluma': { lat: 38.2324, lng: -122.6367 },
  'sonoma': { lat: 38.2919, lng: -122.4580 },
  'sebastopol': { lat: 38.4021, lng: -122.8239 },
  'napa': { lat: 38.2975, lng: -122.2869 },
  'oakdale': { lat: 37.7666, lng: -120.8471 },
  'sacramento': { lat: 38.5816, lng: -121.4944 },
  'rancho murieta': { lat: 38.5032, lng: -121.0827 },
  'davis': { lat: 38.5449, lng: -121.7405 },
  'woodside': { lat: 37.4299, lng: -122.2539 },
  'paso robles': { lat: 35.6369, lng: -120.6545 },
  'bakersfield': { lat: 35.3733, lng: -119.0187 },
  'lexington': { lat: 38.0406, lng: -84.5037 },
  'ocala': { lat: 29.1872, lng: -82.1401 },
  'wellington': { lat: 26.6618, lng: -80.2414 },
  'weatherford': { lat: 32.7593, lng: -97.7972 },
  'pilot point': { lat: 33.3968, lng: -96.9608 },
  'scottsdale': { lat: 33.4942, lng: -111.9261 },
  'aiken': { lat: 33.5604, lng: -81.7196 },
  'tryon': { lat: 35.2090, lng: -82.2387 },
  'middleburg': { lat: 38.9698, lng: -77.7342 }
};

/**
 * Universal Coordinate Geocoding Fallback Engine
 */
export function geocodeEquineLocation(
  city?: string,
  state?: string,
  facilityOrAddress?: string
): { lat: number; lng: number } {
  const normCity = (city || '').toLowerCase().trim();
  const normState = (state || '').toUpperCase().trim();
  const normAddress = (facilityOrAddress || '').toLowerCase().trim();

  // 1. Direct city matches
  if (normCity && KNOWN_EQUINE_COORDINATES[normCity]) {
    return KNOWN_EQUINE_COORDINATES[normCity];
  }

  // 2. Partial city or address keyword matches
  for (const [key, coords] of Object.entries(KNOWN_EQUINE_COORDINATES)) {
    if (normCity.includes(key) || key.includes(normCity) || normAddress.includes(key)) {
      return coords;
    }
  }

  // 3. State-level hubs
  if (normState === 'FL') return KNOWN_EQUINE_COORDINATES['ocala'];
  if (normState === 'KY') return KNOWN_EQUINE_COORDINATES['lexington'];
  if (normState === 'TX') return KNOWN_EQUINE_COORDINATES['weatherford'];
  if (normState === 'AZ') return KNOWN_EQUINE_COORDINATES['scottsdale'];
  if (normState === 'SC') return KNOWN_EQUINE_COORDINATES['aiken'];
  if (normState === 'NC') return KNOWN_EQUINE_COORDINATES['tryon'];
  if (normState === 'VA') return KNOWN_EQUINE_COORDINATES['middleburg'];

  // Default Northern California equestrian cluster
  return { lat: 38.3500, lng: -122.6000 };
}

/**
 * Universal Firestore Publish Function for all Horsez Categories
 */
export async function publishToFirestore<T extends Record<string, any>>(
  collectionName: string,
  data: T,
  customDocId?: string
): Promise<{ id: string; success: boolean } & T> {
  const currentUser = auth.currentUser;
  
  const payload = {
    ...data,
    isFirebase: true,
    publishedAsListing: true,
    authorId: currentUser?.uid || data.authorId || 'community-member',
    authorEmail: currentUser?.email || data.authorEmail || '',
    sellerId: currentUser?.uid || data.sellerId || 'community-member',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    if (customDocId) {
      const docRef = doc(db, collectionName, customDocId);
      await setDoc(docRef, payload, { merge: true });
      return { id: customDocId, success: true, ...payload };
    } else {
      const colRef = collection(db, collectionName);
      const docRef = await addDoc(colRef, payload);
      return { id: docRef.id, success: true, ...payload };
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collectionName);
    throw error;
  }
}

/**
 * Universal Real-Time Listener for any Firestore Collection
 */
export function subscribeToFirestoreCollection<T>(
  collectionName: string,
  onData: (items: T[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  try {
    const colRef = collection(db, collectionName);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const results: T[] = [];
        snapshot.forEach((docSnap) => {
          const docData = docSnap.data();
          results.push({
            id: docSnap.id,
            ...docData,
            isFirebase: true
          } as unknown as T);
        });
        onData(results);
      },
      (error) => {
        console.warn(`Realtime subscription error on /${collectionName}:`, error);
        handleFirestoreError(error, OperationType.LIST, collectionName);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.error(`Failed to initiate listener for /${collectionName}:`, err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Universal Delete Listing Function
 */
export async function deleteFromFirestore(
  collectionName: string,
  docId: string
): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${docId}`);
    return false;
  }
}

/**
 * Universal Update Listing Function
 */
export async function updateInFirestore(
  collectionName: string,
  docId: string,
  updates: Record<string, any>
): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${docId}`);
    return false;
  }
}

/**
 * Save Feed Product to Firestore
 */
export async function saveFeedProductToFirestore(product: Record<string, any>) {
  return publishToFirestore(EQUINE_COLLECTIONS.FEED_SUPPLIES, {
    ...product,
    inStock: product.inStock !== false,
    rating: product.rating || 5.0
  });
}

/**
 * Save Feed Order to Firestore
 */
export async function saveFeedOrderToFirestore(order: Record<string, any>) {
  return publishToFirestore(EQUINE_COLLECTIONS.FEED_ORDERS, {
    ...order,
    status: order.orderStatus || 'confirmed',
    createdAt: order.createdAt || new Date().toISOString()
  });
}

/**
 * Save Bulk Feed / Hay Haul Quote to Firestore
 */
export async function saveFeedBulkQuoteToFirestore(quote: Record<string, any>) {
  return publishToFirestore(EQUINE_COLLECTIONS.FEED_BULK_QUOTES, {
    ...quote,
    status: 'submitted',
    createdAt: new Date().toISOString()
  });
}

/**
 * Save Marketplace Listing to Firestore
 */
export async function saveMarketplaceListingToFirestore(listing: Record<string, any>) {
  return publishToFirestore(EQUINE_COLLECTIONS.MARKETPLACE, {
    ...listing,
    sellerRating: listing.sellerRating || 5.0,
    sellerVerified: listing.sellerVerified ?? true,
    createdAt: listing.createdAt || new Date().toISOString()
  });
}

/**
 * Save Marketplace Inquiry / Offer to Firestore
 */
export async function saveMarketplaceInquiryToFirestore(inquiry: Record<string, any>) {
  return publishToFirestore(EQUINE_COLLECTIONS.MARKETPLACE_INQUIRIES, {
    ...inquiry,
    status: 'pending',
    createdAt: new Date().toISOString()
  });
}

/**
 * Save Marketplace Escrow Transaction to Firestore
 */
export async function saveMarketplaceEscrowToFirestore(escrow: Record<string, any>) {
  return publishToFirestore(EQUINE_COLLECTIONS.MARKETPLACE_ESCROW, {
    ...escrow,
    escrowStatus: 'deposit_held',
    termsAgreed: true,
    createdAt: new Date().toISOString()
  });
}

