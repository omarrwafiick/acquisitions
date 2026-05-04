import express from 'express';
import { listAuditLogs } from '#controllers/auditLog.controller.js';
import authenticationMiddleware from '#middleware/authentication.middleware.js';

const router = express.Router();

router.use(authenticationMiddleware);

router.get('/', listAuditLogs);

export default router;