import React, { useState } from 'react';
import { TextInput, TouchableOpacity, Pressable } from 'react-native';
import Animated, { LinearTransition, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { View, Text } from '../tw';
import { Recipe } from '../types';
import { PaintItem } from './PaintItem';
import { Card } from './ui/Card';
import { useRecipeStore } from '../store/useRecipeStore';
import { Icon } from './ui/Icon';
import { ChevronDown, ChevronUp, Pencil, Trash2, Check } from 'lucide-react-native';

interface RecipeCardProps {
  recipe: Recipe;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(recipe.unitName || '');

  const deleteRecipe = useRecipeStore((state) => state.deleteRecipe);
  const updateRecipe = useRecipeStore((state) => state.updateRecipe);

  const handleSaveName = () => {
    updateRecipe(recipe.id, { unitName: editName });
    setIsEditing(false);
  };

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View layout={LinearTransition.springify().damping(14)}>
      <Card className="my-2 overflow-hidden p-0 shadow-sm" style={{ borderColor: '#cbd5e1', borderWidth: 1 }}>
        {/* Header / Accordion Toggle */}
        <AnimatedPressable 
          className="flex-row items-center justify-between p-4 bg-white border-b border-slate-100"
          style={animatedStyle}
          onPress={() => setIsExpanded(!isExpanded)}
          onPressIn={() => { scale.value = withSpring(0.98, { damping: 15 }); }}
          onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
        >
        <View className="flex-1 mr-4">
          {isEditing ? (
            <View className="flex-row items-center border border-slate-300 rounded-lg px-3 py-1">
              <TextInput
                className="flex-1 h-8 text-slate-900 font-bold"
                value={editName}
                onChangeText={setEditName}
                autoFocus
                onSubmitEditing={handleSaveName}
              />
              <TouchableOpacity onPress={handleSaveName} className="p-1">
                <Icon as={Check} size={18} className="text-green-600" />
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-row items-center">
              <View className="flex-1">
                <Text className="text-lg font-bold text-slate-900">
                  {recipe.unitName || 'Unnamed Unit'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsEditing(true)} className="p-2 ml-2 bg-slate-50 rounded-full">
                <Icon as={Pencil} size={16} className="text-slate-500" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => deleteRecipe(recipe.id)} className="p-2 mr-1">
            <Icon as={Trash2} size={18} className="text-red-500" />
          </TouchableOpacity>
          <View className="p-2">
            <Icon as={isExpanded ? ChevronUp : ChevronDown} size={20} className="text-slate-400" />
          </View>
        </View>
      </AnimatedPressable>

      {/* Expandable Content */}
      {isExpanded && (
        <View className="p-5 bg-slate-50/50">
          {recipe.confidence < 40 && (
            <View className="bg-amber-50 p-4 rounded-2xl mb-5 border border-amber-200">
              <Text className="text-amber-700 text-sm font-semibold">
                Low confidence — try better lighting
              </Text>
            </View>
          )}

          <PaintItem paint={recipe.base} stepName="1. Base Coat" />
          <PaintItem paint={recipe.shade} stepName="2. Shade" />
          
          {recipe.layers.map((layer, index) => (
            <PaintItem key={layer.id} paint={layer} stepName={`3.${index + 1} Layer`} />
          ))}
          
          <PaintItem paint={recipe.highlight} stepName="4. Highlight" />
          
          {recipe.optional && (
            <PaintItem paint={recipe.optional} stepName="5. Optional" />
          )}

          {recipe.tips && recipe.tips.length > 0 && (
            <View className="mt-5 pt-5 border-t border-slate-100">
              <Text className="font-bold text-slate-900 mb-3">Tips:</Text>
              {recipe.tips.map((tip, idx) => (
                <Text key={idx} className="text-sm text-slate-600 mb-2 leading-relaxed">
                  • {tip}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}
      </Card>
    </Animated.View>
  );
};
