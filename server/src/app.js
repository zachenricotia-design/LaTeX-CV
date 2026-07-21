import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cvRoutes from './routes/cv.routes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '125kb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/cv', cvRoutes);

app.use(errorHandler);

export default app;
