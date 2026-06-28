import { create } from 'zustand';
import { Recipe, RecipeState } from '../types';
import * as api from '../services/api';
import { useAuthStore } from './useAuthStore';

// Extend RecipeState with fetchRecipes if not already
export interface ExtendedRecipeState extends RecipeState {
  fetchRecipes: () => Promise<void>;
  isLoading: boolean;
}

export const useRecipeStore = create<ExtendedRecipeState>((set, get) => ({
  recipes: [],
  isLoading: false,
  fetchRecipes: async () => {
    const token = useAuthStore.getState().session?.token;
    if (!token) return;
    set({ isLoading: true });
    try {
      const recipes = await api.getRecipes(token);
      set({ recipes });
    } catch (e) {
      console.error('Failed to fetch recipes', e);
    } finally {
      set({ isLoading: false });
    }
  },
  saveRecipe: async (recipe) => {
    const token = useAuthStore.getState().session?.token;
    let savedRecipe = recipe;
    if (token) {
      try {
        savedRecipe = await api.saveRecipe(recipe, token);
      } catch (e) {
        console.error('Failed to save recipe', e);
      }
    }
    set((state) => ({
      recipes: [...state.recipes, savedRecipe],
    }));
  },
  deleteRecipe: async (id) => {
    const token = useAuthStore.getState().session?.token;
    if (token) {
      try {
        await api.deleteRecipe(id, token);
      } catch (e) {
        console.error('Failed to delete recipe', e);
      }
    }
    set((state) => ({
      recipes: state.recipes.filter((r) => r.id !== id),
    }));
  },
  updateRecipe: async (id, updates) => {
    const token = useAuthStore.getState().session?.token;
    if (token) {
      try {
        await api.updateRecipe(id, updates, token);
      } catch (e) {
        console.error('Failed to update recipe', e);
      }
    }
    set((state) => ({
      recipes: state.recipes.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }));
  },
}));
