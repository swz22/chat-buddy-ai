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

  constructor() {
    this.openaiService = new OpenAIService();
  }

  handleConnection(socket: Socket) {
    socket.on('chat:message', async (data: ClientMessage) => {
      try {
        socket.emit('chat:start');
        
        let conversationId = data.conversationId;
        
        if (!conversationId) {
          const firstUserMessage = data.messages.find(m => m.role === 'user');
          const title = firstUserMessage 
            ? ConversationModel.generateTitle(firstUserMessage.content)
            : 'New Conversation';
          
          const conversation = await ConversationModel.create(title);
          conversationId = conversation.id!;
          
          socket.emit('conversation:created', { 
            conversationId, 
            title: conversation.title 
          });
        }
        
        const lastUserMessage = data.messages[data.messages.length - 1];
        if (lastUserMessage && lastUserMessage.role === 'user') {
          await MessageModel.create(conversationId, 'user', lastUserMessage.content);
        }
        
        let fullResponse = '';
        const stream = this.openaiService.streamChat(data.messages);
        
        for await (const token of stream) {
          socket.emit('chat:token', { token });
          fullResponse += token;
        }
        
        const savedMessage = await MessageModel.create(conversationId, 'assistant', fullResponse);
        
        socket.emit('chat:complete', { 
          message: fullResponse,
          messageId: savedMessage.id!,
          conversationId 
        });
        
      } catch (error) {
        console.error('Chat error:', error);
        socket.emit('chat:error', { 
          error: error instanceof Error ? error.message : 'An error occurred' 
        });
      }
    });

    socket.on('message:edit', async (data: { messageId: number; newContent: string }) => {
      try {
        const success = await MessageModel.update(data.messageId, data.newContent);
        
        if (success) {
          socket.emit('message:edited', {
            messageId: data.messageId,
            newContent: data.newContent,
            editedAt: new Date().toISOString()
          });
        } else {
          socket.emit('message:edit:error', { 
            error: 'Message not found' 
          });
        }
      } catch (error) {
        console.error('Edit message error:', error);
        socket.emit('message:edit:error', { 
          error: 'Failed to edit message' 
        });
      }
    });
  }
}