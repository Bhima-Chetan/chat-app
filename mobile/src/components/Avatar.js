import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#10b981', '#0ea5e9'
];

const getInitials = (name = '') => name.charAt(0).toUpperCase();

const colorForName = (name = '') => {
  const charCodeSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COLORS[charCodeSum % COLORS.length];
};

export default function Avatar({ name, size = 40 }) {
  const initials = getInitials(name);
  const backgroundColor = colorForName(name);

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2, backgroundColor }]}>
      <Text style={[styles.text, { fontSize: size * 0.45 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
});
