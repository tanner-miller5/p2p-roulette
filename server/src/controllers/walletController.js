const walletService = require('../services/walletService');
const { validateAmount } = require('../utils/validation');

class WalletController {
  async getBalance(req, res) {
    try {
      const userId = req.user.id; // Assuming you have auth middleware that adds user to req
      const balance = await walletService.getBalance(userId);
      res.json({ balance });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deposit(req, res) {
    try {
      const userId = req.user.id;
      const { amount } = req.body;

      if (!validateAmount(amount)) {
        return res.status(400).json({ error: 'Invalid amount' });
      }

      const newBalance = await walletService.deposit(userId, parseFloat(amount));
      res.json({ balance: newBalance });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async withdraw(req, res) {
    try {
      const userId = req.user.id;
      const { amount } = req.body;

      if (!validateAmount(amount)) {
        return res.status(400).json({ error: 'Invalid amount' });
      }

      const newBalance = await walletService.withdraw(userId, parseFloat(amount));
      res.json({ balance: newBalance });
    } catch (error) {
      if (error.message === 'Insufficient balance') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new WalletController();
