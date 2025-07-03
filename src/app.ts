import express from 'express';
import routes from './routes';

const app = express();

app.use(express.json());

app.use('/api', routes);

app.get('/', (_req, res) => {
  res.send('Server is running...');
});

export default app;