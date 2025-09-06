import { Socket } from 'socket.io';
import { OpenAIService, Message } from '../services/openai.service';
import { ConversationModel } from '../models/conversation.model';
import { MessageModel } from '../models/message.model';

interface ClientMessage {
  messages: Message[];
  conversationId?: number;
}

interface EditMessageData {
  messageId: number;
  newContent: string;
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
          
          const conversation = ConversationModel.create(title);
          conversationId = conversation.id!;
          
          socket.emit('conversation:created', { 
            conversationId, 
            title: conversation.title 
          });
        }
        
        const lastMessage = data.messages[data.messages.length - 1];
        if (lastMessage && lastMessage.role === 'user') {
          const savedMessage = MessageModel.create(conversationId, 'user', lastMessage.content);
          
          socket.emit('message:saved', {
            tempId: data.messages.length - 1,
            messageId: savedMessage.id,
            conversationId
          });
        }
        
        let fullResponse = '';
        for await (const chunk of this.openaiService.streamChat(data.messages)) {
          fullResponse += chunk;
          socket.emit('chat:token', { token: chunk });
        }
        
        const assistantMessage = MessageModel.create(conversationId, 'assistant', fullResponse);
        
        socket.emit('chat:complete', { 
          message: fullResponse,
          messageId: assistantMessage.id,
          conversationId 
        });
      } catch (error) {
        console.error('Chat error:', error);
        socket.emit('chat:error', { 
          error: 'Failed to process message' 
        });
      }
    });

    socket.on('message:edit', (data: EditMessageData) => {
      try {
        const message = MessageModel.findById(data.messageId);
        if (!message) {
          socket.emit('message:edit:error', { 
            error: 'Message not found' 
          });
          return;
        }
        
        MessageModel.saveEditHistory(data.messageId, message.content);
        
        const success = MessageModel.update(data.messageId, data.newContent);
        
        if (success) {
          socket.emit('message:edited', {
            messageId: data.messageId,
            newContent: data.newContent,
            editedAt: new Date().toISOString()
          });
        } else {
          socket.emit('message:edit:error', { 
            error: 'Failed to update message' 
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