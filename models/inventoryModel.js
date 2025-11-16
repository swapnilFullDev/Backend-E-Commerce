const pool = require('../db');

class InventoryModel {
  // Get all inventory items by business_id
  static async getInventoryByBusiness(businessId, page = 1, limit = 10) {
    try {
      // Convert to numbers and ensure safe values
      page = Math.max(Number.parseInt(page, 10) || 1, 1);
      limit = Math.min(Math.max(Number.parseInt(limit, 10) || 10, 1), 100);
      const offset = (page - 1) * limit;

      // Fetch paginated data (use placeholders for LIMIT/OFFSET, not string interpolation)
      const [rows] = await pool.execute(
        `SELECT * FROM inventory WHERE business_id = ? ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`,
        [businessId]
      );

      // Fetch total count for pagination
      const [[{ total }]] = await pool.execute(
        `SELECT COUNT(*) AS total FROM inventory WHERE business_id = ?`,
        [businessId]
      );

      // Return in desired format
      return {
        data: rows,
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
      // Generate SKU from dynamic item
      const baseSku = generateSkuCode(item);

      // Ensure uniqueness: regenerate if duplicate
      let sku = baseSku;
      let attempt = 1;

      while (true) {
        const [existing] = await pool.execute(
          `SELECT id FROM inventory WHERE sku = ?`,
          [sku]
        );
        if (existing.length === 0) break; // Unique
        sku = baseSku + "-" + Math.random().toString(36).substring(2, 4).toUpperCase();
        attempt++;
        if (attempt > 5) throw new Error("Failed to generate unique SKU");
      }

      const sizeQuantity = JSON.stringify(item.size_quantity || []);
      const colours = JSON.stringify(item.colours || []);
      const productImages = JSON.stringify(
        item.productImages || item.product_images || []
      );
      const totalQuantity =
        item.total_quantity ||
        (Array.isArray(item.size_quantity)
          ? item.size_quantity.reduce((sum, s) => sum + (s.quantity || 0), 0)
          : 0);

      const [result] = await pool.execute(
        `INSERT INTO inventory (
          product_name, business_id, available_sizes, available_colour, prices,
          is_return_acceptable, is_available_on_rent, product_images, combo_details, description,
          fabric_material, status, category, available_online,
          product_type, prefer_gender, size_quantity, colours, total_quantity, sku, brand
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.productName,
          item.business_id,
          item.available_sizes || null,
          item.available_colour || null,
          item.prices,
          item.is_return_acceptable ? 1 : 0,
          item.is_available_on_rent ? 1 : 0,
          productImages,
          item.combo_details || null,
          item.description || null,
          item.fabric_material || null,
          item.status || "Active",
          item.category || null,
          item.available_online !== undefined
            ? item.available_online
              ? 1
              : 0
            : 1,
          item.product_type || null,
          item.prefer_gender || null,
          sizeQuantity,
          colours,
          totalQuantity,
          sku,
          item.brand || null,
        ]
      );
      console.log(result);
      return {
        id: result.insertId,
        sku,
        message: "Inventory item created successfully",
      };
    } catch (error) {
      throw new Error("Failed to create inventory item: " + error.message);
    }
  }

  // Update inventory item by ID
  static async updateInventoryItem(id, updates) {
    try {
      const [result] = await pool.execute(
        `UPDATE inventory SET
            product_name = ?,
            available_sizes = ?,
            available_colour = ?,
            prices = ?,
            is_return_acceptable = ?,
            is_available_on_rent = ?,
            product_images = ?,
            combo_details = ?,
            description = ?,
            fabric_material = ?,
            status = ?,
            category = ?,
            available_online = ?
           WHERE id = ?`,
        [
          updates.productName || updates.product_name,
          updates.availableSizes || updates.available_sizes || null,
          updates.availableColour || updates.available_colour || null,
          updates.prices,
          updates.isReturnAcceptable || updates.is_return_acceptable ? 1 : 0,
          updates.isAvailableOnRent || updates.is_available_on_rent ? 1 : 0,
          updates.productImages || updates.product_images || null,
          updates.comboDetails || updates.combo_details || null,
          updates.description || null,
          updates.fabricMaterial || updates.fabric_material || null,
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
        `DELETE FROM inventory WHERE id = ?`,
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
      let sql = "";
      let params = [];

      switch (field) {
        case "Rent":
          sql = `UPDATE inventory SET is_available_on_rent = NOT is_available_on_rent WHERE id = ?`;
          params = [id];
          break;

        case "Status":
          sql = `UPDATE inventory 
           SET status = CASE 
               WHEN status = 'Active' THEN 'Inactive' 
               ELSE 'Active' 
           END 
           WHERE id = ?`;
          params = [id];
          break;

        case "Online":
          sql = `UPDATE inventory SET available_online = NOT available_online WHERE id = ?`;
          params = [id];
          break;

        default:
          throw new Error("Invalid toggle field");
      }

      const [result] = await pool.execute(sql, params);

      if (result.affectedRows === 0) {
        throw new Error("Inventory item not found");
      }

      return true;
    } catch (error) {
      throw new Error("Failed to update inventory toggle: " + error.message);
    }
  }

  static async getById(id) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM inventory WHERE id = ?",
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error("Failed to get inventory item by ID: " + error.message);
    }
  }

  static async generateSkuCode(product) {
    const typeMap = {
      "T-shirt": "TSH",
      Jeans: "JNS",
      Kurta: "KRT",
      Suit: "SUT",
      Jacket: "JKT",
    };

    const genderMap = {
      Male: "M",
      Female: "F",
      Kids: "K",
      Transgender: "T",
      Unisex: "U",
    };

    const typeCode = typeMap[product.product_type] || "GEN";
    const genderCode = genderMap[product.prefer_gender] || "X";

    let colorCode = "NA";
    if (Array.isArray(product.colours) && product.colours.length > 0) {
      colorCode = product.colours[0].substring(0, 3).toUpperCase();
    }

    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();

    return `${typeCode}-${genderCode}-${colorCode}-${randomCode}`;
  }
}

module.exports = InventoryModel;