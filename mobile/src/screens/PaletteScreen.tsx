import React, { useState, useMemo, useCallback } from 'react';
import { FlatList, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, TouchableOpacity } from '../tw';
import { useRecipeStore } from '../store/useRecipeStore';
import { useStashStore } from '../store/useStashStore';
import { RecipeCard } from '../components/RecipeCard';
import { H1, P } from '../components/ui/Typography';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { Palette, Search, X, PlusCircle, ChevronRight, Check } from 'lucide-react-native';
import { Paint, Recipe } from '../types';
import { MOCK_PAINTS } from '../constants/paints';

export const PaletteScreen = () => {
  const recipes = useRecipeStore((state) => state.recipes);
  const saveRecipe = useRecipeStore((state) => state.saveRecipe);
  const customPaints = useStashStore((state) => state.customPaints);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create Modal State
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [unitName, setUnitName] = useState('');
  const [basePaint, setBasePaint] = useState<Paint | null>(null);
  const [shadePaint, setShadePaint] = useState<Paint | null>(null);
  const [layerPaint, setLayerPaint] = useState<Paint | null>(null);
  const [highlightPaint, setHighlightPaint] = useState<Paint | null>(null);
  
  // Paint Picker Modal State
  const [paintPickerType, setPaintPickerType] = useState<'base' | 'shade' | 'layer' | 'highlight' | null>(null);
  const [paintSearchQuery, setPaintSearchQuery] = useState('');

  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) return recipes;
    const lowerQuery = searchQuery.toLowerCase();
    return recipes.filter(r => {
      const nameMatch = (r.unitName || 'Unnamed Unit').toLowerCase().includes(lowerQuery);
      const baseMatch = r.base?.name.toLowerCase().includes(lowerQuery);
      const highlightMatch = r.highlight?.name.toLowerCase().includes(lowerQuery);
      return nameMatch || baseMatch || highlightMatch;
    });
  }, [recipes, searchQuery]);

  const allAvailablePaints = useMemo(() => [...MOCK_PAINTS, ...customPaints], [customPaints]);
  
  const filteredAvailablePaints = useMemo(() => {
    if (!paintSearchQuery.trim()) return allAvailablePaints;
    const query = paintSearchQuery.toLowerCase();
    return allAvailablePaints.filter((paint) =>
      paint.name.toLowerCase().includes(query) || paint.brand.toLowerCase().includes(query)
    );
  }, [allAvailablePaints, paintSearchQuery]);

  const handleSavePalette = () => {
    if (!basePaint || !shadePaint || !highlightPaint) return;
    
    const newRecipe: Recipe = {
      id: '', // Backend will generate it
      unitName: unitName.trim() || 'Custom Palette',
      base: basePaint,
      shade: shadePaint,
      layers: layerPaint ? [layerPaint] : [],
      highlight: highlightPaint,
      confidence: 100,
      tips: ['Manually created custom palette.']
    };
    
    saveRecipe(newRecipe);
    resetCreateForm();
  };

  const resetCreateForm = () => {
    setIsCreateModalVisible(false);
    setUnitName('');
    setBasePaint(null);
    setShadePaint(null);
    setLayerPaint(null);
    setHighlightPaint(null);
  };

  const selectPaint = (paint: Paint) => {
    if (paintPickerType === 'base') setBasePaint(paint);
    if (paintPickerType === 'shade') setShadePaint(paint);
    if (paintPickerType === 'layer') setLayerPaint(paint);
    if (paintPickerType === 'highlight') setHighlightPaint(paint);
    setPaintPickerType(null);
    setPaintSearchQuery('');
  };

  const PaintSelectorRow = ({ label, selectedPaint, type }: { label: string, selectedPaint: Paint | null, type: 'base' | 'shade' | 'layer' | 'highlight' }) => (
    <TouchableOpacity 
      className="flex-row items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200 mb-3"
      onPress={() => setPaintPickerType(type)}
    >
      <View className="flex-row items-center flex-1">
        <View 
          className="w-10 h-10 rounded-full border border-slate-200 mr-3" 
          style={{ backgroundColor: selectedPaint?.colorHex || '#e2e8f0' }} 
        />
        <View className="flex-1">
          <Text className="text-slate-500 text-sm">{label}</Text>
          <Text className={`font-semibold text-base ${selectedPaint ? 'text-slate-900' : 'text-slate-400'}`}>
            {selectedPaint ? selectedPaint.name : 'Select a paint...'}
          </Text>
        </View>
      </View>
      <ChevronRight size={20} color="#94a3b8" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View className="px-6 pt-6 pb-4 border-b border-slate-200">
        <View className="flex-row justify-between items-center">
          <H1 className="text-slate-900 mb-0">My Palette</H1>
          <TouchableOpacity onPress={() => setIsCreateModalVisible(true)} className="p-2">
            <PlusCircle size={24} color="#3b82f6" />
          </TouchableOpacity>
        </View>
        <P className="text-slate-500 mt-1">
          {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} saved
        </P>
      </View>
      
      {/* Search Bar */}
      <View className="px-6 py-4 bg-white border-b border-slate-100">
        <View 
          className={`flex-row items-center bg-slate-50 border rounded-xl px-4 h-12 transition-colors duration-200 ${
            searchQuery ? 'border-slate-300 bg-white' : 'border-slate-200'
          }`}
        >
          <Icon as={Search} size={20} className={searchQuery ? 'text-slate-600' : 'text-slate-400'} />
          <TextInput
            className="flex-1 h-full text-slate-900 ml-2"
            placeholder="Search recipes..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              className="p-1.5 rounded-full bg-slate-200"
            >
              <Icon as={X} size={16} className="text-slate-500" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredRecipes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={recipes.length === 0 ? { flex: 1 } : { padding: 24, paddingBottom: 40 }}
        style={{ backgroundColor: '#ffffff', flex: 1 }}
        renderItem={({ item }) => (
          <RecipeCard recipe={item} />
        )}
        ListEmptyComponent={
          recipes.length === 0 ? (
            <View className="flex-1 items-center justify-center p-6 bg-slate-50">
              <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-6">
                <Icon as={Palette} size={40} className="text-slate-300" />
              </View>
              <H1 className="text-slate-900 mb-2 text-center">Your Palette is Empty</H1>
              <P className="text-slate-500 text-center max-w-[280px] mb-6">
                Scan your first miniature to save a recipe, or create a custom palette.
              </P>
              <Button label="Create Palette" onPress={() => setIsCreateModalVisible(true)} />
            </View>
          ) : (
            <View className="py-10 items-center">
              <Text className="text-slate-500 text-center">No recipes match your search.</Text>
            </View>
          )
        }
      />

      {/* Create Palette Modal */}
      <Modal visible={isCreateModalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl p-6 h-[90%]">
              <View className="flex-row justify-between items-center mb-6">
                <H1 className="mb-0">Create Palette</H1>
                <TouchableOpacity onPress={resetCreateForm}>
                  <X size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={[]} // Using FlatList just for scrolling form
                ListHeaderComponent={
                  <>
                    <View className="mb-6">
                      <Text className="text-slate-700 font-semibold mb-2">Palette Name</Text>
                      <TextInput
                        className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-lg"
                        placeholder="e.g. Ultramarines Armor"
                        value={unitName}
                        onChangeText={setUnitName}
                      />
                    </View>

                    <Text className="text-slate-700 font-semibold mb-2">Recipe Colors</Text>
                    
                    <PaintSelectorRow label="Base (Required)" selectedPaint={basePaint} type="base" />
                    <PaintSelectorRow label="Shade (Required)" selectedPaint={shadePaint} type="shade" />
                    <PaintSelectorRow label="Layer (Optional)" selectedPaint={layerPaint} type="layer" />
                    <PaintSelectorRow label="Highlight (Required)" selectedPaint={highlightPaint} type="highlight" />
                  </>
                }
                renderItem={() => null}
                showsVerticalScrollIndicator={false}
              />

              <View className="pt-4 mt-auto border-t border-slate-100">
                <Button 
                  label="Save Palette" 
                  onPress={handleSavePalette} 
                  disabled={!basePaint || !shadePaint || !highlightPaint} 
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Paint Picker Modal */}
      <Modal visible={paintPickerType !== null} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl p-6 h-[80%]">
              <View className="flex-row justify-between items-center mb-4">
                <H1 className="mb-0">Select Paint</H1>
                <TouchableOpacity onPress={() => { setPaintPickerType(null); setPaintSearchQuery(''); }}>
                  <X size={24} color="#64748b" />
                </TouchableOpacity>
              </View>
              
              <TextInput
                className="bg-slate-50 px-4 py-3.5 mb-4 rounded-xl text-base text-slate-900 border border-slate-200 w-full"
                placeholder="Search paints..."
                placeholderTextColor="#94a3b8"
                value={paintSearchQuery}
                onChangeText={setPaintSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <FlatList
                data={filteredAvailablePaints}
                keyExtractor={(item) => item.id}
                initialNumToRender={15}
                maxToRenderPerBatch={20}
                windowSize={5}
                removeClippedSubviews={true}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    className="flex-row items-center py-3 border-b border-slate-100"
                    onPress={() => selectPaint(item)}
                  >
                    <View 
                      className="w-10 h-10 rounded-full border border-slate-200 mr-3" 
                      style={{ backgroundColor: item.colorHex || '#e2e8f0' }} 
                    />
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-slate-900">{item.name}</Text>
                      <Text className="text-sm text-slate-500 mt-0.5">
                        {item.brand} {item.paintType ? `• ${item.paintType}` : ''}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View className="py-10 items-center">
                    <Text className="text-slate-500 text-center">No paints found.</Text>
                  </View>
                }
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
};
