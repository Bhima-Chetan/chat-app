import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Modal, Pressable } from 'react-native';
import { MotiView, MotiText } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import api from '../api/client';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // micro-bounce for CTA
  const ctaScale = useSharedValue(1);
  const ctaAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: ctaScale.value }] }), []);

  const onSubmit = async () => {
    try {
      setLoading(true);
      // perform registration but do NOT auto-login; show success modal then navigate to Login
      await api.post('/auth/register', { username: username.trim(), password });
      setSuccess(true);
    } catch (e) {
      Alert.alert('Register failed', e?.response?.data?.error || 'Try again');
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.root}>
      <MotiView
        from={{ opacity: 0, translateY: 14 }}
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
          Create Account
        </MotiText>

        <MotiView
          from={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 100 }}
        >
          <TextInput placeholder="Username" style={styles.input} autoCapitalize='none' value={username} onChangeText={setUsername} />
          <TextInput placeholder="Password (min 6)" style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />
        </MotiView>

        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 400, delay: 200 }}>
          <AnimatedPressable
            disabled={loading}
            onPressIn={() => { ctaScale.value = withSpring(0.97, { damping: 18, stiffness: 220 }); }}
            onPressOut={() => { ctaScale.value = withSpring(1, { damping: 16, stiffness: 180 }); }}
            onPress={onSubmit}
            style={[{ borderRadius: 12, overflow: 'hidden' }, ctaAnimatedStyle]}
            accessibilityRole="button"
            accessibilityLabel="Create account"
          >
            <LinearGradient
              colors={[ '#feda75', '#fa7e1e', '#d62976', '#962fbf', '#4f5bd5' ]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.gradientBtn}
            >
              <Text style={styles.gradientBtnText}>{loading ? 'Creating...' : 'Create Account'}</Text>
            </LinearGradient>
          </AnimatedPressable>
        </MotiView>

        <TouchableOpacity style={{ marginTop: 16 }} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.muted}>Have an account? Login</Text>
        </TouchableOpacity>
      </MotiView>
      {/* Success Modal */}
      <Modal visible={success} transparent animationType="fade" onRequestClose={() => setSuccess(false)}>
        <View style={styles.modalBackdrop}>
          <MotiView
            from={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 250 }}
            style={styles.modalCard}
          >
            <Text style={styles.modalTitle}>Welcome!</Text>
            <Text style={styles.modalText}>Your account has been created successfully.</Text>
            <TouchableOpacity onPress={() => { setSuccess(false); navigation.replace('Login'); }} style={styles.modalCta}>
              <Text style={styles.modalCtaText}>Go to Login</Text>
            </TouchableOpacity>
          </MotiView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: { width: '100%', maxWidth: 420, backgroundColor: 'white', borderRadius: 18, padding: 22, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 20, textAlign: 'center', color: '#111827' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12, marginBottom: 12, backgroundColor: '#f9fafb' },
  muted: { color: '#6b7280', textAlign: 'center' },
  gradientBtn: { paddingVertical: 14, alignItems: 'center' },
  gradientBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { width: '100%', maxWidth: 360, backgroundColor: 'white', borderRadius: 16, padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 6 },
  modalText: { color: '#374151', textAlign: 'center', marginBottom: 14 },
  modalCta: { backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  modalCtaText: { color: 'white', fontWeight: '700' }
});
