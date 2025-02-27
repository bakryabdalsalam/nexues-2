import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import swaggerOptions from './config/swagger.config';
import { db } from './services/database.service';
import jobRoutes from './routes/job.routes';
import { authRoutes } from './routes/auth.routes';
import { applicationRoutes } from './routes/application.routes';
import { adminRoutes } from './routes/admin.routes';
import { uploadRoutes } from './routes/upload.routes';
import { companyRoutes } from './routes/company.routes';
import { userRoutes } from './routes/user.routes';
import { errorHandler } from './middleware/error.middleware';
import { apiLimiter, authLimiter } from './middleware/rate-limit.middleware';
import { swaggerSpec } from './swagger';

export const app: Express = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173', // Vite default port
    'http://127.0.0.1:5173',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600 // Cache preflight requests for 10 minutes
};

app.use(cors(corsOptions));

// Logging and parsing middleware
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Apply rate limiting
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

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
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version
    });
  } catch (error: unknown) {
    console.error('Health check failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal server error'
    });
  }
});

// API welcome message handler
const apiWelcomeHandler = (req: express.Request, res: express.Response) => {
  res.json({
    status: 'success',
    message: 'Welcome to the Job Board API',
    documentation: '/api-docs',
    version: '1.0.0'
  });
};

// API Routes with proper prefixing
const apiRouter = express.Router();

// Add welcome message for root API endpoint
apiRouter.get('/', apiWelcomeHandler);

// Mount job routes first to ensure they take precedence
apiRouter.use('/jobs', jobRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/applications', applicationRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/upload', uploadRoutes);
apiRouter.use('/company', companyRoutes);
apiRouter.use('/users', userRoutes);  // Changed from /user to /users for consistency

// Mount all API routes under /api
app.use('/api', apiRouter);

// Add explicit error handling for CORS errors
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS error: Origin not allowed'
    });
  }
  next(err);
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});
