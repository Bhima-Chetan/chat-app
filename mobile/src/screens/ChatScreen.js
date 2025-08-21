import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/client';
import { useSocket } from '../contexts/SocketProvider';
import Avatar from '../components/Avatar';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

const Tick = React.memo(function Tick({ status }) {
  const getTickProps = () => {
    switch (status) {
      case 'read':
        return {
          color: '#22c55e', // Green for read
          icon: '✓✓'
        };
      case 'delivered':
        return {
          color: '#64748b', // Gray for delivered  
          icon: '✓✓'
        };
      case 'sent':
        return {
          color: '#64748b', // Gray for sent
          icon: '✓'
        };
      default:
        return {
          color: '#64748b',
          icon: '✓'
        };
    }
  };

  const { color, icon } = getTickProps();
  
  const tickStyle = {
    color,
    fontSize: 12,
    fontWeight: '600'
  };

  return <Text style={tickStyle}>{icon}</Text>;
});

export default function ChatScreen({ route }) {
  const { peerId, username } = route.params;
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const [conversationId, setConversationId] = useState(route.params.conversationId || null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [showNewMessageBadge, setShowNewMessageBadge] = useState(false);
  const typingTimeoutRef = useRef(null);
  const initialMessageCount = useRef(0);
  const flatListRef = useRef(null);

  const sorted = useMemo(() => [...messages].sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt)), [messages]);

  // Track new messages and show badge
  useEffect(() => {
    if (initialMessageCount.current > 0 && messages.length > initialMessageCount.current) {
      const newCount = messages.length - initialMessageCount.current;
      setNewMessageCount(newCount);
      setShowNewMessageBadge(true);
      
      // Auto-hide badge after 3 seconds
      const timer = setTimeout(() => {
        setShowNewMessageBadge(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  // Auto-scroll to bottom when new messages arrive (debounced)
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      const timeoutId = setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: false });
      }, 50);
      
      return () => clearTimeout(timeoutId);
    }
  }, [messages.length]);

  const load = async () => {
    const res = await api.get(`/conversations/${peerId}/messages`);
    setConversationId(res.data.conversationId);
    setMessages(res.data.messages);
    initialMessageCount.current = res.data.messages.length;
    setNewMessageCount(0);
    setShowNewMessageBadge(false);
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
    
    const onMessageRead = ({ messageIds }) => {
      // Update status of messages that were read
      setMessages(prev => prev.map(msg => 
        messageIds.includes(msg._id) ? { ...msg, status: 'read' } : msg
      ));
    };
    
    socket.on('message:new', onNew);
    socket.on('typing:start', onTypingStart);
    socket.on('typing:stop', onTypingStop);
    socket.on('message:read', onMessageRead);
    
    return () => {
      socket.off('message:new', onNew);
      socket.off('typing:start', onTypingStart);
      socket.off('typing:stop', onTypingStop);
      socket.off('message:read', onMessageRead);
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

  const renderItem = React.useCallback(({ item, index }) => {
    const isMe = String(item.sender) === String(user.id);
    return (
      <View style={styles.msgRowContainer}>
        <View style={[styles.msgRow, isMe ? styles.rowMe : styles.rowThem]}>
          <View style={[styles.bubble, isMe ? styles.me : styles.them]}>
            <Text style={[styles.msgText, isMe ? styles.msgTextMe : styles.msgTextThem]}>{item.text}</Text>
            <View style={styles.meta}>
              <Text style={[styles.time, { color: isMe ? '#e2e8f0' : '#64748b' }]}>{dayjs(item.createdAt).format('HH:mm')}</Text>
              {isMe && (
                <View style={styles.tickContainer}>
                  <Tick status={item.status} />
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  }, [user.id]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.page}>
      {showNewMessageBadge && (
        <View style={styles.newMessageBadgeOverlay}>
          <Pressable 
            onPress={() => setShowNewMessageBadge(false)}
            style={[styles.newMessageBadge, styles.newMessagePressable]}
          >
            <Text style={styles.newMessageText}>
              {newMessageCount} new message{newMessageCount !== 1 ? 's' : ''}
            </Text>
            <Text style={styles.dismissText}>Tap to dismiss</Text>
          </Pressable>
        </View>
      )}
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Avatar name={username} size={36} />
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>{username}</Text>
              {typing ? (
                <View style={styles.typingRow}>
                  <Text style={styles.typingText}>typing...</Text>
                </View>
              ) : (
                <Text style={styles.subtitle}>Active now</Text>
              )}
            </View>
          </View>
        </View>
        
        <FlatList
          ref={flatListRef}
          data={sorted}
          keyExtractor={(item) => String(item._id || item.tempId)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 16, paddingHorizontal: 8, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={true}
          initialNumToRender={25}
          maxToRenderPerBatch={15}
          windowSize={10}
          getItemLayout={null}
          updateCellsBatchingPeriod={50}
        />
        <View style={styles.inputRow}>
          <TextInput 
            placeholder="Message" 
            style={styles.input} 
            value={text} 
            onChangeText={onChangeText}
            onSubmitEditing={send}
            returnKeyType="send"
            blurOnSubmit={false}
            multiline={false}
          />
        <Pressable
          style={styles.sendBtn}
          onPress={send}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Send</Text>
        </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { 
    flex: 1, 
    backgroundColor: '#f8fafc' 
  },
  content: { 
    flex: 1, 
    width: '100%', 
    maxWidth: 900, 
    alignSelf: 'center',
    backgroundColor: 'white'
  },
  header: { 
    paddingHorizontal: 16, 
    paddingVertical: 16, 
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    borderBottomWidth: 1, 
    borderBottomColor: '#e5e7eb', 
    backgroundColor: '#ffffff',
    zIndex: 10
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '600',
    color: '#111827'
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2
  },
  typingRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 2
  },
  typingText: {
    fontSize: 12,
    color: '#22c55e',
    marginRight: 4,
    fontStyle: 'italic'
  },
  typingDot: { 
    width: 4, 
    height: 4, 
    borderRadius: 2, 
    backgroundColor: '#22c55e', 
    marginRight: 2 
  },
  msgRowContainer: { 
    width: '100%',
    marginVertical: 1
  },
  msgRow: { 
    width: '100%', 
    flexDirection: 'row',
    paddingHorizontal: 4
  },
  rowMe: { justifyContent: 'flex-end' },
  rowThem: { justifyContent: 'flex-start' },
  bubble: { 
    maxWidth: '75%', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderRadius: 20, 
    marginVertical: 2
  },
  me: { 
    backgroundColor: '#007AFF', 
    borderBottomRightRadius: 6,
    marginRight: 8
  },
  them: { 
    backgroundColor: '#f1f3f4', 
    borderBottomLeftRadius: 6,
    marginLeft: 8
  },
  msgText: {
    fontSize: 16,
    lineHeight: 22
  },
  msgTextMe: {
    color: '#ffffff'
  },
  msgTextThem: {
    color: '#1f2937'
  },
  meta: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 4, 
    alignSelf: 'flex-end' 
  },
  time: { 
    fontSize: 11, 
    marginRight: 4,
    fontWeight: '500'
  },
  tickContainer: {
    minWidth: 20,
    alignItems: 'flex-end'
  },
  tick: { 
    fontSize: 11, 
    color: '#e2e8f0' 
  },
  inputRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-end',
    padding: 16, 
    borderTopWidth: 1, 
    borderTopColor: '#e5e7eb', 
    backgroundColor: '#ffffff',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16
  },
  input: { 
    flex: 1, 
    borderWidth: 1, 
    borderColor: '#d1d5db', 
    borderRadius: 24, 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    marginRight: 12, 
    backgroundColor: '#f9fafb',
    maxHeight: 120,
    fontSize: 16,
    minHeight: 44
  },
  sendBtn: { 
    backgroundColor: '#007AFF', 
    borderRadius: 24, 
    paddingHorizontal: 20, 
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
    minWidth: 60
  },
  newMessageBadgeOverlay: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    paddingHorizontal: 20
  },
  newMessageBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 25
  },
  newMessagePressable: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center'
  },
  newMessageText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center'
  },
  dismissText: {
    color: '#ffffff',
    fontSize: 11,
    opacity: 0.8,
    marginTop: 2,
    textAlign: 'center'
  }
});
