const pool = require('../db');
const bcrypt = require('bcrypt');

async function approveBusinessAndCreateLogin(businessId) {
  const conn = await pool.getConnection();
  
  let generatedPassword = null;
  let message = '';
  let isNewUser = false;

  try {
    await conn.beginTransaction();

    // Get the business details within transaction
    const [businessRows] = await conn.execute(
      'SELECT * FROM BusinessDetails WHERE ID = ?',
      [businessId]
    );
    const business = businessRows[0];
    if (!business) throw new Error('Business not found');

    const isCurrentlyVerified = business.isVerified;

    if (isCurrentlyVerified) {
      // Unverify the business
      await conn.execute(
        'UPDATE BusinessDetails SET isVerified = 0 WHERE ID = ?',
        [businessId]
      );

      // Deactivate the user login
      await conn.execute(
        'UPDATE Users SET IsActive = 0 WHERE BusinessId = ?',
        [businessId]
      );

      message = 'Business unverified and user deactivated.';
    } else {
      // Verify the business
      await conn.execute(
        'UPDATE BusinessDetails SET isVerified = 1 WHERE ID = ?',
        [businessId]
      );

      // Check if user already exists
      const [userRows] = await conn.execute(
        'SELECT * FROM Users WHERE BusinessId = ?',
        [businessId]
      );
      const userExists = userRows.length > 0;

      if (userExists) {
        // Reactivate existing user
        await conn.execute(
          'UPDATE Users SET IsActive = 1 WHERE BusinessId = ?',
          [businessId]
        );
        message = 'Business verified, user already exists and is now active.';
      } else {
        // Generate password and hash it
        generatedPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);

        // Insert new user
        await conn.execute(
          `INSERT INTO Users (BusinessId, Username, PasswordHash)
           VALUES (?, ?, ?)`,
          [businessId, business.BusinessEmail, hashedPassword]
        );
        isNewUser = true;
        message = 'Business verified, new user created.';
      }
    }

    await conn.commit();

    return {
      username: business.BusinessEmail,
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

module.exports = {
  approveBusinessAndCreateLogin
};