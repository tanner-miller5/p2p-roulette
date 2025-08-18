require('dotenv').config();
const { sequelize, User, Wallet } = require('../models');
const bcrypt = require('bcrypt');

async function initializeDatabase() {
  try {
    // Force sync all models
    await sequelize.sync({ force: true });
    console.log('Database synchronized');

    // Create test user with transaction
    const transaction = await sequelize.transaction();
    try {
      const hashedPassword = await bcrypt.hash('test123', 10);
      const user = await User.create({
        username: 'testuser',
        password: hashedPassword
      }, { transaction });

      // Create wallet for test user
      await Wallet.create({
        userId: user.id,
        balance: 1000
      }, { transaction });

      await transaction.commit();
      console.log('Test user created with wallet');
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run initialization
initializeDatabase();

module.exports = {
    initializeDatabase
}