const pool = require('../db');
const bcrypt = require('bcrypt');

async function approveBusinessAndCreateLogin(businessId) {
  const conn = await pool.getConnection();

  let generatedPassword = null;
  let message = '';
  let isNewUser = false;

  try {
    await conn.beginTransaction();

    // Fetch business details
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

      // Deactivate the user login
      await conn.execute(
        'UPDATE user_accounts SET is_active = 0 WHERE business_id = ?',
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
      const [userRows] = await conn.execute(
        'SELECT * FROM user_accounts WHERE business_id = ?',
        [businessId]
      );

      const userExists = userRows.length > 0;

      if (userExists) {
        // Reactivate existing user
        await conn.execute(
          'UPDATE user_accounts SET is_active = 1 WHERE business_id = ?',
          [businessId]
        );

        message = 'Business verified, existing user reactivated.';
      } else {
        // Generate password and hash it
        generatedPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);

        // Insert new user
        await conn.execute(
          `INSERT INTO user_accounts (business_id, username, password_hash, role, is_active)
           VALUES (?, ?, ?, 'business_admin', 1)`,
          [businessId, business.business_email, hashedPassword]
        );

        isNewUser = true;
        message = 'Business verified, new user created.';
      }
    }

    await conn.commit();

    return {
      username: business.business_email,
      tempPassword: isNewUser ? generatedPassword : null,
      message,
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
  try {
    await conn.beginTransaction();

    // Check if user with same username already exists
    const [existingRows] = await conn.execute(
      'SELECT * FROM user_accounts WHERE username = ?',
      [username]
    );

    if (existingRows.length > 0) {
      throw new Error('User with this username already exists.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new super admin
    await conn.execute(
      `INSERT INTO user_accounts (business_id, username, password_hash, role, is_active)
       VALUES (NULL, ?, ?, 'super_admin', 1)`,
      [username, hashedPassword]
    );

    await conn.commit();

    return {
      username,
      tempPassword: password,
      message: 'Super admin created successfully.',
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
  createSuperAdmin,
};