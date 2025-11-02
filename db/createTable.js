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

async function createDeliveryRiderTable() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS DeliveryRider (
      ID INT AUTO_INCREMENT PRIMARY KEY,
      Name VARCHAR(255) NOT NULL,
      Address TEXT NOT NULL,
      Email VARCHAR(255) UNIQUE NOT NULL,
      Phone VARCHAR(20) UNIQUE NOT NULL,
      PasswordHash VARCHAR(255) NOT NULL,
      IsActive BOOLEAN DEFAULT TRUE,
      AadharCardNumber VARCHAR(20) UNIQUE NOT NULL,
      DrivingLicenseNumber VARCHAR(50) UNIQUE NOT NULL,
      CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  try {
    await pool.execute(createTableSQL);
    console.log('DeliveryRider table created or already exists.');
  } catch (error) {
    console.error('Error creating DeliveryRider table:', error);
    throw error;
  }
}

async function createUserTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      fullName VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      confirmPassword VARCHAR(255) NOT NULL,
      phone VARCHAR(15),
      address TEXT,
      gender ENUM('Male', 'Female', 'Other') DEFAULT 'Other',
      profileImage VARCHAR(255),
      status ENUM('Active', 'Inactive') DEFAULT 'Active',
      isDeleted BOOLEAN DEFAULT FALSE,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  try {
    await pool.execute(sql);
    console.log('✅ users table created or already exists.');
  } catch (error) {
    console.error('❌ Error creating users table:', error.message);
  }
}

async function createWishlistTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS wishlist (
   id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    productId INT NOT NULL,
    productName VARCHAR(255) NOT NULL,
    productImage VARCHAR(500),
    price DECIMAL(10,2),
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_wishlist_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_wishlist_product FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
)
  `;
  try {
    await pool.execute(sql);
    console.log('✅ wishlist table created or already exists.');
  } catch (error) {
    console.error('❌ Error creating wishlist table:', error.message);
  }
}
async function createBuyItemTable() {
  const sql = `
  CREATE TABLE IF NOT EXISTS buyItem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    productId INT NOT NULL,
    productName VARCHAR(255) NOT NULL,
    productImage VARCHAR(500),
    price DECIMAL(10,2),
    quantity INT DEFAULT 1,
    description TEXT,
    status ENUM('Pending', 'Purchased', 'Cancelled') DEFAULT 'Pending',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_buyitem_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_buyitem_product FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
  )
  `;
  try {
    await pool.execute(sql);
    console.log('✅ buyItem table created or already exists.');
  } catch (error) {
    console.error('❌ Error creating buyItem table:', error.message);
  }
}

// createUserTable();
// createDeliveryRiderTable();
// createInventoryTable();
// createWishlistTable();
// createBuyItemTable();