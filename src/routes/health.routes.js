import express from 'express';
import responseHandler from '#utils/response.js'

const router = express.Router();

router.get("/health", async (_req, res) => {
  const checks = {
    api: "up",
    database: "down",
  };

  let status = 200;

  try {
    await db.execute(sql`SELECT 1`);
    checks.database = "up";
  } catch {
    status = 503;
  }
  
  responseHandler(req, res, 200, {
    status: status === 200 ? "healthy" : "degraded",
    checks,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
  });
});

router.get('/', (req, res) => {
  responseHandler(req, res, 200, { message: 'API is running...' });
});

export default router;