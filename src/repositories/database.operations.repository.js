import { db } from '#config/database.js';
import logger from '#config/logger.js';
import { sql } from 'drizzle-orm';

export const isDatabaseAlive = async () => {
  const currentState = true;
  try {
    await db.execute(sql`SELECT 1`);
    return currentState;
  } catch (error) {
    logger.error(error);
    return !currentState;
  }
};
