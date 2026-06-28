import * as FileSystem from 'expo-file-system/legacy';
import { Recipe } from '../types';

// Use local network IP or ngrok for physical device testing if needed
// For iOS simulator, localhost works. For Android, use 10.0.2.2
const API_URL = 'http://localhost:8080/api';

export const scanImage = async (imageUri: string, token: string, mimeType: string): Promise<Recipe> => {
  try {
    const uploadResult = await FileSystem.uploadAsync(`${API_URL}/scan`, imageUri, {
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: 'image',
      mimeType: mimeType,
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    if (uploadResult.status !== 200) {
      console.error('Scan failed with status:', uploadResult.status, uploadResult.body);
      throw new Error(`Failed to scan image: ${uploadResult.body}`);
    }
    
    return JSON.parse(uploadResult.body);
  } catch (err) {
    console.error('Fetch error in scanImage:', err);
    throw err;
  }
};

export const getRecipes = async (token: string): Promise<Recipe[]> => {
  const res = await fetch(`${API_URL}/recipes`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch recipes');
  return res.json();
};

export const saveRecipe = async (recipe: Recipe, token: string): Promise<Recipe> => {
  const res = await fetch(`${API_URL}/recipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(recipe)
  });
  if (!res.ok) throw new Error('Failed to save recipe');
  return res.json();
};

export const deleteRecipe = async (id: string, token: string): Promise<void> => {
  const res = await fetch(`${API_URL}/recipes/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete recipe');
};

export const updateRecipe = async (id: string, updates: Partial<Recipe>, token: string): Promise<void> => {
  const res = await fetch(`${API_URL}/recipes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update recipe');
};

export const getStash = async (token: string): Promise<{ paint_ids: string[], custom_paints: Paint[] }> => {
  const res = await fetch(`${API_URL}/stash`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch stash');
  return res.json();
};

export const updateStash = async (paintIds: string[], customPaints: Paint[], token: string): Promise<void> => {
  const res = await fetch(`${API_URL}/stash`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ paint_ids: paintIds, custom_paints: customPaints })
  });
  if (!res.ok) throw new Error('Failed to update stash');
};
