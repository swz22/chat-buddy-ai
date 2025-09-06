export interface DBConversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  pinned?: number;
}

export interface DBMessage {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  edited_at?: string;
}

export interface DBMessageEdit {
  id: number;
  message_id: number;
  old_content: string;
  edited_at: string;
}

export interface DBQueryResult<T> {
  lastInsertRowid?: number;
  changes: number;
  firstRow?: T;
  rows?: T[];
}