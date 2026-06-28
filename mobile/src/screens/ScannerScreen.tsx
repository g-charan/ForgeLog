import React, { useState } from 'react';
import { ScrollView, Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ImagePlus, Save, RotateCcw } from 'lucide-react-native';

import { scanImage } from '../services/api';
import { RecipeCard } from '../components/RecipeCard';
import { Recipe } from '../types';
import { useRecipeStore } from '../store/useRecipeStore';
import { useAuthStore } from '../store/useAuthStore';

import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { H1, P } from '../components/ui/Typography';
import { Icon } from '../components/ui/Icon';

export const ScannerScreen = () => {
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const saveRecipe = useRecipeStore((state) => state.saveRecipe);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      processImage(result.assets[0].uri, result.assets[0].mimeType);
    }
  };

  const handleTakePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', "You've refused to allow this app to access your camera!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      processImage(result.assets[0].uri, result.assets[0].mimeType);
    }
  };

  const processImage = async (uri: string, mimeType?: string) => {
    setLoading(true);
    try {
      const token = useAuthStore.getState().session?.token;
      if (!token) throw new Error('Not authenticated');
      
      let finalMime = mimeType;
      if (!finalMime) {
        if (uri.toLowerCase().endsWith('.png')) finalMime = 'image/png';
        else if (uri.toLowerCase().endsWith('.heic')) finalMime = 'image/heic';
        else finalMime = 'image/jpeg';
      }

      const generatedRecipe = await scanImage(uri, token, finalMime);
      setRecipe(generatedRecipe);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate recipe');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = () => {
    if (recipe) {
      // In a real app, you'd prompt for a unit name here
      const recipeToSave = { ...recipe, unitName: 'My New Unit' };
      saveRecipe(recipeToSave);
      Alert.alert('Success', 'Recipe saved to your palette!');
      setRecipe(null);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        
        <View style={{ alignItems: 'center', marginTop: 24, marginBottom: 40 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Icon as={Camera} size={40} className="text-blue-600" style={{ marginRight: 8 }} />
            <H1 className="text-blue-600">ForgeLog</H1>
          </View>
          <P className="text-center text-slate-500 max-w-[280px]">
            Scan your miniature to reverse-engineer the paint recipe
          </P>
        </View>

        {!recipe && (
          <Card className="mb-6">
            <CardHeader className="items-center">
              <View className="w-16 h-16 bg-blue-50 rounded-full items-center justify-center mb-4">
                <Icon as={Camera} size={32} className="text-blue-500" />
              </View>
              <CardTitle>Scan Miniature</CardTitle>
              <CardDescription className="text-center">
                Take a clear photo in good lighting to get the most accurate paint match.
              </CardDescription>
            </CardHeader>
            <View className="flex-col gap-3 mt-2">
              <Button 
                label="Take Photo" 
                onPress={handleTakePhoto}
                loading={loading}
              />
              <Button 
                variant="outline" 
                label="Upload from Gallery" 
                onPress={handlePickImage}
                disabled={loading}
              />
            </View>
          </Card>
        )}

        {recipe && !loading && (
          <View className="mt-2">
            <RecipeCard recipe={recipe} />
            
            <View className="flex-col gap-3 mt-6">
              <Button 
                label="Save to Palette" 
                onPress={handleSaveRecipe}
                className="bg-green-600 active:bg-green-700"
              />
              <Button 
                variant="ghost" 
                label="Scan Another" 
                onPress={() => setRecipe(null)}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
