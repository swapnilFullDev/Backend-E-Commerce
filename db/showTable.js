async function showDatabaseDetails() {
  try {
    console.log('🔍 Fetching database table list...\n');

    // Step 1: Get all table names
    const [tables] = await pool.query('SHOW TABLES');
    if (tables.length === 0) {
      console.log('⚠️ No tables found in the database.');
      return;
    }

    // MySQL returns table names under dynamic key like: "Tables_in_yourDB"
    const key = Object.keys(tables[0])[0];

    for (const row of tables) {
      const tableName = row[key];
      console.log(`📦 Table: ${tableName}`);

      // Step 2: Describe each table
      const [columns] = await pool.query(`DESCRIBE \`${tableName}\``);

      columns.forEach((col) => {
        console.log(
          `   → ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Key ? `KEY: ${col.Key}` : ''}`
        );
      });

      console.log(''); // spacing between tables
    }

    console.log('✅ All table details printed successfully.');
  } catch (error) {
    console.error('❌ Error fetching database details:', error.message);
  } finally {
    pool.end();
  }
}

async function getAllTablesAndFields(dbConfig) {
  try {
    // Query to fetch all tables and their column details
    const [rows] = await pool.execute(`
      SELECT 
        TABLE_NAME,
        COLUMN_NAME,
        COLUMN_TYPE,
        IS_NULLABLE,
        COLUMN_KEY,
        COLUMN_DEFAULT,
        EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME, ORDINAL_POSITION;
    `);

    // Organize results by table
    const tables = {};
    for (const row of rows) {
      if (!tables[row.TABLE_NAME]) {
        tables[row.TABLE_NAME] = [];
      }
      tables[row.TABLE_NAME].push({
        column: row.COLUMN_NAME,
        type: row.COLUMN_TYPE,
        nullable: row.IS_NULLABLE,
        key: row.COLUMN_KEY,
        default: row.COLUMN_DEFAULT,
        extra: row.EXTRA
      });
    }

    // Print nicely to console
    console.log('📋 All Tables and Their Fields:\n');
    for (const [table, fields] of Object.entries(tables)) {
      console.log(`🧱 Table: ${table}`);
      fields.forEach(col => {
        console.log(`   • ${col.column} (${col.type})${col.key ? ' [' + col.key + ']' : ''}`);
      });
      console.log('');
    }

    return tables;
  } catch (err) {
    console.error('❌ Error fetching table details:', err.message);
  }
}

// showDatabaseDetails();