import { useState, useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { Conversation } from '../types/conversation';

export function useConversations(socket: Socket | null) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const loadConversations = useCallback(() => {
    if (!socket) return;
    setLoading(true);
    socket.emit('conversations:list');
  }, [socket]);

  const loadConversation = useCallback((conversationId: number) => {
    if (!socket) return;
    setLoading(true);
    socket.emit('conversation:load', { conversationId });
    setCurrentConversationId(conversationId);
  }, [socket]);

  const deleteConversation = useCallback((conversationId: number) => {
    if (!socket) return;
    socket.emit('conversation:delete', { conversationId });
  }, [socket]);

  const searchConversations = useCallback((query: string) => {
    if (!socket || !query.trim()) {
      loadConversations();
      return;
    }
    setLoading(true);
    socket.emit('conversations:search', { query });
  }, [socket, loadConversations]);

  useEffect(() => {
    if (!socket) return;

    socket.on('conversations:listed', (data: { conversations: Conversation[] }) => {
      setConversations(data.conversations);
      setLoading(false);
    });

    socket.on('conversations:searched', (data: { conversations: Conversation[] }) => {
      setConversations(data.conversations);
      setLoading(false);
    });

    socket.on('conversation:created', (data: { conversationId: number; title: string }) => {
      const newConversation: Conversation = {
        id: data.conversationId,
        title: data.title,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversationId(data.conversationId);
    });

    socket.on('conversation:deleted', (data: { conversationId: number }) => {
      setConversations(prev => prev.filter(c => c.id !== data.conversationId));
      if (currentConversationId === data.conversationId) {
        setCurrentConversationId(null);
      }
    });

    socket.on('conversations:error', (data: { error: string }) => {
      console.error('Conversations error:', data.error);
      setLoading(false);
    });

    return () => {
      socket.off('conversations:listed');
      socket.off('conversations:searched');
      socket.off('conversation:created');
      socket.off('conversation:deleted');
      socket.off('conversations:error');
    };
  }, [socket, currentConversationId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

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