import express from 'express';
import { listUsers } from '#controllers/user.controller.js';
import authenticationMiddleware from '#middleware/authentication.middleware.js';
import { getMyProfile } from '#services/user.service.js';

const router = express.Router();

router.use(authenticationMiddleware);

router.get('/', listUsers);

router.get('/me', getMyProfile);

export default router;