import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  User 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfileData, FirestoreHorseRecord } from '../types';

interface SignUpInput {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  equineRole: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  location?: string;
  primaryDiscipline: string;
  numberOfHorses: number;
  barnName?: string;
  initialHorseName?: string;
  initialHorseBreed?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfileData | null;
  userHorses: FirestoreHorseRecord[];
  loading: boolean;
  dbConnected: boolean;
  totalMembersCount: number;
  signUp: (input: SignUpInput) => Promise<UserProfileData>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfileData>) => Promise<void>;
  addHorse: (horse: Omit<FirestoreHorseRecord, 'userId' | 'createdAt'>) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [userHorses, setUserHorses] = useState<FirestoreHorseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(true);
  const [totalMembersCount, setTotalMembersCount] = useState(1284);

  // Fetch Firestore Profile & User Horses
  const fetchUserData = async (uid: string) => {
    try {
      // 1. Fetch user document from 'users' collection
      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfileData;
        setUserProfile(data);
      }

      // 2. Fetch user's horses from 'userHorses' collection
      const horsesRef = collection(db, 'userHorses');
      const q = query(horsesRef, where('userId', '==', uid));
      const horseQuerySnap = await getDocs(q);

      const horsesList: FirestoreHorseRecord[] = [];
      horseQuerySnap.forEach((docSnap) => {
        horsesList.push({ id: docSnap.id, ...docSnap.data() } as FirestoreHorseRecord);
      });

      setUserHorses(horsesList);
      setDbConnected(true);
    } catch (err) {
      console.warn('Firestore fetch error:', err);
      setDbConnected(false);
    }
  };

  // Fetch total database members count
  const fetchTotalMembers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const usersSnap = await getDocs(usersRef);
      if (!usersSnap.empty) {
        setTotalMembersCount(1280 + usersSnap.size);
      }
    } catch (err) {
      console.warn('Firestore members count error:', err);
    }
  };

  useEffect(() => {
    fetchTotalMembers();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserData(currentUser.uid);
      } else {
        setUserProfile(null);
        setUserHorses([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user.uid);
      await fetchTotalMembers();
    }
  };

  // Sign Up & Complete Save to Firestore Database Collection
  const signUp = async (input: SignUpInput): Promise<UserProfileData> => {
    // 1. Register with Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, input.email, input.password);
    const createdUser = userCredential.user;

    // Compute location string from address components if needed
    let computedLocation = input.location?.trim() || '';
    if (!computedLocation) {
      const parts = [
        input.city?.trim(),
        input.state?.trim(),
        input.zipCode?.trim()
      ].filter(Boolean);
      computedLocation = parts.join(', ') || 'Santa Rosa, CA';
    }

    const profileData: UserProfileData = {
      uid: createdUser.uid,
      email: input.email.trim(),
      fullName: input.fullName.trim(),
      phone: input.phone?.trim() || '',
      equineRole: input.equineRole || 'Horse Owner',
      address: input.address?.trim() || '',
      city: input.city?.trim() || '',
      state: input.state?.trim() || '',
      zipCode: input.zipCode?.trim() || '',
      location: computedLocation,
      primaryDiscipline: input.primaryDiscipline || 'Hunter/Jumper',
      numberOfHorses: Number(input.numberOfHorses) || 1,
      barnName: input.barnName?.trim() || '',
      createdAt: new Date().toISOString()
    };

    // 2. Save profile in Firestore 'users' collection
    try {
      await setDoc(doc(db, 'users', createdUser.uid), profileData);
      setUserProfile(profileData);
      setDbConnected(true);
    } catch (dbErr) {
      console.error('Firestore users doc save error:', dbErr);
      setUserProfile(profileData);
    }

    // 3. Save initial horse in Firestore 'userHorses' collection if provided
    if (input.initialHorseName && input.initialHorseName.trim() !== '') {
      try {
        const horseRecord: FirestoreHorseRecord = {
          userId: createdUser.uid,
          name: input.initialHorseName.trim(),
          breed: input.initialHorseBreed?.trim() || 'Warmblood',
          age: 8,
          discipline: input.primaryDiscipline || 'Hunter/Jumper',
          stabledAt: input.barnName?.trim() || input.location || 'Sonoma Barn',
          createdAt: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, 'userHorses'), horseRecord);
        setUserHorses([{ id: docRef.id, ...horseRecord }]);
      } catch (horseErr) {
        console.error('Firestore userHorses save error:', horseErr);
      }
    }

    setTotalMembersCount(prev => prev + 1);
    return profileData;
  };

  // Update Profile Data in Firestore
  const updateUserProfile = async (updates: Partial<UserProfileData>) => {
    if (!user || !userProfile) throw new Error('Must be signed in to update profile');

    const updatedData: UserProfileData = {
      ...userProfile,
      ...updates
    };

    await setDoc(doc(db, 'users', user.uid), updatedData, { merge: true });
    setUserProfile(updatedData);
  };

  // Sign In
  const signIn = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      await fetchUserData(userCredential.user.uid);
    }
  };

  // Sign Out
  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setUserProfile(null);
    setUserHorses([]);
  };

  // Add Horse to Database Collection
  const addHorse = async (horse: Omit<FirestoreHorseRecord, 'userId' | 'createdAt'>) => {
    if (!user) throw new Error('Must be logged in to add a horse record');

    const newHorse: FirestoreHorseRecord = {
      ...horse,
      userId: user.uid,
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'userHorses'), newHorse);
    const savedHorse = { id: docRef.id, ...newHorse };

    setUserHorses(prev => [savedHorse, ...prev]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        userHorses,
        loading,
        dbConnected,
        totalMembersCount,
        signUp,
        signIn,
        signOut,
        updateUserProfile,
        addHorse,
        refreshUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
