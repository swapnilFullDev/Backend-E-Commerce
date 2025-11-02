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

// showDatabaseDetails();