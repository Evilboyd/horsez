import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Tag, 
  Search, 
  Plus, 
  ShieldCheck, 
  DollarSign, 
  Heart, 
  MessageSquare, 
  Sparkles, 
  Filter,
  CheckCircle2,
  AlertCircle,
  Video,
  Truck,
  Layers,
  MapPin,
  Star,
  ChevronRight,
  ChevronLeft,
  BadgeCheck,
  Shield,
  Info,
  Camera,
  Upload,
  Image as ImageIcon,
  Trash2,
  Phone,
  Mail,
  ExternalLink,
  Database,
  Check,
  X,
  SlidersHorizontal
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MOCK_MARKETPLACE_LISTINGS } from '../../data/mockData';
import { MarketplaceListing, MarketplaceInquiry, MarketplaceEscrow } from '../../types';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, addDoc, query, orderBy } from 'firebase/firestore';
import { 
  EQUINE_COLLECTIONS, 
  saveMarketplaceInquiryToFirestore, 
  saveMarketplaceEscrowToFirestore, 
  saveMarketplaceListingToFirestore, 
  deleteFromFirestore,
  subscribeToFirestoreCollection 
} from '../../lib/equineDataService';

// Preset category photo packs for quick testing & instant selection
const CATEGORY_IMAGE_PRESETS: Record<string, { label: string; url: string }[]> = {
  trailers: [
    {
      label: 'Featherlite 2-Horse Bumper Pull',
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Horse_trailer.jpg/800px-Horse_trailer.jpg'
    },
    {
      label: 'Open Rear Ramp & Stall Floor Mats',
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Horse_trailer_with_doors_open.jpg/800px-Horse_trailer_with_doors_open.jpg'
    },
    {
      label: '4-Horse Slant Gooseneck Show Rig',
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Horse_trailer_at_Fair.JPG/800px-Horse_trailer_at_Fair.JPG'
    },
    {
      label: 'Böckmann Comfort Warmblood Deluxe',
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Pferdeanh%C3%A4nger_B%C3%B6ckmann_Comfort.jpg/800px-Pferdeanh%C3%A4nger_B%C3%B6ckmann_Comfort.jpg'
    },
    {
      label: 'Cheval Liberté Pullman Suspension',
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Cheval_Liberte_Gold_One_Pullman_V2.jpg/800px-Cheval_Liberte_Gold_One_Pullman_V2.jpg'
    },
    {
      label: 'Equi-Trek Living Quarters Luxury Rig',
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Equi-Trek_Star-Treka.jpg/800px-Equi-Trek_Star-Treka.jpg'
    },
    {
      label: 'Ifor Williams Heavy-Duty Horsebox',
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Ifor_Williams_horsebox.jpg/800px-Ifor_Williams_horsebox.jpg'
    },
    {
      label: 'Heavy-Duty Aluminum Combo Gooseneck',
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/BigComboTrailer.jpg/800px-BigComboTrailer.jpg'
    }
  ],
  tack: [
    {
      label: 'CWD 2Gs Close Contact Saddle',
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/JumpSaddle2.jpg/800px-JumpSaddle2.jpg'
    },
    {
      label: 'Devoucoux Makila Dressage Saddle',
      url: 'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?auto=format&fit=crop&q=80&w=800'
    },
    {
      label: 'Antarès Custom Hunter Bridle',
      url: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=800'
    },
    {
      label: 'Western Reining Silver Saddle',
      url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&q=80&w=800'
    }
  ],
  horses: [
    {
      label: 'Dutch Warmblood Hunter/Jumper',
      url: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=800'
    },
    {
      label: 'Holsteiner Grand Prix Gelding',
      url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800'
    },
    {
      label: 'AQHA Reining & Ranch Champion',
      url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&q=80&w=800'
    },
    {
      label: 'Connemara Eventing Pony',
      url: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&q=80&w=800'
    }
  ],
  gear: [
    {
      label: 'Equestrian Tack Trunk & Grooming Pack',
      url: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?auto=format&fit=crop&q=80&w=800'
    },
    {
      label: 'Equine Polar Heart Monitor & GPS',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800'
    },
    {
      label: 'Rambo Waterproof Winter Turnout Blankets',
      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800'
    },
    {
      label: 'Arena Drag & Groomer Attachment',
      url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800'
    }
  ],
  apparel: [
    {
      label: 'Samshield Crystal Leaf Riding Helmet',
      url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800'
    },
    {
      label: 'Parlanti Dressage & Jumper Custom Boots',
      url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800'
    },
    {
      label: 'Cavalleria Toscana Show Coat',
      url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800'
    },
    {
      label: 'Pikeur Full-Grip Competition Breeches',
      url: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&q=80&w=800'
    }
  ]
};

export const BuySellView: React.FC = () => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { userProfile } = useAuth();

  // Firestore real-time state + mock listings
  const [firestoreListings, setFirestoreListings] = useState<MarketplaceListing[]>([]);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);

  // Search & Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MarketplaceListing | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Price Range Slider Filter States
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(100000);
  const [minPriceFilter, setMinPriceFilter] = useState<number>(0);
  const [isPriceFilterActive, setIsPriceFilterActive] = useState<boolean>(false);
  const [showPriceSlider, setShowPriceSlider] = useState<boolean>(true);

  // New Listing Highlight & Success Notification
  const [publishedToast, setPublishedToast] = useState<{ id: string; title: string; price: number; category: string } | null>(null);
  const [highlightedListingId, setHighlightedListingId] = useState<string | null>(null);

  // Create Listing Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState<'trailers' | 'tack' | 'horses' | 'gear' | 'apparel'>('trailers');
  const [newCondition, setNewCondition] = useState('Excellent Used');
  const [newLocation, setNewLocation] = useState('Santa Rosa, CA');
  const [newAddress, setNewAddress] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newBreed, setNewBreed] = useState('');
  const [newDiscipline, setNewDiscipline] = useState('');
  const [newAgeYears, setNewAgeYears] = useState('');
  const [newSellerName, setNewSellerName] = useState(userProfile?.fullName || 'Verified Member');
  const [newSellerPhone, setNewSellerPhone] = useState(userProfile?.phone || '');
  const [newSellerEmail, setNewSellerEmail] = useState(userProfile?.email || '');

  // Picture Field & Upload States
  const [listingImages, setListingImages] = useState<string[]>([
    CATEGORY_IMAGE_PRESETS['trailers'][0].url
  ]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Publishing / Status Feedback
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatusMsg, setPublishStatusMsg] = useState('');
  const [publishError, setPublishError] = useState('');

  // Real-time Inquiries and Escrow from Firestore
  const [inquiries, setInquiries] = useState<MarketplaceInquiry[]>([]);
  const [escrows, setEscrows] = useState<MarketplaceEscrow[]>([]);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [showEscrowModal, setShowEscrowModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityTab, setActivityTab] = useState<'escrow' | 'inquiries'>('escrow');

  // Inquiry form
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryOffer, setInquiryOffer] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [isInquirySubmitting, setIsInquirySubmitting] = useState(false);

  // Escrow form
  const [escrowDepositType, setEscrowDepositType] = useState<'10%' | '100%'>('10%');
  const [escrowCustomDeposit, setEscrowCustomDeposit] = useState('');
  const [escrowInspectionDays, setEscrowInspectionDays] = useState(7);
  const [escrowBuyerName, setEscrowBuyerName] = useState('');
  const [escrowBuyerEmail, setEscrowBuyerEmail] = useState('');
  const [escrowBuyerPhone, setEscrowBuyerPhone] = useState('');
  const [isEscrowSubmitting, setIsEscrowSubmitting] = useState(false);

  // Catalog Sync State
  const [isSyncingCatalog, setIsSyncingCatalog] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // 1. Subscribe to Firestore `marketplaceListings` in real-time
  useEffect(() => {
    setIsFirebaseLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, 'marketplaceListings'),
      (snapshot) => {
        const loaded: MarketplaceListing[] = [];
        snapshot.forEach((doc) => {
          const d = doc.data();
          loaded.push({
            id: doc.id,
            title: d.title || 'Equine Listing',
            price: Number(d.price) || 0,
            category: d.category || 'tack',
            location: d.location || 'California',
            address: d.address || '',
            images: Array.isArray(d.images) && d.images.length > 0 
              ? d.images 
              : [CATEGORY_IMAGE_PRESETS['trailers'][0].url],
            sellerName: d.sellerName || 'Verified Member',
            sellerAvatar: d.sellerAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
            sellerRating: d.sellerRating || 5.0,
            sellerVerified: d.sellerVerified !== undefined ? d.sellerVerified : true,
            sellerPhone: d.sellerPhone || '',
            sellerEmail: d.sellerEmail || '',
            condition: d.condition || 'Excellent',
            breed: d.breed || undefined,
            discipline: d.discipline || undefined,
            ageYears: d.ageYears ? Number(d.ageYears) : undefined,
            description: d.description || '',
            createdAt: d.createdAt || 'Just now',
            isFirebase: true
          });
        });
        setFirestoreListings(loaded);
        setIsFirebaseLoading(false);
      },
      (error) => {
        console.error('Error fetching marketplace listings from Firestore:', error);
        setIsFirebaseLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Subscribe to Firestore `marketplaceInquiries` & `marketplaceEscrow`
  useEffect(() => {
    const unsubInquiries = subscribeToFirestoreCollection(
      EQUINE_COLLECTIONS.MARKETPLACE_INQUIRIES,
      (data) => setInquiries(data as MarketplaceInquiry[])
    );
    const unsubEscrow = subscribeToFirestoreCollection(
      EQUINE_COLLECTIONS.MARKETPLACE_ESCROW,
      (data) => setEscrows(data as MarketplaceEscrow[])
    );
    return () => {
      unsubInquiries();
      unsubEscrow();
    };
  }, []);

  // Update seller default name when userProfile loads
  useEffect(() => {
    if (userProfile?.fullName && newSellerName === 'Verified Member') {
      setNewSellerName(userProfile.fullName);
    }
    if (userProfile?.phone && !newSellerPhone) {
      setNewSellerPhone(userProfile.phone);
    }
    if (userProfile?.email && !newSellerEmail) {
      setNewSellerEmail(userProfile.email);
    }
  }, [userProfile]);

  // Combine Firestore listings + Mock listings (Firestore listings appear first)
  const allItems: MarketplaceListing[] = useMemo(() => {
    const combined = [...firestoreListings, ...MOCK_MARKETPLACE_LISTINGS];
    const seen = new Set<string>();
    return combined.filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [firestoreListings]);

  // Category counts
  const categoryCounts = useMemo(() => ({
    all: allItems.length,
    trailers: allItems.filter(i => i.category === 'trailers' || (i.category as any) === 'trailer').length,
    tack: allItems.filter(i => i.category === 'tack').length,
    horses: allItems.filter(i => i.category === 'horses' || (i.category as any) === 'horse').length,
    apparel: allItems.filter(i => i.category === 'apparel').length,
    gear: allItems.filter(i => i.category === 'gear').length,
  }), [allItems]);

  // Search & Filter (including Price Range Slider & Category Dropdown)
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return allItems.filter(i => {
      const matchesCat = 
        selectedCategory === 'all' || 
        i.category === selectedCategory ||
        (selectedCategory === 'horse' && (i.category === 'horses' || (i.category as any) === 'horse')) ||
        (selectedCategory === 'horses' && (i.category === 'horses' || (i.category as any) === 'horse')) ||
        (selectedCategory === 'trailer' && (i.category === 'trailers' || (i.category as any) === 'trailer')) ||
        (selectedCategory === 'trailers' && (i.category === 'trailers' || (i.category as any) === 'trailer'));

      if (!matchesCat) return false;

      // Price Range Filter
      if (isPriceFilterActive) {
        if (i.price < minPriceFilter) return false;
        if (maxPriceFilter < 100000 && i.price > maxPriceFilter) return false;
      }

      if (!q) return true;

      const matchTitle = i.title.toLowerCase().includes(q);
      const matchDesc = i.description.toLowerCase().includes(q);
      const matchLoc = i.location.toLowerCase().includes(q);
      const matchSeller = i.sellerName.toLowerCase().includes(q);
      const matchBreed = i.breed ? i.breed.toLowerCase().includes(q) : false;
      const matchDiscipline = i.discipline ? i.discipline.toLowerCase().includes(q) : false;
      const matchCondition = i.condition ? i.condition.toLowerCase().includes(q) : false;

      return matchTitle || matchDesc || matchLoc || matchSeller || matchBreed || matchDiscipline || matchCondition;
    });
  }, [allItems, selectedCategory, searchQuery, isPriceFilterActive, minPriceFilter, maxPriceFilter]);

  // Set quick price filter presets
  const applyPricePreset = (min: number, max: number) => {
    setMinPriceFilter(min);
    setMaxPriceFilter(max);
    setIsPriceFilterActive(true);
  };

  const resetPriceFilter = () => {
    setMinPriceFilter(0);
    setMaxPriceFilter(100000);
    setIsPriceFilterActive(false);
  };

  // Handle Photo File Upload (via input or drag-drop)
  const processImageFiles = (files: FileList | File[]) => {
    const newImgs: string[] = [];
    const fileArray = Array.from(files);

    if (fileArray.length === 0) return;

    let processedCount = 0;
    fileArray.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        processedCount++;
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          newImgs.push(reader.result);
        }
        processedCount++;
        if (processedCount === fileArray.length) {
          if (newImgs.length > 0) {
            setListingImages(prev => [...prev, ...newImgs]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processImageFiles(e.target.files);
    }
  };

  const handleDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files) {
      processImageFiles(e.dataTransfer.files);
    }
  };

  const handleAddImageUrl = () => {
    const trimmed = customImageUrl.trim();
    if (trimmed) {
      setListingImages(prev => [...prev, trimmed]);
      setCustomImageUrl('');
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    if (listingImages.length <= 1) {
      alert('A listing requires at least one picture.');
      return;
    }
    setListingImages(listingImages.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    const target = listingImages[index];
    const rest = listingImages.filter((_, idx) => idx !== index);
    setListingImages([target, ...rest]);
  };

  // Change category handler: updates default preset if only 1 default image exists
  const handleCategoryChange = (cat: 'trailers' | 'tack' | 'horses' | 'gear' | 'apparel') => {
    setNewCategory(cat);
    // If the user has only 1 image and it's from presets, auto-switch to new category default preset
    if (listingImages.length === 1 && CATEGORY_IMAGE_PRESETS[cat]) {
      setListingImages([CATEGORY_IMAGE_PRESETS[cat][0].url]);
    }
  };

  // Publish Listing to Firebase Firestore
  const handlePublishListingToFirebase = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishError('');
    setPublishStatusMsg('');

    if (!newTitle.trim()) {
      setPublishError('Please enter a listing title.');
      return;
    }
    if (!newPrice || Number(newPrice) <= 0) {
      setPublishError('Please specify a valid listing price.');
      return;
    }
    if (listingImages.length === 0) {
      setPublishError('Please upload or select at least one picture for your listing.');
      return;
    }
    if (!newDesc.trim()) {
      setPublishError('Please provide an item description.');
      return;
    }

    setIsPublishing(true);
    setPublishStatusMsg('Uploading picture & publishing listing to Firebase...');

    try {
      const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      const newListingData = {
        title: newTitle.trim(),
        price: Number(newPrice),
        category: newCategory,
        location: newLocation.trim() || 'Santa Rosa, CA',
        address: newAddress.trim() || '',
        images: listingImages,
        condition: newCondition,
        sellerName: newSellerName.trim() || (userProfile?.fullName || 'Verified Member'),
        sellerAvatar: userProfile?.equineRole 
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300' 
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
        sellerRating: 5.0,
        sellerVerified: true,
        sellerPhone: newSellerPhone.trim() || '',
        sellerEmail: newSellerEmail.trim() || '',
        breed: newBreed.trim() || undefined,
        discipline: newDiscipline.trim() || undefined,
        ageYears: newAgeYears ? Number(newAgeYears) : undefined,
        description: newDesc.trim(),
        createdAt: nowStr
      };

      // Save into Firestore collection `marketplaceListings`
      const docRef = await addDoc(collection(db, 'marketplaceListings'), newListingData);

      const createdListing: MarketplaceListing = {
        id: docRef.id,
        ...newListingData,
        isFirebase: true
      };

      // Celebration effect
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.5 } });

      // Set success notification & highlight new item
      setPublishedToast({
        id: docRef.id,
        title: newListingData.title,
        price: newListingData.price,
        category: newListingData.category
      });
      setHighlightedListingId(docRef.id);

      // Make sure the active category and price filter display the new listing
      setSelectedCategory(newCategory);
      if (isPriceFilterActive && (newListingData.price < minPriceFilter || (maxPriceFilter < 100000 && newListingData.price > maxPriceFilter))) {
        setIsPriceFilterActive(false);
      }

      // Close modal and return directly to listings
      setShowCreateModal(false);

      // Reset form states for next use
      setNewTitle('');
      setNewPrice('');
      setNewDesc('');
      setNewBreed('');
      setNewDiscipline('');
      setNewAgeYears('');
      setListingImages([CATEGORY_IMAGE_PRESETS['trailers'][0].url]);
      setPublishStatusMsg('');

      // Auto-clear highlight after 10 seconds
      setTimeout(() => {
        setHighlightedListingId(null);
      }, 10000);

    } catch (err: any) {
      console.error('Error publishing listing to Firebase:', err);
      setPublishError(err.message || 'Failed to save listing in Firebase. Please check connection.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Sync Default Marketplace Catalog to Firestore
  const handleSyncCatalogToFirestore = async () => {
    setIsSyncingCatalog(true);
    setSyncMessage('Syncing verified marketplace catalog to Firebase Firestore database...');
    try {
      let count = 0;
      for (const item of MOCK_MARKETPLACE_LISTINGS) {
        const exists = firestoreListings.some(l => l.id === item.id || l.title.toLowerCase() === item.title.toLowerCase());
        if (!exists) {
          await saveMarketplaceListingToFirestore({
            ...item,
            isFirebase: true,
            createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          });
          count++;
        }
      }
      confetti({ particleCount: 75, spread: 60 });
      setSyncMessage(count > 0 ? `Saved ${count} marketplace listings to Firestore!` : 'Marketplace catalog already in Firestore!');
      setTimeout(() => setSyncMessage(null), 3500);
    } catch (err: any) {
      console.error('Failed to sync marketplace catalog:', err);
      setSyncMessage('Sync note: check Firebase connection');
      setTimeout(() => setSyncMessage(null), 2500);
    } finally {
      setIsSyncingCatalog(false);
    }
  };

  // Open Message / Make Offer Modal
  const handleOpenInquiry = (item: MarketplaceListing) => {
    setSelectedItem(item);
    setInquiryName(userProfile?.fullName || 'Prospective Buyer');
    setInquiryEmail(userProfile?.email || '');
    setInquiryPhone(userProfile?.phone || '');
    setInquiryOffer(item.price ? String(Math.round(item.price * 0.95)) : '');
    setInquiryMessage(`Hi ${item.sellerName}, I am interested in purchasing your ${item.title}. Can we discuss availability and arrange a PPE inspection?`);
    setShowInquiryModal(true);
  };

  // Submit Inquiry / Offer to Firestore
  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setIsInquirySubmitting(true);
    try {
      await saveMarketplaceInquiryToFirestore({
        listingId: selectedItem.id,
        listingTitle: selectedItem.title,
        listingCategory: selectedItem.category,
        listingPrice: selectedItem.price,
        sellerName: selectedItem.sellerName,
        sellerEmail: selectedItem.sellerEmail || '',
        buyerId: userProfile?.uid || undefined,
        buyerName: inquiryName.trim() || (userProfile?.fullName || 'Prospective Buyer'),
        buyerEmail: inquiryEmail.trim() || (userProfile?.email || ''),
        buyerPhone: inquiryPhone.trim() || (userProfile?.phone || ''),
        offerAmount: Number(inquiryOffer) || selectedItem.price,
        message: inquiryMessage.trim() || 'Interested in this listing.',
        status: 'pending'
      });
      confetti({ particleCount: 70, spread: 60 });
      setShowInquiryModal(false);
      setSelectedItem(null);
      alert(`Your inquiry & offer of $${(Number(inquiryOffer) || selectedItem.price).toLocaleString()} has been sent to ${selectedItem.sellerName} and recorded in Firebase Firestore!`);
    } catch (err: any) {
      console.error('Inquiry submit error:', err);
      alert('Could not save inquiry to Firebase.');
    } finally {
      setIsInquirySubmitting(false);
    }
  };

  // Open Escrow Deposit Modal
  const handleOpenEscrow = (item: MarketplaceListing) => {
    setSelectedItem(item);
    setEscrowBuyerName(userProfile?.fullName || 'Equestrian Buyer');
    setEscrowBuyerEmail(userProfile?.email || '');
    setEscrowBuyerPhone(userProfile?.phone || '');
    setEscrowDepositType('10%');
    setEscrowCustomDeposit(String(Math.round(item.price * 0.1)));
    setEscrowInspectionDays(7);
    setShowEscrowModal(true);
  };

  // Submit Escrow Deposit to Firestore
  const handleSubmitEscrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setIsEscrowSubmitting(true);
    try {
      const depAmount = Number(escrowCustomDeposit) || Math.round(selectedItem.price * 0.1);
      const escrowRef = `ESC-HZ-${Math.floor(100000 + Math.random() * 900000)}`;
      await saveMarketplaceEscrowToFirestore({
        escrowNumber: escrowRef,
        listingId: selectedItem.id,
        listingTitle: selectedItem.title,
        listingPrice: selectedItem.price,
        depositAmount: depAmount,
        buyerId: userProfile?.uid || undefined,
        buyerName: escrowBuyerName.trim() || (userProfile?.fullName || 'Equestrian Buyer'),
        buyerEmail: escrowBuyerEmail.trim() || (userProfile?.email || ''),
        buyerPhone: escrowBuyerPhone.trim() || (userProfile?.phone || ''),
        sellerName: selectedItem.sellerName,
        ppeInspectionDays: escrowInspectionDays,
        escrowStatus: 'deposit_held',
        termsAgreed: true
      });
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
      setShowEscrowModal(false);
      setSelectedItem(null);
      alert(`horsez Escrow Deposit confirmed! Ref: ${escrowRef}. Deposit of $${depAmount.toLocaleString()} is securely held in Firestore under our ${escrowInspectionDays}-day Pre-Purchase Exam (PPE) inspection guarantee.`);
    } catch (err: any) {
      console.error('Escrow submit error:', err);
      alert('Could not save escrow transaction to Firebase.');
    } finally {
      setIsEscrowSubmitting(false);
    }
  };

  // Delete Listing from Firestore
  const handleDeleteListing = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this listing from Firebase Firestore database?')) {
      await deleteFromFirestore(EQUINE_COLLECTIONS.MARKETPLACE, id);
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-10 space-y-6 font-sans">
      
      {/* Top Banner Header */}
      <div className="bg-[#095DE3] text-white p-4 sm:p-5 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-blue-400/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-md">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black uppercase tracking-wide text-white">
                BUY & SELL MARKETPLACE
              </h1>
              <span className="bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Database className="w-3 h-3 text-emerald-300" />
                <span>Firestore Live</span>
              </span>
            </div>
            <p className="text-xs text-sky-100 mt-0.5">
              Verified trailers, saddles, horses &amp; gear with Escrow Buyer Protection &amp; Firebase Database
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleSyncCatalogToFirestore}
            disabled={isSyncingCatalog}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs px-3 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            title="Save default verified marketplace items to Firebase Firestore"
          >
            <Database className={`w-4 h-4 text-emerald-300 ${isSyncingCatalog ? 'animate-spin' : ''}`} />
            <span>{isSyncingCatalog ? 'Saving...' : 'Sync to Firebase'}</span>
          </button>

          <button
            onClick={() => setShowActivityModal(true)}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer relative"
            title="View active Escrow contracts and buyer inquiries in Firestore"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Escrow &amp; Offers</span>
            {(escrows.length > 0 || inquiries.length > 0) && (
              <span className="bg-emerald-400 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full">
                {escrows.length + inquiries.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-lg transition-transform hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Listing</span>
          </button>
        </div>
      </div>

      {/* Database Sync Feedback Banner */}
      {syncMessage && (
        <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-between gap-2 shadow-md animate-in fade-in">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-200 animate-pulse" />
            <span>{syncMessage}</span>
          </div>
          <button onClick={() => setSyncMessage(null)} className="text-white/80 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Firebase Database Status Bar */}
      <div className="bg-slate-900 text-slate-200 px-4 py-2 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2 shadow-sm border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-white">Firebase Firestore Connected</span>
          <span className="text-slate-400 hidden sm:inline">•</span>
          <span className="text-slate-300 text-[11px] font-mono">
            Collections: <span className="text-orange-400 font-bold">marketplaceListings</span> ({allItems.length}), <span className="text-emerald-400 font-bold">marketplaceEscrow</span> ({escrows.length}), <span className="text-sky-400 font-bold">marketplaceInquiries</span> ({inquiries.length})
          </span>
        </div>
        <div className="text-[11px] text-slate-400">
          {firestoreListings.length > 0 ? (
            <span className="text-emerald-400 font-medium">✓ {firestoreListings.length} custom listings in Firestore</span>
          ) : (
            <span>Ready for real-time buyer offers &amp; escrow</span>
          )}
        </div>
      </div>

      {/* Published Success Toast / Banner */}
      {publishedToast && (
        <div className="bg-emerald-500 text-slate-950 p-4 rounded-2xl shadow-lg border-2 border-emerald-400 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-950 text-emerald-400 flex items-center justify-center font-black shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider bg-slate-950 text-white px-2 py-0.5 rounded-md">
                  Published to Firestore
                </span>
                <span className="text-xs font-black">Listing is Now Live!</span>
              </div>
              <p className="text-xs font-bold text-slate-900 mt-0.5">
                "{publishedToast.title}" listed for ${publishedToast.price.toLocaleString()} in {publishedToast.category}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const found = allItems.find(i => i.id === publishedToast.id);
                if (found) {
                  setSelectedItem(found);
                  setActiveImageIndex(0);
                }
              }}
              className="bg-slate-950 hover:bg-slate-900 text-white text-xs font-black px-3.5 py-1.5 rounded-xl cursor-pointer shadow-sm transition-all"
            >
              View Listing
            </button>
            <button
              onClick={() => setPublishedToast(null)}
              className="w-7 h-7 rounded-full bg-slate-900/10 hover:bg-slate-900/20 text-slate-950 font-black flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Search, Category Dropdown & Price Range Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3.5">
        
        {/* Search Input & Category Select Dropdown */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 25+ trailers, saddles, show coats, horses, bridles..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative min-w-[170px] sm:min-w-[190px]">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-900 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all cursor-pointer"
              >
                <option value="all">📁 All Categories ({categoryCounts.all})</option>
                <option value="trailers">🚛 Horse Trailers ({categoryCounts.trailers})</option>
                <option value="tack">🏇 Tack & Saddles ({categoryCounts.tack})</option>
                <option value="horses">🐴 Horses & Ponies ({categoryCounts.horses})</option>
                <option value="apparel">👗 Riding Apparel ({categoryCounts.apparel})</option>
                <option value="gear">⚙️ Gear & Tech ({categoryCounts.gear})</option>
              </select>
            </div>

            {/* Price Filter Toggle Button */}
            <button
              onClick={() => setShowPriceSlider(prev => !prev)}
              className={`px-3 py-2.5 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                isPriceFilterActive 
                  ? 'bg-orange-50 border-orange-500 text-orange-950 ring-2 ring-orange-200'
                  : showPriceSlider
                    ? 'bg-slate-100 border-slate-300 text-slate-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title="Filter by Price Range"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-orange-600" />
              <span className="hidden sm:inline">Price Filter</span>
              {isPriceFilterActive && (
                <span className="w-2 h-2 rounded-full bg-orange-600"></span>
              )}
            </button>
          </div>
        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              selectedCategory === 'all' 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>All Listings</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
              {categoryCounts.all}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('trailers')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              selectedCategory === 'trailers' || selectedCategory === 'trailer'
                ? 'bg-slate-800 text-white shadow-md' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>🚛 Trailers</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === 'trailers' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
              {categoryCounts.trailers}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('tack')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              selectedCategory === 'tack'
                ? 'bg-amber-600 text-white shadow-md' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>🏇 Tack</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === 'tack' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
              {categoryCounts.tack}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('horses')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              selectedCategory === 'horses' || selectedCategory === 'horse'
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>🐴 Horses</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === 'horses' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
              {categoryCounts.horses}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('apparel')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              selectedCategory === 'apparel'
                ? 'bg-rose-600 text-white shadow-md' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>👗 Apparel</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === 'apparel' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
              {categoryCounts.apparel}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('gear')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              selectedCategory === 'gear'
                ? 'bg-purple-600 text-white shadow-md' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>⚙️ Gear</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === 'gear' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
              {categoryCounts.gear}
            </span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* PRICE RANGE SLIDER & PRESET FILTER CONTROLS */}
        {/* ========================================================= */}
        {showPriceSlider && (
          <div className="pt-3 border-t border-slate-100 bg-slate-50/80 -mx-4 -mb-4 p-4 rounded-b-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-orange-600 shrink-0" />
                <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                  Price Range Filter
                </span>
                <span className="bg-orange-100 text-orange-950 text-[11px] font-black px-2.5 py-0.5 rounded-lg border border-orange-200">
                  ${minPriceFilter.toLocaleString()} – {maxPriceFilter >= 100000 ? 'Any ($100k+)' : `$${maxPriceFilter.toLocaleString()}`}
                </span>
              </div>

              {isPriceFilterActive && (
                <button
                  onClick={resetPriceFilter}
                  className="text-xs font-bold text-slate-500 hover:text-slate-900 underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                >
                  <X className="w-3 h-3" />
                  Reset Price
                </button>
              )}
            </div>

            {/* Range Slider Track */}
            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max="100000"
                step="500"
                value={maxPriceFilter}
                onChange={(e) => {
                  setMaxPriceFilter(Number(e.target.value));
                  setIsPriceFilterActive(true);
                }}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>$0</span>
                <span>$25k</span>
                <span>$50k</span>
                <span>$75k</span>
                <span>$100k+</span>
              </div>
            </div>

            {/* Quick Price Preset Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 mr-1">Quick:</span>
              {[
                { label: 'All Prices', min: 0, max: 100000, active: !isPriceFilterActive },
                { label: 'Under $1,000', min: 0, max: 1000, active: isPriceFilterActive && minPriceFilter === 0 && maxPriceFilter === 1000 },
                { label: '$1k – $10k', min: 1000, max: 10000, active: isPriceFilterActive && minPriceFilter === 1000 && maxPriceFilter === 10000 },
                { label: '$10k – $30k', min: 10000, max: 30000, active: isPriceFilterActive && minPriceFilter === 10000 && maxPriceFilter === 30000 },
                { label: '$30k – $75k', min: 30000, max: 75000, active: isPriceFilterActive && minPriceFilter === 30000 && maxPriceFilter === 75000 },
                { label: '$75,000+', min: 75000, max: 100000, active: isPriceFilterActive && minPriceFilter === 75000 }
              ].map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (preset.min === 0 && preset.max === 100000) {
                      resetPriceFilter();
                    } else {
                      applyPricePreset(preset.min, preset.max);
                    }
                  }}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    preset.active
                      ? 'bg-orange-500 text-slate-950 font-black shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Escrow Guarantee Banner */}
      <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-sky-900 shadow-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0" />
          <span className="font-medium">
            <strong className="font-extrabold text-sky-950">horsez Escrow Buyer Protection:</strong> Funds held securely until Pre-Purchase Exam (PPE), trailer mechanical inspection, or trial period is completed.
          </span>
        </div>
        <span className="text-[10px] bg-sky-200 text-sky-950 font-black px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 self-start sm:self-auto">
          100% Verified Escrow
        </span>
      </div>

      {/* Empty Search State */}
      {filteredItems.length === 0 && (
        <div className="p-10 text-center bg-white rounded-3xl border border-slate-200 space-y-3 shadow-sm">
          <Tag className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-black text-slate-800">No listings found matching your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords, clearing price range limits, or publish a new listing!
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); resetPriceFilter(); }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              Publish New Listing
            </button>
          </div>
        </div>
      )}

      {/* Marketplace Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const isHighlighted = highlightedListingId === item.id;

          return (
            <div
              key={item.id}
              onClick={() => {
                setSelectedItem(item);
                setActiveImageIndex(0);
              }}
              className={`bg-white rounded-2xl p-3.5 shadow-sm border transition-all cursor-pointer flex flex-col justify-between group ${
                isHighlighted
                  ? 'border-emerald-500 ring-2 ring-emerald-300 shadow-lg scale-[1.01]'
                  : 'border-slate-200 hover:border-orange-400 hover:shadow-md'
              }`}
            >
              <div className="space-y-2.5">
                {/* Photo & Top Badges */}
                <div className="relative h-48 rounded-xl overflow-hidden bg-slate-100">
                  <img 
                    src={item.images[0] || 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Horse_trailer.jpg/800px-Horse_trailer.jpg'} 
                    alt={item.title} 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = item.category === 'trailers' 
                        ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Horse_trailer.jpg/800px-Horse_trailer.jpg'
                        : 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=800';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  
                  {/* Firebase DB Badge or Featured Tag */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                    {item.isFirebase && (
                      <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-md uppercase tracking-wider flex items-center gap-1">
                        <Database className="w-2.5 h-2.5" />
                        Firestore Live
                      </span>
                    )}
                    {item.featured && (
                      <span className="bg-amber-400 text-amber-950 text-[9px] font-black px-2 py-0.5 rounded-md shadow uppercase tracking-wider flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" />
                        Featured
                      </span>
                    )}
                  </div>
                  
                  {/* Favorite & Price Overlay */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    {item.isFirebase && (
                      <button
                        onClick={(e) => handleDeleteListing(item.id, e)}
                        className="p-2 rounded-full shadow-md bg-white/90 backdrop-blur-sm text-red-600 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                        title="Delete listing from Firebase Firestore"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite({
                          id: item.id,
                          category: 'buy-sell',
                          title: item.title,
                          subtitle: `${item.location} • Seller: ${item.sellerName}`,
                          price: item.price,
                          image: item.images[0],
                          location: item.location
                        });
                      }}
                      className={`p-2 rounded-full shadow-md transition-transform hover:scale-110 cursor-pointer ${
                        isFavorite(item.id) 
                          ? 'bg-rose-500 text-white' 
                          : 'bg-white/90 backdrop-blur-sm text-slate-700 hover:text-rose-500 hover:bg-white'
                      }`}
                      title={isFavorite(item.id) ? 'Remove from favorites' : 'Save to favorites'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFavorite(item.id) ? 'fill-white' : ''}`} />
                    </button>

                    <span className="bg-slate-900/90 backdrop-blur-sm text-white font-black text-xs px-3 py-1.5 rounded-full shadow-md border border-slate-700">
                      ${item.price.toLocaleString()}
                    </span>
                  </div>

                  {/* Photo count indicator if multiple */}
                  {item.images.length > 1 && (
                    <span className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      <span>{item.images.length} photos</span>
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-extrabold text-xs text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-tight">
                    {item.title}
                  </h3>

                  {/* Discipline / Breed / Condition Badges */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {item.condition && (
                      <span className="bg-slate-100 text-slate-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-slate-200">
                        {item.condition}
                      </span>
                    )}
                    {item.breed && (
                      <span className="bg-emerald-50 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-emerald-200">
                        {item.breed}
                      </span>
                    )}
                    {item.discipline && (
                      <span className="bg-sky-50 text-sky-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-sky-200">
                        {item.discipline}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Card Footer: Location & Seller */}
              <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span className="text-slate-500 font-semibold flex items-center gap-1 truncate max-w-[50%]">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{item.location}</span>
                </span>
                
                <div className="flex items-center gap-1 font-bold text-slate-800 shrink-0">
                  <span>{item.sellerName}</span>
                  {item.sellerVerified && <BadgeCheck className="w-3.5 h-3.5 text-teal-600" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                {selectedItem.isFirebase && (
                  <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1">
                    <Database className="w-3 h-3 text-emerald-700" />
                    Firestore Live Listing
                  </span>
                )}
                {selectedItem.featured && (
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded">
                    ★ FEATURED
                  </span>
                )}
              </div>
              <button 
                onClick={() => setSelectedItem(null)} 
                className="text-slate-400 hover:text-slate-700 font-black text-sm w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Main Photo Gallery */}
            <div className="space-y-2">
              <div className="relative h-60 sm:h-72 rounded-2xl overflow-hidden bg-slate-100 shadow-inner group">
                <img 
                  src={selectedItem.images[activeImageIndex] || selectedItem.images[0]} 
                  alt={selectedItem.title} 
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = selectedItem.category === 'trailers'
                      ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Horse_trailer.jpg/800px-Horse_trailer.jpg'
                      : 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=800';
                  }}
                  className="w-full h-full object-cover transition-all duration-300" 
                />

                {/* Left/Right Navigation Arrows for Multi-Photo Listings */}
                {selectedItem.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev === 0 ? selectedItem.images.length - 1 : prev - 1));
                      }}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-transform hover:scale-110 shadow-md cursor-pointer"
                      title="Previous picture"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev === selectedItem.images.length - 1 ? 0 : prev + 1));
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-transform hover:scale-110 shadow-md cursor-pointer"
                      title="Next picture"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Price badge */}
                <span className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-sm text-white font-black text-base px-3.5 py-1.5 rounded-full shadow-lg border border-slate-700">
                  ${selectedItem.price.toLocaleString()}
                </span>

                {/* Location & Photo Counter badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow">
                    📍 {selectedItem.location}
                  </span>
                  {selectedItem.images.length > 1 && (
                    <span className="bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md shadow flex items-center gap-1">
                      <Camera className="w-3 h-3 text-orange-400" />
                      <span>{activeImageIndex + 1} of {selectedItem.images.length}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Photo Thumbnails if multiple */}
              {selectedItem.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {selectedItem.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                        activeImageIndex === idx ? 'border-orange-500 scale-105 shadow-sm ring-2 ring-orange-200' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img 
                        src={img} 
                        alt="" 
                        referrerPolicy="no-referrer" 
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Horse_trailer.jpg/800px-Horse_trailer.jpg';
                        }}
                        className="w-full h-full object-cover" 
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Info */}
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                {selectedItem.title}
              </h2>
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <span>Posted {selectedItem.createdAt} in {selectedItem.location}</span>
                {selectedItem.condition && (
                  <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.2 rounded text-[10px]">
                    Condition: {selectedItem.condition}
                  </span>
                )}
              </p>
            </div>

            {/* Equine Specific Badges */}
            {(selectedItem.breed || selectedItem.discipline || selectedItem.ageYears) && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
                {selectedItem.breed && (
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Breed</span>
                    <strong className="text-slate-800 font-extrabold text-[11px] truncate block">{selectedItem.breed}</strong>
                  </div>
                )}
                {selectedItem.ageYears && (
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Age</span>
                    <strong className="text-slate-800 font-extrabold text-[11px] block">{selectedItem.ageYears} Years Old</strong>
                  </div>
                )}
                {selectedItem.discipline && (
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Discipline</span>
                    <strong className="text-slate-800 font-extrabold text-[11px] truncate block">{selectedItem.discipline}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Full Description */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">Item Details</h4>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100 whitespace-pre-line">
                {selectedItem.description}
              </p>
            </div>

            {/* Seller & Escrow Card */}
            <div className="bg-sky-50 p-3.5 rounded-2xl border border-sky-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={selectedItem.sellerAvatar} alt={selectedItem.sellerName} className="w-10 h-10 rounded-full object-cover ring-2 ring-sky-300" />
                <div>
                  <div className="flex items-center gap-1 font-black text-slate-900">
                    <span>{selectedItem.sellerName}</span>
                    {selectedItem.sellerVerified && <BadgeCheck className="w-3.5 h-3.5 text-teal-600" />}
                  </div>
                  <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>{selectedItem.sellerRating} Seller Rating • Verified Member</span>
                  </span>
                  {selectedItem.sellerPhone && (
                    <div className="text-[10px] text-slate-600 font-medium flex items-center gap-1 mt-0.5">
                      <Phone className="w-2.5 h-2.5 text-slate-400" />
                      <span>{selectedItem.sellerPhone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] bg-sky-200 text-sky-950 font-black px-2 py-0.5 rounded uppercase">
                  PPE Escrow Protected
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleOpenInquiry(selectedItem)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs py-3 rounded-xl uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Send Message / Make Offer (Firebase)</span>
              </button>
              
              <button
                onClick={() => handleOpenEscrow(selectedItem)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-3 rounded-xl uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Deposit into Escrow (${selectedItem.price.toLocaleString()})</span>
              </button>

              {selectedItem.isFirebase && (
                <button
                  onClick={(e) => handleDeleteListing(selectedItem.id, e)}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Listing from Firestore</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* POST / PUBLISH LISTING MODAL (WITH PICTURE UPLOAD & FIREBASE PERSISTENCE) */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-7 shadow-2xl space-y-5 animate-in fade-in">
            
            {/* Modal Top Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">Publish Listing on horsez</h3>
                  <p className="text-[11px] text-slate-500">Saves to Firebase Firestore with Escrow Buyer Protection</p>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => setShowCreateModal(false)} 
                className="text-slate-400 hover:text-slate-700 font-black text-sm w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Notification & Status Messages */}
            {publishStatusMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-2xl text-xs font-black flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{publishStatusMsg}</span>
              </div>
            )}

            {publishError && (
              <div className="p-3.5 bg-rose-50 border border-rose-300 text-rose-900 rounded-2xl text-xs font-black flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{publishError}</span>
              </div>
            )}

            <form onSubmit={handlePublishListingToFirebase} className="space-y-4 text-xs font-sans">
              
              {/* Category Selector */}
              <div>
                <label className="block font-black text-slate-700 mb-1.5 text-[11px] uppercase tracking-wider">
                  Category *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'trailers', label: 'Trailers', icon: '🚛' },
                    { id: 'tack', label: 'Tack', icon: '🏇' },
                    { id: 'horses', label: 'Horses', icon: '🐴' },
                    { id: 'apparel', label: 'Apparel', icon: '👗' },
                    { id: 'gear', label: 'Gear', icon: '⚙️' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryChange(cat.id as any)}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        newCategory === cat.id
                          ? 'bg-orange-50 border-orange-500 text-orange-950 ring-2 ring-orange-500/20 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-base block mb-0.5">{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-black text-slate-700 mb-1 text-[11px]">
                    Listing Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. 2023 Featherlite 2-Horse Bumper Pull or CWD 2Gs 17.5 Saddle..."
                    className="w-full border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-black text-slate-700 mb-1 text-[11px]">
                    Price ($ USD) *
                  </label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                    <input
                      type="number"
                      required
                      min="1"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder="3500"
                      className="w-full border border-slate-300 pl-8 pr-3 py-2.5 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* ========================================================= */}
              {/* PICTURE FIELD WITH UPLOAD & MULTI-PHOTO GALLERY */}
              {/* ========================================================= */}
              <div className="bg-slate-50 border border-slate-300 p-4 rounded-2xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-orange-600" />
                    <span className="font-black text-slate-800 text-xs uppercase tracking-wider">
                      Listing Pictures & Photo Upload *
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">
                    {listingImages.length} Photo{listingImages.length === 1 ? '' : 's'} Selected
                  </span>
                </div>

                {/* Drag-and-Drop / File Upload Box */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
                  onDragLeave={() => setIsDraggingFile(false)}
                  onDrop={handleDropFile}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                    isDraggingFile 
                      ? 'border-orange-500 bg-orange-100/50 scale-[0.99]' 
                      : 'border-slate-300 hover:border-orange-400 bg-white'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="font-extrabold text-xs text-slate-800">
                      Click to upload photos or drag & drop files here
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Supports JPG, PNG, WEBP from your computer, phone, or stable camera
                    </p>
                  </div>
                </div>

                {/* Direct Image URL input */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="Or paste an image web URL (https://...)"
                    className="flex-1 border border-slate-300 px-3 py-2 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors shrink-0 cursor-pointer"
                  >
                    + Add URL
                  </button>
                </div>

                {/* Category Preset Quick Photos */}
                <div>
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1.5">
                    ⚡ Quick {newCategory.toUpperCase()} Photo Presets:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CATEGORY_IMAGE_PRESETS[newCategory]?.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (!listingImages.includes(preset.url)) {
                            setListingImages([...listingImages, preset.url]);
                          }
                        }}
                        className="group relative h-16 rounded-xl overflow-hidden border border-slate-200 hover:border-orange-500 transition-all text-left cursor-pointer"
                      >
                        <img src={preset.url} alt={preset.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-1.5">
                          <span className="text-[9px] font-bold text-white leading-tight truncate">
                            {preset.label}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Photo Thumbnails Gallery */}
                {listingImages.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">
                      Uploaded Photo Gallery (First photo is Primary Cover):
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                      {listingImages.map((img, idx) => (
                        <div key={idx} className="relative group h-20 rounded-xl overflow-hidden border-2 border-slate-300 bg-slate-200">
                          <img src={img} alt={`Listing photo ${idx + 1}`} className="w-full h-full object-cover" />
                          
                          {/* Primary Cover Badge */}
                          {idx === 0 ? (
                            <span className="absolute top-1 left-1 bg-orange-500 text-slate-950 text-[8px] font-black px-1.5 py-0.2 rounded shadow">
                              Cover
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(idx)}
                              className="absolute top-1 left-1 bg-slate-900/80 hover:bg-orange-500 text-white hover:text-slate-950 text-[8px] font-black px-1.5 py-0.2 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              Make Cover
                            </button>
                          )}

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow cursor-pointer transition-colors"
                            title="Remove picture"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Location & Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-700 mb-1 text-[11px]">
                    Location (City, State / ZIP) *
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                    <input
                      type="text"
                      required
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="e.g. Santa Rosa, CA 95404"
                      className="w-full border border-slate-300 pl-8 pr-3 py-2.5 rounded-xl font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-black text-slate-700 mb-1 text-[11px]">
                    Condition *
                  </label>
                  <select
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    className="w-full border border-slate-300 p-2.5 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50 focus:bg-white"
                  >
                    <option value="Brand New in Box">✨ Brand New / Mint</option>
                    <option value="Like New (Flawless)">⭐ Like New (Flawless)</option>
                    <option value="Excellent Used">🏆 Excellent Used</option>
                    <option value="Good Condition">👍 Good Condition</option>
                    <option value="Fair / Workhorse">🔨 Fair / Workhorse</option>
                  </select>
                </div>
              </div>

              {/* Optional Horse or Equine Specific Specs */}
              {newCategory === 'horses' && (
                <div className="grid grid-cols-3 gap-2.5 bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200">
                  <div>
                    <label className="block font-bold text-emerald-900 mb-1 text-[10px]">Breed</label>
                    <input
                      type="text"
                      value={newBreed}
                      onChange={(e) => setNewBreed(e.target.value)}
                      placeholder="e.g. KWPN, AQHA, TB"
                      className="w-full border border-emerald-300 p-2 rounded-xl text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-emerald-900 mb-1 text-[10px]">Discipline</label>
                    <input
                      type="text"
                      value={newDiscipline}
                      onChange={(e) => setNewDiscipline(e.target.value)}
                      placeholder="e.g. Hunter / Jumper"
                      className="w-full border border-emerald-300 p-2 rounded-xl text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-emerald-900 mb-1 text-[10px]">Age (Years)</label>
                    <input
                      type="number"
                      value={newAgeYears}
                      onChange={(e) => setNewAgeYears(e.target.value)}
                      placeholder="8"
                      className="w-full border border-emerald-300 p-2 rounded-xl text-xs bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Item Description */}
              <div>
                <label className="block font-black text-slate-700 mb-1 text-[11px]">
                  Description, Specs & PPE/Trial Terms *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Detail condition, tree size, leather type, trailer hitch specs, PPE trial availability, service records..."
                  className="w-full border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50 focus:bg-white"
                />
              </div>

              {/* Seller Contact Info */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-2.5">
                <span className="font-extrabold text-[11px] text-slate-700 uppercase tracking-wider block">
                  Seller Contact Info
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Seller Name</label>
                    <input
                      type="text"
                      value={newSellerName}
                      onChange={(e) => setNewSellerName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full border border-slate-300 p-2 rounded-xl text-xs bg-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Contact Phone</label>
                    <input
                      type="tel"
                      value={newSellerPhone}
                      onChange={(e) => setNewSellerPhone(e.target.value)}
                      placeholder="(707) 555-0192"
                      className="w-full border border-slate-300 p-2 rounded-xl text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Contact Email</label>
                    <input
                      type="email"
                      value={newSellerEmail}
                      onChange={(e) => setNewSellerEmail(e.target.value)}
                      placeholder="rider@example.com"
                      className="w-full border border-slate-300 p-2 rounded-xl text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  disabled={isPublishing}
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="w-2/3 bg-orange-500 hover:bg-orange-400 text-slate-950 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isPublishing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Publishing to Firebase...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Publish Listing to Firebase</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BUYER INQUIRY / OFFER MODAL (FIRESTORE: marketplaceInquiries) */}
      {/* ========================================================================= */}
      {showInquiryModal && selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500 text-slate-950 flex items-center justify-center font-bold">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                    Make Offer / Message Seller
                  </h3>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <Database className="w-2.5 h-2.5" /> Saves to Firestore: marketplaceInquiries
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowInquiryModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Target Item Card */}
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center gap-3">
              <img 
                src={selectedItem.images[0]} 
                alt={selectedItem.title} 
                className="w-14 h-14 rounded-xl object-cover ring-1 ring-slate-200" 
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black text-slate-900 truncate">{selectedItem.title}</h4>
                <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                  <span className="font-extrabold text-orange-600">${selectedItem.price.toLocaleString()}</span>
                  <span>•</span>
                  <span>Seller: {selectedItem.sellerName}</span>
                </div>
                <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono uppercase">
                  {selectedItem.category}
                </span>
              </div>
            </div>

            {/* Inquiry Form */}
            <form onSubmit={handleSubmitInquiry} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    placeholder="e.g. Jessica Davies"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Offer Amount (USD) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      required
                      min={1}
                      value={inquiryOffer}
                      onChange={(e) => setInquiryOffer(e.target.value)}
                      placeholder={String(selectedItem.price)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-3 py-2 font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    placeholder="you@equestrian.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={inquiryPhone}
                    onChange={(e) => setInquiryPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Message to Seller *</label>
                <textarea
                  rows={3}
                  required
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  placeholder="Ask about inspection times, shipping arrangements, maintenance records, or PPE vet coordination..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="bg-orange-50 border border-orange-200 p-2.5 rounded-xl text-[11px] text-orange-900">
                horsez Buyer Security: Never wire money outside verified Escrow. Inquiries and offers are timestamped in Firebase Firestore.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInquiryModal(false)}
                  className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInquirySubmitting}
                  className="w-2/3 bg-orange-500 hover:bg-orange-400 text-slate-950 py-2.5 rounded-xl font-black uppercase tracking-wide transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isInquirySubmitting ? 'Recording in Firebase...' : 'Submit Offer & Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ESCROW PROTECTION DEPOSIT MODAL (FIRESTORE: marketplaceEscrow) */}
      {/* ========================================================================= */}
      {showEscrowModal && selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-950 text-emerald-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                    Initiate Escrow Deposit
                  </h3>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <Database className="w-2.5 h-2.5" /> Saves to Firestore: marketplaceEscrow
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowEscrowModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Target Item Summary */}
            <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-emerald-950 truncate max-w-[280px]">{selectedItem.title}</h4>
                <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                  Full Price: <strong className="font-extrabold text-emerald-950">${selectedItem.price.toLocaleString()}</strong> • Seller: {selectedItem.sellerName}
                </p>
              </div>
              <span className="bg-emerald-200 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                PPE Protected
              </span>
            </div>

            <form onSubmit={handleSubmitEscrow} className="space-y-3.5 text-xs">
              {/* Deposit Option Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Select Escrow Hold Amount:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEscrowDepositType('10%');
                      setEscrowCustomDeposit(String(Math.round(selectedItem.price * 0.1)));
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      escrowDepositType === '10%'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-extrabold text-xs">10% Deposit Hold</div>
                    <div className="text-[11px] font-mono mt-0.5 font-bold text-emerald-400">
                      ${Math.round(selectedItem.price * 0.1).toLocaleString()}
                    </div>
                    <div className="text-[9px] opacity-75 mt-0.5">Holds item for PPE exam</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEscrowDepositType('100%');
                      setEscrowCustomDeposit(String(selectedItem.price));
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      escrowDepositType === '100%'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-extrabold text-xs">100% Full Escrow</div>
                    <div className="text-[11px] font-mono mt-0.5 font-bold text-emerald-400">
                      ${selectedItem.price.toLocaleString()}
                    </div>
                    <div className="text-[9px] opacity-75 mt-0.5">Released upon delivery sign-off</div>
                  </button>
                </div>
              </div>

              {/* Inspection Days */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Pre-Purchase Exam (PPE) / Inspection Window
                </label>
                <select
                  value={escrowInspectionDays}
                  onChange={(e) => setEscrowInspectionDays(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                >
                  <option value={7}>7 Days (Standard Veterinary PPE &amp; Trailer Inspection)</option>
                  <option value={10}>10 Days (Comprehensive Diagnostics &amp; Road Trial)</option>
                  <option value={14}>14 Days (Extended Show / Trainer Evaluation Window)</option>
                </select>
              </div>

              {/* Buyer Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Buyer Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={escrowBuyerName}
                    onChange={(e) => setEscrowBuyerName(e.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Buyer Phone *</label>
                  <input
                    type="tel"
                    required
                    value={escrowBuyerPhone}
                    onChange={(e) => setEscrowBuyerPhone(e.target.value)}
                    placeholder="(555) 345-6789"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Buyer Email *</label>
                <input
                  type="email"
                  required
                  value={escrowBuyerEmail}
                  onChange={(e) => setEscrowBuyerEmail(e.target.value)}
                  placeholder="eleanor@barnridge.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Escrow Guarantee Terms */}
              <div className="bg-slate-900 text-slate-300 p-3 rounded-2xl space-y-1.5 text-[11px]">
                <div className="flex items-center gap-1.5 font-black text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>horsez Escrow Buyer Guarantee</span>
                </div>
                <p className="text-[10px] leading-relaxed text-slate-400">
                  Deposit is held securely in Firebase Firestore. The seller is notified to pause other viewings. Funds are never released to seller until you confirm passing PPE veterinary inspection or delivery completion.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEscrowModal(false)}
                  className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEscrowSubmitting}
                  className="w-2/3 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl font-black uppercase tracking-wide transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{isEscrowSubmitting ? 'Holding in Escrow...' : `Deposit $${(Number(escrowCustomDeposit) || Math.round(selectedItem.price * 0.1)).toLocaleString()} in Escrow`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MARKETPLACE ACTIVITY & ESCROW MODAL (FIRESTORE REAL-TIME VIEWER) */}
      {/* ========================================================================= */}
      {showActivityModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-emerald-400 flex items-center justify-center font-bold">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                    Marketplace Firestore Database Activity
                  </h3>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Live escrow contracts, buyer offers &amp; transaction states
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowActivityModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Tab navigation */}
            <div className="flex gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setActivityTab('escrow')}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  activityTab === 'escrow'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Escrow Contracts ({escrows.length})</span>
              </button>
              <button
                onClick={() => setActivityTab('inquiries')}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  activityTab === 'inquiries'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
                <span>Buyer Inquiries &amp; Offers ({inquiries.length})</span>
              </button>
            </div>

            {/* Escrow Tab Content */}
            {activityTab === 'escrow' && (
              <div className="space-y-3">
                {escrows.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
                    <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto" />
                    <h4 className="text-xs font-black text-slate-700">No Escrow Deposits Yet</h4>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      Click "Deposit into Escrow" on any horse trailer, saddle, or horse listing to create a secure PPE escrow contract in Firebase Firestore.
                    </p>
                  </div>
                ) : (
                  escrows.map((e) => (
                    <div key={e.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-black bg-slate-900 text-white px-2 py-0.5 rounded">
                            {e.escrowNumber || 'ESC-HZ-LIVE'}
                          </span>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                            {e.escrowStatus.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="font-black text-slate-900 text-sm">
                          ${e.depositAmount.toLocaleString()} Held
                        </span>
                      </div>

                      <div className="font-bold text-slate-800">{e.listingTitle}</div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Buyer</span>
                          <span className="font-medium text-slate-900">{e.buyerName}</span>
                          <div className="text-[10px] text-slate-500">{e.buyerEmail}</div>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Seller</span>
                          <span className="font-medium text-slate-900">{e.sellerName}</span>
                          <div className="text-[10px] text-slate-500">PPE: {e.ppeInspectionDays} Days Window</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span>Initiated: {e.createdAt}</span>
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Terms Agreed in Firestore
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Inquiries Tab Content */}
            {activityTab === 'inquiries' && (
              <div className="space-y-3">
                {inquiries.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                    <h4 className="text-xs font-black text-slate-700">No Buyer Inquiries Yet</h4>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      Click "Send Message / Make Offer" on any listing to submit an inquiry saved in Firebase Firestore.
                    </p>
                  </div>
                ) : (
                  inquiries.map((inq) => (
                    <div key={inq.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-orange-100 text-orange-800 rounded">
                            {inq.status.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {inq.listingCategory}
                          </span>
                        </div>
                        <span className="font-black text-orange-600 text-sm">
                          ${inq.offerAmount.toLocaleString()} Offered
                        </span>
                      </div>

                      <div className="font-bold text-slate-800">{inq.listingTitle}</div>

                      <div className="bg-white p-2.5 rounded-xl border border-slate-100 space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-600">
                          <span>From: <strong className="text-slate-900">{inq.buyerName}</strong> ({inq.buyerEmail})</span>
                          <span>To: <strong className="text-slate-900">{inq.sellerName}</strong></span>
                        </div>
                        <p className="text-slate-700 italic text-[11px] pt-1">
                          "{inq.message}"
                        </p>
                      </div>

                      <div className="text-right text-[10px] text-slate-400">
                        Submitted: {inq.createdAt}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowActivityModal(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Close Activity Viewer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
