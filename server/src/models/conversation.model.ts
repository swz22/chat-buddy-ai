import db from '../config/database';

export interface Conversation {
  id?: number;
  title: string;
  created_at?: string;
  updated_at?: string;
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

export class ConversationModel {
  static create(title: string): Conversation {
    const stmt = db.prepare(
      'INSERT INTO conversations (title) VALUES (?)'
    );
    const result = stmt.run(title);
    return this.findById(result.lastInsertRowid as number)!;
  }

  static findById(id: number): Conversation | undefined {
    const stmt = db.prepare('SELECT * FROM conversations WHERE id = ?');
    const conversation = stmt.get(id) as Conversation | undefined;
    
    if (conversation) {
      const messageInfo = this.getMessageInfo(id);
      conversation.lastMessage = messageInfo.lastMessage;
      conversation.messageCount = messageInfo.messageCount;
    }
    
    return conversation;
  }

  static findAll(limit = 20, offset = 0): Conversation[] {
    const stmt = db.prepare(
      'SELECT * FROM conversations ORDER BY updated_at DESC LIMIT ? OFFSET ?'
    );
    const conversations = stmt.all(limit, offset) as Conversation[];
    
    conversations.forEach(conv => {
      const messageInfo = this.getMessageInfo(conv.id!);
      conv.lastMessage = messageInfo.lastMessage;
      conv.messageCount = messageInfo.messageCount;
    });
    
    return conversations;
  }

  static getMessageInfo(conversationId: number): { lastMessage?: string; messageCount: number } {
    const countStmt = db.prepare('SELECT COUNT(*) as count FROM messages WHERE conversation_id = ?');
    const lastMessageStmt = db.prepare(
      "SELECT content FROM messages WHERE conversation_id = ? AND role = 'assistant' ORDER BY created_at DESC LIMIT 1"
    );
    
    const countResult = countStmt.get(conversationId) as { count: number };
    const lastMessageResult = lastMessageStmt.get(conversationId) as { content: string } | undefined;
    
    return {
      messageCount: countResult.count,
      lastMessage: lastMessageResult?.content
    };
  }

  static update(id: number, title: string): void {
    const stmt = db.prepare(
      'UPDATE conversations SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    );
    stmt.run(title, id);
  }

  static delete(id: number): void {
    const stmt = db.prepare('DELETE FROM conversations WHERE id = ?');
    stmt.run(id);
  }

  static updateTimestamp(id: number): void {
    const stmt = db.prepare(
      'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    );
    stmt.run(id);
  }

  static search(query: string, limit = 10): Conversation[] {
    const stmt = db.prepare(`
      SELECT DISTINCT c.* FROM conversations c
      LEFT JOIN messages m ON c.id = m.conversation_id
      WHERE c.title LIKE ? OR m.content LIKE ?
      ORDER BY c.updated_at DESC
      LIMIT ?
    `);
    const searchPattern = `%${query}%`;
    const conversations = stmt.all(searchPattern, searchPattern, limit) as Conversation[];
    
    conversations.forEach(conv => {
      const messageInfo = this.getMessageInfo(conv.id!);
      conv.lastMessage = messageInfo.lastMessage;
      conv.messageCount = messageInfo.messageCount;
    });
    
    return conversations;
  }

  static generateTitle(firstMessage: string): string {
    const maxLength = 50;
    let title = firstMessage.trim().replace(/\n/g, ' ');
    if (title.length > maxLength) {
      title = title.substring(0, maxLength) + '...';
    }
    return title || 'New Conversation';
  }
}