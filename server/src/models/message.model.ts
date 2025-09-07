import { db } from '../config/database';
import { Message } from './conversation.model';
import { ConversationModel } from './conversation.model';

export class MessageModel {
  static async create(conversationId: number, role: Message['role'], content: string): Promise<Message> {
    const client = await db.connect();
    try {
      const result = await client.query(
        'INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3) RETURNING *',
        [conversationId, role, content]
      );
      await ConversationModel.updateTimestamp(conversationId);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async findById(id: number): Promise<Message | undefined> {
    const client = await db.connect();
    try {
      const result = await client.query(
        'SELECT * FROM messages WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async findByConversation(conversationId: number): Promise<Message[]> {
    const client = await db.connect();
    try {
      const result = await client.query(
        'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
        [conversationId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  static async update(id: number, content: string): Promise<boolean> {
    const client = await db.connect();
    try {
      const result = await client.query(
        'UPDATE messages SET content = $1, edited_at = CURRENT_TIMESTAMP WHERE id = $2',
        [content, id]
      );
      
      const message = await this.findById(id);
      if (message) {
        await ConversationModel.updateTimestamp(message.conversation_id);
      }
      
      return result.rowCount! > 0;
    } finally {
      client.release();
    }
  }

  static async deleteByConversation(conversationId: number): Promise<void> {
    const client = await db.connect();
    try {
      await client.query(
        'DELETE FROM messages WHERE conversation_id = $1',
        [conversationId]
      );
    } finally {
      client.release();
    }
  }

  static async getRecentMessages(limit = 50): Promise<Message[]> {
    const client = await db.connect();
    try {
      const result = await client.query(
        `SELECT m.*, c.title as conversation_title 
         FROM messages m
         JOIN conversations c ON m.conversation_id = c.id
         ORDER BY m.created_at DESC 
         LIMIT $1`,
        [limit]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  static async searchInMessages(query: string, limit = 20): Promise<Message[]> {
    const searchPattern = `%${query}%`;
    const client = await db.connect();
    try {
      const result = await client.query(
        `SELECT m.*, c.title as conversation_title
         FROM messages m
         JOIN conversations c ON m.conversation_id = c.id
         WHERE m.content ILIKE $1
         ORDER BY m.created_at DESC
         LIMIT $2`,
        [searchPattern, limit]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }
}