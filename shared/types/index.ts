export * from './socket-events';
export * from './database';

export type Role = 'user' | 'assistant' | 'system';

export interface BaseMessage {
  role: Role;
  content: string;
}

export interface SavedMessage extends BaseMessage {
  id: number;
  conversation_id: number;
  created_at: string;
  edited_at?: string;
}

export interface BaseConversation {
  title: string;
}

export interface SavedConversation extends BaseConversation {
  id: number;
  created_at: string;
  updated_at: string;
  lastMessage?: string;
  messageCount?: number;
  pinned?: boolean;
}