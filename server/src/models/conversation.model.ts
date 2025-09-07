import { db, dbType } from '../config/database';

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
  static async create(title: string): Promise<Conversation> {
    if (dbType === 'postgres') {
      const client = await db.connect();
      try {
        const result = await client.query(
          'INSERT INTO conversations (title) VALUES ($1) RETURNING *',
          [title]
        );
        const conversation = result.rows[0];
        return {
          ...conversation,
          messageCount: 0
        };
      } finally {
        client.release();
      }
    } else {
      const stmt = db.prepare('INSERT INTO conversations (title) VALUES (?)');
      const result = stmt.run(title);
      return await this.findById(result.lastInsertRowid as number) || { title, id: result.lastInsertRowid as number };
    }
  }

  static async findById(id: number): Promise<Conversation | undefined> {
    if (dbType === 'postgres') {
      const client = await db.connect();
      try {
        const result = await client.query(
          'SELECT * FROM conversations WHERE id = $1',
          [id]
        );
        if (result.rows.length === 0) return undefined;
        
        const conversation = result.rows[0];
        const messageInfo = await this.getMessageInfo(id);
        return {
          ...conversation,
          ...messageInfo
        };
      } finally {
        client.release();
      }
    } else {
      const stmt = db.prepare('SELECT * FROM conversations WHERE id = ?');
      const conversation = stmt.get(id) as Conversation | undefined;
      if (conversation) {
        const messageInfo = await this.getMessageInfo(id);
        conversation.lastMessage = messageInfo.lastMessage;
        conversation.messageCount = messageInfo.messageCount;
      }
      return conversation;
    }
  }

  static async findAll(limit = 20, offset = 0): Promise<Conversation[]> {
    if (dbType === 'postgres') {
      const client = await db.connect();
      try {
        const result = await client.query(
          'SELECT * FROM conversations ORDER BY updated_at DESC LIMIT $1 OFFSET $2',
          [limit, offset]
        );
        
        const conversations = await Promise.all(
          result.rows.map(async (conv: any) => {
            const messageInfo = await this.getMessageInfo(conv.id);
            return { ...conv, ...messageInfo };
          })
        );
        
        return conversations;
      } finally {
        client.release();
      }
    } else {
      const stmt = db.prepare(
        'SELECT * FROM conversations ORDER BY updated_at DESC LIMIT ? OFFSET ?'
      );
      const conversations = stmt.all(limit, offset) as Conversation[];
      
      const conversationsWithInfo = await Promise.all(
        conversations.map(async (conv) => {
          const messageInfo = await this.getMessageInfo(conv.id!);
          return { ...conv, ...messageInfo };
        })
      );
      
      return conversationsWithInfo;
    }
  }

  static async getMessageInfo(conversationId: number): Promise<{ lastMessage?: string; messageCount: number }> {
    if (dbType === 'postgres') {
      const client = await db.connect();
      try {
        const countResult = await client.query(
          'SELECT COUNT(*) as count FROM messages WHERE conversation_id = $1',
          [conversationId]
        );
        const lastMessageResult = await client.query(
          "SELECT content FROM messages WHERE conversation_id = $1 AND role = 'assistant' ORDER BY created_at DESC LIMIT 1",
          [conversationId]
        );
        
        return {
          messageCount: parseInt(countResult.rows[0].count),
          lastMessage: lastMessageResult.rows[0]?.content
        };
      } finally {
        client.release();
      }
    } else {
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
  }

  static async update(id: number, title: string): Promise<void> {
    if (dbType === 'postgres') {
      const client = await db.connect();
      try {
        await client.query(
          'UPDATE conversations SET title = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [title, id]
        );
      } finally {
        client.release();
      }
    } else {
      const stmt = db.prepare(
        'UPDATE conversations SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      );
      stmt.run(title, id);
    }
  }

  static async delete(id: number): Promise<void> {
    if (dbType === 'postgres') {
      const client = await db.connect();
      try {
        await client.query('DELETE FROM conversations WHERE id = $1', [id]);
      } finally {
        client.release();
      }
    } else {
      const stmt = db.prepare('DELETE FROM conversations WHERE id = ?');
      stmt.run(id);
    }
  }

  static async updateTimestamp(id: number): Promise<void> {
    if (dbType === 'postgres') {
      const client = await db.connect();
      try {
        await client.query(
          'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
          [id]
        );
      } finally {
        client.release();
      }
    } else {
      const stmt = db.prepare(
        'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      );
      stmt.run(id);
    }
  }

  static async search(query: string, limit = 10): Promise<Conversation[]> {
    const searchPattern = `%${query}%`;
    
    if (dbType === 'postgres') {
      const client = await db.connect();
      try {
        const result = await client.query(
          `SELECT DISTINCT c.* FROM conversations c
           LEFT JOIN messages m ON c.id = m.conversation_id
           WHERE c.title ILIKE $1 OR m.content ILIKE $1
           ORDER BY c.updated_at DESC
           LIMIT $2`,
          [searchPattern, limit]
        );
        
        const conversations = await Promise.all(
          result.rows.map(async (conv: any) => {
            const messageInfo = await this.getMessageInfo(conv.id);
            return { ...conv, ...messageInfo };
          })
        );
        
        return conversations;
      } finally {
        client.release();
      }
    } else {
      const stmt = db.prepare(`
        SELECT DISTINCT c.* FROM conversations c
        LEFT JOIN messages m ON c.id = m.conversation_id
        WHERE c.title LIKE ? OR m.content LIKE ?
        ORDER BY c.updated_at DESC
        LIMIT ?
      `);
      const conversations = stmt.all(searchPattern, searchPattern, limit) as Conversation[];
      
      const conversationsWithInfo = await Promise.all(
        conversations.map(async (conv) => {
          const messageInfo = await this.getMessageInfo(conv.id!);
          return { ...conv, ...messageInfo };
        })
      );
      
      return conversationsWithInfo;
    }
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