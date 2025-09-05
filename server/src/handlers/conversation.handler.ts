import { Socket } from 'socket.io';
import { ConversationModel } from '../models/conversation.model';
import { MessageModel } from '../models/message.model';

export class ConversationHandler {
  handleConnection(socket: Socket) {
    socket.on('conversations:list', () => {
      try {
        const conversations = ConversationModel.findAll(50, 0);
        socket.emit('conversations:listed', { conversations });
      } catch (error) {
        console.error('List conversations error:', error);
        socket.emit('conversations:error', { 
          error: 'Failed to load conversations' 
        });
      }
    });

    socket.on('conversation:load', (data: { conversationId: number }) => {
      try {
        const conversation = ConversationModel.findById(data.conversationId);
        if (!conversation) {
          socket.emit('conversation:error', { 
            error: 'Conversation not found' 
          });
          return;
        }
        
        const messages = MessageModel.findByConversation(data.conversationId);
        socket.emit('conversation:loaded', { 
          conversation, 
          messages 
        });
      } catch (error) {
        console.error('Load conversation error:', error);
        socket.emit('conversation:error', { 
          error: 'Failed to load conversation' 
        });
      }
    });

    socket.on('conversation:delete', (data: { conversationId: number }) => {
      try {
        ConversationModel.delete(data.conversationId);
        socket.emit('conversation:deleted', { 
          conversationId: data.conversationId 
        });
      } catch (error) {
        console.error('Delete conversation error:', error);
        socket.emit('conversation:error', { 
          error: 'Failed to delete conversation' 
        });
      }
    });

    socket.on('conversations:search', (data: { query: string }) => {
      try {
        const conversations = ConversationModel.search(data.query, 20);
        socket.emit('conversations:searched', { conversations });
      } catch (error) {
        console.error('Search conversations error:', error);
        socket.emit('conversations:error', { 
          error: 'Failed to search conversations' 
        });
      }
    });

    socket.on('conversation:update', (data: { conversationId: number; title: string }) => {
      try {
        ConversationModel.update(data.conversationId, data.title);
        const updated = ConversationModel.findById(data.conversationId);
        socket.emit('conversation:updated', { conversation: updated });
      } catch (error) {
        console.error('Update conversation error:', error);
        socket.emit('conversation:error', { 
          error: 'Failed to update conversation' 
        });
      }
    });

    socket.on('messages:recent', (data: { limit?: number }) => {
      try {
        const messages = MessageModel.getRecentMessages(data.limit || 50);
        socket.emit('messages:recent:loaded', { messages });
      } catch (error) {
        console.error('Load recent messages error:', error);
        socket.emit('messages:error', { 
          error: 'Failed to load recent messages' 
        });
      }
    });

    socket.on('messages:search', (data: { query: string; limit?: number }) => {
      try {
        const messages = MessageModel.searchInMessages(data.query, data.limit || 20);
        socket.emit('messages:searched', { messages });
      } catch (error) {
        console.error('Search messages error:', error);
        socket.emit('messages:error', { 
          error: 'Failed to search messages' 
        });
      }
    });
  }
}