import logger from '#config/logger.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from '#routes/auth.routes.js';
import healthRoutes from '#routes/health.routes.js';

const app = express();

app.use(helmet());

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(
  morgan('combined', {
    stream: { write: message => logger.info(message.trim()) },
  })
);

const MAIN_URL = `${process.env.URL}${process.env.VERSION}`;

app.use(`${MAIN_URL}${process.env.AUTH_ROUTE}`, authRoutes);

app.use(`${MAIN_URL}${process.env.HEALTH_ROUTE}`, healthRoutes);

export default app;
