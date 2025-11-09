const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

// Determine SSL configuration
let sslConfig = undefined;

if (process.env.DB_CA_CERT && process.env.DB_CA_CERT.trim() !== "") {
  // Use CA certificate if provided
  const caCertPath = path.resolve(process.env.DB_CA_CERT);
  if (!fs.existsSync(caCertPath)) {
    console.error("❌ CA certificate file not found at:", caCertPath);
    process.exit(1);
  }
  sslConfig = {
    ca: fs.readFileSync(caCertPath),
    rejectUnauthorized: false,
  };
} else {
  // Use basic SSL verification (Aiven MySQL requires SSL)
  sslConfig = {
    rejectUnauthorized: false,
  };
}

// Create MySQL pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: sslConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Connected to Aiven MySQL!");

    const [rows] = await conn.query("SELECT NOW() AS now");
    console.log("Current DB time:", rows[0].now);

    conn.release();
  } catch (err) {
    console.error("❌ Database Connection Failed!", err);
  }
})();

module.exports = pool;
