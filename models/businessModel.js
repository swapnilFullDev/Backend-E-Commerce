const pool = require('../db');

class BusinessModel {
  static async create(data) {
    console.log(data);
    const [result] = await pool.execute(
      `INSERT INTO business_details 
        (owner_name, business_name, business_email, business_phone_no, personal_phone_no, gst_number, business_docs, business_address, business_front_image,is_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
      [
        data.owner_name,
        data.business_name,
        data.business_email,
        data.business_phone_no,
        data.personal_phone_no,
        data.gst_number,
        data.business_docs,
        data.business_address,
        data.business_front_image,
        false,
      ]
    );
console.log(result);
    // MySQL gives you the inserted ID via result.insertId
    return result.id;
  }

  // static async getAll(page = 1, limit = 10, search = '') {
  //   const offset = (page - 1) * limit;
  //   const [rows] = await pool.execute(
  //     `SELECT * FROM business_details
  //      WHERE business_name LIKE ?
  //      ORDER BY ID DESC
  //      LIMIT ? OFFSET ?`,
  //     [`%${search}%`, limit, offset]
  //   );
  //   return rows;
  // }
  static async getAll() {
    // const [rows] = await pool.execute(
    //   `SELECT * FROM business_details ORDER BY ID DESC`
    // );
    const [rows] = await pool.execute(
      `SELECT * FROM business_details 
     WHERE owner_name != 'Super Admin Business'
     ORDER BY ID DESC`
    );

    // Parse JSON business_address for each record
    const formattedRows = rows.map((row) => {
      let parsedAddress = null;

      if (row.business_address) {
        try {
          // Clean and normalize JSON string before parsing
          let cleanAddress = row.business_address.trim() // remove leading/trailing spaces
            .replace(/[\n\r\t]/g, "") // remove newlines/tabs
            .replace(/\s{2,}/g, " "); // collapse multiple spaces

          // Try parsing JSON safely
          parsedAddress = JSON.parse(cleanAddress);
        } catch (err) {
          console.warn(
            `⚠️ Invalid JSON for Business ID ${row.ID}:`,
            row.business_address
          );
          parsedAddress = row.business_address; // fallback to original string
        }
      }

      return {
        ...row,
        business_address: parsedAddress,
      };
    });
    return formattedRows;
  }

  static async getUnverified(page = 1, limit = 10, search = "") {
    const offset = (page - 1) * limit;
    const [rows] = await pool.execute(
      `SELECT * FROM business_details 
       WHERE isVerified = 0 AND business_name LIKE ? 
       ORDER BY ID DESC
       LIMIT ? OFFSET ?`,
      [`%${search}%`, limit, offset]
    );
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute(
      "SELECT * FROM business_details WHERE ID = ?",
      [id]
    );
    return rows[0];
  }

  static async update(id, data) {
    await pool.execute(
      `UPDATE business_details SET
        owner_name = ?,
        business_name = ?,
        business_email = ?,
        business_phone_no = ?,
        personal_phone_no = ?,
        gst_number = ?,
        business_docs = ?,
        business_address = ?,
        business_front_image = ?
      WHERE ID = ?`,
      [
        data.owner_name,
        data.business_name,
        data.business_email,
        data.business_phone_no,
        data.personal_phone_no,
        data.gst_number,
        data.business_docs,
        data.business_address,
        data.business_front_image,
        id,
      ]
    );
  }

  static async delete(id) {
    await pool.execute("DELETE FROM business_details WHERE ID = ?", [id]);
  }
}

module.exports = BusinessModel;