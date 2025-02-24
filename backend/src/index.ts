import dotenv from 'dotenv';
import { app } from './app.js';
import { Express } from 'express';
import { initializeDatabase } from './utils/init-db.js';

dotenv.config();

const port = process.env.PORT || 3000;

async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
