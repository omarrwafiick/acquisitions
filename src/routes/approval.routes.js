import express from 'express';
import {
  listPendingApprovals,
  approveRequest,
  rejectRequest,
} from '#controllers/approval.controller.js';
import authenticationMiddleware from '#middleware/authentication.middleware.js';
import roleBasedAccessControlMiddleware from '#middleware/roleBasedAccessControl.middleware.js';

const router = express.Router();

router.use(authenticationMiddleware);

router.use(roleBasedAccessControlMiddleware(['approver']));

router.get('/pending', listPendingApprovals);

router.post('/:requestId/approve', approveRequest);

router.post('/:requestId/reject', rejectRequest);

export default router;