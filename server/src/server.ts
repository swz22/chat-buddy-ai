import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { ChatHandler } from './handlers/chat.handler';
import { ConversationHandler } from './handlers/conversation.handler';
import { initializeDatabase } from './config/database';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

// Serve static files from React build
const clientPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientPath));

app.get('/health', (_req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    database: process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite'
  });
});

// Serve React app for all other routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

// Async initialization
async function startServer() {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }

  const chatHandler = new ChatHandler();
  const conversationHandler = new ConversationHandler();

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    chatHandler.handleConnection(socket);
    conversationHandler.handleConnection(socket);
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  const PORT = process.env.PORT || 5000;

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Database: ${process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite'}`);
    console.log(`CORS origin: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    console.log(`Serving static files from: ${clientPath}`);
  });
}

// Start the server
startServer();