import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_URL } from '../utils/config';

const api = axios.create({ baseURL: SERVER_URL });

api.interceptors.request.use(async (config) => {
  // First try from defaults (set immediately after login)
  let token = api.defaults.headers.common.Authorization;
  
  // Fallback to AsyncStorage if not in defaults
  if (!token) {
    const storedToken = await AsyncStorage.getItem('token');
    if (storedToken) {
      token = `Bearer ${storedToken}`;
      api.defaults.headers.common.Authorization = token;
    }
  }
  
  if (token) {
    config.headers.Authorization = token;
    console.log(`🔐 API Request: ${config.method?.toUpperCase()} ${config.url} with auth`);
  } else {
    console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url} (no auth)`);
  }
  
  return config;
});

export default api;
