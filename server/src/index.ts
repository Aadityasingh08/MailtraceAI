import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { config } from './config/env';
import { initDatabase } from './models/db';
import { apiRouter } from './routes/api';

const app = express();

// Security Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow client scripts & inline SVG/maps during development
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: true, // Allow frontend dev server
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parsers
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    service: 'MailTrace AI Server',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', apiRouter);

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred.',
    },
  });
});

// Start Server
async function startServer(): Promise<void> {
  try {
    await initDatabase();
    const server = app.listen(config.port, '0.0.0.0', () => {
      console.log(`====================================================`);
      console.log(`  🛡️  MAILTRACE AI FORENSIC PLATFORM BACKEND ONLINE`);
      console.log(`  🚀  Port: ${config.port}`);
      console.log(`  📊  Environment: ${config.nodeEnv}`);
      console.log(`  🌐  Health Check: http://localhost:${config.port}/health`);
      console.log(`====================================================`);
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ [PORT CONFLICT] Port ${config.port} is already in use by another process.`);
        console.error(`👉 Close the old process or launch using start.bat which auto-clears ports.\n`);
      } else {
        console.error('[Server Error]:', err);
      }
      process.exit(1);
    });
  } catch (err) {
    console.error('[Startup Error] Failed to initialize backend server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

export { app, startServer };
