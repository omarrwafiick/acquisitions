import express from 'express';
import responseHandler from '#utils/response.js';
import { db } from '#config/database.js';
import { sql } from 'drizzle-orm';

const router = express.Router();

router.get('/', async (req, res) => {
  const checks = {
    api: 'up',
    database: 'down',
  };

  let status = 200;

  try {
    await db.execute(sql`SELECT 1`);
    checks.database = 'up';
  } catch {
    status = 503;
  }

  responseHandler(
    req,
    res,
    {
      status: status === 200 ? 'healthy' : 'degraded',
      checks,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    },
    200
  );
});

router.get('/application', (req, res) => {
  responseHandler(req, res, { message: 'API is running...' }, 200);
});

export default router;
