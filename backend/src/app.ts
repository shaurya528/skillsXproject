import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import routes from './routes/index.routes';

const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

app.use('/api/v1', routes);

export default app;