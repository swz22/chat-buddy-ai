import { Socket } from 'socket.io';
import { OpenAIService, Message } from '../services/openai.service';
import { ConversationModel } from '../models/conversation.model';
import { MessageModel } from '../models/message.model';

interface ClientMessage {
  messages: Message[];
  conversationId?: number;
}

export class ChatHandler {
  private openaiService: OpenAIService;
  private userConversations: Map<string, number> = new Map();

  constructor() {
    this.openaiService = new OpenAIService();
  }

  handleConnection(socket: Socket) {
    console.log('Client connected:', socket.id);

    socket.on('chat:message', async (data: ClientMessage) => {
      try {
        socket.emit('chat:start');
        
        let conversationId = data.conversationId;
        
        if (!conversationId) {
          const firstUserMessage = data.messages.find(m => m.role === 'user');
          const title = firstUserMessage 
            ? ConversationModel.generateTitle(firstUserMessage.content)
            : 'New Conversation';
          
          const conversation = ConversationModel.create(title);
          conversationId = conversation.id!;
          
          socket.emit('conversation:created', { 
            conversationId, 
            title: conversation.title 
          });
        }
        
        this.userConversations.set(socket.id, conversationId);
        
        const lastMessage = data.messages[data.messages.length - 1];
        if (lastMessage && lastMessage.role === 'user') {
          MessageModel.create(conversationId, 'user', lastMessage.content);
        }
        
        let fullResponse = '';
        for await (const chunk of this.openaiService.streamChat(data.messages)) {
          fullResponse += chunk;
          socket.emit('chat:token', { token: chunk });
        }
        
        MessageModel.create(conversationId, 'assistant', fullResponse);
        
        socket.emit('chat:complete', { 
          message: fullResponse,
          conversationId 
        });
      } catch (error) {
        console.error('Chat error:', error);
        socket.emit('chat:error', { 
          error: 'Failed to process message' 
        });
      }
    });

    socket.on('conversation:load', (data: { conversationId: number }) => {
      try {
        const conversation = ConversationModel.findById(data.conversationId);
        if (!conversation) {
          socket.emit('conversation:error', { error: 'Conversation not found' });
          return;
        }
        
        const messages = MessageModel.findByConversation(data.conversationId);
        socket.emit('conversation:loaded', {
          conversation,
          messages
        });
      } catch (error) {
        console.error('Load conversation error:', error);
        socket.emit('conversation:error', { error: 'Failed to load conversation' });
      }
    });

    socket.on('conversations:list', () => {
      try {
        const conversations = ConversationModel.findAll(20, 0);
        socket.emit('conversations:listed', { conversations });
      } catch (error) {
        console.error('List conversations error:', error);
        socket.emit('conversations:error', { error: 'Failed to list conversations' });
      }
    });

    socket.on('conversation:delete', (data: { conversationId: number }) => {
      try {
        ConversationModel.delete(data.conversationId);
        socket.emit('conversation:deleted', { conversationId: data.conversationId });
      } catch (error) {
        console.error('Delete conversation error:', error);
        socket.emit('conversation:error', { error: 'Failed to delete conversation' });
      }
    });

    socket.on('conversations:search', (data: { query: string }) => {
      try {
        const conversations = ConversationModel.search(data.query);
        socket.emit('conversations:searched', { conversations });
      } catch (error) {
        console.error('Search error:', error);
        socket.emit('conversations:error', { error: 'Failed to search conversations' });
      }
    });

    socket.on('disconnect', () => {
      this.userConversations.delete(socket.id);
      console.log('Client disconnected:', socket.id);
    });
  }
}