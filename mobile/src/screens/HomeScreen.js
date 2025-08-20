import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketProvider';
import dayjs from 'dayjs';

export default function HomeScreen({ navigation }) {
  const { logout, user } = useAuth();
  const { socket } = useSocket();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!socket) return;
    const onPresence = (p) => {
      setUsers((prev) => prev.map(u => u.id === p.userId ? { ...u, online: p.online, lastSeen: p.lastSeen } : u));
    };
    const onNewMsg = ({ message }) => {
      // Update last message preview
      setUsers((prev) => prev.map(u => {
        if (String(u.id) === String(message.sender) || String(u.id) === String(message.recipient)) {
          return { ...u, lastMessage: { text: message.text, at: message.createdAt, from: message.sender } };
        }
        return u;
      }));
    };
    socket.on('presence:update', onPresence);
    socket.on('message:new', onNewMsg);
    return () => {
      socket.off('presence:update', onPresence);
      socket.off('message:new', onNewMsg);
    };
  }, [socket]);

  const renderItem = ({ item }) => {
    const last = item.lastMessage;
    return (
      <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Chat', { peerId: item.id, username: item.username, conversationId: item.conversationId })}>
        <View style={[styles.dot, { backgroundColor: item.online ? '#4ade80' : '#cbd5e1' }]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.username}{String(item.id) === String(user?.id) ? ' (You)' : ''}</Text>
          <Text style={styles.preview} numberOfLines={1}>{last ? last.text : 'No messages yet'}</Text>
        </View>
        <Text style={styles.time}>{last?.at ? dayjs(last.at).format('HH:mm') : ''}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={users}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#eee', marginLeft: 56 }} />}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Chats</Text>
            <Text style={styles.logout} onPress={logout}>Logout</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  logout: { color: '#ef4444' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  name: { fontWeight: '600', fontSize: 16 },
  preview: { color: '#64748b', marginTop: 4 },
  time: { color: '#94a3b8', fontSize: 12, marginLeft: 8 }
});
