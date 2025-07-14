const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Wallet } = require('../models');
//const { JWT_SECRET } = require('../config/jwt');
const JWT_SECRET = process.env.JWT_SECRET;
class UserService {
  async register(username, password) {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      throw new Error('Username already taken');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user and wallet in a transaction
    const result = await User.sequelize.transaction(async (t) => {
      // Create user
      const user = await User.create(
        {
          username,
          password: hashedPassword
        },
        { transaction: t }
      );

      // Create wallet for user
      await Wallet.create(
        {
          userId: user.id,
          balance: 1000 // Initial balance for new users
        },
        { transaction: t }
      );

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Return user data (excluding password) and token
      return {
        user: {
          id: user.id,
          username: user.username,
          createdAt: user.createdAt
        },
        token
      };
    });

    return result;
  }

  async login(username, password) {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      throw new Error('Invalid username or password');
    }
    console.log(password)
    console.log(user)
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid username or password');
    }
    console.log(isValidPassword)
    console.log(JWT_SECRET)
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log(token)
    return {
      user: {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt
      },
      token
    };
  }

  async getProfile(userId) {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'createdAt'],
      include: [
        {
          model: Wallet,
          attributes: ['balance']
        }
      ]
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateProfile(userId, updates) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Only allow updating certain fields
    const allowedUpdates = ['username'];
    const updateData = {};
    
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        updateData[key] = updates[key];
      }
    }

    await user.update(updateData);

    return {
      id: user.id,
      username: user.username,
      createdAt: user.createdAt
    };
  }
}

module.exports = new UserService();