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
      const t = await AsyncStorage.getItem('token');
      const u = await AsyncStorage.getItem('user');
      if (t && u) {
        setToken(t);
        setUser(JSON.parse(u));
      }
      setLoading(false);
    })();
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    setToken(res.data.token);
    setUser(res.data.user);
    await AsyncStorage.setItem('token', res.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
  };

  const register = async (username, password) => {
    const res = await api.post('/auth/register', { username, password });
    setToken(res.data.token);
    setUser(res.data.user);
    await AsyncStorage.setItem('token', res.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
