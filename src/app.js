import logger from '#config/logger.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import mainRouter from '#routes/index.js';
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

const MAIN_URL = `${process.env.URL}${process.env.VERSION}`;

app.use(`/${MAIN_URL}`, mainRouter);

export default app;
