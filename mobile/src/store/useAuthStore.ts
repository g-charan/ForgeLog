import { create } from 'zustand';
import { authClient } from '../services/authClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  session: any | null;
  user: any | null;
  isLoading: boolean;
  hasSeenOnboarding: boolean;
  checkSession: () => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  isLoading: true,
  hasSeenOnboarding: false,
  checkSession: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await authClient.getSession();
      if (data && !error && data.user) {
        const hasSeen = await AsyncStorage.getItem(`hasSeenOnboarding_${data.user.id}`);
        set({ session: data.session, user: data.user, hasSeenOnboarding: hasSeen === 'true' });
      } else {
        set({ session: null, user: null, hasSeenOnboarding: false });
      }
    } catch (e) {
      set({ session: null, user: null, hasSeenOnboarding: false });
    } finally {
      set({ isLoading: false });
    }
  },
  completeOnboarding: async () => {
    const { user } = get();
    if (user) {
      await AsyncStorage.setItem(`hasSeenOnboarding_${user.id}`, 'true');
    }
    set({ hasSeenOnboarding: true });
  },
  signOut: async () => {
    await authClient.signOut();
    set({ session: null, user: null, hasSeenOnboarding: false });
  }
}));
