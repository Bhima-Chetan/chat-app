import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);
      await register(username.trim(), password);
    } catch (e) {
      Alert.alert('Register failed', e?.response?.data?.error || 'Try again');
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <TextInput placeholder="Username" style={styles.input} autoCapitalize='none' value={username} onChangeText={setUsername} />
      <TextInput placeholder="Password (min 6)" style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />
      <Button title={loading ? 'Loading...' : 'Register'} onPress={onSubmit} disabled={loading} />
      <TouchableOpacity style={{ marginTop: 16 }} onPress={() => navigation.navigate('Login')}>
        <Text>Have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 }
});
