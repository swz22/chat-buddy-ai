import { Socket } from 'socket.io';
import { OpenAIService, Message } from '../services/openai.service';

export class ChatHandler {
  private openaiService: OpenAIService;

  constructor() {
    this.openaiService = new OpenAIService();
  }

  handleConnection(socket: Socket) {
    console.log('Client connected:', socket.id);

    socket.on('chat:message', async (data: { messages: Message[] }) => {
      try {
        socket.emit('chat:start');
        
        let fullResponse = '';
        for await (const chunk of this.openaiService.streamChat(data.messages)) {
          fullResponse += chunk;
          socket.emit('chat:token', { token: chunk });
        }
        
        socket.emit('chat:complete', { message: fullResponse });
      } catch (error) {
        console.error('Chat error:', error);
        socket.emit('chat:error', { 
          error: 'Failed to process message' 
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  }
}