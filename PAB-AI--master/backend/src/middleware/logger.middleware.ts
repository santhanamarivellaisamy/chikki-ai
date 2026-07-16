import winston from 'winston';
import { Request, Response, NextFunction } from 'express';

// ── Winston Logger setup ────────────────────────────────────────

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
    return `${timestamp} [${level}] ${message}${metaStr}`;
  })
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// ── In-memory API metrics ────────────────────────────────────────

interface ApiMetric {
  method: string;
  path: string;
  statusCode: number;
  responseTimeMs: number;
  userId?: string;
  timestamp: Date;
}

const metrics: ApiMetric[] = [];
const MAX_METRICS = 1000; // Keep last 1000 requests

export function getMetrics() {
  return metrics;
}

export function getSummaryMetrics() {
  const total = metrics.length;
  const errors = metrics.filter((m) => m.statusCode >= 400).length;
  const avgResponseTime =
    total > 0 ? Math.round(metrics.reduce((sum, m) => sum + m.responseTimeMs, 0) / total) : 0;

  const pathCounts: Record<string, number> = {};
  metrics.forEach((m) => {
    const key = `${m.method} ${m.path}`;
    pathCounts[key] = (pathCounts[key] || 0) + 1;
  });

  const topEndpoints = Object.entries(pathCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([endpoint, count]) => ({ endpoint, count }));

  return { total, errors, errorRate: total ? ((errors / total) * 100).toFixed(1) + '%' : '0%', avgResponseTime, topEndpoints };
}

// ── Request logging middleware ────────────────────────────────────

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on('finish', () => {
    const responseTimeMs = Date.now() - start;
    const metric: ApiMetric = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTimeMs,
      userId: req.user?.id,
      timestamp: new Date(),
    };

    // Store metric
    if (metrics.length >= MAX_METRICS) metrics.shift();
    metrics.push(metric);

    // Log the request
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    logger[level](`${req.method} ${req.path}`, {
      statusCode: res.statusCode,
      responseTimeMs,
      userId: req.user?.id,
      ip: req.ip,
    });
  });

  next();
};

// ── Error logging middleware ──────────────────────────────────────

export const errorLogger = (err: any, req: Request, res: Response, next: NextFunction): void => {
  logger.error(`Unhandled error on ${req.method} ${req.path}`, {
    message: err.message,
    stack: err.stack,
    statusCode: err.status || 500,
    userId: req.user?.id,
  });
  next(err);
};

// ── Centralized error handler ─────────────────────────────────────

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction): void => {
  const statusCode = err.status || err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal Server Error' : err.message || 'An error occurred';

  // Don't expose stack traces in production
  const response: any = { error: { message, statusCode } };
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
