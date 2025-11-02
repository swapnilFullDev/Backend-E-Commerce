const pool = require('../db');

class InventoryModel {
  // Get all inventory items by Business_id
  static async getInventoryByBusiness(businessId, page = 1, limit = 10) {
    try {
      // Convert to numbers and ensure safe values
      page = parseInt(page, 10) || 1;
      limit = parseInt(limit, 10) || 10;
      const offset = (page - 1) * limit;

      // Fetch paginated data
      const [rows] = await pool.execute(
        `SELECT * FROM Inventory WHERE Business_id = ? ORDER BY ID DESC LIMIT ${limit} OFFSET ${offset}`,
        [businessId]
      );

      // Fetch total count for pagination
      const [[{ total }]] = await pool.execute(
        `SELECT COUNT(*) AS total FROM Inventory WHERE Business_id = ?`,
        [businessId]
      );
      // ✅ Convert column names to lowerFirst (e.g., AvailableColour → availableColour)
      const formattedRows = rows.map((row) => {
        const formatted = {};
        for (const key in row) {
          if (Object.hasOwn(row, key)) {
            const newKey = key.charAt(0).toLowerCase() + key.slice(1);
            formatted[newKey] = row[key];
          }
        }
        return formatted;
      });

      // Return in desired format
      return {
        data: formattedRows,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error("Failed to fetch inventory: " + error.message);
    }
  }

  // Create new inventory item
  static async createInventoryItem(item) {
    try {
      console.log(item);

      const [result] = await pool.execute(
        `INSERT INTO Inventory
          (ProductName, Business_id, AvailableSizes, AvailableColour, Prices, IsReturnAcceptable, IsAvailableOnRent, ProductImages, ComboDetails, Description, FabricMaterial, Status, Category, AvailableOnline)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.productName,
          item.Business_id,
          item.availableSizes || null,
          item.availableColour || null,
          item.prices,
          item.isReturnAcceptable ? 1 : 0,
          item.isAvailableOnRent ? 1 : 0,
          item.productImages || null,
          item.comboDetails || null,
          item.description || null,
          item.fabricMaterial || null,
          item.status || "Active",
          item.category || null,
          item.availableOnline !== undefined
            ? item.availableOnline
              ? 1
              : 0
            : 1,
        ]
      );
      return { ID: result.insertId };
    } catch (error) {
      throw new Error("Failed to create inventory item: " + error.message);
    }
  }

  // Update inventory item by ID
  static async updateInventoryItem(id, updates) {
    try {
      const [result] = await pool.execute(
        `UPDATE Inventory SET
          ProductName = ?,
          AvailableSizes = ?,
          AvailableColour = ?,
          Prices = ?,
          IsReturnAcceptable = ?,
          IsAvailableOnRent = ?,
          ProductImages = ?,
          ComboDetails = ?,
          Description = ?,
          FabricMaterial = ?,
          Status = ?,
          Category = ?,
          AvailableOnline = ?
         WHERE ID = ?`,
        [
          updates.productName,
          updates.availableSizes || null,
          updates.availableColour || null,
          updates.prices,
          updates.isReturnAcceptable ? 1 : 0,
          updates.isAvailableOnRent ? 1 : 0,
          updates.productImages || null,
          updates.comboDetails || null,
          updates.description || null,
          updates.fabricMaterial || null,
          updates.status || "Active",
          updates.category || null,
          updates.availableOnline !== undefined
            ? updates.availableOnline
              ? 1
              : 0
            : 1,
          id,
        ]
      );
      if (result.affectedRows === 0) {
        throw new Error("No inventory item found with the given ID");
      }
      return true;
    } catch (error) {
      throw new Error("Failed to update inventory item: " + error.message);
    }
  }

  // Delete inventory item by ID
  static async deleteInventoryItem(id) {
    try {
      const [result] = await pool.execute(
        `DELETE FROM Inventory WHERE ID = ?`,
        [id]
      );
      if (result.affectedRows === 0) {
        throw new Error("No inventory item found with the given ID");
      }
      return true;
    } catch (error) {
      throw new Error("Failed to delete inventory item: " + error.message);
    }
  }

  static async updateInventoryToggle(id, field) {
    try {
      let sql = '';
      let params = [];
    
      switch (field) {
        case "Rent":
          sql = `UPDATE Inventory SET IsAvailableOnRent = NOT IsAvailableOnRent WHERE ID = ?`;
          params = [id];
          break;

        case "Status":
          sql = `UPDATE Inventory 
           SET Status = CASE 
               WHEN Status = 'Active' THEN 'Inactive' 
               ELSE 'Active' 
           END 
           WHERE ID = ?`;
          params = [id];
          break;

        case "Online":
          sql = `UPDATE Inventory SET AvailableOnline = NOT AvailableOnline WHERE ID = ?`;
          params = [id];
          break;

        default:
          throw new Error("Invalid toggle field");
      }

      const [result] = await pool.execute(sql, params);

      if (result.affectedRows === 0) {
        throw new Error('Inventory item not found');
      }

      return true;
    } catch (error) {
      throw new Error('Failed to update inventory toggle: ' + error.message);
    }
  }

  static async getById(id) {
    try {
      const [rows] = await pool.execute("SELECT * FROM Inventory WHERE ID = ?", [id]);
      return rows[0] || null;
    } catch (error) {
      throw new Error('Failed to get inventory item by ID: ' + error.message);
    }
  }
}

module.exports = InventoryModel;