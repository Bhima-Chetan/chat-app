import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MotiView } from 'moti';

export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <View style={styles.container}>
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 300 }}
        style={styles.content}
      >
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.text}>{message}</Text>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  content: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500'
  }
});
