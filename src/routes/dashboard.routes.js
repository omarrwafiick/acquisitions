import express from 'express';
import { getDashboardSummary } from '#controllers/dashboard.controller.js';
import authenticationMiddleware from '#middleware/authentication.middleware.js';

const router = express.Router();

router.use(authenticationMiddleware);

router.get('/summary', getDashboardSummary);

export default router;