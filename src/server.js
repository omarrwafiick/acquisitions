import app from './app.js';
import db from './config/database.js'
import { sql } from "drizzle-orm";

const PORT = process.env.PORT || 3000;
const URL = process.env.URL || 'http://localhost:';

app.listen(PORT, () => {
  console.log(`Listening on ${URL}${PORT}`);
});