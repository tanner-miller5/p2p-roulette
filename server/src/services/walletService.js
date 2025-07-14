// server/src/services/walletService.js
const { User, Transaction } = require('../models');
const { sequelize } = require('../models');

class WalletService {
  async getBalance(userId) {
    const user = await User.findByPk(userId);
    return user?.balance || 0;
  }

  async deposit(userId, amount) {
    const transaction = await sequelize.transaction();
    try {
      await User.increment('balance', {
        by: amount,
        where: { id: userId },
        transaction
      });

      await Transaction.create({
        userId,
        type: 'deposit',
        amount,
        status: 'completed'
      }, { transaction });

      await transaction.commit();
      return this.getBalance(userId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async withdraw(userId, amount) {
    const transaction = await sequelize.transaction();
    try {
      const user = await User.findByPk(userId, { transaction });
      if (!user || user.balance < amount) {
        throw new Error('Insufficient balance');
      }

      await User.decrement('balance', {
        by: amount,
        where: { id: userId },
        transaction
      });

      await Transaction.create({
        userId,
        type: 'withdrawal',
        amount,
        status: 'completed'
      }, { transaction });

      await transaction.commit();
      return this.getBalance(userId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = new WalletService();