import path from 'path';
import { mkdirSync, existsSync } from 'fs';

const dbDir = path.join(process.cwd(), 'server', 'data');
const dbPath = path.join(dbDir, 'chat.db');

if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
  console.log('Created data directory:', dbDir);
}

let Database: any;
try {
  Database = require('better-sqlite3');
} catch (error) {
  console.error('Failed to load better-sqlite3:', error);
  throw error;
}

const db = new Database(dbPath);
console.log('Database connected at:', dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initializeDatabase() {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
      )
    `);

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)
    `);
    
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at)
    `);

    console.log('Database tables initialized successfully');
    
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('Available tables:', tables);
    
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

export default db;