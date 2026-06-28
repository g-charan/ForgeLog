import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = "https://ep-patient-rain-atr4n108.neonauth.c-9.us-east-1.aws.neon.tech/neondb/auth";

async function fetchAuth(endpoint: string, body?: any) {
  const options: RequestInit = {
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Origin': 'http://localhost:8081' // Required by Better Auth
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const token = await AsyncStorage.getItem('auth_token');
  if (token && options.headers) {
    (options.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await res.json().catch(() => null);
  
  if (!res.ok) {
    return { data: null, error: data || { message: 'Network request failed' } };
  }
  return { data, error: null };
}

export const authClient = {
  getSession: async () => {
    // Hydrate the session from local storage to avoid Better Auth cookie requirements
    const userStr = await AsyncStorage.getItem('auth_user');
    const token = await AsyncStorage.getItem('auth_token');
    if (userStr && token) {
      return { data: { session: { token }, user: JSON.parse(userStr) }, error: null };
    }
    return { data: null, error: { message: 'No session' } };
  },
  signOut: async () => {
    await fetchAuth('/sign-out', {});
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('auth_user');
    return { data: true, error: null };
  },
  signIn: {
    email: async (credentials: any) => {
      const res = await fetchAuth('/sign-in/email', credentials);
      if (res.data?.token && res.data?.user) {
        await AsyncStorage.setItem('auth_token', res.data.token);
        await AsyncStorage.setItem('auth_user', JSON.stringify(res.data.user));
      }
      return res;
    }
  },
  signUp: {
    email: async (credentials: any) => {
      const res = await fetchAuth('/sign-up/email', credentials);
      if (res.data?.token && res.data?.user) {
        await AsyncStorage.setItem('auth_token', res.data.token);
        await AsyncStorage.setItem('auth_user', JSON.stringify(res.data.user));
      }
      return res;
    }
  }
};
