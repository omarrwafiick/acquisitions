import app from './app.js';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'http://localhost';
const URL = process.env.URL || '/api';

app.listen(PORT, () => {
  console.log(`Listening on ${HOST}:${PORT}/${URL}`);
});
