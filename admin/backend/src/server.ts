import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createApp } from './app';

dotenv.config();

const PORT = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI;

// Redact password when logging URI for security
const getSanitizedUri = (uri: string): string => {
  try {
    return uri.replace(/:([^@]+)@/, ':****@');
  } catch {
    return 'mongodb+srv://[REDACTED]';
  }
};

const startServer = async () => {
  if (!mongoUri) {
    throw new Error(
      'MONGODB_URI environment variable is required to connect to MongoDB Atlas. ' +
      'Please configure MONGODB_URI in admin/backend/.env before starting the server.'
    );
  }

  console.log(`Connecting to MongoDB Atlas at ${getSanitizedUri(mongoUri)}...`);

  // Establish connection to MongoDB Atlas
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  });

  console.log('Successfully connected to MongoDB Atlas database cluster.');

  mongoose.connection.on('error', (err: Error) => {
    console.error('MongoDB Atlas runtime connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB Atlas disconnected. Attempting automatic reconnection...');
  });

  // Ensure the HTTP server starts ONLY after a successful database connection
  const app = createApp();
  const server = app.listen(PORT, () => {
    console.log(`ManPowerLink Central Backend listening on port ${PORT}`);
  });

  // Graceful shutdown handling
  const gracefulShutdown = async (signal: string) => {
    console.log(`Received ${signal}. Shutting down HTTP server gracefully...`);
    server.close(async () => {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close(false);
        console.log('MongoDB connection closed.');
      }
      process.exit(0);
    });
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  return server;
};

// Start the server and exit if database connection fails
startServer().catch((err: Error) => {
  console.error('Fatal database connection error. HTTP server failed to start:', err.message);
  process.exit(1);
});

