import db from '../config/database';
import { Message } from './conversation.model';
import { ConversationModel } from './conversation.model';

export class MessageModel {
  static create(conversationId: number, role: Message['role'], content: string): Message {
    const stmt = db.prepare(
      'INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)'
    );
    const result = stmt.run(conversationId, role, content);
    
    ConversationModel.updateTimestamp(conversationId);
    
    return this.findById(result.lastInsertRowid as number)!;
  }

  static findById(id: number): Message | undefined {
    const stmt = db.prepare('SELECT * FROM messages WHERE id = ?');
    return stmt.get(id) as Message | undefined;
  }

  static findByConversation(conversationId: number): Message[] {
    const stmt = db.prepare(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC'
    );
    return stmt.all(conversationId) as Message[];
  }

  static deleteByConversation(conversationId: number): void {
    const stmt = db.prepare('DELETE FROM messages WHERE conversation_id = ?');
    stmt.run(conversationId);
  }

  static getRecentMessages(limit = 50): Message[] {
    const stmt = db.prepare(`
      SELECT m.*, c.title as conversation_title 
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      ORDER BY m.created_at DESC 
      LIMIT ?
    `);
    return stmt.all(limit) as Message[];
  }

  static searchInMessages(query: string, limit = 20): Message[] {
    const stmt = db.prepare(`
      SELECT m.*, c.title as conversation_title
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE m.content LIKE ?
      ORDER BY m.created_at DESC
      LIMIT ?
    `);
    const searchPattern = `%${query}%`;
    return stmt.all(searchPattern, limit) as Message[];
  }
}