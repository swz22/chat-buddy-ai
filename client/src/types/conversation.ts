export interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  lastMessage?: string;
  messageCount?: number;
}

export interface Message {
  id?: number;
  conversation_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
}