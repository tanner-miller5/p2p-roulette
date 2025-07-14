// server/src/scripts/seedDatabase.js
require('dotenv').config();
const { User, sequelize } = require('../models');
const bcrypt = require('bcrypt');

const seedDatabase = async () => {
  try {
    // Force sync all models (this will drop all tables!)
    await sequelize.sync({ force: true });
    console.log('Database tables created');

    // Create test user
    const hashedPassword = await bcrypt.hash('test123', 10);
    await User.create({
      username: 'testuser',
      password: hashedPassword,
      balance: 1000
    });
    console.log('Test user created');

  } catch (error) {
    console.error('Database seeding error:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
};

// Run the seeding if this file is run directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Database seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedDatabase;