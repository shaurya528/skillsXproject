import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import routes from './routes/index.routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';


const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

app.use('/api/v1', routes);
app.use(notFoundHandler);
app.use(errorHandler);
export default app;