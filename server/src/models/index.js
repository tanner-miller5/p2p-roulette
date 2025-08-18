const { Sequelize } = require('sequelize');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
  logging: false,
  define: {
    timestamps: true,
    underscored: true
  }
});

// Import models
const Game = require('./Game')(sequelize);
const Bet = require('./Bet')(sequelize);
const User = require('./User')(sequelize);
const Wallet = require('./Wallet')(sequelize);
const Transaction = require('./Transaction')(sequelize);

// Define relationships
Game.hasMany(Bet, {
  foreignKey: 'game_id',
  as: 'bets'
});

Bet.belongsTo(Game, {
  foreignKey: 'game_id',
  as: 'game'
});

User.hasMany(Bet, {
  foreignKey: 'user_id',
  as: 'bets'
});

Bet.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

User.hasOne(Wallet, {
  foreignKey: 'user_id',
  as: 'wallet'
});

Wallet.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

User.hasMany(Transaction, {
  foreignKey: 'user_id',
  as: 'transactions'
});

Transaction.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Database initialization function
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    await sequelize.sync({ force: process.env.NODE_ENV === 'development' });
    console.log('Database tables synchronized.');

    // Create system user if it doesn't exist
    const systemUser = await User.findOne({ where: { username: 'system' } });
    
    if (!systemUser) {
      const hashedPassword = await bcrypt.hash(uuidv4(), 10);
      const systemUserId = uuidv4();

      const newSystemUser = await User.create({
        id: systemUserId,
        username: 'system',
        email: 'system@p2p-roulette.com',
        password: hashedPassword,
        role: 'SYSTEM'
      });

      await Wallet.create({
        userId: newSystemUser.id,
        balance: 1000000
      });

      console.log('System user created with ID:', newSystemUser.id);
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  Game,
  Bet,
  User,
  Wallet,
  Transaction,
  initializeDatabase
};