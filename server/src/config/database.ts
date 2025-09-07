import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Use PostgreSQL only
const isProduction = process.env.NODE_ENV === 'production';

// Debug: Log to see if DATABASE_URL is loaded
console.log('DATABASE_URL loaded:', process.env.DATABASE_URL ? 'Yes' : 'No');
console.log('Environment:', process.env.NODE_ENV);

// For local development, you can use a local PostgreSQL or the Railway database
const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/chatbuddy';

const db = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

const dbType = 'postgres';

export async function initializeDatabase() {
  try {
    const client = await db.connect();
    console.log('Connected to PostgreSQL database');
    
    // Create conversations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        pinned INTEGER DEFAULT 0
      )
    `);

    // Create messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        edited_at TIMESTAMP
      )
    `);

    // Create message_edits table
    await client.query(`
      CREATE TABLE IF NOT EXISTS message_edits (
        id SERIAL PRIMARY KEY,
        message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
        old_content TEXT NOT NULL,
        edited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indices
    await client.query('CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_message_edits_message_id ON message_edits(message_id)');
    
    client.release();
    console.log('PostgreSQL tables initialized successfully');
    
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

export { db, dbType };
export default db;