import React, { useRef, useState } from 'react';
import { FlatList, Dimensions, TouchableOpacity, View, Text, StyleSheet, Platform } from 'react-native';
import { Camera, Palette, Box } from 'lucide-react-native';
import { useAuthStore } from '../store/useAuthStore';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Scan Your Minis',
    description: 'Take a photo of any painted miniature. Our AI extracts the exact Vallejo and Citadel recipe instantly.',
    icon: Camera,
    color: '#60a5fa', // blue-400
    iconBg: 'rgba(59, 130, 246, 0.15)', 
    shadowColor: '#3b82f6'
  },
  {
    id: '2',
    title: 'Save & Customize',
    description: 'Save your favorite recipes to your Palette. Edit layers, highlight colors, and add custom notes.',
    icon: Palette,
    color: '#a78bfa', // violet-400
    iconBg: 'rgba(139, 92, 246, 0.15)', 
    shadowColor: '#8b5cf6'
  },
  {
    id: '3',
    title: 'Track Your Stash',
    description: 'Never buy duplicate paints again. Keep track of what you own and plan your next hobby purchase.',
    icon: Box,
    color: '#34d399', // emerald-400
    iconBg: 'rgba(16, 185, 129, 0.15)', 
    shadowColor: '#10b981'
  }
];

export function OnboardingScreen() {
  const completeOnboarding = useAuthStore(s => s.completeOnboarding);
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      completeOnboarding();
    }
  };

  const handleScroll = (e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / width);
    setCurrentIndex(index);
  };

  const renderItem = ({ item, index }: { item: typeof slides[0], index: number }) => {
    const IconComponent = item.icon;
    const isLast = index === slides.length - 1;

    return (
      <View style={[styles.slideContainer, { width }]}>
        {/* Top Visual Area */}
        <View style={styles.topSection}>
          <View style={[
            styles.iconWrapper, 
            { 
              backgroundColor: item.iconBg,
              shadowColor: item.shadowColor,
            }
          ]}>
            <IconComponent size={72} color={item.color} strokeWidth={2} />
          </View>
        </View>

        {/* Bottom Card Area */}
        <View style={styles.bottomCard}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>

          <View style={styles.footer}>
            <View style={styles.pagination}>
              {slides.map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.dot, 
                    i === index ? styles.dotActive : styles.dotInactive,
                    i === index && { backgroundColor: item.color }
                  ]} 
                />
              ))}
            </View>

            <TouchableOpacity 
              onPress={handleNext}
              activeOpacity={0.8}
              style={[
                styles.button, 
                { shadowColor: item.shadowColor }
              ]}
            >
              <Text style={styles.buttonText}>{isLast ? 'Get Started' : 'Continue'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        {currentIndex < slides.length - 1 && (
          <TouchableOpacity onPress={completeOnboarding} style={styles.skipButton} activeOpacity={0.6}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a', // slate-900
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 16,
    height: 60,
    zIndex: 10,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    color: '#94a3b8', // slate-400
    fontSize: 16,
    fontWeight: '600',
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topSection: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  bottomCard: {
    flex: 1,
    backgroundColor: '#1e293b', // slate-800
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 32,
    paddingTop: 48,
    paddingBottom: Platform.OS === 'ios' ? 24 : 40,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    color: '#94a3b8', // slate-400
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 8,
  },
  footer: {
    width: '100%',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    height: 10,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 32,
  },
  dotInactive: {
    width: 8,
    backgroundColor: '#334155', // slate-700
  },
  button: {
    backgroundColor: '#3b82f6', // blue-500
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
