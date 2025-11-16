async function cleanInvalidProductImages() {
  try {
    console.log("🧹 Checking for invalid product_images...");

    const [badRows] = await pool.execute(`
      SELECT id, product_images
      FROM inventory
      WHERE JSON_VALID(product_images) = 0 OR product_images IS NULL
    `);

    if (!badRows.length) {
      console.log("✅ No invalid entries found.");
      return;
    }

    console.log(`⚠ Found ${badRows.length} invalid entries. Deleting...`);
    await pool.execute(`
      DELETE FROM inventory
      WHERE JSON_VALID(product_images) = 0 OR product_images IS NULL
    `);

    console.log("✅ Invalid product_images rows removed.");

  } catch (err) {
    console.error("❌ Error cleaning product_images:", err.message);
  }
}
async function logInventoryTableSchema() {
  try {
    console.log("📋 Inventory table structure:");

    const [rows] = await pool.execute(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'inventory'
      ORDER BY ORDINAL_POSITION
    `);

    rows.forEach(row => {
      console.log(
        `🧾 ${row.COLUMN_NAME.padEnd(20)} | ${row.COLUMN_TYPE.padEnd(25)} | Nullable: ${row.IS_NULLABLE.padEnd(3)} | Default: ${row.COLUMN_DEFAULT}`
      );
    });

  } catch (err) {
    console.error("❌ Error reading inventory schema:", err.message);
  }
}

// Utility to check if column exists
async function columnExists(table, column) {
  const [rows] = await pool.execute(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return rows.length > 0;
}

async function updateInventoryTableSchema() {
  try {
    console.log("⏳ Checking and updating inventory schema...");

    const table = "inventory";

    const addColumnIfMissing = async (column, definition) => {
      const exists = await columnExists(table, column);
      if (!exists) {
        console.log(`🆕 Adding column: ${column}`);
        await pool.execute(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
      }
    };

    // 1. Add new columns
    await addColumnIfMissing("prefer_gender", `ENUM('Male', 'Female', 'Kids', 'Transgender', 'Unisex')`);
    await addColumnIfMissing("product_type", `ENUM('T-shirt', 'Jeans', 'Kurta', 'Suit', 'Jacket')`);
    await addColumnIfMissing("size_quantity", "JSON");
    await addColumnIfMissing("colours", "JSON");
    await addColumnIfMissing("total_quantity", "INT DEFAULT 0");
    await addColumnIfMissing("sku", "VARCHAR(100) UNIQUE");
    await addColumnIfMissing("brand", "VARCHAR(100)");
    await addColumnIfMissing("created_at", "DATETIME DEFAULT CURRENT_TIMESTAMP");
    await addColumnIfMissing("updated_at", "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

    // 2. Update product_images to JSON if needed
    const [imgCol] = await pool.execute(
      `SELECT DATA_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = 'product_images'`,
      [table]
    );

    if (imgCol.length && imgCol[0].DATA_TYPE !== "json") {
      console.log("🔁 Modifying product_images to JSON...");
      await pool.execute(`ALTER TABLE \`${table}\` MODIFY COLUMN product_images JSON`);
    }

    console.log("✅ Inventory table schema updated successfully.");

  } catch (err) {
    console.error("❌ Error updating inventory schema:", err.message);
  }
}