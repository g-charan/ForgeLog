import { create } from 'zustand';
import { Paint, StashState } from '../types';
import * as api from '../services/api';
import { useAuthStore } from './useAuthStore';

export interface ExtendedStashState extends StashState {
  fetchStash: () => Promise<void>;
  isLoading: boolean;
}

export const useStashStore = create<ExtendedStashState>((set, get) => ({
  ownedPaintIds: [],
  customPaints: [],
  isLoading: false,
  fetchStash: async () => {
    const token = useAuthStore.getState().session?.token;
    if (!token) return;
    set({ isLoading: true });
    try {
      const stash = await api.getStash(token);
      set({ 
        ownedPaintIds: stash.paint_ids || [],
        customPaints: stash.custom_paints || [] 
      });
    } catch (e) {
      console.error('Failed to fetch stash', e);
    } finally {
      set({ isLoading: false });
    }
  },
  addPaint: async (id) => {
    const state = get();
    if (state.ownedPaintIds.includes(id)) return;
    const newOwned = [...state.ownedPaintIds, id];
    set({ ownedPaintIds: newOwned });

    const token = useAuthStore.getState().session?.token;
    if (token) {
      try {
        await api.updateStash(newOwned, state.customPaints, token);
      } catch (e) {
        console.error('Failed to update stash on server', e);
      }
    }
  },
  removePaint: async (id) => {
    const state = get();
    const newOwned = state.ownedPaintIds.filter((paintId) => paintId !== id);
    set({ ownedPaintIds: newOwned });

    const token = useAuthStore.getState().session?.token;
    if (token) {
      try {
        await api.updateStash(newOwned, state.customPaints, token);
      } catch (e) {
        console.error('Failed to update stash on server', e);
      }
    }
  },
  addCustomPaint: async (paint: Paint) => {
    const state = get();
    const newCustomPaints = [...state.customPaints, paint];
    set({ customPaints: newCustomPaints });

    const token = useAuthStore.getState().session?.token;
    if (token) {
      try {
        await api.updateStash(state.ownedPaintIds, newCustomPaints, token);
      } catch (e) {
        console.error('Failed to update stash on server', e);
      }
    }
  },
  removeCustomPaint: async (id: string) => {
    const state = get();
    const newCustomPaints = state.customPaints.filter((p) => p.id !== id);
    set({ customPaints: newCustomPaints });

    const token = useAuthStore.getState().session?.token;
    if (token) {
      try {
        await api.updateStash(state.ownedPaintIds, newCustomPaints, token);
      } catch (e) {
        console.error('Failed to update stash on server', e);
      }
    }
  },
  hasPaint: (id) => get().ownedPaintIds.includes(id) || get().customPaints.some((p) => p.id === id),
}));
