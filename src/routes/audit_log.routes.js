import express from 'express';
import { listAuditLogs } from '#controllers/auditLog.controller.js';
import authenticationMiddleware from '#middleware/authentication.middleware.js';
import roleBasedAccessControlMiddleware from '#middleware/roleBasedAccessControl.middleware.js';

const router = express.Router();

router.use(authenticationMiddleware);

router.get('/', 
    roleBasedAccessControlMiddleware(['moderator']),
    listAuditLogs
);

export default router;