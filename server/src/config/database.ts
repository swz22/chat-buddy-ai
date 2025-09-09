import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const isProduction = process.env.NODE_ENV === 'production';

console.log('DATABASE_URL loaded:', process.env.DATABASE_URL ? 'Yes' : 'No');
console.log('Environment:', process.env.NODE_ENV);

const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/chatbuddy';

const db = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

db.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

db.on('connect', () => {
  console.log('Database pool: new client connected');
});

db.on('remove', () => {
  console.log('Database pool: client removed');
});

const dbType = 'postgres';

export async function initializeDatabase(): Promise<boolean> {
  let retries = 3;
  
  while (retries > 0) {
    try {
      const client = await db.connect();
      console.log('Connected to PostgreSQL database');
      
      await client.query(`
        CREATE TABLE IF NOT EXISTS conversations (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          pinned INTEGER DEFAULT 0
        )
      `);

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

      await client.query(`
        CREATE TABLE IF NOT EXISTS message_edits (
          id SERIAL PRIMARY KEY,
          message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
          old_content TEXT NOT NULL,
          edited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await client.query('CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_message_edits_message_id ON message_edits(message_id)');
      
      client.release();
      console.log('PostgreSQL tables initialized successfully');
      return true;
      
    } catch (error) {
      console.error(`Database initialization error (${retries} retries left):`, error);
      retries--;
      
      if (retries === 0) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  return false;
}

process.on('SIGINT', async () => {
  console.log('Closing database pool...');
  await db.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Closing database pool...');
  await db.end();
  process.exit(0);
});

export { db, dbType };
export default db;