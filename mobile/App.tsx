import 'react-native-get-random-values';
import './src/global.css';
import React, { useEffect } from 'react';
import { ActivityIndicator, Platform } from 'react-native';
import { View } from './src/tw';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Camera, Palette, Box, Settings } from 'lucide-react-native';

import { ScannerScreen } from './src/screens/ScannerScreen';
import { PaletteScreen } from './src/screens/PaletteScreen';
import { StashScreen } from './src/screens/StashScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { useAuthStore } from './src/store/useAuthStore';
import { useRecipeStore } from './src/store/useRecipeStore';
import { useStashStore } from './src/store/useStashStore';

const queryClient = new QueryClient();
const Tab = createBottomTabNavigator();

function RootNavigator() {
  const { session, isLoading, checkSession, hasSeenOnboarding } = useAuthStore();
  const fetchRecipes = useRecipeStore(s => (s as any).fetchRecipes);
  const fetchStash = useStashStore(s => (s as any).fetchStash);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (session?.token) {
      fetchRecipes();
      fetchStash();
    }
  }, [session?.token, fetchRecipes, fetchStash]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-900">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  if (!hasSeenOnboarding) {
    return <OnboardingScreen />;
  }

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6', // blue-500
        tabBarInactiveTintColor: '#64748b', // slate-500
        tabBarStyle: {
          backgroundColor: '#1e293b', // slate-800
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 12,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Scanner" 
        component={ScannerScreen} 
        options={{ 
          title: 'Scan',
          tabBarIcon: ({ color, size, focused }) => (
            <Camera color={color} size={26} strokeWidth={focused ? 2.5 : 2} />
          )
        }}
      />
      <Tab.Screen 
        name="Palette" 
        component={PaletteScreen} 
        options={{ 
          title: 'Palette', 
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Palette color={color} size={26} strokeWidth={focused ? 2.5 : 2} />
          )
        }}
      />
      <Tab.Screen 
        name="Stash" 
        component={StashScreen} 
        options={{ 
          title: 'Stash', 
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Box color={color} size={26} strokeWidth={focused ? 2.5 : 2} />
          )
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ 
          title: 'Settings', 
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Settings color={color} size={26} strokeWidth={focused ? 2.5 : 2} />
          )
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
