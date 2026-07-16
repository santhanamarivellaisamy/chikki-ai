import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Routes
import authRouter from './routes/auth.routes';
import aiRouter from './routes/ai.routes';
import chatRouter from './routes/chat.routes';
import processingRouter from './routes/processing.routes';
import metricsRouter from './routes/metrics.routes';

// Middleware
import { requireAuth } from './middleware/auth.middleware';
import { requestLogger, errorLogger, errorHandler } from './middleware/logger.middleware';
import {
  generalRateLimit,
  authRateLimit,
  aiRateLimit,
  sanitizeInput,
  addSecurityHeaders,
} from './middleware/security.middleware';

const app: Application = express();

// ── Core Security ──────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(addSecurityHeaders);

// ── CORS ───────────────────────────────────────────────────────────
const corsOptions = {
  origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// ── Body Parsing ───────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Input Sanitization ─────────────────────────────────────────────
app.use(sanitizeInput);

// ── Logging ────────────────────────────────────────────────────────
app.use(morgan('dev'));
app.use(requestLogger);

// ── Static file serving for temp uploads ──────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ── Rate Limiting ──────────────────────────────────────────────────
app.use('/api/', generalRateLimit);
app.use('/api/auth/', authRateLimit);
app.use('/api/ai/', aiRateLimit);

// ── Health Check ───────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'AI Chatbot Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// ── API Routes ─────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/ai', requireAuth, aiRouter);
app.use('/api/chats', chatRouter);
app.use('/api', processingRouter);
app.use('/api/metrics', metricsRouter);

// ── 404 Handler ────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: { message: 'Route not found', statusCode: 404 } });
});

// ── Error Handling ─────────────────────────────────────────────────
app.use(errorLogger);
app.use(errorHandler);

export default app;
