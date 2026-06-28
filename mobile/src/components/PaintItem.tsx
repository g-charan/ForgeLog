import React from 'react';
import { Linking } from 'react-native';
import { View, Text } from '../tw';
import { Paint } from '../types';
import { useStashStore } from '../store/useStashStore';
import { Button } from './ui/Button';

interface PaintItemProps {
  paint: Paint;
  stepName: string;
}

export const PaintItem: React.FC<PaintItemProps> = ({ paint, stepName }) => {
  const hasPaint = useStashStore((state) => state.hasPaint(paint.id));

  const handleBuy = () => {
    Linking.openURL(paint.affiliateUrl);
  };

  return (
    <View className="flex-row items-center justify-between py-4 border-b border-slate-100">
      <View className="flex-row flex-1 items-center mr-4">
        <View 
          className="w-10 h-10 rounded-full border border-slate-200 mr-3" 
          style={{ backgroundColor: paint.colorHex || '#e2e8f0' }} 
        />
        <View className="flex-1">
          <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {stepName}
          </Text>
          <Text className="text-base text-slate-900 mt-1 font-medium">
            {paint.name} 
            <Text className="text-slate-500 font-normal text-sm ml-1">
              {' '} ({paint.brand}{paint.paintType ? ` • ${paint.paintType}` : ''})
            </Text>
          </Text>
        </View>
      </View>
      {!hasPaint && (
        <View className="w-28">
          <Button 
            label="Buy" 
            onPress={handleBuy}
            className="h-10 px-3 bg-blue-600 rounded-xl"
            textClassName="text-sm font-semibold"
          />
        </View>
      )}
    </View>
  );
};
