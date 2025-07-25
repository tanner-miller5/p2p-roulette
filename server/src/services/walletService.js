// server/src/services/walletService.js
const { User, Transaction, Wallet} = require('../models');
const { sequelize } = require('../models');

class WalletService {
  async getBalance(userId) {
    const wallet = await Wallet.findOne({ where: { userId } });
    return wallet?.balance || 0;
  }

  async deposit(userId, amount) {
    const transaction = await sequelize.transaction();
    try {
      await Wallet.increment('balance', {
        by: amount,
        where: { userId },
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
      const wallet = await Wallet.findOne({
        where: { userId },
        transaction
      });

      if (!wallet || wallet.balance < amount) {
        throw new Error('Insufficient balance');
      }

      await Wallet.decrement('balance', {
        by: amount,
        where: { userId },
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