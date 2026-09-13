import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { useFavorites } from './FavoritesContext';
import { PushNotification, NotificationType, CategoryId } from '../types';

interface NotificationContextType {
  notifications: PushNotification[];
  unreadCount: number;
  activeToast: PushNotification | null;
  dismissToast: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  pushPermission: NotificationPermission | 'unsupported';
  requestPushPermission: () => Promise<boolean>;
  triggerNotification: (notif: {
    title: string;
    message: string;
    providerName: string;
    providerId?: string;
    category: PushNotification['category'];
    type: NotificationType;
    targetCategory?: CategoryId;
    urgency?: 'urgent' | 'normal';
  }) => void;
  simulateSavedProviderAlert: (overrideProvider?: { name: string; category: 'vets' | 'trainers' }) => void;
}

const LOCAL_STORAGE_KEY = 'horsez_push_notifications';

const INITIAL_NOTIFICATIONS: PushNotification[] = [
  {
    id: 'notif-init-1',
    title: 'New Emergency Slot Available!',
    message: 'Dr. Samantha Davis, DVM has opened 2 emergency farm-call appointments for tomorrow morning.',
    providerName: 'Dr. Samantha Davis, DVM',
    providerId: 'vet-1',
    category: 'vets',
    type: 'availability',
    timestamp: '10 mins ago',
    read: false,
    targetCategory: 'vets',
    urgency: 'urgent'
  },
  {
    id: 'notif-init-2',
    title: 'Saved Trainer Urgent Update',
    message: 'Marcus Vance, USHJA posted an urgent update: 1 spot opened for the Saturday Hunter/Jumper Masterclass Clinic.',
    providerName: 'Marcus Vance, USHJA',
    providerId: 'trainer-1',
    category: 'trainers',
    type: 'urgent_update',
    timestamp: '1 hour ago',
    read: false,
    targetCategory: 'trainers',
    urgency: 'normal'
  }
];

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { favorites } = useFavorites();

  const [notifications, setNotifications] = useState<PushNotification[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [activeToast, setActiveToast] = useState<PushNotification | null>(null);

  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.warn('Failed to save notifications to localStorage:', e);
    }
  }, [notifications]);

  // Sync with Firestore when logged in
  useEffect(() => {
    if (!user) return;

    const fetchFirestoreNotifications = async () => {
      try {
        const notifRef = collection(db, 'users', user.uid, 'notifications');
        const snap = await getDocs(notifRef);
        const remoteNotifs: PushNotification[] = [];
        snap.forEach((docSnap) => {
          remoteNotifs.push({ id: docSnap.id, ...docSnap.data() } as PushNotification);
        });

        if (remoteNotifs.length > 0) {
          setNotifications((prev) => {
            const map = new Map<string, PushNotification>();
            prev.forEach((item) => map.set(item.id, item));
            remoteNotifs.forEach((item) => map.set(item.id, item));
            return Array.from(map.values()).sort((a, b) => (b.id > a.id ? 1 : -1));
          });
        }
      } catch (err) {
        console.warn('Firestore notifications sync error:', err);
      }
    };

    fetchFirestoreNotifications();
  }, [user]);

  // Request native web push permission
  const requestPushPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Web Push Notifications are not supported in this browser environment.');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPushPermission(result);
      if (result === 'granted') {
        // Show welcome push test
        new Notification('horsez Push Notifications Active', {
          body: 'You will now receive instant push alerts when your saved vets and trainers post new availability or urgent updates!',
          icon: 'https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?auto=format&fit=crop&q=80&w=120'
        });
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Error requesting push permission:', err);
      return false;
    }
  };

  const triggerNotification = (notifData: {
    title: string;
    message: string;
    providerName: string;
    providerId?: string;
    category: PushNotification['category'];
    type: NotificationType;
    targetCategory?: CategoryId;
    urgency?: 'urgent' | 'normal';
  }) => {
    const newNotif: PushNotification = {
      ...notifData,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: 'Just now',
      read: false,
      urgency: notifData.urgency || 'normal'
    };

    setNotifications((prev) => [newNotif, ...prev]);
    setActiveToast(newNotif);

    // Trigger native browser notification if permitted
    if (pushPermission === 'granted' && typeof window !== 'undefined' && 'Notification' in window) {
      try {
        new Notification(`${newNotif.title} • ${newNotif.providerName}`, {
          body: newNotif.message,
          icon: 'https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?auto=format&fit=crop&q=80&w=120'
        });
      } catch (err) {
        console.warn('Native notification failed:', err);
      }
    }

    // Save to Firestore if authenticated
    if (user) {
      setDoc(doc(db, 'users', user.uid, 'notifications', newNotif.id), newNotif).catch((err) => {
        console.warn('Failed to save notification to Firestore:', err);
      });
    }
  };

  const simulateSavedProviderAlert = (overrideProvider?: { name: string; category: 'vets' | 'trainers' }) => {
    let targetName = overrideProvider?.name;
    let targetCat: 'vets' | 'trainers' = overrideProvider?.category || 'vets';

    if (!targetName) {
      const savedVetsAndTrainers = favorites.filter(
        (f) => f.category === 'vets' || f.category === 'trainers' || f.category === 'farriers'
      );

      if (savedVetsAndTrainers.length > 0) {
        const randomFav = savedVetsAndTrainers[Math.floor(Math.random() * savedVetsAndTrainers.length)];
        targetName = randomFav.title;
        targetCat = (randomFav.category as 'vets' | 'trainers') || 'vets';
      } else {
        targetName = 'Dr. Samantha Davis, DVM (Saved Vet Clinic)';
        targetCat = 'vets';
      }
    }

    const isVet = targetCat === 'vets';

    const messages = isVet
      ? [
          {
            title: 'New Emergency Ambulatory Slot!',
            message: `${targetName} just released 2 priority farm-call slots for tomorrow morning due to a schedule opening.`,
            type: 'availability' as const,
            urgency: 'urgent' as const,
            targetCategory: 'vets' as CategoryId
          },
          {
            title: 'Vaccine & Coggins Clinic Update',
            message: `${targetName} is holding a discounted Spring Coggins & Equine Flu/Rhino clinic this weekend. Book early!`,
            type: 'urgent_update' as const,
            urgency: 'normal' as const,
            targetCategory: 'vets' as CategoryId
          }
        ]
      : [
          {
            title: 'Urgent Clinic Spot Opened!',
            message: `${targetName} posted an urgent update: 1 rider cancellation for this Saturday's Jumping & Equitation Clinic.`,
            type: 'urgent_update' as const,
            urgency: 'urgent' as const,
            targetCategory: 'trainers' as CategoryId
          },
          {
            title: 'New Training Schedule Released',
            message: `${targetName} opened 3 new recurring weekly training slots for young horses and haul-in lessons.`,
            type: 'availability' as const,
            urgency: 'normal' as const,
            targetCategory: 'trainers' as CategoryId
          }
        ];

    const selectedMsg = messages[Math.floor(Math.random() * messages.length)];

    triggerNotification({
      title: selectedMsg.title,
      message: selectedMsg.message,
      providerName: targetName,
      category: targetCat,
      type: selectedMsg.type,
      targetCategory: selectedMsg.targetCategory,
      urgency: selectedMsg.urgency
    });
  };

  const dismissToast = () => {
    setActiveToast(null);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    if (user) {
      setDoc(doc(db, 'users', user.uid, 'notifications', id), { read: true }, { merge: true }).catch(console.warn);
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (user) {
      deleteDoc(doc(db, 'users', user.uid, 'notifications', id)).catch(console.warn);
    }
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        activeToast,
        dismissToast,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        pushPermission,
        requestPushPermission,
        triggerNotification,
        simulateSavedProviderAlert
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
