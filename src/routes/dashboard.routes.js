import express from 'express';
import { getDashboardSummaryController } from '#controllers/dashboard.controller.js';
import authenticationMiddleware from '#middleware/authentication.middleware.js';
import { CONSTANTS } from '#services/constants.service.js';

const router = express.Router();

router.use(authenticationMiddleware);

router.get('/summary', getDashboardSummaryController);

export default router;
