import express from 'express';
import routes from './routes';
import { startSyncWorker } from './workers/sync-worker';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

const app = express();

if(process.env.NODE_ENV === 'production') {
  startSyncWorker();
}

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credential: true,
  } as cors.CorsOptions)
);

app.use(express.json());

app.use('/api', routes);

app.get('/', (_req, res): void => {
  res.send('Server is running...');
});

export default app;