import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import modelsRouter from './routes/models.routes';
import settingsRouter from './routes/settings.routes';
import partsRouter from './routes/parts.routes';
import evaluationsRouter from './routes/evaluations.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api/models', modelsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/parts', partsRouter);
app.use('/api/evaluations', evaluationsRouter);

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} (0.0.0.0)`);
});


export default app;
