const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

// Determine SSL configuration
let sslConfig = undefined;

if (process.env.DB_CA_CERT && process.env.DB_CA_CERT.trim() !== '') {
  // Use CA certificate if provided
  const caCertPath = path.resolve(process.env.DB_CA_CERT);
  if (!fs.existsSync(caCertPath)) {
    console.error('❌ CA certificate file not found at:', caCertPath);
    process.exit(1);
  }
  sslConfig = {
    ca: fs.readFileSync(caCertPath),
    rejectUnauthorized: true,
  };
} else {
  // Use basic SSL verification (Aiven MySQL requires SSL)
  sslConfig = {
    rejectUnauthorized: true,
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

async function createInventoryTable() {
  try {
    const sql = `
      CREATE TABLE IF NOT EXISTS Inventory (
        ID INT AUTO_INCREMENT PRIMARY KEY,
        ProductName VARCHAR(255) NOT NULL,
        Business_id INT NOT NULL,
        AvailableSizes VARCHAR(50),
        AvailableColour VARCHAR(100),
        Prices DECIMAL(10,2),
        IsReturnAcceptable BOOLEAN DEFAULT FALSE,
        IsAvailableOnRent BOOLEAN DEFAULT FALSE,
        ProductImages TEXT,
        ComboDetails TEXT,
        Description TEXT,
        FabricMaterial VARCHAR(255),
        Status ENUM('Active', 'Inactive') DEFAULT 'Active',
        Category ENUM('M', 'W', 'Kids'),
        AvailableOnline BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (Business_id) REFERENCES BusinessDetails(ID) ON DELETE CASCADE
      );
    `;

    await pool.execute(sql);
    console.log('✅ Inventory table created successfully!');
  } catch (err) {
    console.error('❌ Error creating Inventory table:', err);
  } finally {
    await pool.end();
  }
}

// createInventoryTable();

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

module.exports = pool;
