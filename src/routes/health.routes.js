import express from 'express';
import responseHandler from '#utils/response.js';
import {
  getAppHealthController,
  pingAppHealthController,
} from '#src/controllers/health.controller.js';

const router = express.Router();

router.get('/', getAppHealthController);

router.get('/app', pingAppHealthController);

export default router;
