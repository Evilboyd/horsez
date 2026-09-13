import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { FavoriteItem } from '../types';

interface FavoritesContextType {
  favorites: FavoriteItem[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (item: Omit<FavoriteItem, 'addedAt'>) => void;
  removeFavorite: (id: string) => void;
  favoritesCount: number;
}

const LOCAL_STORAGE_KEY = 'horsez_saved_favorites';

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save to LocalStorage whenever favorites change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.warn('Failed to save favorites to localStorage:', e);
    }
  }, [favorites]);

  // Sync with Firestore when user logs in
  useEffect(() => {
    if (!user) return;

    const fetchFirestoreFavorites = async () => {
      try {
        const favsRef = collection(db, 'users', user.uid, 'favorites');
        const snap = await getDocs(favsRef);
        const remoteFavs: FavoriteItem[] = [];
        snap.forEach((docSnap) => {
          remoteFavs.push({ id: docSnap.id, ...docSnap.data() } as FavoriteItem);
        });

        if (remoteFavs.length > 0) {
          // Merge local and remote
          setFavorites((prev) => {
            const map = new Map<string, FavoriteItem>();
            prev.forEach((item) => map.set(item.id, item));
            remoteFavs.forEach((item) => map.set(item.id, item));
            return Array.from(map.values());
          });
        }
      } catch (err) {
        console.warn('Firestore favorites sync error:', err);
      }
    };

    fetchFirestoreFavorites();
  }, [user]);

  const isFavorite = (id: string): boolean => {
    return favorites.some((item) => item.id === id);
  };

  const toggleFavorite = (item: Omit<FavoriteItem, 'addedAt'>) => {
    const exists = favorites.some((f) => f.id === item.id);
    const updatedAddedAt = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (exists) {
      // Remove
      removeFavorite(item.id);
    } else {
      // Add
      const newFav: FavoriteItem = { ...item, addedAt: updatedAddedAt };
      setFavorites((prev) => [newFav, ...prev]);

      // Save to Firestore if authenticated
      if (user) {
        setDoc(doc(db, 'users', user.uid, 'favorites', item.id), newFav).catch((err) => {
          console.warn('Failed to save favorite to Firestore:', err);
        });
      }
    }
  };

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));

    if (user) {
      deleteDoc(doc(db, 'users', user.uid, 'favorites', id)).catch((err) => {
        console.warn('Failed to remove favorite from Firestore:', err);
      });
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isFavorite,
        toggleFavorite,
        removeFavorite,
        favoritesCount: favorites.length
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
