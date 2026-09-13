import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  UserCheck, 
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
  Award,
  MapPin,
  Star,
  BadgeCheck,
  Camera,
  Upload,
  Image as ImageIcon,
  Trash2,
  Phone,
  Mail,
  Play,
  FileCheck,
  Database,
  Check,
  X,
  SlidersHorizontal,
  Clock,
  Navigation
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MOCK_TRAINER_PROFILES } from '../../data/mockData';
import { TrainerProfile } from '../../types';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';

// Preset trainer photo packs for quick testing & instant selection
const TRAINER_IMAGE_PRESETS: Record<string, { label: string; url: string; hero: string }[]> = {
  hunter_jumper: [
    {
      label: 'Grand Prix Show Jumping Arena',
      url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=400',
      hero: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800'
    },
    {
      label: 'Warmblood Over Oxer Jump',
      url: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=400',
      hero: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=800'
    }
  ],
  dressage: [
    {
      label: 'FEI Dressage Extension',
      url: 'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?auto=format&fit=crop&q=80&w=400',
      hero: 'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?auto=format&fit=crop&q=80&w=800'
    },
    {
      label: 'Piaffe & Passage Schooling',
      url: 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&q=80&w=400',
      hero: 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&q=80&w=800'
    }
  ],
  western_reining: [
    {
      label: 'Sliding Stop & Reining Cowgirl',
      url: 'https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?auto=format&fit=crop&q=80&w=400',
      hero: 'https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?auto=format&fit=crop&q=80&w=800'
    },
    {
      label: 'Cowgirl Ranch Horse & Cattle Work',
      url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&q=80&w=400',
      hero: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&q=80&w=800'
    }
  ],
  eventing: [
    {
      label: 'Cross Country Water Gallop',
      url: 'https://images.unsplash.com/photo-1534773728080-33d31da27ae5?auto=format&fit=crop&q=80&w=400',
      hero: 'https://images.unsplash.com/photo-1534773728080-33d31da27ae5?auto=format&fit=crop&q=80&w=800'
    }
  ],
  natural_horsemanship: [
    {
      label: 'Liberty & Groundwork Round Pen',
      url: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=400',
      hero: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=800'
    }
  ]
};

const DISCIPLINE_CATEGORIES = [
  { id: 'all', label: 'All Trainers', icon: '🏇' },
  { id: 'hunter_jumper', label: 'Hunter / Jumper', icon: '🏆', matchTerms: ['hunter', 'jumper', 'equitation', 'show jumping'] },
  { id: 'dressage', label: 'Dressage & Flatwork', icon: '🩰', matchTerms: ['dressage', 'fei', 'flatwork', 'in-hand'] },
  { id: 'western_reining', label: 'Western & Reining', icon: '🤠', matchTerms: ['reining', 'western', 'cow horse', 'ranch'] },
  { id: 'eventing', label: 'Eventing & XC', icon: '🌲', matchTerms: ['eventing', 'cross country', 'xc', 'conditioning'] },
  { id: 'natural_horsemanship', label: 'Natural Horsemanship', icon: '🌿', matchTerms: ['natural horsemanship', 'liberty', 'groundwork', 'trailer loading'] },
  { id: 'colt_starting', label: 'Colt Starting & Behavior', icon: '🐴', matchTerms: ['colt starting', 'problem solving', 'behavioral', 'young horse'] }
];

export const TrainersView: React.FC = () => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { userProfile } = useAuth();

  // Firestore real-time state + mock trainers
  const [firestoreTrainers, setFirestoreTrainers] = useState<TrainerProfile[]>([]);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);

  // Search & Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrainer, setSelectedTrainer] = useState<TrainerProfile | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Create / Publish Trainer Listing Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState(userProfile?.fullName || '');
  const [newHourlyRate, setNewHourlyRate] = useState('85');
  const [newPrimaryDiscipline, setNewPrimaryDiscipline] = useState('hunter_jumper');
  const [newLocation, setNewLocation] = useState('Santa Rosa, CA');
  const [newAddress, setNewAddress] = useState('');
  const [newPhone, setNewPhone] = useState(userProfile?.phone || '');
  const [newEmail, setNewEmail] = useState(userProfile?.email || '');
  const [newMcNumber, setNewMcNumber] = useState('');
  const [newBio, setNewBio] = useState('');
  const [newCertifications, setNewCertifications] = useState<string>('USEF Licensed, USDF Certified, MC# Verified');
  const [newServices, setNewServices] = useState<string>('Freelance Arena Lesson, On-Demand Lunge & Ride, Problem Horse Consultation');

  // Pictures & Upload state
  const [trainerPhotos, setTrainerPhotos] = useState<string[]>([
    TRAINER_IMAGE_PRESETS.hunter_jumper[0].hero,
    TRAINER_IMAGE_PRESETS.hunter_jumper[0].url
  ]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Publishing status
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatusMsg, setPublishStatusMsg] = useState('');
  const [publishError, setPublishError] = useState('');

  // 1. Subscribe to Firestore `trainers` collection in real-time
  useEffect(() => {
    setIsFirebaseLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, 'trainers'),
      (snapshot) => {
        const loaded: TrainerProfile[] = [];
        snapshot.forEach((doc) => {
          const d = doc.data();
          loaded.push({
            id: doc.id,
            name: d.name || 'Certified Trainer',
            avatar: d.avatar || 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&q=80&w=400',
            heroPhoto: d.heroPhoto || (Array.isArray(d.images) && d.images[0]) || TRAINER_IMAGE_PRESETS.hunter_jumper[0].hero,
            images: Array.isArray(d.images) && d.images.length > 0 
              ? d.images 
              : [d.heroPhoto || TRAINER_IMAGE_PRESETS.hunter_jumper[0].hero],
            rating: Number(d.rating) || 5.0,
            mcNumber: d.mcNumber || undefined,
            disciplines: Array.isArray(d.disciplines) ? d.disciplines : ['Hunter/Jumper', 'Dressage'],
            certifications: Array.isArray(d.certifications) ? d.certifications : ['Certified Trainer'],
            hourlyRate: Number(d.hourlyRate) || 85,
            bio: d.bio || '',
            videoUrl: d.videoUrl || undefined,
            location: d.location || 'Sonoma County, CA',
            address: d.address || '',
            phone: d.phone || '',
            email: d.email || '',
            distanceMiles: Number(d.distanceMiles) || 5,
            waiverVerified: d.waiverVerified !== undefined ? d.waiverVerified : true,
            services: Array.isArray(d.services) ? d.services : ['Freelance Arena Lesson', 'On-Demand Lunge & Ride'],
            isFirebase: true,
            createdAt: d.createdAt || 'Just now'
          });
        });
        setFirestoreTrainers(loaded);
        setIsFirebaseLoading(false);
      },
      (error) => {
        console.error('Error fetching trainers from Firestore:', error);
        setIsFirebaseLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Update default name/contact info from user profile
  useEffect(() => {
    if (userProfile?.fullName && !newName) {
      setNewName(userProfile.fullName);
    }
    if (userProfile?.phone && !newPhone) {
      setNewPhone(userProfile.phone);
    }
    if (userProfile?.email && !newEmail) {
      setNewEmail(userProfile.email);
    }
  }, [userProfile]);

  // Combine Firestore trainers + Mock trainers (Firestore appears first)
  const allTrainers: TrainerProfile[] = useMemo(() => {
    const combined = [...firestoreTrainers, ...MOCK_TRAINER_PROFILES];
    const seen = new Set<string>();
    return combined.filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [firestoreTrainers]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allTrainers.length };
    DISCIPLINE_CATEGORIES.forEach(cat => {
      if (cat.id === 'all') return;
      counts[cat.id] = allTrainers.filter(t => {
        const text = `${t.disciplines.join(' ')} ${t.bio} ${t.services.join(' ')}`.toLowerCase();
        return cat.matchTerms?.some(term => text.includes(term.toLowerCase()));
      }).length;
    });
    return counts;
  }, [allTrainers]);

  // Search & filter logic
  const filteredTrainers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return allTrainers.filter(trainer => {
      // Category filter
      if (selectedCategory !== 'all') {
        const currentCatObj = DISCIPLINE_CATEGORIES.find(c => c.id === selectedCategory);
        if (currentCatObj?.matchTerms) {
          const text = `${trainer.disciplines.join(' ')} ${trainer.bio} ${trainer.services.join(' ')}`.toLowerCase();
          const matches = currentCatObj.matchTerms.some(term => text.includes(term.toLowerCase()));
          if (!matches) return false;
        }
      }

      // Search query filter
      if (!q) return true;

      const matchName = trainer.name.toLowerCase().includes(q);
      const matchBio = trainer.bio.toLowerCase().includes(q);
      const matchLoc = trainer.location.toLowerCase().includes(q);
      const matchDisciplines = trainer.disciplines.some(d => d.toLowerCase().includes(q));
      const matchCerts = trainer.certifications.some(c => c.toLowerCase().includes(q));
      const matchServices = trainer.services.some(s => s.toLowerCase().includes(q));
      const matchMc = trainer.mcNumber ? trainer.mcNumber.toLowerCase().includes(q) : false;

      return matchName || matchBio || matchLoc || matchDisciplines || matchCerts || matchServices || matchMc;
    });
  }, [allTrainers, selectedCategory, searchQuery]);

  // Handle Photo File Upload
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
            setTrainerPhotos(prev => [...prev, ...newImgs]);
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
      setTrainerPhotos(prev => [...prev, trimmed]);
      setCustomImageUrl('');
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    if (trainerPhotos.length <= 1) {
      alert('A trainer listing requires at least one photo.');
      return;
    }
    setTrainerPhotos(trainerPhotos.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    const target = trainerPhotos[index];
    const rest = trainerPhotos.filter((_, idx) => idx !== index);
    setTrainerPhotos([target, ...rest]);
  };

  // Preset quick selection
  const handleSelectPreset = (catKey: string, presetIndex: number) => {
    const preset = TRAINER_IMAGE_PRESETS[catKey]?.[presetIndex];
    if (preset) {
      setTrainerPhotos([preset.hero, preset.url]);
    }
  };

  // Publish Trainer Listing to Firebase Firestore
  const handlePublishTrainerToFirebase = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishError('');
    setPublishStatusMsg('');

    if (!newName.trim()) {
      setPublishError('Please enter the trainer or instructor name.');
      return;
    }
    if (!newHourlyRate || Number(newHourlyRate) <= 0) {
      setPublishError('Please specify a valid hourly lesson rate ($/hr).');
      return;
    }
    if (trainerPhotos.length === 0) {
      setPublishError('Please upload or select at least one photo for your profile.');
      return;
    }
    if (!newBio.trim()) {
      setPublishError('Please enter a bio or training philosophy.');
      return;
    }

    setIsPublishing(true);
    setPublishStatusMsg('Uploading pictures & publishing trainer profile to Firebase...');

    try {
      const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      const disciplinesArray = newPrimaryDiscipline === 'hunter_jumper' 
        ? ['Hunter/Jumper', 'Dressage', 'Equitation']
        : newPrimaryDiscipline === 'dressage'
        ? ['Dressage', 'In-Hand Work', 'Longeing']
        : newPrimaryDiscipline === 'western_reining'
        ? ['Reining', 'Western Pleasure', 'Colt Starting']
        : newPrimaryDiscipline === 'eventing'
        ? ['Eventing', 'Cross Country', 'Show Jumping']
        : ['Natural Horsemanship', 'Liberty', 'Problem Solving'];

      const certsArray = newCertifications
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const servicesArray = newServices
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const newTrainerData = {
        name: newName.trim(),
        avatar: trainerPhotos[1] || trainerPhotos[0],
        heroPhoto: trainerPhotos[0],
        images: trainerPhotos,
        rating: 5.0,
        hourlyRate: Number(newHourlyRate),
        disciplines: disciplinesArray,
        certifications: certsArray.length > 0 ? certsArray : ['Certified Trainer'],
        services: servicesArray.length > 0 ? servicesArray : ['Freelance Arena Lesson', 'On-Demand Lunge & Ride'],
        bio: newBio.trim(),
        location: newLocation.trim() || 'Santa Rosa, CA',
        address: newAddress.trim() || '',
        phone: newPhone.trim() || '',
        email: newEmail.trim() || '',
        mcNumber: newMcNumber.trim() || undefined,
        distanceMiles: Math.floor(Math.random() * 8) + 2,
        waiverVerified: true,
        createdAt: nowStr
      };

      // Save into Firestore collection `trainers`
      const docRef = await addDoc(collection(db, 'trainers'), newTrainerData);

      const createdTrainer: TrainerProfile = {
        id: docRef.id,
        ...newTrainerData,
        isFirebase: true
      };

      setPublishStatusMsg('Trainer profile published successfully to Firebase Firestore!');
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

      // Automatically open the new trainer listing
      setSelectedTrainer(createdTrainer);
      setActiveImageIndex(0);

      // Reset form states
      setTimeout(() => {
        setShowCreateModal(false);
        setNewName('');
        setNewHourlyRate('85');
        setNewBio('');
        setNewMcNumber('');
        setTrainerPhotos([
          TRAINER_IMAGE_PRESETS.hunter_jumper[0].hero,
          TRAINER_IMAGE_PRESETS.hunter_jumper[0].url
        ]);
        setPublishStatusMsg('');
      }, 800);

    } catch (err: any) {
      console.error('Error publishing trainer to Firebase:', err);
      setPublishError(err.message || 'Failed to save trainer in Firebase. Please check connection.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-10 space-y-6 font-sans">
      
      {/* Top Banner Header (identical aesthetic to Buy & Sell) */}
      <div className="bg-[#1B4A72] text-white p-4 sm:p-5 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black uppercase tracking-wide text-white">
                EQUINE TRAINERS & INSTRUCTORS
              </h1>
              <span className="bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Database className="w-3 h-3 text-emerald-300" />
                <span>Firestore Live</span>
              </span>
            </div>
            <p className="text-xs text-sky-200 mt-0.5">
              Certified instructors, exercise riders & master clinicians with Digital Liability Waivers & MC# Verification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] text-sky-200 block font-medium">Available Trainers</span>
            <span className="text-xs font-black text-amber-300">
              {allTrainers.length} Registered ({firestoreTrainers.length} in Firebase)
            </span>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-500 hover:bg-purple-400 text-white font-black text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-lg transition-transform hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Trainer Profile</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search trainers (Sarah Jenkins, Mike Turner), disciplines (Hunter/Jumper, Reining, Dressage), certifications..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
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

        {/* Discipline category filter chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
          {DISCIPLINE_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isSelected 
                    ? 'bg-purple-700 text-white shadow-md' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{cat.icon} {cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {categoryCounts[cat.id] || 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Verified Guarantee Banner */}
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-purple-950 shadow-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0" />
          <span className="font-medium">
            <strong className="font-extrabold text-purple-950">horsez Verified Trainer Guarantee:</strong> Every trainer includes digital liability waiver protection, MC# credential verification, and verified student reviews.
          </span>
        </div>
        <span className="text-[10px] bg-purple-200 text-purple-950 font-black px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 self-start sm:self-auto">
          100% Signed Waivers
        </span>
      </div>

      {/* Empty Search State */}
      {filteredTrainers.length === 0 && (
        <div className="p-10 text-center bg-white rounded-3xl border border-slate-200 space-y-3 shadow-sm">
          <UserCheck className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-black text-slate-800">No trainers found matching your search</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms, clear filters, or publish the first trainer listing in this category!
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-4 py-2 rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              Publish Trainer Profile
            </button>
          </div>
        </div>
      )}

      {/* Trainer Cards Grid (same clean 3-column layout as Buy & Sell) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTrainers.map((trainer) => {
          const mainPhoto = trainer.heroPhoto || (trainer.images && trainer.images[0]) || trainer.avatar;
          const photoList = trainer.images && trainer.images.length > 0 ? trainer.images : [mainPhoto];

          return (
            <div
              key={trainer.id}
              onClick={() => {
                setSelectedTrainer(trainer);
                setActiveImageIndex(0);
              }}
              className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200 hover:border-purple-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                {/* Hero Image & Top Badges */}
                <div className="relative h-48 rounded-xl overflow-hidden bg-slate-100">
                  <img 
                    src={mainPhoto} 
                    alt={trainer.name} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Top Left: Firebase Live or Distance Badge */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                    {trainer.isFirebase && (
                      <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-md uppercase tracking-wider flex items-center gap-1">
                        <Database className="w-2.5 h-2.5" />
                        Firestore Live
                      </span>
                    )}
                    <span className="bg-slate-900/90 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow uppercase tracking-wider">
                      {trainer.distanceMiles || 5} mi away
                    </span>
                  </div>

                  {/* Top Right: Favorite Button & Hourly Rate */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite({
                          id: trainer.id,
                          category: 'trainers',
                          title: trainer.name,
                          subtitle: `${trainer.disciplines.join(', ')} • $${trainer.hourlyRate}/hr`,
                          rating: trainer.rating,
                          image: trainer.avatar || mainPhoto,
                          price: `$${trainer.hourlyRate}/hr`,
                          location: trainer.location
                        });
                      }}
                      className={`p-2 rounded-full shadow-md transition-transform hover:scale-110 cursor-pointer ${
                        isFavorite(trainer.id) 
                          ? 'bg-rose-500 text-white' 
                          : 'bg-white/90 backdrop-blur-sm text-slate-700 hover:text-rose-500 hover:bg-white'
                      }`}
                      title={isFavorite(trainer.id) ? 'Remove from favorites' : 'Save trainer'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFavorite(trainer.id) ? 'fill-white' : ''}`} />
                    </button>

                    <span className="bg-purple-900/90 backdrop-blur-sm text-white font-black text-xs px-3 py-1.5 rounded-full shadow-md border border-purple-700">
                      ${trainer.hourlyRate}/hr
                    </span>
                  </div>

                  {/* Bottom Avatar Overlay & Photo Count */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-2">
                    <img 
                      src={trainer.avatar} 
                      alt="" 
                      className="w-8 h-8 rounded-full border-2 border-white object-cover shadow" 
                    />
                    {photoList.length > 1 && (
                      <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        <span>{photoList.length} photos</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Trainer Info */}
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-extrabold text-xs text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-1 leading-tight flex items-center gap-1">
                      <span>{trainer.name}</span>
                      {trainer.waiverVerified && <BadgeCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
                    </h3>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 shrink-0">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{trainer.rating}</span>
                    </div>
                  </div>

                  {/* Disciplines Chips */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {trainer.disciplines.slice(0, 3).map((disc, idx) => (
                      <span key={idx} className="bg-purple-50 text-purple-900 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-purple-200">
                        {disc}
                      </span>
                    ))}
                    {trainer.mcNumber && (
                      <span className="bg-teal-50 text-teal-900 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-teal-200 flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5 text-teal-600" />
                        MC# {trainer.mcNumber}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed italic">
                    "{trainer.bio}"
                  </p>
                </div>
              </div>

              {/* Card Footer: Location & Services */}
              <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span className="text-slate-500 font-semibold flex items-center gap-1 truncate max-w-[50%]">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{trainer.location}</span>
                </span>
                
                <span className="text-purple-700 font-bold hover:underline">
                  View Profile & Book ➔
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TRAINER DETAILS MODAL (HERO, GALLERY, CERTIFICATIONS, VIDEO, BOOKING)    */}
      {/* ========================================================================= */}
      {selectedTrainer && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                {selectedTrainer.isFirebase && (
                  <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1">
                    <Database className="w-3 h-3 text-emerald-700" />
                    Firestore Live Profile
                  </span>
                )}
                {selectedTrainer.waiverVerified && (
                  <span className="bg-teal-100 text-teal-900 text-[10px] font-extrabold px-2 py-0.5 rounded flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-teal-700" />
                    Waiver & MC# Verified
                  </span>
                )}
              </div>
              <button 
                onClick={() => setSelectedTrainer(null)} 
                className="text-slate-400 hover:text-slate-700 font-black text-sm w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Main Photo Gallery */}
            {(() => {
              const photos = selectedTrainer.images && selectedTrainer.images.length > 0 
                ? selectedTrainer.images 
                : [selectedTrainer.heroPhoto || selectedTrainer.avatar];
              const currentImg = photos[activeImageIndex] || photos[0];

              return (
                <div className="space-y-2">
                  <div className="relative h-60 sm:h-72 rounded-2xl overflow-hidden bg-slate-100 shadow-inner">
                    <img 
                      src={currentImg} 
                      alt={selectedTrainer.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />
                    <span className="absolute bottom-3 right-3 bg-purple-900/90 backdrop-blur-sm text-white font-black text-base px-3.5 py-1.5 rounded-full shadow-lg border border-purple-700">
                      ${selectedTrainer.hourlyRate}/hr
                    </span>
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-purple-600" />
                      <span>{selectedTrainer.location} ({selectedTrainer.distanceMiles || 5} mi)</span>
                    </span>
                  </div>

                  {/* Photo Thumbnails if multiple */}
                  {photos.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {photos.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`relative w-16 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                            activeImageIndex === idx ? 'border-purple-600 scale-105 shadow-sm' : 'border-slate-200 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Trainer Title & Bio */}
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <img src={selectedTrainer.avatar} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-purple-300 ring-2 ring-purple-100" />
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug flex items-center gap-1">
                    <span>{selectedTrainer.name}</span>
                    <BadgeCheck className="w-4 h-4 text-teal-600" />
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{selectedTrainer.rating} Rating</span>
                    </span>
                    <span>•</span>
                    <span>{selectedTrainer.location}</span>
                  </div>
                </div>
              </div>

              {/* Disciplines Badges */}
              <div className="flex flex-wrap gap-1 pt-2">
                {selectedTrainer.disciplines.map((d, i) => (
                  <span key={i} className="bg-purple-50 text-purple-900 text-[10px] font-extrabold px-2.5 py-1 rounded-md border border-purple-200">
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* Certifications & Licenses */}
            {selectedTrainer.certifications.length > 0 && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Certifications & Credentials
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTrainer.certifications.map((cert, idx) => (
                    <span key={idx} className="bg-white text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                      <Award className="w-3 h-3 text-purple-600" />
                      <span>{cert}</span>
                    </span>
                  ))}
                  {selectedTrainer.mcNumber && (
                    <span className="bg-teal-50 text-teal-900 text-[10px] font-bold px-2 py-0.5 rounded border border-teal-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-teal-600" />
                      <span>MC# {selectedTrainer.mcNumber}</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Video Portfolio Player Simulation */}
            <div className="bg-slate-900 rounded-2xl overflow-hidden relative h-40 border border-slate-800 flex items-center justify-center group">
              <img 
                src={selectedTrainer.heroPhoto || selectedTrainer.avatar} 
                alt="" 
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-300" 
              />
              <button 
                onClick={() => alert(`Playing video teaching portfolio for ${selectedTrainer.name}...`)}
                className="absolute w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
              >
                <Play className="w-6 h-6 fill-white ml-0.5" />
              </button>
              <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded">
                ▶ Video Portfolio: Arena Teaching & Course Schooling
              </span>
            </div>

            {/* Full Bio */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">
                Training Philosophy & Background
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100 whitespace-pre-line">
                {selectedTrainer.bio}
              </p>
            </div>

            {/* Services Offered */}
            {selectedTrainer.services.length > 0 && (
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">
                  Services Offered
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {selectedTrainer.services.map((svc, idx) => (
                    <div key={idx} className="bg-purple-50 text-purple-950 text-xs font-bold p-2 rounded-lg border border-purple-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>{svc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  alert(`On-Demand Exercise Ride & Lunge requested with ${selectedTrainer.name}!`);
                  setSelectedTrainer(null);
                }}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black text-xs py-3 rounded-xl uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                <span>Request Exerciser (On-Demand Lunge / Ride)</span>
              </button>

              <button
                onClick={() => {
                  confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
                  alert(`Freelance Lesson Booked with ${selectedTrainer.name} ($${selectedTrainer.hourlyRate}/hr).`);
                  setSelectedTrainer(null);
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black text-xs py-3 rounded-xl uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4" />
                <span>Book Freelance Lesson (${selectedTrainer.hourlyRate}/hr)</span>
              </button>
              
              <button
                onClick={() => {
                  alert(`Problem horse video consultation request sent to ${selectedTrainer.name}!`);
                  setSelectedTrainer(null);
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-2.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Video className="w-4 h-4 text-purple-400" />
                <span>Problem Horse Consultation (Submit Video)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* POST / PUBLISH TRAINER MODAL (WITH PICTURE UPLOAD & FIREBASE PERSISTENCE) */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-7 shadow-2xl space-y-5 animate-in fade-in">
            
            {/* Modal Top Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">Publish Trainer Profile</h3>
                  <p className="text-[11px] text-slate-500">Saves to Firebase Firestore with Digital Waiver & Verification</p>
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

            <form onSubmit={handlePublishTrainerToFirebase} className="space-y-4 text-xs font-sans">
              
              {/* Primary Discipline Category */}
              <div>
                <label className="block font-black text-slate-700 mb-1.5 text-[11px] uppercase tracking-wider">
                  Primary Discipline Focus *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'hunter_jumper', label: 'Hunter / Jumper', icon: '🏆' },
                    { id: 'dressage', label: 'Dressage & Flat', icon: '🩰' },
                    { id: 'western_reining', label: 'Western / Reining', icon: '🤠' },
                    { id: 'eventing', label: 'Eventing & XC', icon: '🌲' },
                    { id: 'natural_horsemanship', label: 'Natural Horsemanship', icon: '🌿' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setNewPrimaryDiscipline(cat.id);
                        if (TRAINER_IMAGE_PRESETS[cat.id]) {
                          handleSelectPreset(cat.id, 0);
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        newPrimaryDiscipline === cat.id
                          ? 'bg-purple-50 border-purple-500 text-purple-950 ring-2 ring-purple-500/20 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-base block mb-0.5">{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Hourly Rate */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-black text-slate-700 mb-1 text-[11px]">
                    Trainer / Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins (Hunter/Jumper Pro)"
                    className="w-full border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-black text-slate-700 mb-1 text-[11px]">
                    Hourly Rate ($/hr) *
                  </label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                    <input
                      type="number"
                      required
                      min="1"
                      value={newHourlyRate}
                      onChange={(e) => setNewHourlyRate(e.target.value)}
                      placeholder="85"
                      className="w-full border border-slate-300 pl-8 pr-3 py-2.5 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none bg-slate-50 focus:bg-white"
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
                    <Camera className="w-4 h-4 text-purple-600" />
                    <span className="font-black text-slate-800 text-xs uppercase tracking-wider">
                      Profile Photos & Arena Action Shots *
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">
                    {trainerPhotos.length} Photo{trainerPhotos.length === 1 ? '' : 's'} Selected
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
                      ? 'border-purple-500 bg-purple-100/50 scale-[0.99]' 
                      : 'border-slate-300 hover:border-purple-400 bg-white'
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
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="font-extrabold text-xs text-slate-800">
                      Click to upload photos or drag & drop files here
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Supports JPG, PNG, WEBP from your phone, stable camera, or arena footage
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
                    className="flex-1 border border-slate-300 px-3 py-2 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors shrink-0 cursor-pointer"
                  >
                    + Add URL
                  </button>
                </div>

                {/* Discipline Preset Quick Photos */}
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Or pick curated equine presets:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.entries(TRAINER_IMAGE_PRESETS).flatMap(([catKey, list]) =>
                      list.map((item, idx) => (
                        <div
                          key={`${catKey}-${idx}`}
                          onClick={() => handleSelectPreset(catKey, idx)}
                          className="relative h-14 rounded-xl overflow-hidden border border-slate-200 hover:border-purple-500 cursor-pointer group shadow-xs"
                          title={item.label}
                        >
                          <img src={item.hero} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-1 text-center">
                            <span className="text-[9px] font-black text-white leading-tight drop-shadow">
                              {item.label}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Photo Previews with Reorder / Delete */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Selected Profile Photos (First is Cover Photo):
                  </span>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {trainerPhotos.map((photoUrl, idx) => (
                      <div key={idx} className="relative w-20 h-16 rounded-xl overflow-hidden border-2 border-slate-200 shrink-0 group">
                        <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute bottom-0 inset-x-0 bg-purple-600 text-white text-[8px] font-black text-center py-0.5 uppercase">
                            Cover
                          </span>
                        )}
                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(idx)}
                              className="bg-slate-900/80 text-white p-1 rounded-md text-[8px] font-bold"
                              title="Set as cover"
                            >
                              ★
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="bg-rose-600 text-white p-1 rounded-md"
                            title="Remove image"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Location & Barn Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-700 mb-1 text-[11px]">
                    City, State / Service Area *
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                    <input
                      type="text"
                      required
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="Santa Rosa, CA"
                      className="w-full border border-slate-300 pl-8 pr-3 py-2 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-black text-slate-700 mb-1 text-[11px]">
                    Primary Barn / Facility Address (Optional)
                  </label>
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="e.g. 4200 Sonoma Mountain Rd"
                    className="w-full border border-slate-300 px-3 py-2 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Contact Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-700 mb-1 text-[11px]">
                    Contact Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="(707) 555-0199"
                      className="w-full border border-slate-300 pl-8 pr-3 py-2 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-black text-slate-700 mb-1 text-[11px]">
                    MC# / USEF License Number (Optional)
                  </label>
                  <div className="relative">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                    <input
                      type="text"
                      value={newMcNumber}
                      onChange={(e) => setNewMcNumber(e.target.value)}
                      placeholder="e.g. MC-884920 or USEF #4492"
                      className="w-full border border-slate-300 pl-8 pr-3 py-2 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Certifications & Services (Comma separated) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-700 mb-1 text-[11px]">
                    Certifications (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={newCertifications}
                    onChange={(e) => setNewCertifications(e.target.value)}
                    placeholder="USEF Licensed Judge, USDF Gold Medalist"
                    className="w-full border border-slate-300 px-3 py-2 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-black text-slate-700 mb-1 text-[11px]">
                    Services Offered (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={newServices}
                    onChange={(e) => setNewServices(e.target.value)}
                    placeholder="Freelance Arena Lesson, On-Demand Lunge & Ride, Video Review"
                    className="w-full border border-slate-300 px-3 py-2 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Bio / Description */}
              <div>
                <label className="block font-black text-slate-700 mb-1 text-[11px]">
                  Trainer Bio & Training Philosophy *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  placeholder="Detail your equestrian background, achievements, teaching methodology, and expectations for lessons or training..."
                  className="w-full border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none bg-slate-50 focus:bg-white leading-relaxed"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isPublishing}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-black px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {isPublishing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Publishing to Firebase...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Publish Trainer Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
