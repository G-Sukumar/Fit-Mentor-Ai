import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { verifyDbConnection } from './config/db';
import { runDatabaseMigrations } from './config/migrate';
import routes from './routes';

const app = express();

const corsOrigin = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) 
  : '*';

app.use(cors({
  origin: corsOrigin,
  credentials: true
}));
app.use(express.json());

// Public Health Check Endpoint for Container & Cloud Monitors
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    service: 'FitMentor AI API', 
    uptime: Math.round(process.uptime()), 
    timestamp: new Date().toISOString() 
  });
});

// API Base Gateway Router
app.use('/api', routes);

// Production Static Frontend SPA Serving (Single-server deployment mode)
function resolveFrontendDist(): string | null {
  const candidates = [
    process.env.FRONTEND_DIST_PATH,
    path.resolve(process.cwd(), 'frontend/dist'),
    path.resolve(process.cwd(), '../frontend/dist'),
    path.resolve(process.cwd(), 'dist'),
    path.resolve(__dirname, '../../frontend/dist'),
    path.resolve(__dirname, '../../../frontend/dist'),
    path.resolve(__dirname, '../public'),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.existsSync(path.join(candidate, 'index.html'))) {
      return candidate;
    }
  }
  return null;
}

const activeDistPath = resolveFrontendDist();

if (activeDistPath) {
  logger.info(`📦 Serving production frontend build from: ${activeDistPath}`);
  app.use(express.static(activeDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(activeDistPath, 'index.html'));
  });
}


// Centralized Error Handler
app.use(errorHandler);

app.listen(config.port, async () => {
  logger.info(`⚡ FitMentor AI Backend Server running on port ${config.port} (${config.nodeEnv})`);
  logger.info(`Health Check: http://localhost:${config.port}/api/health`);

  // Verify DB Connection & Run Migrations
  const dbConnected = await verifyDbConnection();
  if (dbConnected) {
    await runDatabaseMigrations();
  }
});
