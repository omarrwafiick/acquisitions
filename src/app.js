import logger from '#config/logger.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { router, healthRoutes } from '#routes/index.js';
import securityMiddleware from '#middleware/security.middleware.js';

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

app.use(securityMiddleware);

const MAIN_URL = `${process.env.URL}`;

const API_URL = `${MAIN_URL}${process.env.VERSION}`;

app.use(`${MAIN_URL}/health`, healthRoutes);

app.use(`${API_URL}`, router);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export { app, API_URL };
