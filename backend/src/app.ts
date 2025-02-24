import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerOptions from './config/swagger.config.js';
import { db } from './services/database.service.js';
import { jobRoutes } from './routes/job.routes.js';
import { authRoutes } from './routes/auth.routes.js';
import { applicationRoutes } from './routes/application.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { swaggerSpec } from './swagger.js';

export const app: Express = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3001', 'https://automatic-space-broccoli-46w9jq6jg5wc775r-3001.app.github.dev'],
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// Swagger Documentation
const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Job Board API Documentation"
}));

// Add API documentation redirect
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// Health check route
app.get('/health', async (req, res) => {
  try {
    await db.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Routes
app.use('/api/jobs', jobRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);

// Error handling
app.use(errorHandler);
