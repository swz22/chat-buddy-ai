import db from '../config/database';

export interface Conversation {
  id?: number;
  title: string;
  created_at?: string;
  updated_at?: string;
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
    return stmt.get(id) as Conversation | undefined;
  }

  static findAll(limit = 20, offset = 0): Conversation[] {
    const stmt = db.prepare(
      'SELECT * FROM conversations ORDER BY updated_at DESC LIMIT ? OFFSET ?'
    );
    return stmt.all(limit, offset) as Conversation[];
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
    return stmt.all(searchPattern, searchPattern, limit) as Conversation[];
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