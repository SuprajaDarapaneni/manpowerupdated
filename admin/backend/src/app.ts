import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { apiRouter } from './routes/api.router';

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: '*' }));
  app.use(express.json());

  // Health probe
  app.get('/api/v1/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'ManPowerLink Central Backend',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API v1 Router
  app.use('/api/v1', apiRouter);

  return app;
};
