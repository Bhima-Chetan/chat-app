import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_URL } from '../utils/config';

const api = axios.create({ baseURL: SERVER_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
