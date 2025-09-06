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

interface TableColumn {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: string | null;
  pk: number;
}

interface TableInfo {
  name: string;
}

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

    const conversationColumns = db.prepare("PRAGMA table_info(conversations)").all() as TableColumn[];
    const messageColumns = db.prepare("PRAGMA table_info(messages)").all() as TableColumn[];
    
    if (!conversationColumns.some(col => col.name === 'pinned')) {
      console.log('Adding pinned column to conversations table...');
      db.exec('ALTER TABLE conversations ADD COLUMN pinned INTEGER DEFAULT 0');
    }

    if (!messageColumns.some(col => col.name === 'edited_at')) {
      console.log('Adding edited_at column to messages table...');
      db.exec('ALTER TABLE messages ADD COLUMN edited_at DATETIME');
    }

    db.exec(`
      CREATE TABLE IF NOT EXISTS message_edits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_id INTEGER NOT NULL,
        old_content TEXT NOT NULL,
        edited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (message_id) REFERENCES messages (id) ON DELETE CASCADE
      )
    `);

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)
    `);
    
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at)
    `);

    const hasPinnedColumn = conversationColumns.some(col => col.name === 'pinned');
    
    if (hasPinnedColumn) {
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_conversations_pinned ON conversations(pinned)
      `);
    }

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_message_edits_message_id ON message_edits(message_id)
    `);

    console.log('Database tables initialized successfully');
    
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as TableInfo[];
    console.log('Available tables:', tables.map(t => t.name));
    
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

export default db;