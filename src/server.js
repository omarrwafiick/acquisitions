import logger from '#config/logger.js';
import app from './app.js';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'http://localhost';
const URL = process.env.URL || '/api';

app.listen(PORT, () => {
  logger.info(`
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    🚀 API SERVER ONLINE
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    📍 Host : ${HOST}
    🔌 Port : ${PORT}
    🌐 URL  : http://${HOST}:${PORT}/${URL}
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});
