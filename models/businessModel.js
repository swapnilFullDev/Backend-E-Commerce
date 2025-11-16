const pool = require('../db');

class BusinessModel {
  static async create(data) {
    const [result] = await pool.execute(
      `INSERT INTO business_details 
          (owner_name, business_name, business_email, business_phone_no, personal_phone_no, gst_number, business_docs, business_address, business_front_image)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.owner_name || data.OwnerName,
        data.business_name || data.BusinessName,
        data.business_email || data.BusinessEmail,
        data.business_phone_no || data.BusinessPhoneNo,
        data.personal_phone_no || data.PersonalPhoneNo,
        data.gst_number || data.GSTNumber,
        data.business_docs || data.BusinessDocs,
        data.business_address || data.BusinessAddress,
        data.business_front_image || data.BusinessFrontImage,
      ]
    );

    // MySQL gives you the inserted ID via result.insertId
    return result.insertId;
  }

  static async getAll() {
    const [rows] = await pool.execute(
      `SELECT * FROM business_details 
       WHERE owner_name != 'Super Admin Business'
       ORDER BY id DESC`
    );

    // Parse JSON BusinessAddress for each record
    const formattedRows = rows.map((row) => {
      let parsedAddress = null;

      if (row.business_address) {
        try {
          // Clean and normalize JSON string before parsing
          let cleanAddress = row.business_address
            .trim() // remove leading/trailing spaces
            .replace(/[\n\r\t]/g, "") // remove newlines/tabs
            .replace(/\s{2,}/g, " "); // collapse multiple spaces

          // Try parsing JSON safely
          parsedAddress = JSON.parse(cleanAddress);
        } catch (err) {
          console.warn(
            `⚠️ Invalid JSON for Business ID ${row.id}:`,
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
         WHERE is_verified = 0 AND business_name LIKE ? 
         ORDER BY id DESC
         LIMIT ? OFFSET ?`,
      [`%${search}%`, limit, offset]
    );
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute(
      "SELECT * FROM business_details WHERE id = ?",
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
        WHERE id = ?`,
      [
        data.owner_name || data.OwnerName,
        data.business_name || data.BusinessName,
        data.business_email || data.BusinessEmail,
        data.business_phone_no || data.BusinessPhoneNo,
        data.personal_phone_no || data.PersonalPhoneNo,
        data.gst_number || data.GSTNumber,
        data.business_docs || data.BusinessDocs,
        data.business_address || data.BusinessAddress,
        data.business_front_image || data.BusinessFrontImage,
        id,
      ]
    );
  }

  static async delete(id) {
    try {
      // Delete inventory items for this business
      await pool.execute("DELETE FROM inventory WHERE business_id = ?", [id]);
  
      // Delete products for this business
      await pool.execute("DELETE FROM products WHERE business_id = ?", [id]);
  
      // Finally delete the business record
      await pool.execute("DELETE FROM business_details WHERE id = ?", [id]);
      return {
        message: "Business and related records deleted successfully"
      }
    } catch (error) {
      console.error("Error deleting business and related records:", error);
    }
  }
}

module.exports = BusinessModel;