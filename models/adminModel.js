const pool = require('../db');
const bcrypt = require('bcrypt');

async function approveBusinessAndCreateLogin(businessId) {
  const conn = await pool.getConnection();
  
  let generatedPassword = null;
  let message = '';
  let isNewUser = false;

  try {
    await conn.beginTransaction();

    // Get the business details within transaction (table is `business_details`)
    const [businessRows] = await conn.execute(
      'SELECT * FROM business_details WHERE id = ?',
      [businessId]
    );
    const business = businessRows[0];
    if (!business) throw new Error('Business not found');

  const isCurrentlyVerified = business.is_verified;

    if (isCurrentlyVerified) {
      // Unverify the business
      await conn.execute(
        'UPDATE business_details SET is_verified = 0 WHERE id = ?',
        [businessId]
      );

      // Deactivate the user login (admin_user table)
      await conn.execute(
        'UPDATE admin_user SET isActive = 0 WHERE businessId = ?',
        [businessId]
      );

      message = 'Business unverified and user deactivated.';
    } else {
      // Verify the business
      await conn.execute(
        'UPDATE business_details SET is_verified = 1 WHERE id = ?',
        [businessId]
      );

      // Check if user already exists
      // Check for existing admin_user associated with this business
      const [userRows] = await conn.execute(
        'SELECT * FROM admin_user WHERE businessId = ?',
        [businessId]
      );
      const userExists = userRows.length > 0;

      if (userExists) {
        // Reactivate existing user
        await conn.execute(
          'UPDATE admin_user SET isActive = 1 WHERE businessId = ?',
          [businessId]
        );
        message = 'Business verified, user already exists and is now active.';
      } else {
        // Generate password and hash it
        generatedPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);

        // Insert new user
        await conn.execute(
          `INSERT INTO admin_user (businessId, username, passwordHash, isActive, role)
           VALUES (?, ?, ?, 1, 'business_admin')`,
          [businessId, business.business_email || business.BusinessEmail, hashedPassword]
        );
        isNewUser = true;
        message = 'Business verified, new user created.';
      }
    }

    await conn.commit();

    return {
      username: business.business_email || business.BusinessEmail,
      tempPassword: isNewUser ? generatedPassword : null,
      message
    };

  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

async function createSuperAdmin(username, password) {
  const conn = await pool.getConnection();
  let hashedPassword;
  try {
    await conn.beginTransaction();

    // Check if user with same username already exists
    const [existingRows] = await conn.execute(
      'SELECT * FROM admin_user WHERE username = ? OR email = ?',
      [username, username]
    );

    if (existingRows.length > 0) {
      throw new Error('User with this username already exists.');
    }

    // Hash the password
    hashedPassword = await bcrypt.hash(password, 10);

    // Insert new super admin user
    await conn.execute(
      `INSERT INTO admin_user (businessId, username, passwordHash, role, isActive)
       VALUES (NULL, ?, ?, 'super_admin', 1)`,
      [username, hashedPassword]
    );

    await conn.commit();

    return {
      username,
      tempPassword: password,
      message: 'Super admin created successfully.'
    };

  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

module.exports = {
  approveBusinessAndCreateLogin,
  createSuperAdmin
};