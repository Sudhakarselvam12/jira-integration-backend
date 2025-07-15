import express from 'express';
import routes from './routes';
import { startSyncWorker } from './workers/sync-worker';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

if(process.env.NODE_ENV === 'production') {
  startSyncWorker();
}

app.use(express.json());

app.use('/api', routes);

app.get('/', (_req, res): void => {
  res.send('Server is running...');
});

export default app;