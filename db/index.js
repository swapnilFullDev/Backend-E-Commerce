import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    ca: fs.readFileSync(process.env.DB_CA_CERT),
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Connected to Aiven MySQL!');

    const [rows] = await conn.query('SELECT NOW() AS now');
    console.log('Current DB time:', rows[0].now);

    conn.release();
  } catch (err) {
    console.error('❌ Database Connection Failed!', err);
  }
})();

export default pool;
