const pool = require('../db');

class InventoryModel {
  // Get all inventory items by Business_id
  static async getInventoryByBusiness(businessId) {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM Inventory WHERE Business_id = ? ORDER BY ID DESC`,
        [businessId]
      );
      return rows;
    } catch (error) {
      throw new Error('Failed to fetch inventory: ' + error.message);
    }
  }

  // Create new inventory item
  static async createInventoryItem(item) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO Inventory
          (ProductName, Business_id, AvailableSizes, AvailableColour, Prices, IsReturnAcceptable, IsAvailableOnRent, ProductImages, ComboDetails, Description, FabricMaterial, Status, Category, AvailableOnline)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.ProductName,
          item.Business_id,
          item.AvailableSizes || null,
          item.AvailableColour || null,
          item.Prices,
          item.IsReturnAcceptable ? 1 : 0,
          item.IsAvailableOnRent ? 1 : 0,
          item.ProductImages || null,
          item.ComboDetails || null,
          item.Description || null,
          item.FabricMaterial || null,
          item.Status || 'Active',
          item.Category || null,
          item.AvailableOnline !== undefined ? (item.AvailableOnline ? 1 : 0) : 1
        ]
      );
      return { ID: result.insertId };
    } catch (error) {
      throw new Error('Failed to create inventory item: ' + error.message);
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
          updates.ProductName,
          updates.AvailableSizes || null,
          updates.AvailableColour || null,
          updates.Prices,
          updates.IsReturnAcceptable ? 1 : 0,
          updates.IsAvailableOnRent ? 1 : 0,
          updates.ProductImages || null,
          updates.ComboDetails || null,
          updates.Description || null,
          updates.FabricMaterial || null,
          updates.Status || 'Active',
          updates.Category || null,
          updates.AvailableOnline !== undefined ? (updates.AvailableOnline ? 1 : 0) : 1,
          id
        ]
      );
      if (result.affectedRows === 0) {
        throw new Error('No inventory item found with the given ID');
      }
      return true;
    } catch (error) {
      throw new Error('Failed to update inventory item: ' + error.message);
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
        throw new Error('No inventory item found with the given ID');
      }
      return true;
    } catch (error) {
      throw new Error('Failed to delete inventory item: ' + error.message);
    }
  }
}

module.exports = InventoryModel;