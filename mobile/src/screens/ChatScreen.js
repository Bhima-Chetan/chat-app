import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/client';
import { useSocket } from '../contexts/SocketProvider';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

function Tick({ status }) {
  // One tick for sent/delivered, double for read
  if (status === 'read') return <Text style={styles.tick}>✓✓</Text>;
  return <Text style={styles.tick}>✓</Text>;
}

export default function ChatScreen({ route }) {
  const { peerId, username } = route.params;
  const { user } = useAuth();
  const { socket } = useSocket();
  const [conversationId, setConversationId] = useState(route.params.conversationId || null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const sorted = useMemo(() => [...messages].sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt)), [messages]);

  const load = async () => {
    const res = await api.get(`/conversations/${peerId}/messages`);
    setConversationId(res.data.conversationId);
    setMessages(res.data.messages);
    // Mark other's messages as read
    const unreadIds = res.data.messages.filter(m => String(m.sender) === String(peerId) && m.status !== 'read').map(m => m._id);
    if (socket && unreadIds.length) socket.emit('message:read', { conversationId: res.data.conversationId, messageIds: unreadIds });
  };

  useEffect(() => { load(); }, [peerId]);

  useEffect(() => {
    if (!socket) return;
    const onNew = ({ message }) => {
      // Only messages that belong to this conversation
      if (String(message.sender) !== String(peerId) && String(message.recipient) !== String(peerId)) return;
      setMessages((prev) => {
        if (message.tempId) {
          // replace temp with real
          const idx = prev.findIndex(m => m.tempId === message.tempId);
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = { ...message };
            return next;
          }
        }
        const existingIdx = prev.findIndex(m => String(m._id) === String(message._id));
        if (existingIdx !== -1) {
          const next = [...prev];
          next[existingIdx] = { ...message };
          return next;
        }
        return [...prev, message];
      });
      // If we received a message from peer, mark read
      if (String(message.sender) === String(peerId)) {
        socket.emit('message:read', { conversationId, messageIds: [message._id] });
      }
    };
    const onTypingStart = ({ from }) => {
      if (String(from) === String(peerId)) setTyping(true);
    };
    const onTypingStop = ({ from }) => {
      if (String(from) === String(peerId)) setTyping(false);
    };
    socket.on('message:new', onNew);
    socket.on('typing:start', onTypingStart);
    socket.on('typing:stop', onTypingStop);
    return () => {
      socket.off('message:new', onNew);
      socket.off('typing:start', onTypingStart);
      socket.off('typing:stop', onTypingStop);
    };
  }, [socket, peerId, conversationId]);

  const send = () => {
    const t = text.trim();
    if (!t) return;
    const tempId = uuidv4();
    const optimistic = { _id: tempId, tempId, conversation: conversationId, sender: user.id, recipient: peerId, text: t, status: 'sent', createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, optimistic]);
    setText('');
    socket.emit('message:send', { to: peerId, text: t, tempId });
  };

  const onChangeText = (val) => {
    setText(val);
    if (!socket) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit('typing:start', { to: peerId });
    typingTimeoutRef.current = setTimeout(() => socket.emit('typing:stop', { to: peerId }), 1200);
  };

  const renderItem = ({ item }) => {
    const isMe = String(item.sender) === String(user.id);
    return (
      <View style={[styles.bubble, isMe ? styles.me : styles.them]}>
        <Text style={{ color: isMe ? 'white' : 'black' }}>{item.text}</Text>
        <View style={styles.meta}>
          <Text style={[styles.time, { color: isMe ? '#e2e8f0' : '#64748b' }]}>{dayjs(item.createdAt).format('HH:mm')}</Text>
          {isMe && <Tick status={item.status} />}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{username}</Text>
        {typing && <Text style={styles.typing}>typing...</Text>}
      </View>
      <FlatList
        data={sorted}
        keyExtractor={(item) => String(item._id || item.tempId)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12 }}
      />
      <View style={styles.inputRow}>
        <TextInput placeholder="Message" style={styles.input} value={text} onChangeText={onChangeText} />
        <TouchableOpacity style={styles.sendBtn} onPress={send}>
          <Text style={{ color: 'white', fontWeight: '600' }}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  typing: { color: '#94a3b8', marginTop: 4 },
  bubble: { maxWidth: '80%', padding: 10, borderRadius: 8, marginBottom: 8 },
  me: { alignSelf: 'flex-end', backgroundColor: '#2563eb' },
  them: { alignSelf: 'flex-start', backgroundColor: '#e2e8f0' },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 6, alignSelf: 'flex-end' },
  time: { fontSize: 10, marginRight: 4 },
  tick: { fontSize: 10, color: '#e2e8f0' },
  inputRow: { flexDirection: 'row', padding: 8, borderTopWidth: 1, borderTopColor: '#eee' },
  input: { flex: 1, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8 },
  sendBtn: { backgroundColor: '#2563eb', borderRadius: 20, paddingHorizontal: 16, justifyContent: 'center' }
});
