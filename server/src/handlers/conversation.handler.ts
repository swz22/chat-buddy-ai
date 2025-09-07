import { Socket } from 'socket.io';
import { ConversationModel } from '../models/conversation.model';
import { MessageModel } from '../models/message.model';

export class ConversationHandler {
  handleConnection(socket: Socket) {
    socket.on('conversations:list', async () => {
      try {
        const conversations = await ConversationModel.findAll(50, 0);
        socket.emit('conversations:listed', { conversations });
      } catch (error) {
        console.error('List conversations error:', error);
        socket.emit('conversations:error', { 
          error: 'Failed to load conversations' 
        });
      }
    });

    socket.on('conversation:load', async (data: { conversationId: number }) => {
      try {
        const conversation = await ConversationModel.findById(data.conversationId);
        if (!conversation) {
          socket.emit('conversation:error', { 
            error: 'Conversation not found' 
          });
          return;
        }
        
        const messages = await MessageModel.findByConversation(data.conversationId);
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

    socket.on('conversation:delete', async (data: { conversationId: number }) => {
      try {
        await MessageModel.deleteByConversation(data.conversationId);
        await ConversationModel.delete(data.conversationId);
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

    socket.on('conversations:search', async (data: { query: string }) => {
      try {
        const conversations = await ConversationModel.search(data.query, 20);
        socket.emit('conversations:searched', { conversations });
      } catch (error) {
        console.error('Search conversations error:', error);
        socket.emit('conversations:error', { 
          error: 'Failed to search conversations' 
        });
      }
    });

    socket.on('conversation:update', async (data: { conversationId: number; title: string }) => {
      try {
        await ConversationModel.update(data.conversationId, data.title);
        const updated = await ConversationModel.findById(data.conversationId);
        socket.emit('conversation:updated', { conversation: updated });
      } catch (error) {
        console.error('Update conversation error:', error);
        socket.emit('conversation:error', { 
          error: 'Failed to update conversation' 
        });
      }
    });

    socket.on('messages:recent', async (data: { limit?: number }) => {
      try {
        const messages = await MessageModel.getRecentMessages(data.limit || 50);
        socket.emit('messages:recent:loaded', { messages });
      } catch (error) {
        console.error('Load recent messages error:', error);
        socket.emit('messages:error', { 
          error: 'Failed to load recent messages' 
        });
      }
    });

    socket.on('messages:search', async (data: { query: string; limit?: number }) => {
      try {
        const messages = await MessageModel.searchInMessages(data.query, data.limit || 20);
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