import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MotiView, MotiText } from 'moti';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);
      await login(username.trim(), password);
    } catch (e) {
      Alert.alert('Login failed', e?.response?.data?.error || 'Try again');
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.root}>
      <MotiView
        from={{ opacity: 0, translateY: 12 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500 }}
        style={styles.card}
      >
        <MotiText
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 450 }}
          style={styles.title}
        >
          Welcome Back
        </MotiText>

        <MotiView
          from={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 100 }}
        >
          <TextInput placeholder="Username" style={styles.input} autoCapitalize='none' value={username} onChangeText={setUsername} />
          <TextInput placeholder="Password" style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />
        </MotiView>

        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 200 }}
        >
          <TouchableOpacity 
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]} 
            onPress={onSubmit} 
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.loginBtnText}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>
        </MotiView>

        <TouchableOpacity style={{ marginTop: 16 }} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.muted}>New here? Register</Text>
        </TouchableOpacity>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: { 
    width: '100%', 
    maxWidth: 420, 
    backgroundColor: 'white', 
    borderRadius: 16, 
    padding: 24, 
    shadowColor: '#000', 
    shadowOpacity: 0.08, 
    shadowRadius: 16, 
    shadowOffset: { width: 0, height: 4 }, 
    elevation: 3 
  },
  title: { 
    fontSize: 28, 
    fontWeight: '700', 
    marginBottom: 24, 
    textAlign: 'center', 
    color: '#111827' 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#d1d5db', 
    borderRadius: 12, 
    padding: 14, 
    marginBottom: 16, 
    backgroundColor: '#f9fafb',
    fontSize: 16,
    fontWeight: '400'
  },
  loginBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  loginBtnDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0
  },
  loginBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  muted: { 
    color: '#6b7280', 
    textAlign: 'center',
    fontSize: 14,
    marginTop: 4
  }
});
