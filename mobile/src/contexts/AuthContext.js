import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const t = await AsyncStorage.getItem('token');
        const u = await AsyncStorage.getItem('user');
        
        // Clear any corrupt data immediately
        if (u === 'undefined' || u === 'null' || u === null) {
          await AsyncStorage.removeItem('user');
        }
        
        if (t && t !== 'undefined' && t !== 'null') {
          setToken(t);
          // Set auth header immediately on app start
          api.defaults.headers.common.Authorization = `Bearer ${t}`;
          console.log('🔧 Restored token and set API auth header');
        }
        
        if (u && u !== 'undefined' && u !== 'null') {
          try {
            const parsed = JSON.parse(u);
            if (parsed && typeof parsed === 'object' && parsed.id) {
              setUser(parsed);
            } else {
              await AsyncStorage.removeItem('user');
            }
          } catch (e) {
            console.warn('⚠️ Clearing corrupt user data');
            await AsyncStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('❌ Error loading stored auth data:', error);
        // Clear all potentially corrupted data
        try {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
        } catch {}
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (username, password) => {
    console.log('🔄 Starting login for username:', username);
    try {
      const res = await api.post('/auth/login', { username, password });
      console.log('✅ Login API response:', res.data);
      
      const { token, user: userData } = res.data;
      
      // Set state first
      setToken(token);
      setUser(userData);
      
      // Immediately set auth header for subsequent requests
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      
      // Store in AsyncStorage for persistence
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      console.log('✅ Login completed successfully, token set on API client');
    } catch (error) {
      console.error('❌ Login error:', error.response?.data || error.message);
      throw error;
    }
  };

  const register = async (username, password) => {
    console.log('🔄 Starting registration for username:', username);
    try {
      const res = await api.post('/auth/register', { username, password });
      console.log('✅ Registration API response:', res.data);
      setToken(res.data.token);
      setUser(res.data.user);
      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
      console.log('✅ Registration completed successfully');
    } catch (error) {
      console.error('❌ Registration error:', error.response?.data || error.message);
      throw error;
    }
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    // Clear auth header
    delete api.defaults.headers.common.Authorization;
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    console.log('🔄 Logged out and cleared API auth header');
  };  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
