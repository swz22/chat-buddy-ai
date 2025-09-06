export interface ServerToClientEvents {
  'chat:start': () => void;
  'chat:token': (data: { token: string }) => void;
  'chat:complete': (data: { 
    message: string; 
    messageId: number; 
    conversationId: number 
  }) => void;
  'chat:error': (data: { error: string }) => void;
  
  'message:saved': (data: { 
    tempId: number; 
    messageId: number; 
    conversationId: number 
  }) => void;
  'message:edited': (data: { 
    messageId: number; 
    newContent: string; 
    editedAt: string 
  }) => void;
  'message:edit:error': (data: { error: string }) => void;
  
  'conversation:created': (data: { 
    conversationId: number; 
    title: string 
  }) => void;
  'conversation:loaded': (data: { 
    conversation: ConversationData; 
    messages: MessageData[] 
  }) => void;
  'conversation:deleted': (data: { conversationId: number }) => void;
  'conversation:updated': (data: { conversation: ConversationData }) => void;
  'conversation:error': (data: { error: string }) => void;
  
  'conversations:listed': (data: { conversations: ConversationData[] }) => void;
  'conversations:searched': (data: { conversations: ConversationData[] }) => void;
  'conversations:error': (data: { error: string }) => void;
  
  'messages:recent:loaded': (data: { messages: MessageData[] }) => void;
  'messages:searched': (data: { messages: MessageData[] }) => void;
  'messages:error': (data: { error: string }) => void;
}

export interface ClientToServerEvents {
  'chat:message': (data: { 
    messages: ChatMessage[]; 
    conversationId?: number 
  }) => void;
  
  'message:edit': (data: { 
    messageId: number; 
    newContent: string 
  }) => void;
  
  'conversation:load': (data: { conversationId: number }) => void;
  'conversation:delete': (data: { conversationId: number }) => void;
  'conversation:update': (data: { 
    conversationId: number; 
    title: string 
  }) => void;
  
  'conversations:list': () => void;
  'conversations:search': (data: { query: string }) => void;
  
  'messages:recent': (data: { limit?: number }) => void;
  'messages:search': (data: { 
    query: string; 
    limit?: number 
  }) => void;
}

export interface ConversationData {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  lastMessage?: string;
  messageCount?: number;
}

export interface MessageData {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  edited_at?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}