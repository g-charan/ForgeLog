import React, { useState, useCallback, useMemo } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, TouchableOpacity } from '../tw';
import { useStashStore } from '../store/useStashStore';
import { Paint } from '../types';
import { H1, P } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import { MOCK_PAINTS } from '../constants/paints';
import { Search, Plus, Check, PlusCircle, X } from 'lucide-react-native';

const PaintItem = React.memo(({ item, isOwned, onToggle }: { item: Paint, isOwned: boolean, onToggle: (id: string, isOwned: boolean) => void }) => {
  const fallbackColor = '#e2e8f0';
  return (
    <View className="flex-row justify-between items-center py-4 border-b border-slate-100">
      <View className="flex-row flex-1 items-center mr-4">
        <View 
          className="w-10 h-10 rounded-full border border-slate-200 mr-3" 
          style={{ backgroundColor: item.colorHex || fallbackColor }} 
        />
        <View className="flex-1">
          <Text className="text-base font-semibold text-slate-900">{item.name}</Text>
          <Text className="text-sm text-slate-500 mt-0.5">
            {item.brand} {item.paintType ? `• ${item.paintType}` : ''}
          </Text>
        </View>
      </View>
      <TouchableOpacity 
        onPress={() => onToggle(item.id, isOwned)}
        className={`w-10 h-10 rounded-full items-center justify-center border ${isOwned ? 'bg-slate-900 border-slate-900' : 'bg-transparent border-slate-300'}`}
      >
        {isOwned ? <Check size={20} color="#ffffff" /> : <Plus size={20} color="#64748b" />}
      </TouchableOpacity>
    </View>
  );
});

export const StashScreen = () => {
  const { ownedPaintIds, customPaints, addPaint, removePaint, addCustomPaint, removeCustomPaint } = useStashStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'STASH'>('ALL');
  
  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customHex, setCustomHex] = useState('');

  const handleAddCustom = () => {
    if (!customName.trim()) return;
    const newPaint: Paint = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: customName,
      brand: 'Custom',
      paintType: 'Custom',
      colorHex: customHex.startsWith('#') ? customHex : `#${customHex}`,
    };
    addCustomPaint(newPaint);
    setIsModalVisible(false);
    setCustomName('');
    setCustomHex('');
    setActiveTab('STASH'); // Jump to stash to see the new paint
  };

  const filteredPaints = useMemo(() => {
    // Combine mock paints and custom paints
    const allPaints = [...MOCK_PAINTS, ...customPaints];
    
    // Filter by tab first
    let tabFiltered = allPaints;
    if (activeTab === 'STASH') {
      tabFiltered = allPaints.filter(p => ownedPaintIds.includes(p.id) || p.brand === 'Custom');
    }

    // Filter by search query
    if (!searchQuery.trim()) return tabFiltered;
    const query = searchQuery.toLowerCase();
    return tabFiltered.filter((paint) =>
      paint.name.toLowerCase().includes(query) || paint.brand.toLowerCase().includes(query)
    );
  }, [searchQuery, activeTab, ownedPaintIds, customPaints]);

  const handleToggle = useCallback((id: string, isOwned: boolean) => {
    // Check if it's a custom paint being removed
    const isCustom = id.startsWith('custom_');
    
    if (isOwned) {
      if (isCustom) {
        removeCustomPaint(id);
      } else {
        removePaint(id);
      }
    } else {
      addPaint(id);
    }
  }, [addPaint, removePaint, removeCustomPaint]);

  const renderPaint = useCallback(({ item }: { item: Paint }) => {
    // Custom paints are inherently owned
    const isOwned = item.brand === 'Custom' || ownedPaintIds.includes(item.id);
    return (
      <PaintItem 
        item={item} 
        isOwned={isOwned} 
        onToggle={handleToggle} 
      />
    );
  }, [ownedPaintIds, handleToggle]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View className="px-6 pt-6 pb-2 border-b border-slate-200">
        <View className="flex-row justify-between items-center mb-4">
          <H1 className="text-slate-900 mb-0">My Paint Stash</H1>
          <TouchableOpacity onPress={() => setIsModalVisible(true)} className="p-2">
            <PlusCircle size={24} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        {/* Custom Tab Bar */}
        <View className="flex-row bg-slate-100 p-1 rounded-xl mb-2">
          <TouchableOpacity 
            className={`flex-1 py-2 rounded-lg items-center ${activeTab === 'ALL' ? 'bg-white shadow-sm' : ''}`}
            onPress={() => setActiveTab('ALL')}
          >
            <Text className={`font-semibold ${activeTab === 'ALL' ? 'text-slate-900' : 'text-slate-500'}`}>All Paints</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-1 py-2 rounded-lg items-center ${activeTab === 'STASH' ? 'bg-white shadow-sm' : ''}`}
            onPress={() => setActiveTab('STASH')}
          >
            <Text className={`font-semibold ${activeTab === 'STASH' ? 'text-slate-900' : 'text-slate-500'}`}>My Stash ({ownedPaintIds.length + customPaints.length})</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View className="px-6 py-4 border-b border-slate-100 bg-white flex-row items-center space-x-3">
        <View className="flex-1 relative justify-center">
          <View className="absolute left-4 z-10">
            <Search size={18} color="#94a3b8" />
          </View>
          <TextInput
            className="bg-slate-50 pl-11 pr-4 py-3.5 rounded-2xl text-base text-slate-900 border border-slate-200 w-full"
            placeholder="Search by name or brand..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <FlatList
          data={filteredPaints}
          keyExtractor={(item) => item.id}
          renderItem={renderPaint}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          style={{ backgroundColor: '#ffffff', flex: 1 }}
          initialNumToRender={15}
          maxToRenderPerBatch={20}
          windowSize={5}
          removeClippedSubviews={true}
          keyboardShouldPersistTaps="handled"
        />
      </KeyboardAvoidingView>

      {/* Custom Color Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl p-6 h-[80%]">
              <View className="flex-row justify-between items-center mb-6">
                <H1 className="mb-0">Add Custom Paint</H1>
                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                  <X size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <View className="mb-6 items-center">
                <View 
                  className="w-24 h-24 rounded-full border-4 border-slate-100 shadow-sm"
                  style={{ backgroundColor: customHex.startsWith('#') ? customHex : (customHex ? `#${customHex}` : '#e2e8f0') }}
                />
                <Text className="text-slate-500 mt-3 font-medium">Color Preview</Text>
              </View>

              <View className="mb-4">
                <Text className="text-slate-700 font-semibold mb-2">Paint Name</Text>
                <TextInput
                  className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-lg"
                  placeholder="e.g. My Secret Blue"
                  value={customName}
                  onChangeText={setCustomName}
                />
              </View>

              <View className="mb-8">
                <Text className="text-slate-700 font-semibold mb-2">Hex Code (Optional)</Text>
                <TextInput
                  className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-lg"
                  placeholder="#3b82f6"
                  value={customHex}
                  onChangeText={setCustomHex}
                  autoCapitalize="none"
                />
              </View>

              <Button label="Save to Stash" onPress={handleAddCustom} disabled={!customName.trim()} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
};
