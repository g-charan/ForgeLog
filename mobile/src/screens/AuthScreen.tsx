import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { View, Text, TextInput, TouchableOpacity } from '../tw';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Palette, Mail, Lock, User } from 'lucide-react-native';
import { authClient } from '../services/authClient';
import { useAuthStore } from '../store/useAuthStore';

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  const checkSession = useAuthStore(s => s.checkSession);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }
    if (!isLogin && !name) {
      Alert.alert('Missing Name', 'Please enter your name.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await authClient.signIn.email({ email, password });
        if (error) throw new Error(error.message);
      } else {
        const { error } = await authClient.signUp.email({ email, password, name });
        if (error) throw new Error(error.message);
      }
      await checkSession();
    } catch (err: any) {
      Alert.alert('Authentication Failed', err.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View className="flex-1 justify-center px-6">
          {/* Header Section */}
          <View className="items-center mb-12">
            <View className="w-20 h-20 bg-blue-500 rounded-3xl items-center justify-center mb-6" style={{ shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 }}>
              <Palette color="white" size={40} strokeWidth={2.5} />
            </View>
            <Text className="text-4xl font-extrabold text-white tracking-tight mb-3">
              ForgeLog
            </Text>
            <Text className="text-slate-400 text-center text-base px-4">
              {isLogin ? 'Welcome back! Sign in to access your miniature painting recipes.' : 'Join ForgeLog to save and share your amazing paint recipes.'}
            </Text>
          </View>

          {/* Form Section */}
          <View className="w-full">
            {!isLogin && (
              <View className={`flex-row items-center bg-slate-800/50 border-2 rounded-2xl px-4 py-3.5 mb-4 ${focusedField === 'name' ? 'border-blue-500 bg-slate-800' : 'border-slate-700/50'}`}>
                <User color={focusedField === 'name' ? '#3b82f6' : '#64748b'} size={20} />
                <TextInput
                  className="flex-1 ml-3 text-white text-base"
                  placeholder="Your Name"
                  placeholderTextColor="#64748b"
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View className={`flex-row items-center bg-slate-800/50 border-2 rounded-2xl px-4 py-3.5 mb-4 ${focusedField === 'email' ? 'border-blue-500 bg-slate-800' : 'border-slate-700/50'}`}>
              <Mail color={focusedField === 'email' ? '#3b82f6' : '#64748b'} size={20} />
              <TextInput
                className="flex-1 ml-3 text-white text-base"
                placeholder="Email Address"
                placeholderTextColor="#64748b"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View className={`flex-row items-center bg-slate-800/50 border-2 rounded-2xl px-4 py-3.5 mb-8 ${focusedField === 'password' ? 'border-blue-500 bg-slate-800' : 'border-slate-700/50'}`}>
              <Lock color={focusedField === 'password' ? '#3b82f6' : '#64748b'} size={20} />
              <TextInput
                className="flex-1 ml-3 text-white text-base"
                placeholder="Password"
                placeholderTextColor="#64748b"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              className="w-full bg-blue-500 py-4 rounded-2xl items-center justify-center flex-row active:opacity-80"
              onPress={handleSubmit}
              disabled={loading}
              style={{ shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }}
            >
              {loading ? (
                <ActivityIndicator color="white" style={{ marginRight: 8 }} />
              ) : null}
              <Text className="text-white font-bold text-lg tracking-wide">
                {isLogin ? 'Sign In' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Toggle Section */}
          <View className="mt-8 flex-row justify-center items-center">
            <Text className="text-slate-400 text-base">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)} className="py-2 active:opacity-70">
              <Text className="text-blue-400 font-bold text-base">
                {isLogin ? 'Sign Up' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
