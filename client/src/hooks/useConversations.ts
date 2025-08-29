import { useState, useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { Conversation } from '../types/conversation';

export function useConversations(socket: Socket | null) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const loadConversations = useCallback(() => {
    if (!socket || !socket.connected) return;
    setLoading(true);
    socket.emit('conversations:list');
  }, [socket]);

  const loadConversation = useCallback((conversationId: number) => {
    if (!socket || !socket.connected) return;
    socket.emit('conversation:load', { conversationId });
    setCurrentConversationId(conversationId);
  }, [socket]);

  const deleteConversation = useCallback((conversationId: number) => {
    if (!socket || !socket.connected) return;
    socket.emit('conversation:delete', { conversationId });
  }, [socket]);

  const searchConversations = useCallback((query: string) => {
    if (!socket || !socket.connected) return;
    
    if (!query.trim()) {
      loadConversations();
      return;
    }
    setLoading(true);
    socket.emit('conversations:search', { query });
  }, [socket, loadConversations]);

  // Set up socket event listeners - only runs when socket changes
  useEffect(() => {
    if (!socket) return;

    const handleConversationsListed = (data: { conversations: Conversation[] }) => {
      setConversations(data.conversations);
      setLoading(false);
    };

    const handleConversationsSearched = (data: { conversations: Conversation[] }) => {
      setConversations(data.conversations);
      setLoading(false);
    };

    const handleConversationCreated = (data: { conversationId: number; title: string }) => {
      const newConversation: Conversation = {
        id: data.conversationId,
        title: data.title,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversationId(data.conversationId);
    };

    const handleConversationDeleted = (data: { conversationId: number }) => {
      setConversations(prev => prev.filter(c => c.id !== data.conversationId));
      setCurrentConversationId(current => 
        current === data.conversationId ? null : current
      );
    };

    const handleConversationsError = (data: { error: string }) => {
      console.error('Conversations error:', data.error);
      setLoading(false);
    };

    socket.on('conversations:listed', handleConversationsListed);
    socket.on('conversations:searched', handleConversationsSearched);
    socket.on('conversation:created', handleConversationCreated);
    socket.on('conversation:deleted', handleConversationDeleted);
    socket.on('conversations:error', handleConversationsError);

    // Initial load when socket is ready
    if (socket.connected && !initialized) {
      setInitialized(true);
      loadConversations();
    }

    // Load on connect
    const handleConnect = () => {
      if (!initialized) {
        setInitialized(true);
        loadConversations();
      }
    };
    
    socket.on('connect', handleConnect);

    return () => {
      socket.off('conversations:listed', handleConversationsListed);
      socket.off('conversations:searched', handleConversationsSearched);
      socket.off('conversation:created', handleConversationCreated);
      socket.off('conversation:deleted', handleConversationDeleted);
      socket.off('conversations:error', handleConversationsError);
      socket.off('connect', handleConnect);
    };
  }, [socket, initialized, loadConversations]);

  return {
    conversations,
    currentConversationId,
    loading,
    loadConversation,
    deleteConversation,
    searchConversations,
    loadConversations
  };
}