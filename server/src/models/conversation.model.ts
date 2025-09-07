import { db } from '../config/database';

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
  }

  static async findById(id: number): Promise<Conversation | undefined> {
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
  }

  static async findAll(limit = 20, offset = 0): Promise<Conversation[]> {
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
  }

  static async getMessageInfo(conversationId: number): Promise<{ lastMessage?: string; messageCount: number }> {
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
  }

  static async update(id: number, title: string): Promise<void> {
    const client = await db.connect();
    try {
      await client.query(
        'UPDATE conversations SET title = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [title, id]
      );
    } finally {
      client.release();
    }
  }

  static async delete(id: number): Promise<void> {
    const client = await db.connect();
    try {
      await client.query('DELETE FROM conversations WHERE id = $1', [id]);
    } finally {
      client.release();
    }
  }

  static async updateTimestamp(id: number): Promise<void> {
    const client = await db.connect();
    try {
      await client.query(
        'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [id]
      );
    } finally {
      client.release();
    }
  }

  static async search(query: string, limit = 10): Promise<Conversation[]> {
    const searchPattern = `%${query}%`;
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