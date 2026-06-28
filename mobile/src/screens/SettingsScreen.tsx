import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from '../tw';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, User, LogOut, ChevronRight, Moon, Shield, Bell } from 'lucide-react-native';
import { useAuthStore } from '../store/useAuthStore';

export function SettingsScreen() {
  const { user, signOut } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => signOut() }
      ]
    );
  };

  const SettingRow = ({ icon: Icon, title, value, onPress, isDestructive = false }: any) => (
    <TouchableOpacity 
      className="flex-row items-center bg-slate-800/50 p-4 border-b border-slate-700/50 active:opacity-70"
      onPress={onPress}
    >
      <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${isDestructive ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
        <Icon color={isDestructive ? '#ef4444' : '#3b82f6'} size={20} />
      </View>
      <View className="flex-1">
        <Text className={`text-base font-medium ${isDestructive ? 'text-red-400' : 'text-slate-200'}`}>
          {title}
        </Text>
      </View>
      {value ? (
        <Text className="text-slate-400 text-sm mr-2">{value}</Text>
      ) : null}
      {!isDestructive && <ChevronRight color="#64748b" size={20} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <View className="flex-row items-center px-6 pt-4 pb-6">
        <Text className="text-3xl font-extrabold text-white tracking-tight">Settings</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Profile Section */}
        <View className="px-6 mb-8">
          <View className="bg-slate-800 rounded-3xl p-6 items-center border border-slate-700/50 shadow-sm" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 }}>
            <View className="w-20 h-20 bg-blue-600 rounded-full items-center justify-center mb-4 border-4 border-slate-900">
              <Text className="text-3xl font-bold text-white">
                {user?.name ? user.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U')}
              </Text>
            </View>
            <Text className="text-xl font-bold text-white mb-1">{user?.name || 'User'}</Text>
            <Text className="text-slate-400">{user?.email || 'No email provided'}</Text>
          </View>
        </View>

        {/* Preferences Section */}
        <View className="px-4 mb-6">
          <Text className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 ml-4">Preferences</Text>
          <View className="bg-slate-800 rounded-3xl overflow-hidden border border-slate-700/50">
            <SettingRow icon={Moon} title="Dark Mode" value="On" />
            <SettingRow icon={Bell} title="Notifications" value="Enabled" />
          </View>
        </View>

        {/* Account Section */}
        <View className="px-4 mb-8">
          <Text className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 ml-4">Account</Text>
          <View className="bg-slate-800 rounded-3xl overflow-hidden border border-slate-700/50">
            <SettingRow icon={User} title="Edit Profile" />
            <SettingRow icon={Shield} title="Privacy & Security" />
            <SettingRow 
              icon={LogOut} 
              title="Sign Out" 
              isDestructive={true} 
              onPress={handleSignOut} 
            />
          </View>
        </View>
        
        <Text className="text-center text-slate-600 text-sm mb-10">
          ForgeLog App Version 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
