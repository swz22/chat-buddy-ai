import { Pool } from 'pg';
import Database from 'better-sqlite3';
import path from 'path';
import { mkdirSync, existsSync } from 'fs';

// Use PostgreSQL in production, SQLite in development
const isProduction = process.env.NODE_ENV === 'production';

let db: any;
let dbType: 'postgres' | 'sqlite';

if (isProduction && process.env.DATABASE_URL) {
  // PostgreSQL for production
  console.log('Using PostgreSQL database');
  dbType = 'postgres';
  
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
} else {
  // SQLite for development
  console.log('Using SQLite database');
  dbType = 'sqlite';
  
  const dbDir = path.join(process.cwd(), 'server', 'data');
  const dbPath = path.join(dbDir, 'chat.db');
  
  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true });
  }
  
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
}

export async function initializeDatabase() {
  try {
    if (dbType === 'postgres') {
      // PostgreSQL initialization
      const client = await db.connect();
      
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
      
    } else {
      // SQLite initialization (your existing code)
      db.exec(`
        CREATE TABLE IF NOT EXISTS conversations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          pinned INTEGER DEFAULT 0
        )
      `);

      db.exec(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          conversation_id INTEGER NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
          content TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          edited_at DATETIME,
          FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
        )
      `);

      db.exec(`
        CREATE TABLE IF NOT EXISTS message_edits (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          message_id INTEGER NOT NULL,
          old_content TEXT NOT NULL,
          edited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (message_id) REFERENCES messages (id) ON DELETE CASCADE
        )
      `);
      
      console.log('SQLite tables initialized successfully');
    }
    
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

export { db, dbType };
export default db;