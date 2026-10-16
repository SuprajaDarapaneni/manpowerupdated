import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI;

console.log('Testing connection to MongoDB Atlas...');
console.log('URI configured:', mongoUri ? mongoUri.replace(/:([^@]+)@/, ':****@') : 'NONE');

if (!mongoUri) {
  console.error('No MONGODB_URI provided in .env');
  process.exit(1);
}

mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 })
  .then(() => {
    console.log('✅ SUCCESS: Successfully connected to MongoDB Atlas cluster0.dzxw5pm.mongodb.net!');
    console.log('Database name:', mongoose.connection.name);
    console.log('ReadyState:', mongoose.connection.readyState);
    return mongoose.disconnect();
  })
  .then(() => {
    console.log('Disconnected cleanly.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  });
