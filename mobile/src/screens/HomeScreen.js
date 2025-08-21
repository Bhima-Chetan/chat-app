import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketProvider';
import Avatar from '../components/Avatar';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

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

  const renderItem = ({ item, index }) => {
    const last = item.lastMessage;
    const isCurrentUser = String(item.id) === String(user?.id);
    
    return (
      <TouchableOpacity 
        style={styles.row} 
        onPress={() => navigation.navigate('Chat', { peerId: item.id, username: item.username, conversationId: item.conversationId })}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <Avatar name={item.username} size={48} />
          {item.online && <View style={styles.onlineIndicator} />}
        </View>
        
        <View style={styles.content}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>
              {item.username}{isCurrentUser ? ' (You)' : ''}
            </Text>
            {last?.at && (
              <Text style={styles.time}>{dayjs(last.at).format('HH:mm')}</Text>
            )}
          </View>
          <Text style={styles.preview} numberOfLines={1}>
            {last ? last.text : 'Start a conversation...'}
          </Text>
          {!item.online && item.lastSeen && (
            <Text style={styles.lastSeen}>
              Last seen {dayjs(item.lastSeen).fromNow()}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <FlatList
        data={users}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  header: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  logout: { color: '#ef4444', fontWeight: '600', fontSize: 16 },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    backgroundColor: 'white',
    minHeight: 72
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: 'white'
  },
  content: {
    flex: 1,
    paddingRight: 8
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  name: { 
    fontWeight: '600', 
    fontSize: 16, 
    color: '#111827',
    flex: 1
  },
  preview: { 
    color: '#6b7280', 
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 2
  },
  lastSeen: {
    color: '#9ca3af',
    fontSize: 12,
    fontStyle: 'italic'
  },
  time: { 
    color: '#94a3b8', 
    fontSize: 12,
    fontWeight: '500'
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginLeft: 76
  }
});
