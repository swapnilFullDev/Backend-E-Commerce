// async function deleteUsersTable() {
//   try {
//     const sql = `DROP TABLE IF EXISTS Users`;
//     await pool.query(sql);
//     console.log("✅ 'Users' table and all its data have been removed successfully.");
//   } catch (error) {
//     console.error("❌ Error removing 'Users' table:", error.message);
//   }
// }
// deleteUsersTable();